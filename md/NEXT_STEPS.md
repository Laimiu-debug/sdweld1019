# 下一步操作指南

## 🎯 当前状态

✅ **后端完成** - 自定义模块的数据库、模型、服务、API全部完成  
✅ **前端基础完成** - 类型定义、预设模块库、API服务、基础组件完成  
⏳ **拖拽功能待实现** - 需要安装拖拽库并创建拖拽组件

## 📋 立即可用的功能

### 1. 查看和管理自定义模块

访问模块管理页面（需要先添加路由）：

**步骤1：添加路由**

编辑 `frontend/src/App.tsx` 或路由配置文件，添加：

```typescript
import ModuleManagement from '@/pages/WPS/ModuleManagement'

// 在路由配置中添加
<Route path="/wps/modules" element={<ModuleManagement />} />
```

**步骤2：访问页面**

访问 `http://localhost:3000/wps/modules` 即可查看：
- 预设模块列表（15个系统模块）
- 自定义模块列表
- 创建自定义模块

### 2. 创建自定义模块

在模块管理页面点击"创建自定义模块"按钮：

1. 填写模块基本信息
   - 模块名称（如：预热参数）
   - 模块描述
   - 模块分类
   - 是否可重复
   - 是否共享

2. 添加字段
   - 字段键名（如：preheat_temp）
   - 字段标签（如：预热温度）
   - 字段类型（文本、数字、下拉选择等）
   - 单位（如：°C）
   - 是否必填
   - 其他属性

3. 预览字段

4. 保存模块

## 🚀 继续实现拖拽功能

### 第一步：安装拖拽库

```bash
cd frontend
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 第二步：创建拖拽组件

需要创建以下组件（按顺序）：

#### 1. ModuleCard.tsx
最简单的组件，显示模块信息卡片

```typescript
// frontend/src/components/WPS/ModuleCard.tsx
import React from 'react'
import { Card, Tag, Space } from 'antd'
import { BlockOutlined } from '@ant-design/icons'
import { FieldModule } from '@/types/wpsModules'

interface ModuleCardProps {
  module: FieldModule
  draggable?: boolean
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, draggable = true }) => {
  return (
    <Card
      size="small"
      hoverable
      style={{ marginBottom: 8, cursor: draggable ? 'grab' : 'default' }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Space>
          <BlockOutlined />
          <strong>{module.name}</strong>
        </Space>
        <div style={{ fontSize: 12, color: '#666' }}>
          {module.description}
        </div>
        <Space>
          <Tag color="blue">{Object.keys(module.fields).length} 个字段</Tag>
          {module.repeatable && <Tag color="green">可重复</Tag>}
        </Space>
      </Space>
    </Card>
  )
}

export default ModuleCard
```

#### 2. ModuleLibrary.tsx
显示所有可用模块的库

```typescript
// frontend/src/components/WPS/ModuleLibrary.tsx
import React, { useState, useEffect } from 'react'
import { Card, Tabs, Input, Space, Spin } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { PRESET_MODULES, getModulesByCategory } from '@/constants/wpsModules'
import customModuleService from '@/services/customModules'
import ModuleCard from './ModuleCard'

const { TabPane } = Tabs

const ModuleLibrary: React.FC = () => {
  const [customModules, setCustomModules] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    loadCustomModules()
  }, [])

  const loadCustomModules = async () => {
    try {
      setLoading(true)
      const modules = await customModuleService.getCustomModules()
      setCustomModules(modules)
    } catch (error) {
      console.error('加载自定义模块失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const allModules = [...PRESET_MODULES, ...customModules]
  const filteredModules = allModules.filter(m =>
    m.name.includes(searchText) || m.description?.includes(searchText)
  )

  return (
    <Card title="模块库" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="搜索模块..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
        
        <Spin spinning={loading}>
          <div style={{ maxHeight: 600, overflow: 'auto' }}>
            {filteredModules.map(module => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        </Spin>
      </Space>
    </Card>
  )
}

export default ModuleLibrary
```

#### 3. TemplateCanvas.tsx
接收拖拽的模块并显示

```typescript
// frontend/src/components/WPS/TemplateCanvas.tsx
import React from 'react'
import { Card, Empty, Button, Space } from 'antd'
import { DeleteOutlined, CopyOutlined } from '@ant-design/icons'
import { ModuleInstance } from '@/types/wpsModules'

interface TemplateCanvasProps {
  modules: ModuleInstance[]
  onRemove: (instanceId: string) => void
  onCopy: (instanceId: string) => void
}

const TemplateCanvas: React.FC<TemplateCanvasProps> = ({
  modules,
  onRemove,
  onCopy
}) => {
  return (
    <Card title="模板画布" size="small">
      {modules.length === 0 ? (
        <Empty description="从左侧拖拽模块到这里" />
      ) : (
        <Space direction="vertical" style={{ width: '100%' }}>
          {modules.map(instance => (
            <Card
              key={instance.instanceId}
              size="small"
              extra={
                <Space>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => onCopy(instance.instanceId)}
                  >
                    复制
                  </Button>
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onRemove(instance.instanceId)}
                  >
                    删除
                  </Button>
                </Space>
              }
            >
              {instance.customName || instance.moduleId}
            </Card>
          ))}
        </Space>
      )}
    </Card>
  )
}

export default TemplateCanvas
```

#### 4. TemplateBuilder.tsx
主容器组件，整合所有功能

```typescript
// frontend/src/components/WPS/TemplateBuilder.tsx
import React, { useState } from 'react'
import { Modal, Row, Col, Form, Input, Button, message } from 'antd'
import { ModuleInstance } from '@/types/wpsModules'
import ModuleLibrary from './ModuleLibrary'
import TemplateCanvas from './TemplateCanvas'
import { v4 as uuidv4 } from 'uuid'

interface TemplateBuilderProps {
  visible: boolean
  onClose: () => void
  onSave: (template: any) => void
}

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  visible,
  onClose,
  onSave
}) => {
  const [form] = Form.useForm()
  const [modules, setModules] = useState<ModuleInstance[]>([])

  const handleAddModule = (moduleId: string) => {
    const newInstance: ModuleInstance = {
      instanceId: uuidv4(),
      moduleId,
      order: modules.length + 1
    }
    setModules([...modules, newInstance])
  }

  const handleRemoveModule = (instanceId: string) => {
    setModules(modules.filter(m => m.instanceId !== instanceId))
  }

  const handleCopyModule = (instanceId: string) => {
    const module = modules.find(m => m.instanceId === instanceId)
    if (module) {
      const newInstance: ModuleInstance = {
        ...module,
        instanceId: uuidv4(),
        order: modules.length + 1
      }
      setModules([...modules, newInstance])
    }
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const template = {
        ...values,
        module_instances: modules
      }
      onSave(template)
      message.success('模板创建成功！')
      onClose()
    } catch (error) {
      console.error('保存失败:', error)
    }
  }

  return (
    <Modal
      title="创建模板"
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          保存模板
        </Button>
      ]}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="模板名称"
              name="name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="模板描述" name="description">
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Row gutter={16}>
        <Col span={12}>
          <ModuleLibrary />
        </Col>
        <Col span={12}>
          <TemplateCanvas
            modules={modules}
            onRemove={handleRemoveModule}
            onCopy={handleCopyModule}
          />
        </Col>
      </Row>
    </Modal>
  )
}

export default TemplateBuilder
```

### 第三步：集成到模板管理页面

编辑 `frontend/src/pages/WPS/TemplateManagement.tsx`，添加：

```typescript
import TemplateBuilder from '@/components/WPS/TemplateBuilder'

// 在组件中添加状态
const [builderVisible, setBuilderVisible] = useState(false)

// 添加按钮
<Button
  type="primary"
  onClick={() => setBuilderVisible(true)}
>
  使用模块创建模板
</Button>

// 添加组件
<TemplateBuilder
  visible={builderVisible}
  onClose={() => setBuilderVisible(false)}
  onSave={handleSaveTemplate}
/>
```

## 📝 注意事项

1. **拖拽功能** - 上面的示例代码还没有实现真正的拖拽，只是基础结构。需要集成 @dnd-kit 库来实现拖拽。

2. **路由配置** - 需要在路由配置中添加模块管理页面的路由。

3. **后端集成** - 保存模板时需要更新后端API支持 `module_instances` 字段。

4. **表单渲染** - 需要更新 `DynamicFormRenderer` 组件支持基于模块列表渲染表单。

## 🎯 完整实现拖拽功能

如果要实现完整的拖拽功能，需要：

1. 安装 @dnd-kit 库
2. 使用 `DndContext` 包裹拖拽区域
3. 使用 `useDraggable` 使模块可拖拽
4. 使用 `useDroppable` 使画布可接收拖拽
5. 使用 `SortableContext` 实现排序

详细实现请参考 @dnd-kit 官方文档：
https://docs.dndkit.com/

## 📚 相关文档

- `MODULE_BASED_TEMPLATE_SYSTEM.md` - 系统设计文档
- `CURRENT_PROGRESS_SUMMARY.md` - 当前进度总结
- `frontend/INSTALL_DND_KIT.md` - 拖拽库安装说明

---

**下一步建议**：先实现基础的模块管理功能，测试自定义模块的创建和查看，然后再实现拖拽功能。

