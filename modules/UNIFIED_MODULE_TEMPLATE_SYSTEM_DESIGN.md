# 统一模块模板系统设计方案

## 📋 概述

本文档提出将现有的自定义模块模板系统扩展，使其能够统一支持WPS、PQR、pPQR三个模块的需求。

**创建日期**: 2025-10-25  
**版本**: 1.0

---

## 🎯 目标

### 当前问题
- 自定义模块系统目前主要为WPS设计
- PQR和pPQR需要类似的模块化能力
- 三个模块有大量相似的字段和结构
- 重复开发会增加维护成本

### 解决方案
**统一模块模板系统** - 一套系统支持三种记录类型

---

## 🔍 现状分析

### 当前CustomModule模型分析

#### ✅ 已有的优势
```python
class CustomModule:
    # 核心字段
    id: str                    # ✅ 模块唯一标识
    name: str                  # ✅ 模块名称
    description: str           # ✅ 模块描述
    icon: str                  # ✅ 图标
    category: str              # ✅ 分类
    repeatable: bool           # ✅ 是否可重复
    fields: JSONB              # ✅ 字段定义（灵活）
    
    # 数据隔离
    user_id: int               # ✅ 用户隔离
    workspace_type: str        # ✅ 工作区类型
    company_id: int            # ✅ 企业隔离
    factory_id: int            # ✅ 工厂隔离
    
    # 访问控制
    is_shared: bool            # ✅ 是否共享
    access_level: str          # ✅ 访问级别
    
    # 统计
    usage_count: int           # ✅ 使用次数
```

#### ❌ 需要扩展的部分
```python
# 1. 缺少模块适用范围标识
# 当前category只有7种，都是WPS相关的
category: str  # basic, material, gas, electrical, motion, equipment, calculation

# 2. 缺少模块类型标识
# 无法区分这个模块是用于WPS、PQR还是pPQR

# 3. 分类系统不够灵活
# 硬编码的7个分类无法满足PQR/pPQR的需求
```

---

## 💡 设计方案

### 方案一：扩展Category（推荐）

#### 核心思路
在现有基础上扩展category字段，增加PQR和pPQR专用分类。

#### 数据库修改
```sql
-- 修改CustomModule表
ALTER TABLE custom_modules 
DROP CONSTRAINT check_category;

ALTER TABLE custom_modules 
ADD CONSTRAINT check_category CHECK (
    category IN (
        -- WPS分类（保持不变）
        'basic', 'material', 'gas', 'electrical', 'motion', 'equipment', 'calculation',
        
        -- PQR专用分类
        'pqr_basic',              -- PQR基本信息
        'pqr_welding_params',     -- PQR焊接参数
        'pqr_mechanical_tests',   -- 力学性能测试
        'pqr_ndt_tests',          -- 无损检测
        'pqr_qualification',      -- 合格判定
        
        -- pPQR专用分类
        'ppqr_basic',             -- pPQR基本信息
        'ppqr_test_plan',         -- 试验方案
        'ppqr_planned_params',    -- 计划参数
        'ppqr_actual_params',     -- 实际参数
        'ppqr_test_results',      -- 试验结果
        'ppqr_evaluation',        -- 试验评价
        
        -- 通用分类（可用于所有类型）
        'common_attachments',     -- 附件管理
        'common_notes'            -- 备注信息
    )
);
```

#### Schema修改
```python
# backend/app/schemas/custom_module.py

class CustomModuleBase(BaseModel):
    """自定义模块基础schema"""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    icon: str = Field(default='BlockOutlined', max_length=50)
    
    # 扩展category，支持WPS/PQR/pPQR
    category: str = Field(
        default='basic',
        pattern='^(basic|material|gas|electrical|motion|equipment|calculation|'
                'pqr_basic|pqr_welding_params|pqr_mechanical_tests|pqr_ndt_tests|pqr_qualification|'
                'ppqr_basic|ppqr_test_plan|ppqr_planned_params|ppqr_actual_params|ppqr_test_results|ppqr_evaluation|'
                'common_attachments|common_notes)$'
    )
    
    repeatable: bool = False
    fields: Dict[str, FieldDefinition]
    is_shared: bool = False
    access_level: str = Field(default='private', pattern='^(private|shared|public)$')
```

#### 前端常量定义
```typescript
// frontend/src/constants/moduleCategories.ts

export const MODULE_CATEGORIES = {
  // WPS分类
  basic: { label: '基本信息', color: '#1890ff', applicableTo: ['wps'] },
  material: { label: '材料信息', color: '#52c41a', applicableTo: ['wps'] },
  gas: { label: '气体信息', color: '#13c2c2', applicableTo: ['wps'] },
  electrical: { label: '电气参数', color: '#faad14', applicableTo: ['wps'] },
  motion: { label: '运动参数', color: '#722ed1', applicableTo: ['wps'] },
  equipment: { label: '设备信息', color: '#eb2f96', applicableTo: ['wps'] },
  calculation: { label: '计算结果', color: '#fa8c16', applicableTo: ['wps'] },
  
  // PQR分类
  pqr_basic: { label: 'PQR基本信息', color: '#1890ff', applicableTo: ['pqr'] },
  pqr_welding_params: { label: 'PQR焊接参数', color: '#52c41a', applicableTo: ['pqr'] },
  pqr_mechanical_tests: { label: '力学性能测试', color: '#faad14', applicableTo: ['pqr'] },
  pqr_ndt_tests: { label: '无损检测', color: '#722ed1', applicableTo: ['pqr'] },
  pqr_qualification: { label: '合格判定', color: '#13c2c2', applicableTo: ['pqr'] },
  
  // pPQR分类
  ppqr_basic: { label: 'pPQR基本信息', color: '#1890ff', applicableTo: ['ppqr'] },
  ppqr_test_plan: { label: '试验方案', color: '#52c41a', applicableTo: ['ppqr'] },
  ppqr_planned_params: { label: '计划参数', color: '#faad14', applicableTo: ['ppqr'] },
  ppqr_actual_params: { label: '实际参数', color: '#722ed1', applicableTo: ['ppqr'] },
  ppqr_test_results: { label: '试验结果', color: '#13c2c2', applicableTo: ['ppqr'] },
  ppqr_evaluation: { label: '试验评价', color: '#eb2f96', applicableTo: ['ppqr'] },
  
  // 通用分类
  common_attachments: { label: '附件管理', color: '#8c8c8c', applicableTo: ['wps', 'pqr', 'ppqr'] },
  common_notes: { label: '备注信息', color: '#595959', applicableTo: ['wps', 'pqr', 'ppqr'] },
} as const

// 辅助函数：根据记录类型获取可用分类
export function getCategoriesForRecordType(recordType: 'wps' | 'pqr' | 'ppqr') {
  return Object.entries(MODULE_CATEGORIES)
    .filter(([_, config]) => config.applicableTo.includes(recordType))
    .map(([key, config]) => ({ key, ...config }))
}
```

#### 优势
- ✅ 最小化修改，只需扩展category枚举
- ✅ 保持现有架构不变
- ✅ 向后兼容，不影响现有WPS模块
- ✅ 实现简单，开发成本低

#### 劣势
- ⚠️ category枚举会变得很长
- ⚠️ 需要在多处维护分类列表

---

### 方案二：添加module_type字段

#### 核心思路
添加一个新字段`module_type`来标识模块适用的记录类型。

#### 数据库修改
```sql
-- 添加module_type字段
ALTER TABLE custom_modules 
ADD COLUMN module_type VARCHAR(20) DEFAULT 'wps';

ALTER TABLE custom_modules 
ADD CONSTRAINT check_module_type CHECK (
    module_type IN ('wps', 'pqr', 'ppqr', 'common')
);

-- 创建索引
CREATE INDEX idx_custom_modules_module_type ON custom_modules(module_type);

-- category保持原有的分类，但语义更通用
ALTER TABLE custom_modules 
DROP CONSTRAINT check_category;

ALTER TABLE custom_modules 
ADD CONSTRAINT check_category CHECK (
    category IN (
        'basic',              -- 基本信息
        'parameters',         -- 参数信息
        'materials',          -- 材料信息
        'tests',              -- 测试/试验
        'results',            -- 结果/评价
        'equipment',          -- 设备信息
        'attachments',        -- 附件
        'notes'               -- 备注
    )
);
```

#### Model修改
```python
# backend/app/models/custom_module.py

class CustomModule(Base):
    """自定义字段模块模型"""
    __tablename__ = "custom_modules"

    id = Column(String(100), primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    icon = Column(String(50), default='BlockOutlined')
    
    # 新增：模块类型（适用于哪种记录）
    module_type = Column(String(20), default='wps', index=True)
    
    # 修改：category语义更通用
    category = Column(String(20), default='basic')
    
    repeatable = Column(Boolean, default=False)
    fields = Column(JSONB, nullable=False, default={})
    
    # ... 其他字段保持不变
    
    __table_args__ = (
        CheckConstraint(
            "module_type IN ('wps', 'pqr', 'ppqr', 'common')",
            name='check_module_type'
        ),
        CheckConstraint(
            "category IN ('basic', 'parameters', 'materials', 'tests', 'results', 'equipment', 'attachments', 'notes')",
            name='check_category'
        ),
        # ... 其他约束
    )
```

#### Schema修改
```python
# backend/app/schemas/custom_module.py

class CustomModuleBase(BaseModel):
    """自定义模块基础schema"""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    icon: str = Field(default='BlockOutlined', max_length=50)
    
    # 新增：模块类型
    module_type: str = Field(
        default='wps',
        pattern='^(wps|pqr|ppqr|common)$',
        description="模块适用的记录类型"
    )
    
    # 修改：通用分类
    category: str = Field(
        default='basic',
        pattern='^(basic|parameters|materials|tests|results|equipment|attachments|notes)$',
        description="模块分类"
    )
    
    repeatable: bool = False
    fields: Dict[str, FieldDefinition]
    is_shared: bool = False
    access_level: str = Field(default='private', pattern='^(private|shared|public)$')
```

#### Service修改
```python
# backend/app/services/custom_module_service.py

class CustomModuleService:
    def get_available_modules(
        self,
        current_user: User,
        workspace_context: WorkspaceContext,
        module_type: Optional[str] = None,  # 新增：按类型筛选
        category: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[CustomModule]:
        """获取可用模块列表"""
        
        query = self.db.query(CustomModule)
        
        # 访问权限过滤
        access_conditions = [
            CustomModule.workspace_type == 'system',
        ]
        
        if workspace_context.workspace_type == WorkspaceType.PERSONAL:
            access_conditions.append(
                and_(
                    CustomModule.workspace_type == WorkspaceType.PERSONAL,
                    CustomModule.user_id == current_user.id
                )
            )
        elif workspace_context.workspace_type == WorkspaceType.ENTERPRISE:
            access_conditions.extend([
                and_(
                    CustomModule.workspace_type == WorkspaceType.PERSONAL,
                    CustomModule.user_id == current_user.id
                ),
                and_(
                    CustomModule.workspace_type == WorkspaceType.ENTERPRISE,
                    CustomModule.company_id == workspace_context.company_id,
                    or_(
                        CustomModule.access_level == 'public',
                        CustomModule.is_shared == True
                    )
                )
            ])
        
        query = query.filter(or_(*access_conditions))
        
        # 新增：按模块类型筛选
        if module_type:
            query = query.filter(
                or_(
                    CustomModule.module_type == module_type,
                    CustomModule.module_type == 'common'  # common类型对所有记录可用
                )
            )
        
        # 按分类筛选
        if category:
            query = query.filter(CustomModule.category == category)
        
        return query.offset(skip).limit(limit).all()
```

#### 前端使用
```typescript
// 获取WPS可用模块
const wpsModules = await customModuleService.getModules({
  module_type: 'wps'
})

// 获取PQR可用模块
const pqrModules = await customModuleService.getModules({
  module_type: 'pqr'
})

// 获取pPQR可用模块
const ppqrModules = await customModuleService.getModules({
  module_type: 'ppqr'
})
```

#### 优势
- ✅ 清晰的类型区分
- ✅ 支持common类型（通用模块）
- ✅ category语义更通用，易于理解
- ✅ 查询效率高（有索引）
- ✅ 易于扩展（未来可能有其他记录类型）

#### 劣势
- ⚠️ 需要数据库迁移
- ⚠️ 需要修改现有代码
- ⚠️ 需要迁移现有模块数据

---

## 📊 方案对比

| 维度 | 方案一：扩展Category | 方案二：添加module_type |
|------|---------------------|------------------------|
| **实现复杂度** | ⭐⭐ 简单 | ⭐⭐⭐ 中等 |
| **数据库修改** | 仅修改约束 | 添加字段+约束 |
| **向后兼容** | ✅ 完全兼容 | ⚠️ 需要数据迁移 |
| **代码修改量** | ⭐⭐ 少 | ⭐⭐⭐ 中等 |
| **可维护性** | ⭐⭐ 一般 | ⭐⭐⭐⭐ 好 |
| **可扩展性** | ⭐⭐ 一般 | ⭐⭐⭐⭐⭐ 优秀 |
| **查询效率** | ⭐⭐⭐ 一般 | ⭐⭐⭐⭐ 好（有索引） |
| **语义清晰度** | ⭐⭐ 一般 | ⭐⭐⭐⭐⭐ 优秀 |

---

## 🎯 推荐方案

### **推荐：方案二（添加module_type字段）**

#### 理由
1. **更清晰的架构** - 类型和分类分离，职责明确
2. **更好的扩展性** - 未来可能有其他记录类型（如WPQ、WPQR等）
3. **更高的查询效率** - 有专门的索引
4. **更易维护** - 代码逻辑更清晰

#### 实施步骤
1. 创建数据库迁移脚本
2. 修改Model和Schema
3. 修改Service层
4. 更新API端点
5. 迁移现有数据（将现有模块标记为wps类型）
6. 更新前端代码
7. 测试

---

## 📝 实施细节

### 数据迁移脚本
```sql
-- migrations/add_module_type_to_custom_modules.sql

-- 1. 添加module_type字段
ALTER TABLE custom_modules 
ADD COLUMN module_type VARCHAR(20) DEFAULT 'wps';

-- 2. 更新现有数据（所有现有模块都是WPS类型）
UPDATE custom_modules 
SET module_type = 'wps' 
WHERE module_type IS NULL;

-- 3. 设置NOT NULL约束
ALTER TABLE custom_modules 
ALTER COLUMN module_type SET NOT NULL;

-- 4. 添加检查约束
ALTER TABLE custom_modules 
ADD CONSTRAINT check_module_type CHECK (
    module_type IN ('wps', 'pqr', 'ppqr', 'common')
);

-- 5. 创建索引
CREATE INDEX idx_custom_modules_module_type ON custom_modules(module_type);

-- 6. 修改category约束（使其更通用）
ALTER TABLE custom_modules 
DROP CONSTRAINT check_category;

ALTER TABLE custom_modules 
ADD CONSTRAINT check_category CHECK (
    category IN ('basic', 'parameters', 'materials', 'tests', 'results', 'equipment', 'attachments', 'notes')
);

-- 7. 更新现有模块的category（映射到新的通用分类）
UPDATE custom_modules SET category = 'basic' WHERE category = 'basic';
UPDATE custom_modules SET category = 'materials' WHERE category IN ('material', 'gas');
UPDATE custom_modules SET category = 'parameters' WHERE category IN ('electrical', 'motion');
UPDATE custom_modules SET category = 'equipment' WHERE category = 'equipment';
UPDATE custom_modules SET category = 'results' WHERE category = 'calculation';
```

### 预设模块示例

#### WPS预设模块（保持不变）
```python
# 系统初始化时插入
WPS_PRESET_MODULES = [
    {
        'id': 'wps_basic_info',
        'name': '基本信息',
        'module_type': 'wps',
        'category': 'basic',
        'workspace_type': 'system',
        'fields': {...}
    },
    {
        'id': 'wps_filler_metal',
        'name': '填充金属',
        'module_type': 'wps',
        'category': 'materials',
        'workspace_type': 'system',
        'fields': {...}
    },
    # ... 其他WPS模块
]
```

#### PQR预设模块（新增）
```python
PQR_PRESET_MODULES = [
    {
        'id': 'pqr_basic_info',
        'name': 'PQR基本信息',
        'module_type': 'pqr',
        'category': 'basic',
        'workspace_type': 'system',
        'repeatable': False,
        'fields': {
            'pqr_number': {
                'label': 'PQR编号',
                'type': 'text',
                'required': True
            },
            'test_date': {
                'label': '试验日期',
                'type': 'date',
                'required': True
            },
            'standard': {
                'label': '评定标准',
                'type': 'select',
                'options': ['AWS D1.1', 'ASME IX', 'EN ISO 15609-1', 'GB/T 15169']
            }
        }
    },
    {
        'id': 'pqr_tensile_test',
        'name': '拉伸试验',
        'module_type': 'pqr',
        'category': 'tests',
        'workspace_type': 'system',
        'repeatable': True,  # 可重复，支持多个试样
        'fields': {
            'specimen_number': {
                'label': '试样编号',
                'type': 'text'
            },
            'tensile_strength': {
                'label': '抗拉强度',
                'type': 'number',
                'unit': 'MPa',
                'min': 0
            },
            'yield_strength': {
                'label': '屈服强度',
                'type': 'number',
                'unit': 'MPa',
                'min': 0
            },
            'elongation': {
                'label': '延伸率',
                'type': 'number',
                'unit': '%',
                'min': 0,
                'max': 100
            }
        }
    },
    {
        'id': 'pqr_bend_test',
        'name': '弯曲试验',
        'module_type': 'pqr',
        'category': 'tests',
        'workspace_type': 'system',
        'repeatable': True,
        'fields': {
            'specimen_number': {
                'label': '试样编号',
                'type': 'text'
            },
            'bend_type': {
                'label': '弯曲类型',
                'type': 'select',
                'options': ['面弯', '背弯', '侧弯']
            },
            'bend_angle': {
                'label': '弯曲角度',
                'type': 'number',
                'unit': '°',
                'min': 0,
                'max': 180
            },
            'result': {
                'label': '试验结果',
                'type': 'select',
                'options': ['合格', '不合格']
            }
        }
    },
    {
        'id': 'pqr_impact_test',
        'name': '冲击试验',
        'module_type': 'pqr',
        'category': 'tests',
        'workspace_type': 'system',
        'repeatable': True,
        'fields': {
            'specimen_number': {
                'label': '试样编号',
                'type': 'text'
            },
            'test_temperature': {
                'label': '试验温度',
                'type': 'number',
                'unit': '°C'
            },
            'impact_energy': {
                'label': '冲击功',
                'type': 'number',
                'unit': 'J',
                'min': 0
            }
        }
    },
    {
        'id': 'pqr_qualification',
        'name': '合格判定',
        'module_type': 'pqr',
        'category': 'results',
        'workspace_type': 'system',
        'repeatable': False,
        'fields': {
            'qualification_result': {
                'label': '评定结果',
                'type': 'select',
                'options': ['合格', '不合格', '需重测'],
                'required': True
            },
            'qualification_date': {
                'label': '评定日期',
                'type': 'date'
            },
            'failure_reason': {
                'label': '不合格原因',
                'type': 'textarea'
            },
            'corrective_action': {
                'label': '纠正措施',
                'type': 'textarea'
            }
        }
    }
]
```

#### pPQR预设模块（新增）
```python
PPQR_PRESET_MODULES = [
    {
        'id': 'ppqr_basic_info',
        'name': 'pPQR基本信息',
        'module_type': 'ppqr',
        'category': 'basic',
        'workspace_type': 'system',
        'repeatable': False,
        'fields': {
            'ppqr_number': {
                'label': 'pPQR编号',
                'type': 'text',
                'required': True
            },
            'title': {
                'label': '标题',
                'type': 'text',
                'required': True
            },
            'test_date': {
                'label': '试验日期',
                'type': 'date'
            },
            'purpose': {
                'label': '试验目的',
                'type': 'textarea',
                'required': True
            }
        }
    },
    {
        'id': 'ppqr_test_plan',
        'name': '试验方案',
        'module_type': 'ppqr',
        'category': 'basic',
        'workspace_type': 'system',
        'repeatable': False,
        'fields': {
            'test_plan': {
                'label': '试验方案',
                'type': 'textarea'
            },
            'success_criteria': {
                'label': '成功标准',
                'type': 'textarea'
            },
            'test_steps': {
                'label': '试验步骤',
                'type': 'textarea'
            }
        }
    },
    {
        'id': 'ppqr_parameter_group',
        'name': '参数对比组',
        'module_type': 'ppqr',
        'category': 'parameters',
        'workspace_type': 'system',
        'repeatable': True,  # 可重复，支持多组对比
        'fields': {
            'group_name': {
                'label': '参数组名称',
                'type': 'text'
            },
            'current_plan': {
                'label': '计划电流',
                'type': 'number',
                'unit': 'A',
                'min': 0
            },
            'voltage_plan': {
                'label': '计划电压',
                'type': 'number',
                'unit': 'V',
                'min': 0
            },
            'speed_plan': {
                'label': '计划速度',
                'type': 'number',
                'unit': 'mm/min',
                'min': 0
            },
            'current_actual': {
                'label': '实际电流',
                'type': 'number',
                'unit': 'A',
                'min': 0
            },
            'voltage_actual': {
                'label': '实际电压',
                'type': 'number',
                'unit': 'V',
                'min': 0
            },
            'speed_actual': {
                'label': '实际速度',
                'type': 'number',
                'unit': 'mm/min',
                'min': 0
            }
        }
    },
    {
        'id': 'ppqr_visual_inspection',
        'name': '外观检查',
        'module_type': 'ppqr',
        'category': 'tests',
        'workspace_type': 'system',
        'repeatable': False,
        'fields': {
            'appearance': {
                'label': '外观质量',
                'type': 'select',
                'options': ['优秀', '良好', '一般', '差']
            },
            'surface_defects': {
                'label': '表面缺陷',
                'type': 'textarea'
            },
            'weld_profile': {
                'label': '焊缝成型',
                'type': 'select',
                'options': ['良好', '一般', '不良']
            }
        }
    },
    {
        'id': 'ppqr_evaluation',
        'name': '试验评价',
        'module_type': 'ppqr',
        'category': 'results',
        'workspace_type': 'system',
        'repeatable': False,
        'fields': {
            'is_successful': {
                'label': '是否成功',
                'type': 'select',
                'options': ['是', '否'],
                'required': True
            },
            'evaluation_notes': {
                'label': '评价说明',
                'type': 'textarea'
            },
            'improvement_suggestions': {
                'label': '改进建议',
                'type': 'textarea'
            }
        }
    }
]
```

#### 通用模块（可用于所有类型）
```python
COMMON_PRESET_MODULES = [
    {
        'id': 'common_attachments',
        'name': '附件管理',
        'module_type': 'common',  # 通用类型
        'category': 'attachments',
        'workspace_type': 'system',
        'repeatable': False,
        'fields': {
            'photos': {
                'label': '照片',
                'type': 'file',
                'multiple': True,
                'accept': 'image/*'
            },
            'documents': {
                'label': '文档',
                'type': 'file',
                'multiple': True,
                'accept': '.pdf,.doc,.docx'
            },
            'reports': {
                'label': '报告',
                'type': 'file',
                'multiple': True
            }
        }
    },
    {
        'id': 'common_notes',
        'name': '备注信息',
        'module_type': 'common',
        'category': 'notes',
        'workspace_type': 'system',
        'repeatable': False,
        'fields': {
            'notes': {
                'label': '备注',
                'type': 'textarea'
            },
            'tags': {
                'label': '标签',
                'type': 'text',
                'placeholder': '多个标签用逗号分隔'
            }
        }
    }
]
```

---

## 🔄 模板系统统一

### WPSTemplate扩展

同样需要扩展WPSTemplate以支持PQR和pPQR：

```python
# backend/app/models/record_template.py (重命名并扩展)

class RecordTemplate(Base):
    """记录模板 - 统一支持WPS/PQR/pPQR"""

    __tablename__ = "record_templates"

    id = Column(String(100), primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)

    # 新增：模板类型
    template_type = Column(String(20), nullable=False, default='wps', index=True)

    # 适用范围（对于WPS）
    welding_process = Column(String(50), nullable=True, index=True)
    welding_process_name = Column(String(100))
    standard = Column(String(50), index=True)

    # 模块实例列表
    module_instances = Column(JSONB, nullable=False)

    # 数据隔离字段
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    workspace_type = Column(String(20), nullable=False, default="system", index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True)
    factory_id = Column(Integer, ForeignKey("factories.id", ondelete="SET NULL"), nullable=True, index=True)
    is_shared = Column(Boolean, default=False)
    access_level = Column(String(20), default="private")
    template_source = Column(String(20), nullable=False, default="system", index=True)

    # 元数据
    version = Column(String(20), default="1.0")
    is_active = Column(Boolean, default=True, index=True)
    is_system = Column(Boolean, default=False)
    usage_count = Column(Integer, default=0)

    # 审计
    created_by = Column(Integer, ForeignKey("users.id"))
    updated_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        CheckConstraint(
            "template_type IN ('wps', 'pqr', 'ppqr')",
            name='check_template_type'
        ),
    )
```

---

## 📱 前端使用示例

### 创建WPS
```typescript
// 1. 获取WPS可用模块
const modules = await customModuleService.getModules({
  module_type: 'wps'
})

// 2. 选择模板
const template = await templateService.getTemplate(templateId, 'wps')

// 3. 渲染表单（基于模块）
<ModuleBasedForm
  modules={template.module_instances}
  recordType="wps"
/>
```

### 创建PQR
```typescript
// 1. 获取PQR可用模块
const modules = await customModuleService.getModules({
  module_type: 'pqr'
})

// 2. 选择模板
const template = await templateService.getTemplate(templateId, 'pqr')

// 3. 渲染表单（基于模块）
<ModuleBasedForm
  modules={template.module_instances}
  recordType="pqr"
/>
```

### 创建pPQR
```typescript
// 1. 获取pPQR可用模块
const modules = await customModuleService.getModules({
  module_type: 'ppqr'
})

// 2. 选择模板
const template = await templateService.getTemplate(templateId, 'ppqr')

// 3. 渲染表单（基于模块）
<ModuleBasedForm
  modules={template.module_instances}
  recordType="ppqr"
/>
```

---

## ✅ 总结

### 统一模块模板系统的优势

1. **代码复用** - 一套系统支持三种记录类型
2. **维护简单** - 只需维护一套模块系统
3. **用户体验一致** - WPS/PQR/pPQR使用相同的创建流程
4. **灵活性强** - 用户可以为任何类型创建自定义模块
5. **易于扩展** - 未来添加新记录类型很容易

### 实施建议

1. ✅ **采用方案二**（添加module_type字段）
2. ✅ **统一模板系统**（RecordTemplate支持三种类型）
3. ✅ **创建预设模块**（为PQR和pPQR创建系统模块）
4. ✅ **复用前端组件**（ModuleBasedForm等）
5. ✅ **分阶段实施**：
   - 第一步：扩展CustomModule（添加module_type）
   - 第二步：创建PQR预设模块
   - 第三步：创建pPQR预设模块
   - 第四步：扩展模板系统
   - 第五步：前端适配

---

**文档版本**: 1.0
**最后更新**: 2025-10-25
**状态**: 设计完成，待评审


