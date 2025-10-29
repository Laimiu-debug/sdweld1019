# pPQR编辑按钮问题修复总结

## 🐛 问题描述

点击pPQR列表页面的"编辑"按钮后，虽然可以进入编辑页面，但保存时模块数据无法正确更新到数据库。

## 🔍 根本原因

**字段名不匹配问题**:
- 前端发送的字段名: `modules_data` (复数)
- 数据库字段名: `module_data` (单数)
- 后端update方法使用 `hasattr()` 检查字段，导致 `modules_data` 被忽略

## ✅ 解决方案

### 1. 修复后端服务层

**文件**: `backend/app/services/ppqr_service.py`

#### 修改1: update方法添加字段映射
```python
def update(self, db: Session, *, id: int, ppqr_data: dict, 
           current_user: User, workspace_context: WorkspaceContext) -> Optional[PPQR]:
    ppqr = self.get(db, id=id, current_user=current_user, workspace_context=workspace_context)
    if not ppqr:
        return None

    # ✅ 字段名映射（前端使用 modules_data，数据库使用 module_data）
    field_mapping = {
        'modules_data': 'module_data'
    }

    # 更新字段
    for key, value in ppqr_data.items():
        # ✅ 转换字段名
        db_field_name = field_mapping.get(key, key)
        
        if hasattr(ppqr, db_field_name) and value is not None:
            setattr(ppqr, db_field_name, value)
    
    # ✅ 设置更新人
    ppqr.updated_by = current_user.id

    db.commit()
    db.refresh(ppqr)

    return ppqr
```

#### 修改2: create方法支持两种字段名
```python
def create(self, db: Session, *, ppqr_data: dict, 
           current_user: User, workspace_context: WorkspaceContext) -> PPQR:
    # ✅ 获取模块数据（支持 module_data 和 modules_data 两种字段名）
    module_data = ppqr_data.get("module_data") or ppqr_data.get("modules_data", {})
    
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
        module_data=module_data,  # ✅ 使用转换后的字段
        created_by=current_user.id
    )
    
    db.add(ppqr)
    db.commit()
    db.refresh(ppqr)
    
    return ppqr
```

### 2. 后端API响应兼容性

**文件**: `backend/app/api/v1/endpoints/ppqr.py`

GET和PUT端点都返回两个字段，确保前端兼容性：

```python
response_data = {
    "id": ppqr.id,
    "title": ppqr.title,
    "ppqr_number": ppqr.ppqr_number,
    "revision": ppqr.revision,
    "status": ppqr.status,
    "template_id": ppqr.template_id,
    "module_data": ppqr.module_data,      # 数据库字段名
    "modules_data": ppqr.module_data,     # ✅ 前端期望的字段名
    # ... 其他字段
}
```

## 📋 修改的文件清单

1. ✅ `backend/app/services/ppqr_service.py`
   - 修改 `create()` 方法：支持 `modules_data` 字段
   - 修改 `update()` 方法：添加字段名映射

2. ✅ `backend/app/api/v1/endpoints/ppqr.py`
   - 已经在之前的修复中添加了响应字段兼容性

## 🚀 部署步骤

### 1. 重启后端服务器

**重要**: 必须重启后端服务器才能应用代码更改！

```bash
# 方法1: 如果使用 uvicorn --reload，保存文件后会自动重启

# 方法2: 手动重启
# 1. 停止当前运行的服务器 (Ctrl+C)
# 2. 重新启动
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. 测试编辑功能

1. 打开浏览器，访问 `http://localhost:3000/ppqr`
2. 点击任意pPQR的"编辑"按钮
3. 修改标题或模块数据
4. 点击"保存"按钮
5. 返回列表页面，验证数据已更新
6. 再次点击"查看"按钮，确认模块数据正确保存

### 3. 使用测试脚本验证

```bash
cd backend
# 1. 编辑 test_ppqr_edit.py
# 2. 替换 AUTH_TOKEN 为有效的token
# 3. 运行测试
python test_ppqr_edit.py
```

## 🧪 测试检查清单

- [ ] 后端服务器已重启
- [ ] 可以打开pPQR列表页面
- [ ] 点击"编辑"按钮可以进入编辑页面
- [ ] 编辑页面正确显示现有数据
- [ ] 修改数据后可以成功保存
- [ ] 保存后数据正确更新
- [ ] 模块数据正确保存到数据库
- [ ] 查看页面显示更新后的数据

## 📊 技术细节

### 字段映射逻辑

```
前端发送:
{
  "title": "测试pPQR",
  "modules_data": {           ← 前端使用复数
    "instance_1": {
      "moduleId": "ppqr_basic_info",
      "data": { ... }
    }
  }
}

↓ 后端服务层映射

数据库保存:
{
  "title": "测试pPQR",
  "module_data": {            ← 数据库使用单数
    "instance_1": {
      "moduleId": "ppqr_basic_info",
      "data": { ... }
    }
  }
}

↓ 后端API响应

前端接收:
{
  "title": "测试pPQR",
  "module_data": { ... },     ← 数据库字段
  "modules_data": { ... }     ← 兼容前端（同样的数据）
}
```

### 为什么需要字段映射？

1. **历史原因**: 数据库设计时使用了单数形式 `module_data`
2. **前端约定**: 前端代码使用复数形式 `modules_data` 更符合语义
3. **兼容性**: 通过映射支持两种字段名，避免大规模重构

## ⚠️ 注意事项

1. **必须重启后端**: 代码更改不会自动生效（除非使用 `--reload` 参数）
2. **字段名一致性**: 未来新增字段时注意前后端命名一致性
3. **数据迁移**: 如果要统一字段名，需要数据库迁移脚本

## 🎯 预期结果

修复后，pPQR的编辑功能应该完全正常：

1. ✅ 点击"编辑"按钮进入编辑页面
2. ✅ 编辑页面正确显示所有模块数据
3. ✅ 修改数据后点击"保存"
4. ✅ 数据成功保存到数据库
5. ✅ 返回列表页面看到更新
6. ✅ 查看详情页面显示最新数据

---

**修复日期**: 2025-10-27
**问题类型**: 字段名映射不匹配
**影响范围**: pPQR编辑和创建功能
**修复状态**: ✅ 已完成

