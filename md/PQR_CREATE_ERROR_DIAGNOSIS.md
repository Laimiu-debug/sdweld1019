# PQR 创建错误诊断报告

## 🔍 发现的问题

### 1. ⚠️ **严重问题：模型字段重复定义**

**位置**: `backend/app/models/pqr.py`

**问题描述**: `created_by` 和 `updated_by` 字段被定义了两次：
- 第31-32行（数据隔离核心字段部分）
- 第167-168行（审计字段部分）

**影响**: 这会导致SQLAlchemy模型混乱，可能引发数据库操作错误。

**代码片段**:
```python
# 第31-32行
# 审计字段
created_by = Column(Integer, ForeignKey("users.id"), nullable=False, comment="创建人ID")
updated_by = Column(Integer, ForeignKey("users.id"), nullable=True, comment="最后更新人ID")

# ... 中间省略 ...

# 第167-168行
# ==================== 审计字段 ====================
created_by = Column(Integer, ForeignKey("users.id"), nullable=False, comment="创建人ID")
updated_by = Column(Integer, ForeignKey("users.id"), nullable=True, comment="更新人ID")
```

### 2. ⚠️ **数据库约束问题**

**问题描述**: PQR模型中有多个必填字段（`nullable=False`）：
- `user_id` (第21行)
- `workspace_type` (第22行)
- `created_by` (第31行和第167行)
- `pqr_number` (第35行)
- `title` (第36行)

但前端提交的数据可能不包含所有这些字段。

### 3. ⚠️ **数据结构不匹配**

**前端提交的数据结构** (`frontend/src/pages/PQR/PQRCreate.tsx` 第151-162行):
```typescript
const submitData: any = {
  template_id: selectedTemplateId,
  title: pqrTitle || `PQR-${Date.now()}`,
  pqr_number: pqrNumber || `PQR-${Date.now()}`,
  test_date: new Date().toISOString(),
  qualification_result: 'pending',
}

if (Object.keys(modulesData).length > 0) {
  submitData.modules_data = modulesData
}
```

**后端期望的字段** (`backend/app/schemas/pqr.py` 第11-145行):
- 必填: `title`, `pqr_number`
- 可选: 大量的焊接工艺参数字段

**问题**: 前端使用 `modules_data` 存储模块化数据，但后端schema没有正确处理这个字段。

### 4. ⚠️ **缺少工作区上下文**

**问题描述**: PQR模型需要以下工作区字段：
- `user_id` (必填)
- `workspace_type` (必填，默认值为"personal")
- `company_id` (可选)
- `factory_id` (可选)

但在 `pqr_service.py` 的 `create` 方法中，只设置了：
```python
db_obj = PQR(
    **obj_in.model_dump(),
    owner_id=owner_id,
    user_id=owner_id,
    created_by=owner_id
)
```

缺少 `workspace_type` 的设置。

## 🔧 修复方案

### 修复1: 删除重复的字段定义

**文件**: `backend/app/models/pqr.py`

**操作**: 删除第167-168行的重复定义，保留第31-32行的定义。

### 修复2: 完善PQR创建服务

**文件**: `backend/app/services/pqr_service.py`

**操作**: 在创建PQR时，确保设置所有必填字段：
```python
def create(self, db: Session, *, obj_in: PQRCreate, owner_id: int) -> PQR:
    """Create new PQR."""
    # Check if PQR number already exists
    existing_pqr = self.get_by_number(db, pqr_number=obj_in.pqr_number)
    if existing_pqr:
        raise ValueError(f"PQR number {obj_in.pqr_number} already exists")

    # 准备数据
    obj_data = obj_in.model_dump(exclude_unset=True)
    
    db_obj = PQR(
        **obj_data,
        owner_id=owner_id,
        user_id=owner_id,
        workspace_type="personal",  # 添加默认工作区类型
        created_by=owner_id,
        updated_by=owner_id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
```

### 修复3: 更新PQR Schema以支持模块化数据

**文件**: `backend/app/schemas/pqr.py`

**操作**: 确保 `PQRCreate` schema 正确处理 `modules_data` 字段（已经存在，第144-145行）。

### 修复4: 添加更好的错误处理

**文件**: `backend/app/api/v1/endpoints/pqr.py`

**操作**: 改进错误处理，提供更详细的错误信息：
```python
@router.post("/", response_model=PQRResponse)
def create_pqr(
    *,
    db: Session = Depends(deps.get_db),
    pqr_in: PQRCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """创建新的PQR."""
    try:
        # 检查会员配额
        from app.services.membership_service import MembershipService
        membership_service = MembershipService(db)

        if not membership_service.check_quota_available(current_user, "pqr"):
            limits = membership_service.get_membership_limits(current_user.member_tier)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"已达到PQR配额限制 ({limits['pqr']}个)，请升级会员等级"
            )

        pqr = pqr_service.create(db, obj_in=pqr_in, owner_id=current_user.id)

        # 更新配额使用情况
        membership_service.update_quota_usage(current_user, "pqr", 1)

        return pqr
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # 添加详细的错误日志
        import traceback
        print(f"创建PQR失败: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"创建PQR失败: {str(e)}")
```

## 📋 修复步骤

1. ✅ 修复模型重复字段定义
2. ✅ 完善PQR创建服务，添加必填字段
3. ✅ 改进错误处理
4. ✅ 添加 `modules_data` 列到数据库
5. ✅ 在模型中添加 `modules_data` 字段
6. ✅ 添加 `template_id` 列到数据库
7. ✅ 在模型中添加 `template_id` 字段
8. ✅ 修复 `test_date` 字段约束（改为可空）
9. ✅ 测试PQR创建功能

## 🧪 测试结果

✅ **所有测试通过！**

### 测试1: 完整数据创建PQR
- ✅ 成功创建PQR记录
- ✅ 所有字段正确保存
- ✅ `modules_data` 字段正确存储JSONB数据
- ✅ 可以成功检索PQR

### 测试2: 最小数据创建PQR
- ✅ 只使用必填字段（title, pqr_number）成功创建
- ✅ 可选字段正确设置为NULL
- ✅ 默认值正确应用（workspace_type='personal'）

## ✅ 已修复的文件

### 后端文件
1. **backend/app/models/pqr.py**
   - 删除重复的 `created_by` 和 `updated_by` 字段定义
   - 添加 `template_id` 字段（String类型，带索引）
   - 添加 `modules_data` 字段（JSONB类型）
   - 导入 `JSONB` 类型

2. **backend/app/services/pqr_service.py**
   - 使用 `model_dump(exclude_unset=True)` 避免传递未设置的字段
   - 确保设置所有必填字段（user_id, workspace_type, created_by, updated_by）

3. **backend/app/api/v1/endpoints/pqr.py**
   - 改进错误处理，添加详细的错误日志
   - 捕获所有异常并返回清晰的错误信息

### 数据库修改
1. **test_date 字段**
   - 从 NOT NULL 改为可空
   - 与schema定义保持一致

2. **template_id 字段**
   - 添加 VARCHAR(100) 类型的列
   - 添加索引以提高查询性能
   - 用于关联使用的模板

3. **modules_data 字段**
   - 添加 JSONB 类型的列
   - 用于存储模块化数据

## 🎯 现在可以做什么

现在你可以：
1. ✅ 创建PQR记录（只需要 title 和 pqr_number）
2. ✅ 使用模块化数据（modules_data）
3. ✅ 获得清晰的错误信息
4. ✅ 在前端正常提交PQR表单

## 📝 前端使用示例

```typescript
// 创建PQR
const submitData = {
  title: "测试PQR",
  pqr_number: "PQR-2025-001",
  test_date: new Date().toISOString(),  // 可选
  qualification_result: 'pending',  // 可选
  modules_data: {  // 可选
    "module_1": {
      "module_id": "pqr_basic_info",
      "custom_name": "基本信息",
      "data": {
        "field1": "value1"
      }
    }
  }
}

const response = await pqrService.create(submitData)
```

