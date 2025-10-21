"""
PQR (Procedure Qualification Record) API endpoints for the welding system backend.
"""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.pqr import (
    PQRCreate, PQRResponse, PQRUpdate, PQRSummary,
    PQRTestSpecimenCreate, PQRTestSpecimenResponse,
    PQRQualificationUpdate, PQRSearchParams, PQRExportRequest
)
from app.services.pqr_service import pqr_service
from app.services.user_service import user_service

router = APIRouter()


@router.get("/", response_model=List[PQRSummary])
def read_pqr(
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0, description="跳过记录数"),
    limit: int = Query(100, ge=1, le=1000, description="返回记录数"),
    owner_id: int = Query(None, description="所有者ID过滤"),
    qualification_result: str = Query(None, description="评定结果过滤"),
    search_term: str = Query(None, description="搜索关键词"),
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """检索PQR列表."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "pqr", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    pqr_list = pqr_service.get_multi(
        db,
        skip=skip,
        limit=limit,
        owner_id=owner_id,
        qualification_result=qualification_result,
        search_term=search_term
    )

    # 转换为summary格式
    pqr_summaries = []
    for pqr in pqr_list:
        pqr_summaries.append(PQRSummary(
            id=pqr.id,
            title=pqr.title,
            pqr_number=pqr.pqr_number,
            wps_number=pqr.wps_number,
            test_date=pqr.test_date,
            company=pqr.company,
            welding_process=pqr.welding_process,
            base_material_spec=pqr.base_material_spec,
            qualification_result=pqr.qualification_result,
            created_at=pqr.created_at,
            updated_at=pqr.updated_at
        ))

    return pqr_summaries


@router.post("/", response_model=PQRResponse)
def create_pqr(
    *,
    db: Session = Depends(deps.get_db),
    pqr_in: PQRCreate,
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """创建新的PQR."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "pqr", "create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    # 检查会员配额
    from app.services.membership_service import MembershipService
    membership_service = MembershipService(db)
    user = db.query(User).filter(User.id == current_user.id).first()
    
    if not membership_service.check_quota_available(user, "pqr"):
        limits = membership_service.get_membership_limits(user.member_tier)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"已达到PQR配额限制 ({limits['pqr']}个)，请升级会员等级"
        )

    try:
        pqr = pqr_service.create(db, obj_in=pqr_in, owner_id=current_user.id)
        
        # 更新配额使用情况
        membership_service.update_quota_usage(user, "pqr", 1)
        
        return pqr
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{id}", response_model=PQRResponse)
def read_pqr(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """通过ID获取PQR."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "pqr", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    pqr = pqr_service.get(db, id=id)
    if not pqr:
        raise HTTPException(status_code=404, detail="PQR未找到")
    return pqr


@router.put("/{id}", response_model=PQRResponse)
def update_pqr(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    pqr_in: PQRUpdate,
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """更新PQR."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "pqr", "update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    pqr = pqr_service.get(db, id=id)
    if not pqr:
        raise HTTPException(status_code=404, detail="PQR未找到")

    # 检查是否为所有者或管理员
    if pqr.owner_id != current_user.id and not current_user.is_superuser:
        # 检查是否有管理权限
        if not user_service.has_permission(db, current_user.id, "pqr", "manage"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="只能更新自己的PQR"
            )

    try:
        pqr = pqr_service.update(db, db_obj=pqr, obj_in=pqr_in)
        return pqr
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{id}", response_model=PQRResponse)
def delete_pqr(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """删除PQR."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "pqr", "delete"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    pqr = pqr_service.get(db, id=id)
    if not pqr:
        raise HTTPException(status_code=404, detail="PQR未找到")

    # 检查是否为所有者或管理员
    if pqr.owner_id != current_user.id and not current_user.is_superuser:
        # 检查是否有管理权限
        if not user_service.has_permission(db, current_user.id, "pqr", "manage"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="只能删除自己的PQR"
            )

    try:
        pqr = pqr_service.remove(db, id=id)
        
        # 更新配额使用情况
        from app.services.membership_service import MembershipService
        membership_service = MembershipService(db)
        user = db.query(User).filter(User.id == current_user.id).first()
        membership_service.update_quota_usage(user, "pqr", -1)
        
        return pqr
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{id}/specimens/", response_model=PQRTestSpecimenResponse)
def create_pqr_specimen(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    specimen_in: PQRTestSpecimenCreate,
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """为PQR创建试样记录."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "pqr", "update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    pqr = pqr_service.get(db, id=id)
    if not pqr:
        raise HTTPException(status_code=404, detail="PQR未找到")

    # 设置PQR ID
    specimen_in.pqr_id = id

    try:
        specimen = pqr_service.create_specimen(db, obj_in=specimen_in)
        return specimen
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{id}/specimens/", response_model=List[PQRTestSpecimenResponse])
def read_pqr_specimens(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """获取PQR的试样记录."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "pqr", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    pqr = pqr_service.get(db, id=id)
    if not pqr:
        raise HTTPException(status_code=404, detail="PQR未找到")

    return pqr_service.get_specimens(db, pqr_id=id)


@router.put("/{id}/qualification/", response_model=PQRResponse)
def update_pqr_qualification(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    qualification_update: PQRQualificationUpdate,
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """更新PQR评定结果."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "pqr", "update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    pqr = pqr_service.get(db, id=id)
    if not pqr:
        raise HTTPException(status_code=404, detail="PQR未找到")

    try:
        pqr = pqr_service.update_qualification(
            db, pqr_id=id, qualification_update=qualification_update
        )
        return pqr
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/search", response_model=List[PQRSummary])
def search_pqr(
    *,
    db: Session = Depends(deps.get_db),
    search_params: PQRSearchParams,
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """高级PQR搜索."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "pqr", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    pqr_list = pqr_service.search_pqr(db, search_params=search_params.model_dump())

    # 转换为summary格式
    pqr_summaries = []
    for pqr in pqr_list:
        pqr_summaries.append(PQRSummary(
            id=pqr.id,
            title=pqr.title,
            pqr_number=pqr.pqr_number,
            wps_number=pqr.wps_number,
            test_date=pqr.test_date,
            company=pqr.company,
            welding_process=pqr.welding_process,
            base_material_spec=pqr.base_material_spec,
            qualification_result=pqr.qualification_result,
            created_at=pqr.created_at,
            updated_at=pqr.updated_at
        ))

    return pqr_summaries


@router.get("/statistics/overview", response_model=dict)
def get_pqr_statistics(
    db: Session = Depends(deps.get_db),
    owner_id: int = Query(None, description="所有者ID过滤"),
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """获取PQR统计信息."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "pqr", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    # 如果指定了owner_id，检查是否有权限查看其他用户的统计
    if owner_id and owner_id != current_user.id:
        if not user_service.has_permission(db, current_user.id, "pqr", "manage"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="只能查看自己的统计信息"
            )

    return pqr_service.get_pqr_statistics(db, owner_id=owner_id or current_user.id)


@router.get("/count/qualification", response_model=dict)
def get_pqr_count_by_qualification(
    db: Session = Depends(deps.get_db),
    owner_id: int = Query(None, description="所有者ID过滤"),
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """按评定结果获取PQR数量."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "pqr", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    # 如果指定了owner_id，检查是否有权限查看其他用户的统计
    if owner_id and owner_id != current_user.id:
        if not user_service.has_permission(db, current_user.id, "pqr", "manage"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="只能查看自己的统计信息"
            )

    return pqr_service.get_pqr_count(db, owner_id=owner_id or current_user.id)


@router.get("/statistics/heat-input", response_model=dict)
def get_pqr_heat_input_stats(
    db: Session = Depends(deps.get_db),
    owner_id: int = Query(None, description="所有者ID过滤"),
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """获取PQR热输入统计信息."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "pqr", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    # 如果指定了owner_id，检查是否有权限查看其他用户的统计
    if owner_id and owner_id != current_user.id:
        if not user_service.has_permission(db, current_user.id, "pqr", "manage"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="只能查看自己的统计信息"
            )

    return pqr_service.get_pqr_heat_input_stats(db, owner_id=owner_id or current_user.id)


@router.post("/export", response_model=dict)
def export_pqr(
    *,
    db: Session = Depends(deps.get_db),
    export_request: PQRExportRequest,
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """导出PQR."""
    # 检查权限
    if not user_service.has_permission(db, current_user.id, "pqr", "export"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )

    # 这里应该实现实际的导出逻辑
    # 目前只返回一个模拟的响应
    return {
        "message": f"导出请求已接收，将导出 {len(export_request.pqr_ids)} 个PQR文件",
        "format": export_request.export_format,
        "include_specimens": export_request.include_specimens,
        "include_attachments": export_request.include_attachments
    }