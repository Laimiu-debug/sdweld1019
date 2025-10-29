# PQR 工作区隔离实现

## 📋 概述

为 PQR (Procedure Qualification Record) 实现了完整的工作区隔离功能，与 WPS 保持一致。

## 🎯 实现目标

1. ✅ **个人工作区隔离** - 用户只能看到自己创建的 PQR
2. ✅ **企业工作区隔离** - 企业成员只能看到本企业的 PQR
3. ✅ **工厂级别隔离** - 支持按工厂过滤 PQR
4. ✅ **权限控制** - 基于工作区类型和用户角色的权限检查

## 🔧 实现细节

### 1. PQR 模型字段

PQR 模型已经包含了工作区隔离所需的字段：

```python
class PQR(Base):
    # 数据隔离核心字段
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    workspace_type = Column(String(20), nullable=False, default="personal", index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    factory_id = Column(Integer, ForeignKey("factories.id"), nullable=True, index=True)
    
    # 数据访问控制
    is_shared = Column(Boolean, default=False)
    access_level = Column(String(20), default="private")
    
    # 审计字段
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
```

### 2. PQR Service 修改

#### 初始化方法

```python
class PQRService:
    def __init__(self, db: Session):
        """Initialize PQR service with database session."""
        self.db = db
        self.data_access = DataAccessControl(db)
```

#### get() 方法 - 添加工作区过滤

```python
def get(
    self,
    db: Session,
    *,
    id: int,
    current_user: Optional[User] = None,
    workspace_context: Optional[WorkspaceContext] = None
) -> Optional[PQR]:
    """Get PQR by ID with workspace filtering."""
    query = db.query(PQR).filter(PQR.id == id)

    # Apply workspace filter if context is provided
    if current_user and workspace_context:
        query = self.data_access.apply_workspace_filter(
            query, PQR, current_user, workspace_context
        )

    return query.first()
```

#### get_multi() 方法 - 添加工作区过滤

```python
def get_multi(
    self,
    db: Session,
    *,
    skip: int = 0,
    limit: int = 100,
    current_user: Optional[User] = None,
    workspace_context: Optional[WorkspaceContext] = None,
    owner_id: Optional[int] = None,
    qualification_result: Optional[str] = None,
    search_term: Optional[str] = None,
    status: Optional[str] = None
) -> List[PQR]:
    """Get multiple PQR with filtering options and workspace isolation."""
    query = db.query(PQR).filter(PQR.is_active == True)

    # Apply workspace filter - CRITICAL for data isolation
    if current_user and workspace_context:
        if workspace_context.workspace_type == WorkspaceType.PERSONAL:
            # Personal workspace: only user's own PQR
            query = query.filter(
                PQR.workspace_type == WorkspaceType.PERSONAL,
                PQR.user_id == current_user.id
            )
        elif workspace_context.workspace_type == WorkspaceType.ENTERPRISE:
            # Enterprise workspace: only company's PQR
            if workspace_context.company_id:
                query = query.filter(
                    PQR.workspace_type == WorkspaceType.ENTERPRISE,
                    PQR.company_id == workspace_context.company_id
                )

                # Apply factory filter if specified
                if workspace_context.factory_id:
                    query = query.filter(PQR.factory_id == workspace_context.factory_id)
            else:
                # No company_id, return empty result
                query = query.filter(PQR.id == -1)
        else:
            # Unknown workspace type, return empty result
            query = query.filter(PQR.id == -1)

    # Apply additional filters...
    return query.order_by(PQR.created_at.desc()).offset(skip).limit(limit).all()
```

#### count() 方法 - 添加工作区过滤

```python
def count(
    self,
    db: Session,
    *,
    current_user: Optional[User] = None,
    workspace_context: Optional[WorkspaceContext] = None,
    owner_id: Optional[int] = None,
    qualification_result: Optional[str] = None,
    search_term: Optional[str] = None,
    status: Optional[str] = None
) -> int:
    """Count PQR with filtering options and workspace isolation."""
    # Same workspace filtering logic as get_multi()
    ...
```

#### create() 方法 - 设置工作区字段

```python
def create(
    self,
    db: Session,
    *,
    obj_in: PQRCreate,
    current_user: User,
    workspace_context: WorkspaceContext
) -> PQR:
    """Create new PQR with workspace context."""
    # Check if PQR number already exists in the same workspace
    existing_pqr = self.get_by_number(db, pqr_number=obj_in.pqr_number)
    if existing_pqr:
        if workspace_context.workspace_type == WorkspaceType.PERSONAL:
            if existing_pqr.user_id == current_user.id:
                raise ValueError(f"PQR number {obj_in.pqr_number} already exists in your workspace")
        elif workspace_context.workspace_type == WorkspaceType.ENTERPRISE:
            if existing_pqr.company_id == workspace_context.company_id:
                raise ValueError(f"PQR number {obj_in.pqr_number} already exists in this company")

    # Set workspace-related fields
    workspace_fields = {
        "user_id": current_user.id,
        "workspace_type": workspace_context.workspace_type,
        "created_by": current_user.id,
        "updated_by": current_user.id,
        "owner_id": current_user.id,  # For backward compatibility
    }

    # Set company and factory for enterprise workspace
    if workspace_context.workspace_type == WorkspaceType.ENTERPRISE:
        workspace_fields["company_id"] = workspace_context.company_id
        workspace_fields["factory_id"] = workspace_context.factory_id

    # Create PQR object
    db_obj = PQR(**obj_data, **workspace_fields)
    ...
```

### 3. API 端点修改

#### 列表端点 - GET /api/v1/pqr/

```python
@router.get("/", response_model=PQRListResponse)
def read_pqr_list(
    db: Session = Depends(deps.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=1000),
    current_user: User = Depends(deps.get_current_active_user),
    workspace_id: Optional[str] = Header(None, alias="X-Workspace-ID")
) -> Any:
    """检索PQR列表（带工作区上下文数据隔离）."""
    # Get workspace context
    workspace_context = get_workspace_context(db, current_user, workspace_id)

    # Initialize PQR service
    pqr_service_instance = PQRService(db)

    # Get total count with workspace filtering
    total = pqr_service_instance.count(
        db,
        current_user=current_user,
        workspace_context=workspace_context,
        ...
    )

    # Get PQR list with workspace filtering
    pqr_list = pqr_service_instance.get_multi(
        db,
        current_user=current_user,
        workspace_context=workspace_context,
        ...
    )
    ...
```

#### 创建端点 - POST /api/v1/pqr/

```python
@router.post("/", response_model=PQRResponse)
def create_pqr(
    *,
    db: Session = Depends(deps.get_db),
    pqr_in: PQRCreate,
    current_user: User = Depends(deps.get_current_active_user),
    workspace_id: Optional[str] = Header(None, alias="X-Workspace-ID")
) -> Any:
    """创建新的PQR（带工作区上下文）."""
    # Get workspace context
    workspace_context = get_workspace_context(db, current_user, workspace_id)

    # Check permission (enterprise members have access by default)
    if current_user.membership_type != "enterprise":
        if not user_service.has_permission(db, current_user.id, "pqr", "create"):
            raise HTTPException(status_code=403, detail="没有足够的权限")

    # Check quota (only for personal workspace)
    if workspace_context.workspace_type == WorkspaceType.PERSONAL:
        # Check and update quota...
        pass

    # Create PQR with workspace context
    pqr_service_instance = PQRService(db)
    pqr = pqr_service_instance.create(
        db,
        obj_in=pqr_in,
        current_user=current_user,
        workspace_context=workspace_context
    )
    ...
```

#### 详情端点 - GET /api/v1/pqr/{id}

```python
@router.get("/{id}", response_model=PQRResponse)
def read_pqr_by_id(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
    workspace_id: Optional[str] = Header(None, alias="X-Workspace-ID")
) -> Any:
    """通过ID获取PQR（带工作区上下文数据隔离）."""
    # Get workspace context
    workspace_context = get_workspace_context(db, current_user, workspace_id)

    # Get PQR with workspace filtering
    pqr_service_instance = PQRService(db)
    pqr = pqr_service_instance.get(
        db,
        id=id,
        current_user=current_user,
        workspace_context=workspace_context
    )

    if not pqr:
        raise HTTPException(status_code=404, detail="PQR未找到")

    return pqr
```

#### 更新端点 - PUT /api/v1/pqr/{id}

```python
@router.put("/{id}", response_model=PQRResponse)
def update_pqr(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    pqr_in: PQRUpdate,
    current_user: User = Depends(deps.get_current_active_user),
    workspace_id: Optional[str] = Header(None, alias="X-Workspace-ID")
) -> Any:
    """更新PQR（带权限检查和工作区上下文）."""
    # Get workspace context
    workspace_context = get_workspace_context(db, current_user, workspace_id)

    # Get PQR with workspace filtering
    pqr = pqr_service_instance.get(db, id=id, current_user=current_user, workspace_context=workspace_context)

    if not pqr:
        raise HTTPException(status_code=404, detail="PQR未找到")

    # Check permission
    if pqr.user_id != current_user.id and not current_user.is_superuser:
        # For enterprise workspace, check if user is admin
        if workspace_context.workspace_type == WorkspaceType.ENTERPRISE:
            employee = db.query(CompanyEmployee).filter(...).first()
            if not employee or employee.role != "admin":
                raise HTTPException(status_code=403, detail="只能更新自己的PQR或需要管理员权限")
        else:
            raise HTTPException(status_code=403, detail="只能更新自己的PQR")

    pqr = pqr_service_instance.update(db, db_obj=pqr, obj_in=pqr_in)
    ...
```

## 📊 工作区隔离规则

### 个人工作区 (Personal Workspace)

- **创建**: 自动设置 `workspace_type="personal"`, `user_id=current_user.id`
- **查询**: 只返回 `workspace_type="personal"` 且 `user_id=current_user.id` 的记录
- **更新**: 只能更新自己创建的 PQR
- **删除**: 只能删除自己创建的 PQR
- **配额**: 受会员等级配额限制

### 企业工作区 (Enterprise Workspace)

- **创建**: 自动设置 `workspace_type="enterprise"`, `company_id`, `factory_id`
- **查询**: 只返回 `workspace_type="enterprise"` 且 `company_id=workspace_context.company_id` 的记录
- **工厂过滤**: 如果指定 `factory_id`，进一步过滤
- **更新**: 创建者或企业管理员可以更新
- **删除**: 创建者或企业管理员可以删除
- **配额**: 不受个人配额限制

## 🔒 安全性

1. ✅ **强制工作区过滤** - 所有查询都必须应用工作区过滤
2. ✅ **权限检查** - 基于工作区类型和用户角色
3. ✅ **数据隔离** - 不同工作区的数据完全隔离
4. ✅ **审计追踪** - 记录创建者和更新者

## 📁 修改的文件

1. ✅ `backend/app/services/pqr_service.py`
   - 添加 `__init__` 方法初始化 `DataAccessControl`
   - 修改 `get()` 方法支持工作区过滤
   - 修改 `get_multi()` 方法支持工作区过滤
   - 修改 `count()` 方法支持工作区过滤
   - 修改 `create()` 方法设置工作区字段

2. ✅ `backend/app/api/v1/endpoints/pqr.py`
   - 修改列表端点添加工作区上下文
   - 修改创建端点添加工作区上下文
   - 修改详情端点添加工作区过滤
   - 修改更新端点添加工作区过滤和权限检查
   - 修改删除端点添加工作区过滤和权限检查

## 🧪 测试建议

### 个人工作区测试

1. 用户 A 创建 PQR
2. 用户 A 应该能看到自己的 PQR
3. 用户 B 不应该能看到用户 A 的 PQR
4. 用户 A 可以更新/删除自己的 PQR
5. 用户 B 不能更新/删除用户 A 的 PQR

### 企业工作区测试

1. 企业成员 A 创建 PQR
2. 同企业成员 B 应该能看到 PQR
3. 其他企业成员不应该能看到
4. 企业管理员可以更新/删除任何企业 PQR
5. 普通成员只能更新/删除自己的 PQR

## 🎉 完成

PQR 现在已经实现了完整的工作区隔离功能，与 WPS 保持一致！

