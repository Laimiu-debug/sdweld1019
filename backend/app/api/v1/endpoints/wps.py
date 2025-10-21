"""
WPS (Welding Procedure Specification) API endpoints for the welding system backend.
"""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.wps import (
    WPSCreate, WPSResponse, WPSUpdate, WPSSummary,
    WPSRevisionCreate, WPSRevisionResponse, WPSStatusUpdate,
    WPSSearchParams, WPSExportRequest
)
from app.services.wps_service import wps_service
from app.services.user_service import user_service

router = APIRouter()


@router.get("/", response_model=List[WPSSummary])
def read_wps(
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0, description="跳过记录数"),
    limit: int = Query(100, ge=1, le=1000, description="返回记录数"),
    owner_id: int = Query(None, description="所有者ID过滤"),
    status: str = Query(None, description="状态过滤"),
    search_term: str = Query(None, description="搜索关键词"),
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """检索WPS列表."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "wps", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    wps_list = wps_service.get_multi(
        db,
        skip=skip,
        limit=limit,
        owner_id=owner_id,
        status=status,
        search_term=search_term
    )

    # 转换为summary格式
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
            created_at=wps.created_at,
            updated_at=wps.updated_at
        ))

    return wps_summaries


@router.post("/", response_model=WPSResponse)
def create_wps(
    *,
    db: Session = Depends(deps.get_db),
    wps_in: WPSCreate,
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """创建新的WPS."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "wps", "create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    # 检查会员配额
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
        wps = wps_service.create(db, obj_in=wps_in, owner_id=current_user.id)
        
        # 更新配额使用情况
        membership_service.update_quota_usage(user, "wps", 1)
        
        return wps
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{id}", response_model=WPSResponse)
def read_wps(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """通过ID获取WPS."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "wps", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    wps = wps_service.get(db, id=id)
    if not wps:
        raise HTTPException(status_code=404, detail="WPS未找到")
    return wps


@router.put("/{id}", response_model=WPSResponse)
def update_wps(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    wps_in: WPSUpdate,
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """更新WPS."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "wps", "update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    wps = wps_service.get(db, id=id)
    if not wps:
        raise HTTPException(status_code=404, detail="WPS未找到")

    # 检查是否为所有者或管理员
    if wps.owner_id != current_user.id and not current_user.is_superuser:
        # 检查是否有管理权限
        if not user_service.has_permission(db, current_user.id, "wps", "manage"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="只能更新自己的WPS"
            )

    try:
        wps = wps_service.update(db, db_obj=wps, obj_in=wps_in)
        return wps
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{id}", response_model=WPSResponse)
def delete_wps(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """删除WPS."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "wps", "delete"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    wps = wps_service.get(db, id=id)
    if not wps:
        raise HTTPException(status_code=404, detail="WPS未找到")

    # 检查是否为所有者或管理员
    if wps.owner_id != current_user.id and not current_user.is_superuser:
        # 检查是否有管理权限
        if not user_service.has_permission(db, current_user.id, "wps", "manage"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="只能删除自己的WPS"
            )

    try:
        wps = wps_service.remove(db, id=id)
        
        # 更新配额使用情况
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
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """为WPS创建新版本."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "wps", "update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    wps = wps_service.get(db, id=id)
    if not wps:
        raise HTTPException(status_code=404, detail="WPS未找到")

    try:
        revision = wps_service.create_revision(
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
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """获取WPS的版本历史."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "wps", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    wps = wps_service.get(db, id=id)
    if not wps:
        raise HTTPException(status_code=404, detail="WPS未找到")

    return wps_service.get_revisions(db, wps_id=id)


@router.put("/{id}/status/", response_model=WPSResponse)
def update_wps_status(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    status_update: WPSStatusUpdate,
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """更新WPS状态."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "wps", "update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    wps = wps_service.get(db, id=id)
    if not wps:
        raise HTTPException(status_code=404, detail="WPS未找到")

    try:
        wps = wps_service.update_status(
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
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """高级WPS搜索."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "wps", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    wps_list = wps_service.search_wps(db, search_params=search_params.model_dump())

    # 转换为summary格式
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
            created_at=wps.created_at,
            updated_at=wps.updated_at
        ))

    return wps_summaries


@router.get("/statistics/overview", response_model=dict)
def get_wps_statistics(
    db: Session = Depends(deps.get_db),
    owner_id: int = Query(None, description="所有者ID过滤"),
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """获取WPS统计信息."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "wps", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    # 如果指定了owner_id，检查是否有权限查看其他用户的统计
    if owner_id and owner_id != current_user.id:
        if not user_service.has_permission(db, current_user.id, "wps", "manage"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="只能查看自己的统计信息"
            )

    return wps_service.get_wps_statistics(db, owner_id=owner_id or current_user.id)


@router.get("/count/status", response_model=dict)
def get_wps_count_by_status(
    db: Session = Depends(deps.get_db),
    owner_id: int = Query(None, description="所有者ID过滤"),
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """按状态获取WPS数量."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "wps", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    # 如果指定了owner_id，检查是否有权限查看其他用户的统计
    if owner_id and owner_id != current_user.id:
        if not user_service.has_permission(db, current_user.id, "wps", "manage"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="只能查看自己的统计信息"
            )

    return wps_service.get_wps_count(db, owner_id=owner_id or current_user.id)


@router.post("/export", response_model=dict)
def export_wps(
    *,
    db: Session = Depends(deps.get_db),
    export_request: WPSExportRequest,
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """导出WPS."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "wps", "export"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    # 这里应该实现实际的导出逻辑
    # 目前只返回一个模拟的响应
    return {
        "message": f"导出请求已接收，将导出 {len(export_request.wps_ids)} 个WPS文件",
        "format": export_request.export_format,
        "include_revisions": export_request.include_revisions,
        "include_attachments": export_request.include_attachments
    }