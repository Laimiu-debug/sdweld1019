# WPS 标准模板系统删除清单

## 🗑️ 需要删除的项目

### 1. 数据库迁移脚本（需要删除）

```
backend/migrations/insert_system_templates.sql
- 插入7个系统模板（111, 114, 121, 135, 141, 15, 311）
- 大约 328 行代码

backend/migrations/insert_remaining_templates.sql
- 补充模板数据
- 需要检查内容

backend/migrations/create_wps_templates_table.sql
- 创建 wps_templates 表
- 包含示例数据插入
- 需要保留表结构，删除示例数据
```

### 2. 后端代码修改

#### 需要删除的字段（从 WPSTemplate 模型）：
```python
# backend/app/models/wps_template.py
- field_schema: JSONB  # 删除
- ui_layout: JSONB     # 删除
- validation_rules: JSONB  # 删除
- default_values: JSONB    # 删除
```

#### 需要删除的 Schema（从 wps_template.py）：
```python
# backend/app/schemas/wps_template.py
- FieldDefinition
- TabDefinition
- TopInfoDefinition
- UILayoutDefinition
- WPSTemplateBase 中的相关字段
- WPSTemplateCreate 中的相关字段
- WPSTemplateUpdate 中的相关字段
```

#### 需要删除的服务方法（从 wps_template_service.py）：
```python
# 与传统模板相关的方法
- 所有处理 field_schema 的逻辑
- 所有处理 ui_layout 的逻辑
- 所有处理 validation_rules 的逻辑
```

### 3. 前端代码删除

#### 需要删除的组件：
```
frontend/src/components/WPS/DynamicFormRenderer.tsx
- 动态表单渲染器
- 根据 field_schema 和 ui_layout 渲染表单
- 约 500+ 行代码
```

#### 需要修改的组件：
```
frontend/src/components/WPS/TemplateSelector.tsx
- 移除对 field_schema 的处理
- 只保留模块化模板的选择逻辑

frontend/src/pages/WPS/WPSCreate.tsx
- 移除 DynamicFormRenderer 的导入和使用
- 改为使用模块化模板渲染
```

#### 需要删除的类型定义：
```
frontend/src/services/wpsTemplates.ts
- FieldSchema 接口
- UILayout 接口
- 相关的类型定义
```

### 4. 文档删除

```
frontend/WPS_TEMPLATE_SYSTEM_README.md
- 关于标准模板的部分
- 关于 field_schema 的部分
- 关于 ui_layout 的部分
```

---

## 📊 影响范围分析

### 受影响的 API 端点：
```
GET /api/v1/wps-templates/
- 返回的模板结构会改变
- 不再包含 field_schema, ui_layout

GET /api/v1/wps-templates/{template_id}
- 返回的模板结构会改变

POST /api/v1/wps-templates/
- 不再接受 field_schema, ui_layout 参数

PUT /api/v1/wps-templates/{template_id}
- 不再接受 field_schema, ui_layout 参数
```

### 受影响的前端页面：
```
/wps/create
- 需要改为使用模块化模板

/wps/templates
- 模板管理页面需要更新

/wps/modules
- 模块管理页面（已有）
```

### 受影响的数据库查询：
```
所有查询 field_schema 或 ui_layout 的地方都需要更新
```

---

## ✅ 需要新增的模块

### 1. 表头数据模块（Header Data Module）
```
字段：
- wps_number (WPS编号)
- revision (版本)
- title (标题)
- manufacturer (制造商)
- product_name (产品名称)
- customer (用户)
- location (地点)
- order_number (订单编号)
- part_number (部件编号)
- drawing_number (图纸编号)
- wpqr_number (WPQR编号)
- welder_qualification (焊工资质)
- drafted_by (起草人)
- drafted_date (起草日期)
- reviewed_by (校验人)
- reviewed_date (校验日期)
- approved_by (批准人)
- approved_date (批准日期)
- notes (备注)
- pdf_link (PDF文件)
```

### 2. 概要模块（Summary Module）
```
字段：
- backing_strip (背部衬垫)
- base_material_1 (母材1)
- base_material_2 (母材2)
- thickness (厚度)
- outer_diameter (外径)
- weld_geometry (焊缝几何形状)
- weld_preparation (焊前准备)
- root_treatment (根焊道处理)
- cleaning_method (清根方法)
- preheat_temp (预热温度)
- interpass_temp (层间温度)
- welding_position (焊接位置)
- bead_shape (焊道形状)
- heat_treatment (热处理)
- hydrogen_removal (消氢退火)
```

### 3. 示意图模块（Diagram Module）
```
字段：
- joint_diagram (接头示意图)
- welding_sequence (焊接顺序)
- dimensions (尺寸标注)
```

### 4. 焊层模块（Weld Layer Module）
```
字段：
- layer_id (焊层ID)
- pass_number (焊接道次)
- welding_process (焊接工艺)
- filler_metal_type (填充金属型号)
- filler_metal_diameter (填充金属直径)
- shielding_gas (保护气体)
- current_type (电流类型)
- current_values (电流值)
- voltage (电压)
- transfer_mode (传输模式)
- wire_feed_speed (送丝速度)
- travel_speed (焊接速度)
- oscillation (抖动参数)
- contact_tip_distance (接触尖端距离)
- angle (焊枪角度)
- equipment (设备)
- heat_input (热输入)
```

### 5. 附加信息模块（Additional Info Module）
```
字段：
- additional_notes (附加备注)
- supporting_documents (支持文件)
- attachments (附件)
```

---

## 🔄 迁移策略

### 对现有 WPS 数据的影响：
- 现有的 WPS 记录中的 JSONB 数据不需要修改
- 只需要更新模板定义方式

### 向后兼容性：
- 需要确保现有的 WPS 数据仍然可以查询和显示
- 可能需要数据迁移脚本

---

## 📋 验证清单

删除前需要验证：
- [ ] 没有其他代码依赖 field_schema
- [ ] 没有其他代码依赖 ui_layout
- [ ] 没有其他代码依赖 DynamicFormRenderer
- [ ] 所有现有 WPS 数据都能正常显示
- [ ] 模块化模板能够完全替代标准模板

