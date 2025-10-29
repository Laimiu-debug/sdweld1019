# WPS 新模块规范

## 📋 新增模块详细规范

### 模块1：表头数据模块（Header Data Module）

```typescript
{
  id: 'header_data',
  name: '表头数据',
  description: 'WPS文档的表头信息，包括编号、版本、审批信息等',
  icon: 'FileTextOutlined',
  category: 'basic',
  repeatable: false,  // 不可重复
  fields: {
    wps_number: {
      label: 'WPS编号',
      type: 'text',
      required: true,
      placeholder: '例如：WPS-001'
    },
    revision: {
      label: '版本',
      type: 'text',
      required: true,
      default: 'A'
    },
    title: {
      label: 'WPS标题',
      type: 'text',
      required: true
    },
    manufacturer: {
      label: '制造商',
      type: 'text'
    },
    product_name: {
      label: '产品名称',
      type: 'text'
    },
    customer: {
      label: '用户',
      type: 'text'
    },
    location: {
      label: '地点',
      type: 'text'
    },
    order_number: {
      label: '订单编号',
      type: 'text'
    },
    part_number: {
      label: '部件编号',
      type: 'text'
    },
    drawing_number: {
      label: '图纸编号',
      type: 'text'
    },
    wpqr_number: {
      label: 'WPQR编号',
      type: 'text'
    },
    welder_qualification: {
      label: '焊工资质',
      type: 'text'
    },
    drafted_by: {
      label: '起草人',
      type: 'text'
    },
    drafted_date: {
      label: '起草日期',
      type: 'date'
    },
    reviewed_by: {
      label: '校验人',
      type: 'text'
    },
    reviewed_date: {
      label: '校验日期',
      type: 'date'
    },
    approved_by: {
      label: '批准人',
      type: 'text'
    },
    approved_date: {
      label: '批准日期',
      type: 'date'
    },
    notes: {
      label: '备注',
      type: 'textarea'
    },
    pdf_link: {
      label: 'PDF文件',
      type: 'file'
    }
  }
}
```

### 模块2：概要模块（Summary Module）

```typescript
{
  id: 'summary_info',
  name: '概要信息',
  description: '焊接工艺的概要信息，包括母材、厚度、焊接位置等',
  icon: 'ProfileOutlined',
  category: 'basic',
  repeatable: false,
  fields: {
    backing_strip: {
      label: '背部衬垫',
      type: 'text'
    },
    base_material_1: {
      label: '母材1',
      type: 'text',
      required: true
    },
    base_material_2: {
      label: '母材2',
      type: 'text'
    },
    thickness: {
      label: '厚度',
      type: 'number',
      unit: 'mm',
      min: 0
    },
    outer_diameter: {
      label: '外径',
      type: 'number',
      unit: 'mm',
      min: 0
    },
    weld_geometry: {
      label: '焊缝几何形状',
      type: 'select',
      options: ['对接焊', '角焊', '转角焊']
    },
    weld_preparation: {
      label: '焊前准备',
      type: 'select',
      options: ['氧乙炔切割', '等离子切割', '机械加工']
    },
    root_treatment: {
      label: '根焊道处理',
      type: 'select',
      options: ['无', '磨削', '挖槽']
    },
    cleaning_method: {
      label: '清根方法',
      type: 'text'
    },
    preheat_temp: {
      label: '预热温度',
      type: 'text'
    },
    interpass_temp: {
      label: '层间温度',
      type: 'number',
      unit: '°C'
    },
    welding_position: {
      label: '焊接位置',
      type: 'select',
      options: ['PA', 'PB', 'PC', 'PD', 'PE', 'PF', 'PG']
    },
    bead_shape: {
      label: '焊道形状',
      type: 'select',
      options: ['直焊道', '摆焊道']
    },
    heat_treatment: {
      label: '热处理',
      type: 'select',
      options: ['无需', 'PWHT', '正火', '退火']
    },
    hydrogen_removal: {
      label: '消氢退火',
      type: 'select',
      options: ['无', '需要']
    }
  }
}
```

### 模块3：示意图模块（Diagram Module）

```typescript
{
  id: 'diagram_info',
  name: '示意图',
  description: '焊接接头的示意图和焊接顺序说明',
  icon: 'PictureOutlined',
  category: 'basic',
  repeatable: false,
  fields: {
    joint_diagram: {
      label: '接头示意图',
      type: 'file'
    },
    welding_sequence: {
      label: '焊接顺序',
      type: 'textarea'
    },
    dimensions: {
      label: '尺寸标注',
      type: 'textarea'
    }
  }
}
```

### 模块4：焊层模块（Weld Layer Module）

```typescript
{
  id: 'weld_layer',
  name: '焊层信息',
  description: '单层焊接的详细参数信息',
  icon: 'OrderedListOutlined',
  category: 'basic',
  repeatable: true,  // 可重复，用于多层焊
  fields: {
    layer_id: {
      label: '焊层ID',
      type: 'text'
    },
    pass_number: {
      label: '焊接道次',
      type: 'number',
      min: 1
    },
    welding_process: {
      label: '焊接工艺',
      type: 'select',
      options: ['111', '114', '121', '135', '141', '15', '311'],
      required: true
    },
    filler_metal_type: {
      label: '填充金属型号',
      type: 'text'
    },
    filler_metal_diameter: {
      label: '填充金属直径',
      type: 'number',
      unit: 'mm'
    },
    shielding_gas: {
      label: '保护气体',
      type: 'text'
    },
    current_type: {
      label: '电流类型',
      type: 'select',
      options: ['DC+', 'DC-', 'AC']
    },
    current_values: {
      label: '电流值',
      type: 'number',
      unit: 'A'
    },
    voltage: {
      label: '电压',
      type: 'number',
      unit: 'V'
    },
    transfer_mode: {
      label: '传输模式',
      type: 'text'
    },
    wire_feed_speed: {
      label: '送丝速度',
      type: 'number',
      unit: 'm/min'
    },
    travel_speed: {
      label: '焊接速度',
      type: 'number',
      unit: 'cm/min'
    },
    oscillation: {
      label: '抖动参数',
      type: 'text'
    },
    contact_tip_distance: {
      label: '接触尖端距离',
      type: 'number',
      unit: 'mm'
    },
    angle: {
      label: '焊枪角度',
      type: 'number',
      unit: '°'
    },
    equipment: {
      label: '设备',
      type: 'text'
    },
    heat_input: {
      label: '热输入',
      type: 'number',
      unit: 'kJ/mm'
    }
  }
}
```

### 模块5：附加信息模块（Additional Info Module）

```typescript
{
  id: 'additional_info',
  name: '附加信息',
  description: '其他补充信息和文件附件',
  icon: 'FileOutlined',
  category: 'basic',
  repeatable: false,
  fields: {
    additional_notes: {
      label: '附加备注',
      type: 'textarea'
    },
    supporting_documents: {
      label: '支持文件',
      type: 'text'
    },
    attachments: {
      label: '附件',
      type: 'file'
    }
  }
}
```

---

## 🎯 预设模板组合

### 预设模板1：手工电弧焊（SMAW）标准模板

```
模块组合顺序：
1. header_data (表头数据)
2. summary_info (概要信息)
3. diagram_info (示意图)
4. weld_layer (焊层信息) - 可重复
5. additional_info (附加信息)
```

### 预设模板2：MAG焊（GMAW）标准模板

```
模块组合顺序：
1. header_data (表头数据)
2. summary_info (概要信息)
3. diagram_info (示意图)
4. weld_layer (焊层信息) - 可重复
5. additional_info (附加信息)
```

### 预设模板3：TIG焊（GTAW）标准模板

```
模块组合顺序：
1. header_data (表头数据)
2. summary_info (概要信息)
3. diagram_info (示意图)
4. weld_layer (焊层信息) - 可重复
5. additional_info (附加信息)
```

---

## 📝 实现步骤

1. 在 `frontend/src/constants/wpsModules.ts` 中添加 5 个新模块
2. 在 `backend/app/models/custom_module.py` 中确保支持这些模块
3. 创建 3 个预设模板（作为系统模板，但使用 module_instances 定义）
4. 更新 WPS 创建流程以使用新模块
5. 测试所有功能

