"""
WPS (Welding Procedure Specification) API endpoints for the welding system backend.
"""
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.models.company import CompanyEmployee
from app.schemas.wps import (
    WPSCreate, WPSResponse, WPSUpdate, WPSSummary,
    WPSRevisionCreate, WPSRevisionResponse, WPSStatusUpdate,
    WPSSearchParams, WPSExportRequest
)
from app.services.wps_service import WPSService
from app.services.user_service import user_service
from app.services.workspace_service import WorkspaceService
from app.core.data_access import WorkspaceContext, WorkspaceType

router = APIRouter()


def get_workspace_context(
    db: Session,
    current_user: User,
    workspace_id: Optional[str] = None
) -> WorkspaceContext:
    """
    Get workspace context from header or user's default workspace.

    Args:
        db: Database session
        current_user: Current user
        workspace_id: Workspace ID from header (optional)

    Returns:
        WorkspaceContext object
    """
    workspace_service = WorkspaceService(db)

    # If workspace_id is provided in header, use it
    if workspace_id:
        return workspace_service.create_workspace_context(current_user, workspace_id)

    # Otherwise, determine default workspace based on user's membership type
    if current_user.membership_type == "enterprise":
        # For enterprise users, find their company
        employee = db.query(CompanyEmployee).filter(
            CompanyEmployee.user_id == current_user.id,
            CompanyEmployee.status == "active"
        ).first()

        if employee:
            return WorkspaceContext(
                user_id=current_user.id,
                workspace_type=WorkspaceType.ENTERPRISE,
                company_id=employee.company_id,
                factory_id=employee.factory_id
            )

    # Default to personal workspace
    return WorkspaceContext(
        user_id=current_user.id,
        workspace_type=WorkspaceType.PERSONAL
    )


@router.get("/", response_model=List[WPSSummary])
def read_wps_list(
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0, description="跳过记录数"),
    limit: int = Query(100, ge=1, le=1000, description="返回记录数"),
    owner_id: int = Query(None, description="所有者ID过滤"),
    status_filter: str = Query(None, description="状态过滤"),
    search_term: str = Query(None, description="搜索关键词"),
    current_user: User = Depends(deps.get_current_active_user),
    workspace_id: Optional[str] = Header(None, alias="X-Workspace-ID")
) -> Any:
    """
    检索WPS列表（带工作区上下文数据隔离）.

    - 个人工作区：只返回用户自己的WPS
    - 企业工作区：只返回企业内的WPS
    """
    try:
        # Get workspace context
        print(f"DEBUG WPS: 开始获取工作区上下文, workspace_id={workspace_id}")
        workspace_context = get_workspace_context(db, current_user, workspace_id)
        print(f"DEBUG WPS: 工作区上下文获取成功: type={workspace_context.workspace_type}, user_id={workspace_context.user_id}")

        # Debug information
        print(f"DEBUG WPS: User {current_user.id}, membership_type={current_user.membership_type}, workspace_id={workspace_id}")

        # For now, allow all authenticated users to access WPS
        # TODO: Implement proper permission checking
        print(f"DEBUG WPS: User authenticated, allowing access")

        # Get WPS list with workspace filtering
        print(f"DEBUG WPS: 开始查询WPS列表, skip={skip}, limit={limit}")
        wps_service_instance = WPSService(db)
        wps_list = wps_service_instance.get_multi(
            db,
            skip=skip,
            limit=limit,
            current_user=current_user,
            workspace_context=workspace_context,
            owner_id=owner_id,
            status=status_filter,
            search_term=search_term
        )
        print(f"DEBUG WPS: 查询完成, 返回 {len(wps_list)} 条记录")

        # Convert to summary format with approval workflow info
        from app.models.approval import ApprovalInstance, ApprovalWorkflowDefinition
        from app.services.approval_service import ApprovalService

        approval_service = ApprovalService(db)
        wps_summaries = []
        for wps in wps_list:
            # 查询关联的审批实例
            approval_instance = db.query(ApprovalInstance).filter(
                ApprovalInstance.document_type == "wps",
                ApprovalInstance.document_id == wps.id
            ).order_by(ApprovalInstance.created_at.desc()).first()

            # 获取工作流名称
            workflow_name = None
            approval_status = None
            approval_instance_id = None
            submitter_id = None
            can_approve = False
            can_submit_approval = False

            if approval_instance:
                approval_instance_id = approval_instance.id
                approval_status = approval_instance.status
                submitter_id = approval_instance.submitter_id

                # 查询工作流定义
                workflow = db.query(ApprovalWorkflowDefinition).filter(
                    ApprovalWorkflowDefinition.id == approval_instance.workflow_id
                ).first()

                if workflow:
                    workflow_name = workflow.name

                # 检查当前用户是否可以审批
                if approval_instance.status in ['pending', 'in_progress']:
                    can_approve = approval_service._can_approve(approval_instance, current_user)
            else:
                # 没有审批实例，检查是否可以提交审批
                can_submit_approval = approval_service.should_require_approval('wps', workspace_context)

            wps_summaries.append(WPSSummary(
                id=wps.id,
                title=wps.title,
                wps_number=wps.wps_number,
                revision=wps.revision,
                status=wps.status,
                company=wps.company,
                project_name=wps.project_name,
                welding_process=wps.welding_process,
                base_material_spec=wps.base_material_spec,
                filler_material_classification=wps.filler_material_classification,
                template_id=wps.template_id,
                modules_data=wps.modules_data,
                created_at=wps.created_at,
                updated_at=wps.updated_at,
                approval_instance_id=approval_instance_id,
                approval_status=approval_status,
                workflow_name=workflow_name,
                can_approve=can_approve,
                can_submit_approval=can_submit_approval,
                submitter_id=submitter_id
            ))

        print(f"DEBUG WPS: 返回 {len(wps_summaries)} 条WPS摘要")
        return wps_summaries
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"ERROR in read_wps_list: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取WPS列表失败: {str(e)}"
        )


@router.post("/", response_model=WPSResponse)
def create_wps(
    *,
    db: Session = Depends(deps.get_db),
    wps_in: WPSCreate,
    current_user: User = Depends(deps.get_current_active_user),
    workspace_id: Optional[str] = Header(None, alias="X-Workspace-ID")
) -> Any:
    """
    创建新的WPS（带工作区上下文）.

    - 个人工作区：创建个人WPS
    - 企业工作区：创建企业WPS
    """
    # Get workspace context
    workspace_context = get_workspace_context(db, current_user, workspace_id)

    # Check permission (enterprise members have access by default)
    if current_user.membership_type != "enterprise":
        if not user_service.has_permission(db, current_user.id, "wps", "create"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="没有足够的权限"
            )

    # Check membership quota (only for personal workspace)
    if workspace_context.workspace_type == WorkspaceType.PERSONAL:
        from app.services.membership_service import MembershipService
        membership_service = MembershipService(db)
        user = db.query(User).filter(User.id == current_user.id).first()

        if not membership_service.check_quota_available(user, "wps"):
            limits = membership_service.get_membership_limits(user.member_tier)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"已达到WPS配额限制 ({limits['wps']}个)，请升级会员等级"
            )

    try:
        wps_service_instance = WPSService(db)
        wps = wps_service_instance.create(
            db,
            obj_in=wps_in,
            current_user=current_user,
            workspace_context=workspace_context
        )

        # Update quota usage (only for personal workspace)
        if workspace_context.workspace_type == WorkspaceType.PERSONAL:
            from app.services.membership_service import MembershipService
            membership_service = MembershipService(db)
            user = db.query(User).filter(User.id == current_user.id).first()
            membership_service.update_quota_usage(user, "wps", 1)

        return wps
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{id}", response_model=WPSResponse)
def read_wps_by_id(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
    workspace_id: Optional[str] = Header(None, alias="X-Workspace-ID")
) -> Any:
    """
    通过ID获取WPS（带工作区上下文数据隔离）.

    只能获取当前工作区内的WPS。
    """
    # Get workspace context
    workspace_context = get_workspace_context(db, current_user, workspace_id)

    # Check permission
    if current_user.membership_type != "enterprise":
        if not user_service.has_permission(db, current_user.id, "wps", "read"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="没有足够的权限"
            )

    # Get WPS with workspace filtering
    wps_service_instance = WPSService(db)
    wps = wps_service_instance.get(
        db,
        id=id,
        current_user=current_user,
        workspace_context=workspace_context
    )

    if not wps:
        raise HTTPException(status_code=404, detail="WPS未找到或无权访问")

    # 查询关联的审批实例和工作流信息
    from app.models.approval import ApprovalInstance, ApprovalWorkflowDefinition

    approval_instance = db.query(ApprovalInstance).filter(
        ApprovalInstance.document_type == "wps",
        ApprovalInstance.document_id == wps.id
    ).order_by(ApprovalInstance.created_at.desc()).first()

    # 创建响应字典
    wps_dict = {
        **{k: v for k, v in wps.__dict__.items() if not k.startswith('_')},
        "approval_instance_id": None,
        "approval_status": None,
        "workflow_name": None
    }

    if approval_instance:
        wps_dict["approval_instance_id"] = approval_instance.id
        wps_dict["approval_status"] = approval_instance.status

        # 查询工作流定义
        workflow = db.query(ApprovalWorkflowDefinition).filter(
            ApprovalWorkflowDefinition.id == approval_instance.workflow_id
        ).first()

        if workflow:
            wps_dict["workflow_name"] = workflow.name

    return wps_dict


@router.put("/{id}", response_model=WPSResponse)
def update_wps(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    wps_in: WPSUpdate,
    current_user: User = Depends(deps.get_current_active_user),
    workspace_id: Optional[str] = Header(None, alias="X-Workspace-ID")
) -> Any:
    """
    更新WPS（带权限检查和工作区上下文）.

    只能更新当前工作区内有权限的WPS。
    """
    # Get workspace context
    workspace_context = get_workspace_context(db, current_user, workspace_id)

    # Check permission
    if current_user.membership_type != "enterprise":
        if not user_service.has_permission(db, current_user.id, "wps", "update"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="没有足够的权限"
            )

    # Get WPS with workspace filtering
    wps_service_instance = WPSService(db)
    wps = wps_service_instance.get(
        db,
        id=id,
        current_user=current_user,
        workspace_context=workspace_context
    )

    if not wps:
        raise HTTPException(status_code=404, detail="WPS未找到或无权访问")

    try:
        # Update with permission check (handled in service)
        wps = wps_service_instance.update(
            db,
            db_obj=wps,
            obj_in=wps_in,
            current_user=current_user,
            workspace_context=workspace_context
        )
        return wps
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{id}", response_model=WPSResponse)
def delete_wps(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
    workspace_id: Optional[str] = Header(None, alias="X-Workspace-ID")
) -> Any:
    """
    删除WPS（带权限检查和工作区上下文）.

    只能删除当前工作区内有权限的WPS。
    """
    # Get workspace context
    workspace_context = get_workspace_context(db, current_user, workspace_id)

    # Check permission
    if current_user.membership_type != "enterprise":
        if not user_service.has_permission(db, current_user.id, "wps", "delete"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="没有足够的权限"
            )

    try:
        # Delete with permission check (handled in service)
        wps_service_instance = WPSService(db)
        wps = wps_service_instance.remove(
            db,
            id=id,
            current_user=current_user,
            workspace_context=workspace_context
        )

        # Update quota usage (only for personal workspace)
        if workspace_context.workspace_type == WorkspaceType.PERSONAL:
            from app.services.membership_service import MembershipService
            membership_service = MembershipService(db)
            user = db.query(User).filter(User.id == current_user.id).first()
            membership_service.update_quota_usage(user, "wps", -1)

        return wps
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{id}/revisions/", response_model=WPSRevisionResponse)
def create_wps_revision(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    revision_in: WPSRevisionCreate,
    current_user: User = Depends(deps.get_current_active_user),
    workspace_id: Optional[str] = Header(None, alias="X-Workspace-ID")
) -> Any:
    """为WPS创建新版本（带工作区上下文）."""
    # Get workspace context
    workspace_context = get_workspace_context(db, current_user, workspace_id)

    # Check permission
    if current_user.membership_type != "enterprise":
        if not user_service.has_permission(db, current_user.id, "wps", "update"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="没有足够的权限"
            )

    # Get WPS with workspace filtering
    wps_service_instance = WPSService(db)
    wps = wps_service_instance.get(
        db,
        id=id,
        current_user=current_user,
        workspace_context=workspace_context
    )

    if not wps:
        raise HTTPException(status_code=404, detail="WPS未找到或无权访问")

    try:
        revision = wps_service_instance.create_revision(
            db, wps_id=id, obj_in=revision_in, changed_by=current_user.id
        )
        return revision
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{id}/revisions/", response_model=List[WPSRevisionResponse])
def read_wps_revisions(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
    workspace_id: Optional[str] = Header(None, alias="X-Workspace-ID")
) -> Any:
    """获取WPS的版本历史（带工作区上下文）."""
    # Get workspace context
    workspace_context = get_workspace_context(db, current_user, workspace_id)

    # Check permission
    if current_user.membership_type != "enterprise":
        if not user_service.has_permission(db, current_user.id, "wps", "read"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="没有足够的权限"
            )

    # Get WPS with workspace filtering
    wps_service_instance = WPSService(db)
    wps = wps_service_instance.get(
        db,
        id=id,
        current_user=current_user,
        workspace_context=workspace_context
    )

    if not wps:
        raise HTTPException(status_code=404, detail="WPS未找到或无权访问")

    return wps_service_instance.get_revisions(db, wps_id=id)


@router.put("/{id}/status/", response_model=WPSResponse)
def update_wps_status(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    status_update: WPSStatusUpdate,
    current_user: User = Depends(deps.get_current_active_user),
    workspace_id: Optional[str] = Header(None, alias="X-Workspace-ID")
) -> Any:
    """更新WPS状态（带工作区上下文）."""
    # Get workspace context
    workspace_context = get_workspace_context(db, current_user, workspace_id)

    # Check permission
    if current_user.membership_type != "enterprise":
        if not user_service.has_permission(db, current_user.id, "wps", "update"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="没有足够的权限"
            )

    # Get WPS with workspace filtering
    wps_service_instance = WPSService(db)
    wps = wps_service_instance.get(
        db,
        id=id,
        current_user=current_user,
        workspace_context=workspace_context
    )

    if not wps:
        raise HTTPException(status_code=404, detail="WPS未找到或无权访问")

    try:
        wps = wps_service_instance.update_status(
            db,
            wps_id=id,
            status=status_update.status,
            reviewed_by=status_update.reviewed_by,
            approved_by=status_update.approved_by
        )
        return wps
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/search", response_model=List[WPSSummary])
def search_wps(
    *,
    db: Session = Depends(deps.get_db),
    search_params: WPSSearchParams,
    current_user: User = Depends(deps.get_current_active_user),
    workspace_id: Optional[str] = Header(None, alias="X-Workspace-ID")
) -> Any:
    """
    高级WPS搜索（带工作区上下文数据隔离）.

    只搜索当前工作区内的WPS。
    """
    # Get workspace context
    workspace_context = get_workspace_context(db, current_user, workspace_id)

    # Check permission
    if current_user.membership_type != "enterprise":
        if not user_service.has_permission(db, current_user.id, "wps", "read"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="没有足够的权限"
            )

    # Use get_multi with search parameters for now
    # TODO: Update search_wps service method to support workspace context
    wps_service_instance = WPSService(db)
    wps_list = wps_service_instance.get_multi(
        db,
        skip=0,
        limit=1000,  # Large limit for search
        current_user=current_user,
        workspace_context=workspace_context,
        status=search_params.status if hasattr(search_params, 'status') else None,
        search_term=search_params.search_term if hasattr(search_params, 'search_term') else None
    )

    # Convert to summary format
    wps_summaries = []
    for wps in wps_list:
        wps_summaries.append(WPSSummary(
            id=wps.id,
            title=wps.title,
            wps_number=wps.wps_number,
            revision=wps.revision,
            status=wps.status,
            company=wps.company,
            project_name=wps.project_name,
            welding_process=wps.welding_process,
            base_material_spec=wps.base_material_spec,
            filler_material_classification=wps.filler_material_classification,
            template_id=wps.template_id,
            modules_data=wps.modules_data,
            created_at=wps.created_at,
            updated_at=wps.updated_at
        ))

    return wps_summaries


@router.get("/debug/token", response_model=dict)
def debug_token(
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Debug endpoint to check current user and token validity.
    """
    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "membership_type": current_user.membership_type,
        "member_tier": current_user.member_tier,
        "is_active": current_user.is_active
    }


@router.get("/statistics/overview", response_model=dict)
def get_wps_statistics(
    db: Session = Depends(deps.get_db),
    owner_id: int = Query(None, description="所有者ID过滤"),
    current_user: User = Depends(deps.get_current_active_user),
    workspace_id: Optional[str] = Header(None, alias="X-Workspace-ID")
) -> Any:
    """
    获取WPS统计信息（带工作区上下文数据隔离）.

    只统计当前工作区内的WPS。
    """
    # Get workspace context
    workspace_context = get_workspace_context(db, current_user, workspace_id)

    # Check permission
    if current_user.membership_type != "enterprise":
        if not user_service.has_permission(db, current_user.id, "wps", "read"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="没有足够的权限"
            )

    # Get statistics using service
    wps_service_instance = WPSService(db)
    return wps_service_instance.get_wps_statistics(db, owner_id=owner_id or current_user.id)


@router.get("/count/status", response_model=dict)
def get_wps_count_by_status(
    db: Session = Depends(deps.get_db),
    owner_id: int = Query(None, description="所有者ID过滤"),
    current_user: User = Depends(deps.get_current_active_user),
    workspace_id: Optional[str] = Header(None, alias="X-Workspace-ID")
) -> Any:
    """
    按状态获取WPS数量（带工作区上下文数据隔离）.

    只统计当前工作区内的WPS。
    """
    # Get workspace context
    workspace_context = get_workspace_context(db, current_user, workspace_id)

    # Check permission
    if current_user.membership_type != "enterprise":
        if not user_service.has_permission(db, current_user.id, "wps", "read"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="没有足够的权限"
            )

    # Get count using service
    wps_service_instance = WPSService(db)
    return wps_service_instance.get_wps_count(db, owner_id=owner_id or current_user.id)


@router.post("/export", response_model=dict)
def export_wps(
    *,
    db: Session = Depends(deps.get_db),
    export_request: WPSExportRequest,
    current_user: User = Depends(deps.get_current_active_user),
    workspace_id: Optional[str] = Header(None, alias="X-Workspace-ID")
) -> Any:
    """
    导出WPS（带工作区上下文数据隔离）.

    只能导出当前工作区内有权限的WPS。
    """
    # Get workspace context
    workspace_context = get_workspace_context(db, current_user, workspace_id)

    # Check permission
    if current_user.membership_type != "enterprise":
        if not user_service.has_permission(db, current_user.id, "wps", "export"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="没有足够的权限"
            )

    # Verify all requested WPS IDs are accessible in current workspace
    wps_service_instance = WPSService(db)
    accessible_count = 0
    for wps_id in export_request.wps_ids:
        wps = wps_service_instance.get(
            db,
            id=wps_id,
            current_user=current_user,
            workspace_context=workspace_context
        )
        if wps:
            accessible_count += 1

    # TODO: Implement actual export logic
    return {
        "message": f"导出请求已接收，将导出 {accessible_count} 个WPS文件（共请求 {len(export_request.wps_ids)} 个）",
        "format": export_request.export_format,
        "include_revisions": export_request.include_revisions,
        "include_attachments": export_request.include_attachments,
        "accessible_count": accessible_count,
        "requested_count": len(export_request.wps_ids)
    }