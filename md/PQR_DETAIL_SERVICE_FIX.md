# PQR 详情页面 Service 修复

## 🐛 问题

**症状**: 点击"查看"按钮后，PQR 详情页面显示"未找到PQR数据"

**根本原因**: `pqrService.get()` 返回格式与页面期望不一致

## 🔍 问题分析

### 代码流程

1. **PQRDetail.tsx 期望的格式**:
```typescript
const response = await pqrService.get(parseInt(id))
if (response.success && response.data) {  // 期望有 success 和 data 字段
  setPqrData(response.data)
}
```

2. **pqrService.get() 实际返回**:
```typescript
// 修复前
async get(id: number): Promise<PQRResponse> {
  const response = await api.get(`${this.baseURL}/${id}`)
  return response.data  // ❌ 只返回 data，没有 success 字段
}
```

3. **api.get() 的实际行为**:
```typescript
// api.ts 响应拦截器
this.api.interceptors.response.use(
  (response: AxiosResponse) => {
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    } as ApiResponse
  }
)
```

### 问题根源

- `api.get()` 返回: `{ success: true, data: {...} }`
- `pqrService.get()` 返回: `response.data` = `{...}` (丢失了 `success` 字段)
- `PQRDetail.tsx` 检查: `response.success` = `undefined` ❌

## ✅ 修复方案

### 修改文件: `frontend/src/services/pqr.ts`

**修改前**:
```typescript
async get(id: number): Promise<PQRResponse> {
  const response = await api.get(`${this.baseURL}/${id}`)
  return response.data  // ❌
}
```

**修改后**:
```typescript
async get(id: number): Promise<any> {
  const response = await api.get(`${this.baseURL}/${id}`)
  return response  // ✅ 返回完整的 { success, data } 对象
}
```

## 📊 对比 WPS 实现

### WPS Service (正确的实现)

```typescript
// frontend/src/services/wps.ts
async getWPS(id: number): Promise<any> {
  const response = await api.get(`/wps/${id}`)
  return response  // ✅ 返回完整对象
}
```

### WPS Detail 页面使用

```typescript
// frontend/src/pages/WPS/WPSDetail.tsx
const response = await wpsService.getWPS(parseInt(id))
if (!response.success || !response.data) {
  message.error('获取WPS数据失败')
  return
}
```

## 🎯 影响范围

### 受影响的文件

1. ✅ **frontend/src/pages/PQR/PQRDetail.tsx**
   - 现在可以正确检查 `response.success`
   - 可以正确访问 `response.data`

2. ✅ **frontend/src/pages/PQR/PQREdit.tsx**
   - 现在可以正确检查 `response.success`
   - 可以正确访问 `response.data`

### 不受影响的方法

以下方法返回 `response.data` 是正确的，因为调用方不需要检查 `success`:

- `create()` - 直接使用返回的数据
- `update()` - 直接使用返回的数据
- `duplicate()` - 直接使用返回的数据
- `delete()` - 不需要返回值
- `exportPDF()` - 返回 Blob
- `exportExcel()` - 返回 Blob

## 🧪 验证

### 测试步骤

1. 刷新前端页面
2. 进入 PQR 列表
3. 点击任意 PQR 的"查看"按钮
4. 应该能正常显示 PQR 详情

### 预期结果

- ✅ 页面正常加载
- ✅ 显示 PQR 基本信息
- ✅ 显示模块化数据
- ✅ 显示状态和评定结果
- ✅ 可以点击"编辑"按钮

## 📝 总结

### 修复内容

1. ✅ 修改 `pqrService.get()` 返回完整的 response 对象
2. ✅ 与 WPS 实现保持一致
3. ✅ 修复 PQR 详情页面和编辑页面

### 关键点

- **API 拦截器**已经将响应包装成 `{ success, data }` 格式
- **Service 层**应该返回完整的 response 对象，而不是只返回 data
- **页面组件**需要检查 `success` 字段来判断请求是否成功

### 最佳实践

对于需要检查请求是否成功的方法（如 `get`），应该返回完整的 response 对象：
```typescript
async get(id: number): Promise<any> {
  const response = await api.get(`${this.baseURL}/${id}`)
  return response  // ✅ 包含 success 和 data
}
```

对于不需要检查成功状态的方法（如 `create`, `update`），可以直接返回 data：
```typescript
async create(data: PQRCreate): Promise<PQRResponse> {
  const response = await api.post(`${this.baseURL}`, data)
  return response.data  // ✅ 直接返回数据
}
```

## 🚀 下一步

请刷新前端页面并测试：
1. ✅ 查看 PQR 详情
2. ✅ 编辑 PQR
3. ✅ 查看模块化数据
4. ✅ 所有功能按钮

如果还有问题，请检查浏览器控制台的错误信息！

