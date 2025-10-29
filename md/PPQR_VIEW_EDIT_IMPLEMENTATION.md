# pPQR 查看和编辑功能实现报告

## 📋 概述

本文档记录了pPQR（预备工艺评定记录）的查看和编辑功能的完整实现，参照WPS和PQR的实现方式。

## 🔧 实现的功能

### 1. 后端API实现

#### 1.1 修复创建功能
**文件**: `backend/app/services/ppqr_service.py`

**问题**: 创建pPQR时缺少必填字段 `created_by`，导致500错误

**修复**:
```python
# 创建pPQR对象时添加 created_by 字段
ppqr = PPQR(
    user_id=current_user.id,
    workspace_type=workspace_context.workspace_type,
    company_id=workspace_context.company_id,
    factory_id=workspace_context.factory_id,
    ppqr_number=ppqr_data.get("ppqr_number"),
    title=ppqr_data.get("title"),
    revision=ppqr_data.get("revision", "A"),
    status=ppqr_data.get("status", "draft"),
    template_id=ppqr_data.get("template_id"),
    module_data=ppqr_data.get("module_data", {}),
    created_by=current_user.id  # ✅ 添加创建人ID
)
```

#### 1.2 实现获取详情端点
**文件**: `backend/app/api/v1/endpoints/ppqr.py`

**端点**: `GET /api/v1/ppqr/{ppqr_id}`

**功能**:
- ✅ 支持工作区上下文数据隔离
- ✅ 权限检查（只能查看自己工作区的pPQR）
- ✅ 返回完整的pPQR数据，包括模块数据
- ✅ 兼容前端字段命名（module_data 和 modules_data）

**关键代码**:
```python
@router.get("/{ppqr_id}")
async def get_ppqr_detail(
    ppqr_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    workspace_id: Optional[str] = Header(None, alias="X-Workspace-ID")
) -> Any:
    # 获取工作区上下文
    workspace_context = get_workspace_context(db, current_user, workspace_id)
    
    # 初始化pPQR服务
    ppqr_service = PPQRService(db)
    
    # 获取pPQR
    ppqr = ppqr_service.get(
        db,
        id=ppqr_id,
        current_user=current_user,
        workspace_context=workspace_context
    )
    
    # 返回响应数据
    return response_data
```

#### 1.3 实现更新端点
**文件**: `backend/app/api/v1/endpoints/ppqr.py`

**端点**: `PUT /api/v1/ppqr/{ppqr_id}`

**功能**:
- ✅ 支持工作区上下文数据隔离
- ✅ 权限检查（只能更新自己工作区的pPQR）
- ✅ 自动设置 `updated_by` 字段
- ✅ 支持部分更新

**关键代码**:
```python
@router.put("/{ppqr_id}")
async def update_ppqr(
    ppqr_id: int,
    ppqr_data: dict,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    workspace_id: Optional[str] = Header(None, alias="X-Workspace-ID")
) -> Any:
    # 获取工作区上下文
    workspace_context = get_workspace_context(db, current_user, workspace_id)
    
    # 初始化pPQR服务
    ppqr_service = PPQRService(db)
    
    # 更新pPQR
    ppqr = ppqr_service.update(
        db,
        id=ppqr_id,
        ppqr_data=ppqr_data,
        current_user=current_user,
        workspace_context=workspace_context
    )
    
    return response_data
```

#### 1.4 实现删除端点
**文件**: `backend/app/api/v1/endpoints/ppqr.py`

**端点**: `DELETE /api/v1/ppqr/{ppqr_id}`

**功能**:
- ✅ 支持工作区上下文数据隔离
- ✅ 权限检查（只能删除自己工作区的pPQR）
- ✅ 自动更新配额使用情况（个人工作区）

**关键代码**:
```python
@router.delete("/{ppqr_id}")
async def delete_ppqr(
    ppqr_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    workspace_id: Optional[str] = Header(None, alias="X-Workspace-ID")
) -> Any:
    # 删除pPQR
    success = ppqr_service.delete(
        db,
        id=ppqr_id,
        current_user=current_user,
        workspace_context=workspace_context
    )
    
    # 更新配额使用情况（仅个人工作区）
    if workspace_context.workspace_type == WorkspaceType.PERSONAL:
        membership_service.update_quota_usage(current_user, "ppqr", -1)
    
    return {"success": True, "message": "pPQR删除成功"}
```

#### 1.5 更新服务层
**文件**: `backend/app/services/ppqr_service.py`

**修改**: 在 `update` 方法中添加 `updated_by` 字段

```python
def update(self, db: Session, *, id: int, ppqr_data: dict, 
           current_user: User, workspace_context: WorkspaceContext) -> Optional[PPQR]:
    ppqr = self.get(db, id=id, current_user=current_user, workspace_context=workspace_context)
    if not ppqr:
        return None

    # 更新字段
    for key, value in ppqr_data.items():
        if hasattr(ppqr, key) and value is not None:
            setattr(ppqr, key, value)
    
    # ✅ 设置更新人
    ppqr.updated_by = current_user.id

    db.commit()
    db.refresh(ppqr)

    return ppqr
```

### 2. 前端实现

#### 2.1 文件重命名
为了保持一致性，将文件重命名：
- ✅ `pPQRDetail.tsx` → `PPQRDetail.tsx`
- ✅ `pPQRList.tsx` → `PPQRList.tsx`

#### 2.2 详情页面
**文件**: `frontend/src/pages/pPQR/PPQRDetail.tsx`

**功能**:
- ✅ 显示pPQR基本信息
- ✅ 显示模块化数据（支持预设模块和自定义模块）
- ✅ 支持图片预览
- ✅ 支持文件下载
- ✅ 支持表格数据展示
- ✅ 操作按钮：编辑、复制、导出PDF、转换为PQR

**参照**: `frontend/src/pages/WPS/WPSDetail.tsx` 和 `frontend/src/pages/PQR/PQRDetail.tsx`

#### 2.3 编辑页面
**文件**: `frontend/src/pages/pPQR/PPQREdit.tsx`

**功能**:
- ✅ 基于模板的编辑功能
- ✅ 使用 `ModuleFormRenderer` 渲染模块表单
- ✅ 自动从 `modules_data` 恢复表单值
- ✅ 保存时重新构建 `modules_data` 结构
- ✅ 支持取消操作

**参照**: `frontend/src/pages/WPS/WPSEdit.tsx` 和 `frontend/src/pages/PQR/PQREdit.tsx`

#### 2.4 列表页面
**文件**: `frontend/src/pages/pPQR/PPQRList.tsx`

**功能**:
- ✅ 查看按钮：导航到 `/ppqr/{id}`
- ✅ 编辑按钮：导航到 `/ppqr/{id}/edit`
- ✅ 权限检查：`ppqr.update` 权限
- ✅ 其他操作：复制、导出PDF、转换为PQR、删除

### 3. 路由配置

**文件**: `frontend/src/App.tsx`

**路由**:
```typescript
// pPQR管理
<Route path="ppqr" element={<PPQRList />} />
<Route path="ppqr/create" element={<PPQRCreate />} />
<Route path="ppqr/:id" element={<PPQRDetail />} />        // ✅ 详情页面
<Route path="ppqr/:id/edit" element={<PPQREdit />} />    // ✅ 编辑页面
```

## 📊 功能对比

| 功能 | WPS | PQR | pPQR |
|------|-----|-----|------|
| 列表查看 | ✅ | ✅ | ✅ |
| 详情查看 | ✅ | ✅ | ✅ |
| 创建 | ✅ | ✅ | ✅ |
| 编辑 | ✅ | ✅ | ✅ |
| 删除 | ✅ | ✅ | ✅ |
| 复制 | ✅ | ✅ | ✅ |
| 导出PDF | ✅ | ✅ | ✅ |
| 工作区隔离 | ✅ | ✅ | ✅ |
| 权限控制 | ✅ | ✅ | ✅ |
| 模块化数据 | ✅ | ✅ | ✅ |

## 🧪 测试建议

### 1. 后端测试
```bash
cd backend
python test_ppqr_creation_fix.py
```

### 2. 前端测试
1. 重启后端服务器（应用代码更改）
2. 在pPQR列表页面点击"查看"按钮
3. 验证详情页面正确显示所有数据
4. 点击"编辑"按钮
5. 修改数据并保存
6. 验证数据已正确更新

### 3. 功能测试清单
- [ ] 创建pPQR成功
- [ ] 查看pPQR详情
- [ ] 编辑pPQR并保存
- [ ] 复制pPQR
- [ ] 删除pPQR
- [ ] 导出PDF
- [ ] 转换为PQR
- [ ] 权限控制正常
- [ ] 工作区隔离正常

## 🚀 下一步

1. **重启后端服务器**以应用所有更改
2. **测试所有功能**确保正常工作
3. **优化用户体验**（如需要）
4. **添加更多操作**（如审批流程等）

## 📝 注意事项

1. **字段兼容性**: 后端返回 `module_data` 和 `modules_data` 两个字段，确保前端兼容性
2. **权限检查**: 所有操作都需要检查用户权限
3. **工作区隔离**: 确保用户只能访问自己工作区的数据
4. **配额管理**: 删除pPQR时自动更新配额使用情况

## 🐛 修复的问题

### 问题1: 编辑功能字段名不匹配

**问题描述**:
- 前端发送 `modules_data` 字段
- 数据库字段名是 `module_data`（单数）
- 导致编辑时模块数据无法保存

**解决方案**:

1. **修改 `PPQRService.update()` 方法** (`backend/app/services/ppqr_service.py`)
   ```python
   # 字段名映射（前端使用 modules_data，数据库使用 module_data）
   field_mapping = {
       'modules_data': 'module_data'
   }

   # 更新字段
   for key, value in ppqr_data.items():
       # 转换字段名
       db_field_name = field_mapping.get(key, key)

       if hasattr(ppqr, db_field_name) and value is not None:
           setattr(ppqr, db_field_name, value)
   ```

2. **修改 `PPQRService.create()` 方法** (`backend/app/services/ppqr_service.py`)
   ```python
   # 获取模块数据（支持 module_data 和 modules_data 两种字段名）
   module_data = ppqr_data.get("module_data") or ppqr_data.get("modules_data", {})

   ppqr = PPQR(
       # ... 其他字段
       module_data=module_data,
       # ...
   )
   ```

3. **后端响应兼容性** (`backend/app/api/v1/endpoints/ppqr.py`)
   ```python
   response_data = {
       # ...
       "module_data": ppqr.module_data,
       "modules_data": ppqr.module_data,  # 兼容前端
       # ...
   }
   ```

## ✅ 完成状态

- ✅ 后端创建功能修复（添加 created_by 字段）
- ✅ 后端创建功能支持 modules_data 字段
- ✅ 后端获取详情端点实现
- ✅ 后端更新端点实现
- ✅ 后端更新功能支持 modules_data 字段映射
- ✅ 后端删除端点实现
- ✅ 前端文件重命名（保持一致性）
- ✅ 前端详情页面已存在
- ✅ 前端编辑页面已存在
- ✅ 前端列表页面按钮已存在
- ✅ 路由配置已完成

## 🔍 测试步骤

1. **重启后端服务器**
   ```bash
   # 停止当前运行的后端服务器
   # 重新启动
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **测试编辑功能**
   - 打开pPQR列表页面
   - 点击任意pPQR的"编辑"按钮
   - 修改标题或模块数据
   - 点击"保存"按钮
   - 验证数据已正确更新

3. **使用测试脚本**
   ```bash
   cd backend
   # 先在脚本中设置有效的 AUTH_TOKEN
   python test_ppqr_edit.py
   ```

---

**实施日期**: 2025-10-27
**实施人员**: AI Assistant
**参考实现**: WPS和PQR的查看编辑功能
**最后更新**: 修复了 modules_data 字段映射问题

