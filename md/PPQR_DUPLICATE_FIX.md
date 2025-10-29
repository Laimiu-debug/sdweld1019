# pPQR复制功能修复

## 🐛 问题描述

点击pPQR列表页面的"复制"按钮时，出现404错误：

```
POST http://localhost:8000/api/v1/ppqr/1/duplicate 404 (Not Found)
```

## 🔍 根本原因

后端缺少 `/ppqr/{ppqr_id}/duplicate` 端点的实现。

## ✅ 解决方案

### 实现复制端点

**文件**: `backend/app/api/v1/endpoints/ppqr.py`

**端点**: `POST /api/v1/ppqr/{ppqr_id}/duplicate`

**功能**:
- ✅ 获取原始pPQR数据
- ✅ 创建副本，自动生成新的编号
- ✅ 副本标题添加"(副本)"后缀
- ✅ 副本版本重置为"A"
- ✅ 副本状态设置为"draft"
- ✅ 复制所有模块数据
- ✅ 支持工作区隔离
- ✅ 检查配额限制（个人工作区）
- ✅ 自动更新配额使用情况

**实现代码**:

```python
@router.post("/{ppqr_id}/duplicate")
async def duplicate_ppqr(
    ppqr_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    workspace_id: Optional[str] = Header(None, alias="X-Workspace-ID")
) -> Any:
    """
    复制pPQR（带工作区上下文）
    """
    try:
        import time
        
        # 获取工作区上下文
        workspace_context = get_workspace_context(db, current_user, workspace_id)
        
        # 初始化pPQR服务
        ppqr_service = PPQRService(db)
        
        # 获取原始pPQR
        original_ppqr = ppqr_service.get(
            db,
            id=ppqr_id,
            current_user=current_user,
            workspace_context=workspace_context
        )
        
        if not original_ppqr:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="pPQR不存在或无权访问"
            )
        
        # 检查会员配额（仅个人工作区）
        if workspace_context.workspace_type == WorkspaceType.PERSONAL:
            from app.services.membership_service import MembershipService
            membership_service = MembershipService(db)
            
            if not membership_service.check_quota_available(current_user, "ppqr"):
                limits = membership_service.get_membership_limits(current_user.member_tier)
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"已达到pPQR配额限制 ({limits.get('ppqr', 0)}个)，请升级会员等级"
                )
        
        # 构建新的pPQR数据
        ppqr_data = {
            "title": f"{original_ppqr.title} (副本)",
            "ppqr_number": f"{original_ppqr.ppqr_number}-COPY-{int(time.time())}",
            "revision": "A",  # 副本从A版本开始
            "status": "draft",  # 副本默认为草稿状态
            "template_id": original_ppqr.template_id,
            "module_data": original_ppqr.module_data,
        }
        
        # 创建新pPQR
        new_ppqr = ppqr_service.create(
            db,
            ppqr_data=ppqr_data,
            current_user=current_user,
            workspace_context=workspace_context
        )
        
        # 更新配额使用情况（仅个人工作区）
        if workspace_context.workspace_type == WorkspaceType.PERSONAL:
            from app.services.membership_service import MembershipService
            membership_service = MembershipService(db)
            membership_service.update_quota_usage(current_user, "ppqr", 1)
        
        # 构建响应数据
        response_data = {
            "id": new_ppqr.id,
            "title": new_ppqr.title,
            "ppqr_number": new_ppqr.ppqr_number,
            "revision": new_ppqr.revision,
            "status": new_ppqr.status,
            "template_id": new_ppqr.template_id,
            "module_data": new_ppqr.module_data,
            "modules_data": new_ppqr.module_data,  # 兼容前端
            "owner_id": new_ppqr.user_id,
            "created_at": new_ppqr.created_at.isoformat() if new_ppqr.created_at else None,
            "updated_at": new_ppqr.updated_at.isoformat() if new_ppqr.updated_at else None
        }
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] 复制pPQR失败: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"复制pPQR失败: {str(e)}"
        )
```

## 📊 复制逻辑

### 原始pPQR
```json
{
  "id": 1,
  "title": "测试pPQR",
  "ppqr_number": "PPQR-2025-001",
  "revision": "B",
  "status": "approved",
  "template_id": "template_1",
  "module_data": { ... }
}
```

### 复制后的pPQR
```json
{
  "id": 2,
  "title": "测试pPQR (副本)",
  "ppqr_number": "PPQR-2025-001-COPY-1730000000",
  "revision": "A",  // ✅ 重置为A版本
  "status": "draft",  // ✅ 重置为草稿状态
  "template_id": "template_1",  // ✅ 保留模板ID
  "module_data": { ... }  // ✅ 复制所有模块数据
}
```

## 🔄 与其他功能的对比

| 功能 | WPS | PQR | pPQR |
|------|-----|-----|------|
| 复制端点 | ❌ 前端实现 | ✅ 后端实现 | ✅ 后端实现 |
| 编号生成 | 时间戳 | 时间戳 | 时间戳 |
| 版本重置 | ✅ | ✅ | ✅ |
| 状态重置 | ✅ | ✅ | ✅ |
| 配额检查 | ✅ | ✅ | ✅ |
| 工作区隔离 | ✅ | ✅ | ✅ |

## 🚀 部署步骤

### 1. 重启后端服务器

**重要**: 必须重启后端服务器才能应用代码更改！

```bash
# 停止当前运行的服务器 (Ctrl+C)
# 重新启动
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. 测试复制功能

1. 打开浏览器，访问 `http://localhost:3000/ppqr`
2. 点击任意pPQR的"复制"按钮
3. 等待复制完成
4. 验证列表中出现新的pPQR记录
5. 检查新记录的编号、标题、状态

## 🧪 测试检查清单

- [ ] 后端服务器已重启
- [ ] 可以打开pPQR列表页面
- [ ] 点击"复制"按钮不再报404错误
- [ ] 复制成功后显示成功消息
- [ ] 列表中出现新的pPQR记录
- [ ] 新记录标题包含"(副本)"
- [ ] 新记录编号包含"-COPY-"和时间戳
- [ ] 新记录版本为"A"
- [ ] 新记录状态为"draft"
- [ ] 新记录包含所有模块数据
- [ ] 配额正确更新（个人工作区）

## 📝 修改的文件

1. ✅ `backend/app/api/v1/endpoints/ppqr.py`
   - 添加 `duplicate_ppqr()` 端点

## ⚠️ 注意事项

1. **编号唯一性**: 使用时间戳确保编号唯一
2. **配额限制**: 复制会消耗配额，需要检查是否有足够配额
3. **权限检查**: 只能复制自己工作区内的pPQR
4. **数据完整性**: 复制所有模块数据，确保数据完整

## 🎯 预期结果

修复后，pPQR的复制功能应该完全正常：

1. ✅ 点击"复制"按钮
2. ✅ 后端创建新的pPQR记录
3. ✅ 自动生成新的编号
4. ✅ 复制所有模块数据
5. ✅ 返回列表页面看到新记录
6. ✅ 配额正确更新

---

**修复日期**: 2025-10-27
**问题类型**: 缺少API端点
**影响范围**: pPQR复制功能
**修复状态**: ✅ 已完成
**参考实现**: PQR的duplicate端点

