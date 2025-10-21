"""
Equipment Management API endpoints for the welding system backend.
"""
from typing import Any, List, Optional
from datetime import datetime, date, timedelta
from pydantic import BaseModel

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.services.equipment_service import EquipmentService
from app.services.workspace_service import get_workspace_service
from app.core.data_access import WorkspaceContext, WorkspaceType
from app.models.user import User

router = APIRouter()

# ==================== Pydantic 模型 ====================

class EquipmentCreate(BaseModel):
    """创建设备的数据模型"""
    equipment_code: str
    equipment_name: str
    equipment_type: str
    category: Optional[str] = None
    manufacturer: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    specifications: Optional[str] = None
    rated_power: Optional[float] = None
    rated_voltage: Optional[float] = None
    rated_current: Optional[float] = None
    max_capacity: Optional[float] = None
    working_range: Optional[str] = None
    purchase_date: Optional[str] = None
    purchase_price: Optional[float] = None
    currency: str = "CNY"
    supplier: Optional[str] = None
    warranty_period: Optional[int] = None
    warranty_expiry_date: Optional[str] = None
    location: Optional[str] = None
    workshop: Optional[str] = None
    area: Optional[str] = None
    status: str = "operational"
    is_active: bool = True
    is_critical: bool = False
    installation_date: Optional[str] = None
    commissioning_date: Optional[str] = None
    maintenance_interval_days: Optional[int] = None
    inspection_interval_days: Optional[int] = None
    responsible_person_id: Optional[int] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    manual_url: Optional[str] = None
    images: Optional[str] = None
    documents: Optional[str] = None
    tags: Optional[str] = None
    access_level: str = "private"

class EquipmentUpdate(BaseModel):
    """更新设备的数据模型"""
    equipment_name: Optional[str] = None
    equipment_type: Optional[str] = None
    category: Optional[str] = None
    manufacturer: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    specifications: Optional[str] = None
    rated_power: Optional[float] = None
    rated_voltage: Optional[float] = None
    rated_current: Optional[float] = None
    max_capacity: Optional[float] = None
    working_range: Optional[str] = None
    purchase_price: Optional[float] = None
    supplier: Optional[str] = None
    location: Optional[str] = None
    workshop: Optional[str] = None
    area: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None
    is_critical: Optional[bool] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    manual_url: Optional[str] = None
    images: Optional[str] = None
    documents: Optional[str] = None
    tags: Optional[str] = None
    access_level: Optional[str] = None

class StatusUpdate(BaseModel):
    """状态更新模型"""
    status: str
    notes: Optional[str] = None

class MaintenanceRecord(BaseModel):
    """维护记录模型"""
    maintenance_type: str
    start_date: str
    end_date: Optional[str] = None
    duration_hours: Optional[float] = None
    technician_id: Optional[int] = None
    technician_name: Optional[str] = None
    work_description: Optional[str] = None
    result: Optional[str] = None
    notes: Optional[str] = None


@router.get("/")
async def get_equipment_list(
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0, description="跳过记录数"),
    limit: int = Query(100, ge=1, le=1000, description="返回记录数"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    equipment_type: Optional[str] = Query(None, description="设备类型"),
    status: Optional[str] = Query(None, description="设备状态"),
    factory_id: Optional[int] = Query(None, description="工厂ID筛选"),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    获取设备列表

    - **skip**: 跳过的记录数
    - **limit**: 返回的记录数
    - **search**: 搜索关键词
    - **equipment_type**: 设备类型筛选
    - **status**: 设备状态筛选
    - **factory_id**: 工厂ID筛选
    """
    try:
        # 获取工作区服务
        workspace_service = get_workspace_service(db)
        current_workspace = await workspace_service.get_current_workspace(current_user)

        if not current_workspace:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="未找到工作区信息"
            )

        # 创建工作区上下文
        workspace_context = WorkspaceContext(
            user_id=current_user.id,
            workspace_type=current_workspace.type,
            company_id=current_workspace.company_id,
            factory_id=factory_id or current_workspace.factory_id
        )

        # 创建设备服务
        equipment_service = EquipmentService(db)

        # 获取设备列表
        equipments, total = equipment_service.get_equipment_list(
            current_user=current_user,
            workspace_context=workspace_context,
            skip=skip,
            limit=limit,
            search=search,
            equipment_type=equipment_type,
            status=status,
            factory_id=factory_id
        )

        # 格式化返回数据
        items = []
        for equipment in equipments:
            items.append({
                "id": str(equipment.id),
                "equipment_code": equipment.equipment_code,
                "equipment_name": equipment.equipment_name,
                "equipment_type": equipment.equipment_type,
                "category": equipment.category,
                "manufacturer": equipment.manufacturer,
                "brand": equipment.brand,
                "model": equipment.model,
                "serial_number": equipment.serial_number,
                "status": equipment.status,
                "is_active": equipment.is_active,
                "is_critical": equipment.is_critical,
                "location": equipment.location,
                "workshop": equipment.workshop,
                "area": equipment.area,
                "purchase_date": equipment.purchase_date.isoformat() if equipment.purchase_date else None,
                "last_maintenance_date": equipment.last_maintenance_date.isoformat() if equipment.last_maintenance_date else None,
                "next_maintenance_date": equipment.next_maintenance_date.isoformat() if equipment.next_maintenance_date else None,
                "created_at": equipment.created_at.isoformat() if equipment.created_at else None,
                "updated_at": equipment.updated_at.isoformat() if equipment.updated_at else None
            })

        page = (skip // limit) + 1
        total_pages = (total + limit - 1) // limit

        return {
            "success": True,
            "data": {
                "items": items,
                "total": total,
                "page": page,
                "page_size": limit,
                "total_pages": total_pages
            },
            "message": "获取设备列表成功"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取设备列表失败: {str(e)}"
        )


@router.post("/")
async def create_equipment(
    equipment_data: EquipmentCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    创建新设备
    """
    try:
        # 获取工作区服务
        workspace_service = get_workspace_service(db)
        current_workspace = await workspace_service.get_current_workspace(current_user)

        if not current_workspace:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="未找到工作区信息"
            )

        # 创建工作区上下文
        workspace_context = WorkspaceContext(
            user_id=current_user.id,
            workspace_type=current_workspace.type,
            company_id=current_workspace.company_id,
            factory_id=current_workspace.factory_id
        )

        # 创建设备服务
        equipment_service = EquipmentService(db)

        # 创建设备
        equipment = equipment_service.create_equipment(
            current_user=current_user,
            equipment_data=equipment_data.dict(),
            workspace_context=workspace_context
        )

        return {
            "success": True,
            "data": {
                "id": str(equipment.id),
                "equipment_code": equipment.equipment_code,
                "equipment_name": equipment.equipment_name,
                "equipment_type": equipment.equipment_type,
                "status": equipment.status,
                "created_at": equipment.created_at.isoformat() if equipment.created_at else None
            },
            "message": "设备创建成功"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建设备失败: {str(e)}"
        )


@router.get("/{equipment_id}")
async def get_equipment_detail(
    equipment_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    获取设备详情
    """
    try:
        # 获取工作区服务
        workspace_service = get_workspace_service(db)
        current_workspace = await workspace_service.get_current_workspace(current_user)

        if not current_workspace:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="未找到工作区信息"
            )

        # 创建工作区上下文
        workspace_context = WorkspaceContext(
            user_id=current_user.id,
            workspace_type=current_workspace.type,
            company_id=current_workspace.company_id,
            factory_id=current_workspace.factory_id
        )

        # 创建设备服务
        equipment_service = EquipmentService(db)

        # 获取设备详情
        equipment = equipment_service.get_equipment_by_id(
            equipment_id=equipment_id,
            current_user=current_user,
            workspace_context=workspace_context
        )

        if not equipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="设备不存在或无权访问"
            )

        return {
            "success": True,
            "data": {
                "id": str(equipment.id),
                "equipment_code": equipment.equipment_code,
                "equipment_name": equipment.equipment_name,
                "equipment_type": equipment.equipment_type,
                "category": equipment.category,
                "manufacturer": equipment.manufacturer,
                "brand": equipment.brand,
                "model": equipment.model,
                "serial_number": equipment.serial_number,
                "specifications": equipment.specifications,
                "rated_power": equipment.rated_power,
                "rated_voltage": equipment.rated_voltage,
                "rated_current": equipment.rated_current,
                "max_capacity": equipment.max_capacity,
                "working_range": equipment.working_range,
                "purchase_date": equipment.purchase_date.isoformat() if equipment.purchase_date else None,
                "purchase_price": equipment.purchase_price,
                "currency": equipment.currency,
                "supplier": equipment.supplier,
                "warranty_period": equipment.warranty_period,
                "warranty_expiry_date": equipment.warranty_expiry_date.isoformat() if equipment.warranty_expiry_date else None,
                "location": equipment.location,
                "workshop": equipment.workshop,
                "area": equipment.area,
                "status": equipment.status,
                "is_active": equipment.is_active,
                "is_critical": equipment.is_critical,
                "installation_date": equipment.installation_date.isoformat() if equipment.installation_date else None,
                "commissioning_date": equipment.commissioning_date.isoformat() if equipment.commissioning_date else None,
                "total_operating_hours": equipment.total_operating_hours,
                "total_maintenance_hours": equipment.total_maintenance_hours,
                "last_used_date": equipment.last_used_date.isoformat() if equipment.last_used_date else None,
                "usage_count": equipment.usage_count,
                "last_maintenance_date": equipment.last_maintenance_date.isoformat() if equipment.last_maintenance_date else None,
                "next_maintenance_date": equipment.next_maintenance_date.isoformat() if equipment.next_maintenance_date else None,
                "maintenance_interval_days": equipment.maintenance_interval_days,
                "maintenance_count": equipment.maintenance_count,
                "last_inspection_date": equipment.last_inspection_date.isoformat() if equipment.last_inspection_date else None,
                "next_inspection_date": equipment.next_inspection_date.isoformat() if equipment.next_inspection_date else None,
                "inspection_interval_days": equipment.inspection_interval_days,
                "calibration_date": equipment.calibration_date.isoformat() if equipment.calibration_date else None,
                "calibration_due_date": equipment.calibration_due_date.isoformat() if equipment.calibration_due_date else None,
                "responsible_person_id": equipment.responsible_person_id,
                "operator_ids": equipment.operator_ids,
                "availability_rate": equipment.availability_rate,
                "utilization_rate": equipment.utilization_rate,
                "failure_rate": equipment.failure_rate,
                "mtbf": equipment.mtbf,
                "mttr": equipment.mttr,
                "description": equipment.description,
                "notes": equipment.notes,
                "manual_url": equipment.manual_url,
                "images": equipment.images,
                "documents": equipment.documents,
                "tags": equipment.tags,
                "access_level": equipment.access_level,
                "created_at": equipment.created_at.isoformat() if equipment.created_at else None,
                "updated_at": equipment.updated_at.isoformat() if equipment.updated_at else None
            },
            "message": "获取设备详情成功"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取设备详情失败: {str(e)}"
        )


@router.put("/{equipment_id}")
async def update_equipment(
    equipment_id: int,
    equipment_data: EquipmentUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    更新设备信息
    """
    try:
        # 获取工作区服务
        workspace_service = get_workspace_service(db)
        current_workspace = await workspace_service.get_current_workspace(current_user)

        if not current_workspace:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="未找到工作区信息"
            )

        # 创建工作区上下文
        workspace_context = WorkspaceContext(
            user_id=current_user.id,
            workspace_type=current_workspace.type,
            company_id=current_workspace.company_id,
            factory_id=current_workspace.factory_id
        )

        # 创建设备服务
        equipment_service = EquipmentService(db)

        # 更新设备
        equipment = equipment_service.update_equipment(
            equipment_id=equipment_id,
            current_user=current_user,
            workspace_context=workspace_context,
            update_data=equipment_data.dict(exclude_unset=True)
        )

        if not equipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="设备不存在或无权访问"
            )

        return {
            "success": True,
            "data": {
                "id": str(equipment.id),
                "equipment_code": equipment.equipment_code,
                "equipment_name": equipment.equipment_name,
                "equipment_type": equipment.equipment_type,
                "status": equipment.status,
                "updated_at": equipment.updated_at.isoformat() if equipment.updated_at else None
            },
            "message": "设备信息更新成功"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新设备失败: {str(e)}"
        )


@router.delete("/{equipment_id}")
async def delete_equipment(
    equipment_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    删除设备
    """
    try:
        # 获取工作区服务
        workspace_service = get_workspace_service(db)
        current_workspace = await workspace_service.get_current_workspace(current_user)

        if not current_workspace:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="未找到工作区信息"
            )

        # 创建工作区上下文
        workspace_context = WorkspaceContext(
            user_id=current_user.id,
            workspace_type=current_workspace.type,
            company_id=current_workspace.company_id,
            factory_id=current_workspace.factory_id
        )

        # 创建设备服务
        equipment_service = EquipmentService(db)

        # 删除设备
        success = equipment_service.delete_equipment(
            equipment_id=equipment_id,
            current_user=current_user,
            workspace_context=workspace_context
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="设备不存在或无权访问"
            )

        return {
            "success": True,
            "message": "设备删除成功"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除设备失败: {str(e)}"
        )




@router.put("/{equipment_id}/status")
async def update_equipment_status(
    equipment_id: int,
    status_data: StatusUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    更新设备状态
    """
    try:
        # 获取工作区服务
        workspace_service = get_workspace_service(db)
        current_workspace = await workspace_service.get_current_workspace(current_user)

        if not current_workspace:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="未找到工作区信息"
            )

        # 创建工作区上下文
        workspace_context = WorkspaceContext(
            user_id=current_user.id,
            workspace_type=current_workspace.type,
            company_id=current_workspace.company_id,
            factory_id=current_workspace.factory_id
        )

        # 创建设备服务
        equipment_service = EquipmentService(db)

        # 更新设备状态
        equipment = equipment_service.update_equipment_status(
            equipment_id=equipment_id,
            current_user=current_user,
            workspace_context=workspace_context,
            new_status=status_data.status,
            notes=status_data.notes
        )

        if not equipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="设备不存在或无权访问"
            )

        return {
            "success": True,
            "data": {
                "equipment_id": str(equipment.id),
                "status": equipment.status,
                "updated_at": equipment.updated_at.isoformat() if equipment.updated_at else None
            },
            "message": "设备状态更新成功"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新设备状态失败: {str(e)}"
        )


@router.get("/maintenance/alerts")
async def get_maintenance_alerts(
    db: Session = Depends(deps.get_db),
    days: int = Query(30, ge=1, le=365, description="未来天数"),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    获取维护提醒
    """
    try:
        # 获取工作区服务
        workspace_service = get_workspace_service(db)
        current_workspace = await workspace_service.get_current_workspace(current_user)

        if not current_workspace:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="未找到工作区信息"
            )

        # 创建工作区上下文
        workspace_context = WorkspaceContext(
            user_id=current_user.id,
            workspace_type=current_workspace.type,
            company_id=current_workspace.company_id,
            factory_id=current_workspace.factory_id
        )

        # 创建设备服务
        equipment_service = EquipmentService(db)

        # 获取设备列表
        equipments, total = equipment_service.get_equipment_list(
            current_user=current_user,
            workspace_context=workspace_context,
            skip=0,
            limit=1000  # 获取所有设备用于检查维护提醒
        )

        # 筛选需要维护的设备
        target_date = date.today() + timedelta(days=days)
        maintenance_alerts = []

        for equipment in equipments:
            if (equipment.next_maintenance_date and
                equipment.next_maintenance_date <= target_date):

                days_until_maintenance = (equipment.next_maintenance_date - date.today()).days
                urgency = "urgent" if days_until_maintenance <= 7 else "normal" if days_until_maintenance <= 30 else "low"

                maintenance_alerts.append({
                    "id": str(equipment.id),
                    "equipment_code": equipment.equipment_code,
                    "equipment_name": equipment.equipment_name,
                    "equipment_type": equipment.equipment_type,
                    "next_maintenance_date": equipment.next_maintenance_date.isoformat(),
                    "days_until_maintenance": days_until_maintenance,
                    "urgency": urgency,
                    "location": equipment.location,
                    "status": equipment.status
                })

        # 按紧急程度和日期排序
        maintenance_alerts.sort(key=lambda x: (x["urgency"], x["days_until_maintenance"]))

        return {
            "success": True,
            "data": {
                "items": maintenance_alerts,
                "total": len(maintenance_alerts)
            },
            "message": "获取维护提醒成功"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取维护提醒失败: {str(e)}"
        )


@router.get("/statistics/overview")
async def get_equipment_statistics(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    获取设备统计信息
    """
    try:
        # 获取工作区服务
        workspace_service = get_workspace_service(db)
        current_workspace = await workspace_service.get_current_workspace(current_user)

        if not current_workspace:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="未找到工作区信息"
            )

        # 创建工作区上下文
        workspace_context = WorkspaceContext(
            user_id=current_user.id,
            workspace_type=current_workspace.type,
            company_id=current_workspace.company_id,
            factory_id=current_workspace.factory_id
        )

        # 创建设备服务
        equipment_service = EquipmentService(db)

        # 获取统计信息
        statistics = equipment_service.get_equipment_statistics(
            current_user=current_user,
            workspace_context=workspace_context
        )

        return {
            "success": True,
            "data": statistics,
            "message": "获取统计信息成功"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取统计信息失败: {str(e)}"
        )

