# 焊接工艺管理系统开发文档

## 项目概述

焊接工艺管理系统是一个部署在云服务器上的专业管理网站，旨在为焊接制造企业提供全流程的数字化管理解决方案。

## 系统架构

- **部署方式**: 云服务器部署
- **系统类型**: Web应用
- **目标用户**: 个人焊接工程师、焊接制造企业、工艺工程师、质量管理人员
- **商业模式**: SaaS订阅制

## 会员体系设计

### 用户注册流程
1. 游客体验模式（无需注册）
2. 个人用户免费注册
3. 升级付费会员（个人版/企业版）

### 会员等级详细设计

#### 通用功能（所有会员等级均可使用）
- **仪表盘**: 系统概览和数据展示
- **个人中心**: 用户个人信息管理、系统设置配置

#### 游客体验模式（免费）
- **功能权限**: WPS和PQR只读查看功能（仅可查看示例数据，不可创建、修改、删除）
- **存储服务**: 不提供，仅临时展示
- **数据保存**: 无
- **体验时长**: 临时会话
- **安全限制**: 仅可查看系统预设的示例数据，无法进行任何写操作

#### 个人会员

**个人免费版**
- **月费**: 免费
- **功能权限**: WPS、PQR增删改查功能
- **数量限制**:
  - WPS: 最多10个
  - PQR: 最多10个
  - pPQR: 不可用
- **存储空间**: 基础存储

**个人专业版**
- **月费**: ¥19
- **功能权限**: WPS、PQR、pPQR、焊材管理、焊工管理
- **数量限制**:
  - WPS: 最多30个
  - PQR: 最多30个
  - pPQR: 最多30个
  - 焊材: 基础管理
  - 焊工: 基础管理

**个人高级版**
- **月费**: ¥49
- **功能权限**: WPS、PQR、pPQR、焊材管理、焊工管理、生产管理、设备管理、质量管理
- **数量限制**:
  - WPS: 最多50个
  - PQR: 最多50个
  - pPQR: 最多50个
  - 其他模块: 完整功能

**个人旗舰版**
- **月费**: ¥99
- **功能权限**: 全部个人功能模块（WPS、PQR、pPQR、焊材、焊工、生产、设备、质量、报表统计）
- **数量限制**:
  - WPS: 最多100个
  - PQR: 最多100个
  - pPQR: 最多100个
  - 所有模块: 完整功能
- **注意**: 不包含企业员工管理功能（该功能仅企业会员可用）

#### 企业会员

**企业版**
- **月费**: ¥199
- **管理员权限**: 拥有个人旗舰版所有功能
- **数量限制**:
  - WPS: 最多200个
  - PQR: 最多200个
  - pPQR: 最多200个
- **组织架构**:
  - 可创建工厂: 1个
  - 可邀请员工: 最多10人
- **员工权限**: 被邀请员工拥有个人专业版权限

**企业版PRO**
- **月费**: ¥399
- **管理员权限**: 拥有个人旗舰版所有功能
- **数量限制**:
  - WPS: 最多400个
  - PQR: 最多400个
  - pPQR: 最多400个
- **组织架构**:
  - 可创建工厂: 3个
  - 可邀请员工: 最多20人
- **员工权限**: 被邀请员工拥有个人专业版权限

**企业版PRO MAX**
- **月费**: ¥899
- **管理员权限**: 拥有个人旗舰版所有功能
- **数量限制**:
  - WPS: 最多500个
  - PQR: 最多500个
  - pPQR: 最多500个
- **组织架构**:
  - 可创建工厂: 5个
  - 可邀请员工: 最多50人
- **员工权限**: 被邀请员工拥有个人专业版权限

### 核心权限管理机制

#### 数据隔离机制
- **用户级别数据隔离**: 每个用户的数据完全独立
- **企业级别数据隔离**: 不同企业之间数据完全隔离
- **工厂级别数据隔离**: 同一企业内不同工厂之间数据可选择性隔离

#### 企业管理员权限
- **跨工厂数据权限控制**: 可设置工厂间的数据共享规则
- **员工文件权限管理**: 可控制员工对企业文件的增删改查权限
- **员工账号管理**: 邀请、禁用、移除员工
- **组织架构设置**: 设置工厂和部门的层级结构

#### 员工权限继承机制
- 企业员工默认继承个人专业版功能权限
- 企业管理员可额外分配或限制员工的文件操作权限
- 员工不能访问企业管理员的后台管理功能

### 计费模式
- **订阅方式**: 按月订阅
- **支付周期**: 月付、季付、年付（年付享受折扣）
- **升级/降级**: 随时可调整会员等级
- **企业员工**: 不额外收费，包含在企业会员费用中

## 功能模块

### 1. 仪表盘 (Dashboard)
- 系统概览和数据展示
- 关键指标监控
- 实时状态展示

### 2. WPS管理 (Welding Procedure Specification)
- 焊接工艺规程管理
- 工艺参数维护
- 版本控制管理

### 3. PQR管理 (Procedure Qualification Record)
- 工艺评定记录管理
- 评定报告维护
- 合规性管理

### 4. pPQR管理 (preliminary Procedure Qualification Record)
- 预备工艺评定记录管理
- 临时评定方案维护
- 评审流程管理

### 5. 焊工管理 (Welder Management)
- 焊接人员资质管理
- 技能等级维护
- 培训记录管理

### 6. 焊材管理 (Welding Material Management)
- 焊接材料库存管理
- 材料使用追踪
- 供应商管理
- 焊材计算功能
  - 焊材用量计算
  - 成本核算
  - 消耗预测

### 7. 设备管理 (Equipment Management)
- 焊接设备维护管理
- 设备使用记录
- 维修保养计划

### 8. 生产管理 (Production Management)
- 生产任务管理
- 生产流程控制
- 进度跟踪

### 9. 质量管理 (Quality Management)
- 质量控制管理
- 检验记录维护
- 不合格品处理

### 10. 报表统计 (Report & Statistics)
- 数据分析报表
- 统计图表展示
- 导出功能

### 11. 企业员工管理 (Enterprise Employee Management)
*(仅企业会员用户可见)*
- **员工邀请管理**: 发送邀请链接、管理邀请状态
- **员工权限设置**: 设置员工功能访问权限和文件操作权限
- **工厂组织架构**: 创建和管理工厂、部门结构
- **员工账号管理**: 启用/禁用员工账号、重置密码
- **跨工厂数据权限**: 设置工厂间的数据共享和隔离规则
- **员工使用统计**: 查看员工活跃度和功能使用情况

### 12. 个人中心 (Personal Center)
- 用户个人信息管理
- 系统设置配置
- 权限查看（个人权限范围展示）

## 开发阶段规划

### 第一阶段 - 核心功能（立即开发）
**优先级**: 🔴 最高

1. **用户认证系统** - 登录、注册、权限管理
2. **会员体系** - 会员等级、配额管理、权限控制
3. **仪表盘** - 系统概览和数据展示
4. **WPS管理** - 焊接工艺规程管理（核心业务）
5. **PQR管理** - 工艺评定记录管理（核心业务）
6. **pPQR管理** - 预备工艺评定记录管理（核心业务）
7. **个人中心** - 用户个人信息管理

### 第二阶段 - 重要功能（优先开发）
**优先级**: 🟡 高

8. **焊工管理** - 焊接人员资质管理
9. **焊材管理** - 焊接材料库存管理
10. **设备管理** - 焊接设备维护管理
11. **企业员工管理** - 企业协作管理（仅企业会员）

### 第三阶段 - 增强功能（后续开发）
**优先级**: 🟢 中

12. **生产管理** - 生产任务和流程管理
13. **质量管理** - 质量控制和检验管理
14. **报表统计** - 数据分析和报表生成

### 第四阶段 - 管理功能（后续开发）
**优先级**: 🔵 低

15. **管理员门户** - 系统管理员后台管理

**当前阶段**: 第一阶段开发中

## 技术选型

### 后端技术栈
- **Python 3.11+** - 主要开发语言，性能优化和现代化特性
- **FastAPI 0.104+** - 高性能异步Web框架，自动API文档生成
- **SQLAlchemy 2.0+** - 现代化ORM，支持异步操作
- **Alembic** - 数据库版本控制和迁移管理
- **PostgreSQL 15+** - 企业级关系数据库，支持JSON和复杂查询
- **Redis 7.0+** - 高性能缓存和会话存储
- **Celery** - 分布式异步任务队列
- **RabbitMQ** - 可靠的消息中间件
- **Pydantic 2.0+** - 数据验证和序列化

### 前端技术栈
- **React 18 + TypeScript** - 现代化前端框架，类型安全
- **Vite 5.0+** - 快速构建工具，热重载支持
- **Ant Design 5.0+** - 企业级UI组件库，丰富的组件生态
- **React Query (TanStack Query)** - 服务端状态管理，缓存和同步
- **Zustand** - 轻量级客户端状态管理
- **React Router 6** - 单页应用路由管理
- **Axios** - HTTP客户端，请求拦截和错误处理

### 硬件交互技术 (后期开发)
- **基础通信**: 串口通信、Modbus协议
- **实时数据**: WebSocket、MQTT消息传输
- **设备集成**: 通用仪器控制接口
- **数据采集**: 焊接参数实时监控
- **协议支持**: 多种工业通信协议

### 图纸生成技术
- **Matplotlib + Plotly** - 2D图形绘制
- **CADQuery** - 3D CAD生成
- **ReportLab** - PDF文档生成
- **OpenCV** - 图像处理

### AI/数据处理技术
- **NumPy + Pandas** - 数据处理和分析
- **Scikit-learn** - 机器学习算法
- **SciPy** - 科学计算
- **Transformers** - 自然语言处理（可选）

### 部署和运维
- **Docker + Docker Compose** - 容器化部署，环境一致性
- **Nginx** - 高性能反向代理和静态文件服务
- **Gunicorn** - Python WSGI服务器，多进程管理
- **Let's Encrypt** - 免费SSL证书，HTTPS支持
- **Prometheus + Grafana** - 监控和可视化
- **ELK Stack** - 日志收集和分析（可选）

### 开发工具
- **Poetry** - Python依赖管理和虚拟环境
- **Black + isort** - 代码格式化和导入排序
- **Pytest** - 功能强大的测试框架
- **Pre-commit** - Git钩子管理，代码质量检查
- **mypy** - 静态类型检查
- **flake8** - 代码风格检查
- **ESLint + Prettier** - 前端代码质量和格式化

## 系统架构

### 整体架构设计
```
┌─────────────────────────────────────────────────────────┐
│                    前端层 (React)                        │
│  ├── 用户门户 (frontend)                                │
│  └── 管理员门户 (admin-frontend)                        │
├─────────────────────────────────────────────────────────┤
│                    应用层 (FastAPI)                      │
│  ├── 认证授权模块                                        │
│  ├── 用户管理模块                                        │
│  ├── WPS/PQR管理模块                                     │
│  ├── 企业管理模块                                        │
│  ├── 报表统计模块                                        │
│  └── 系统管理模块                                        │
├─────────────────────────────────────────────────────────┤
│  数据层                                                │
│  ├── PostgreSQL (主数据库)                              │
│  ├── Redis (缓存)                                       │
│  └── 文件存储                                           │
├─────────────────────────────────────────────────────────┤
│                    基础设施层                            │
│  ├── 消息队列 (RabbitMQ)                                │
│  ├── 任务队列 (Celery)                                  │
│  └── 监控日志                                           │
└─────────────────────────────────────────────────────────┘
```

## 后期开发功能需求

> **注意**: 以下功能为后期开发需求，将在系统核心功能稳定后逐步实现

### 1. 硬件交互功能 (后期开发)

#### 1.1 实时参数监控
- **电流监测**: 实时采集焊接电流数据
- **电压监测**: 实时采集焊接电压数据
- **温度监测**: 焊接区域温度监控
- **气体流量**: 保护气体流量监测

#### 1.2 设备通信协议
- **Modbus RTU/TCP**: 工业标准通信协议
- **串口通信**: 直接连接传感器设备
- **MQTT**: 物联网设备数据传输
- **WebSocket**: 前端实时数据推送

#### 1.3 参数验证与预警
- **实时对比**: 监控参数与WPS标准参数对比
- **异常预警**: 参数超出范围时实时报警
- **数据记录**: 完整的焊接过程数据记录
- **质量追溯**: 焊接参数与产品质量关联

### 2. 图纸生成功能 (后期开发)

#### 2.1 管道焊缝布置图
- **自动布局**: 根据管道参数自动生成焊缝位置
- **3D可视化**: 立体展示管道焊缝分布
- **参数标注**: 焊缝编号、焊接方法等标注
- **格式输出**: 支持PDF、DWG、PNG等格式

#### 2.2 焊接工艺文件生成
- **WPS模板**: 标准WPS表格自动填充
- **工艺卡片**: 现场施工工艺卡片生成
- **检验记录**: 质量检验表格生成
- **批量导出**: 支持批量生成和导出

#### 2.3 智能推荐系统
- **参数优化**: AI推荐最佳焊接参数
- **工艺匹配**: 根据材料推荐合适的WPS
- **效率提升**: 优化焊接顺序和工艺流程

### 3. 开发优先级说明

#### 第一阶段 - 核心功能 (立即开发)
- 用户注册和会员体系
- WPS/PQR管理
- 基础业务功能模块
- 管理员门户

#### 第二阶段 - 扩展功能 (中期开发)
- 报表统计
- 企业员工管理
- 生产/质量/设备管理
- 支付集成完善

#### 第三阶段 - 高级功能 (后期开发)
- 硬件交互功能
- 图纸生成功能
- AI智能推荐
- 高级数据分析

#### 技术准备
虽然这些功能在后期开发，但技术栈选择已经考虑了这些需求：
- **Python** 丰富的硬件库支持
- **FastAPI** 高性能实时通信
- **React** 实时数据展示能力
- **PostgreSQL** 复杂数据存储

---

*文档创建时间: 2025-10-15*
*最后更新: 2025-10-15*

## 管理员门户系统

### 门户架构设计
```
┌─────────────────────────────────────────────────────────┐
│                   用户门户 (主站点)                       │
│  ├── 用户注册/登录                                       │
│  ├── 会员功能模块 (11个主要功能)                         │
│  └── 个人中心                                           │
└─────────────────────────────────────────────────────────┘
                                ↓
                        (独立域名/子路径)
                                ↓
┌─────────────────────────────────────────────────────────┐
│                 管理员门户 (admin.yourdomain.com)        │
│  ├── 管理员登录验证                                       │
│  ├── 会员监控模块                                       │
│  ├── 系统管理模块                                       │
│  ├── 数据分析模块                                       │
│  └── 运营管理模块                                       │
└─────────────────────────────────────────────────────────┘
```

### 管理员门户功能模块
### 管理员门户账号密码
- 邮箱: Laimiu.new@gmail.com
- 账号: Laimiu
- 密码: ghzzz123 
#### 1. 会员监控中心
**实时监控面板**
- **在线用户统计**: 当前在线用户数、活跃度分析
- **会员分布**: 各等级会员数量和分布情况
- **收入统计**: 日/月/年收入统计和趋势分析
- **系统负载**: 服务器性能监控和资源使用情况

**会员详情管理**
- **会员列表**: 支持多条件筛选和搜索
- **会员详情**: 查看用户个人信息、订阅历史、使用情况
- **权限管理**: 手动调整用户权限等级
- **账号操作**: 禁用/启用用户账号、重置密码

#### 2. 企业会员监控
**企业概览**
- **企业列表**: 查看所有企业会员信息
- **订阅状态**: 监控企业会员订阅和续费情况
- **使用统计**: 企业用户活跃度和功能使用情况
- **异常监控**: 检测企业异常登录和使用行为

**企业数据统计**
- **企业规模**: 统计各企业员工数量和工厂数量
- **功能使用**: 分析企业各功能模块使用情况
- **存储占用**: 监控企业数据存储空间使用
- **权限合规**: 检查企业权限分配是否合规

#### 3. 系统管理功能
**数据管理**
- **数据备份**: 手动/自动备份用户数据
- **数据恢复**: 数据恢复和回滚功能
- **存储监控**: 存储空间使用情况监控
- **清理工具**: 清理过期数据和临时文件

**系统配置**
- **会员定价**: 调整各等级会员价格
- **功能开关**: 控制功能模块的启用/禁用
- **系统公告**: 发布系统维护和更新通知
- **版本管理**: 系统版本控制和更新管理

#### 4. 财务管理
**收入分析**
- **订阅收入**: 详细收入统计和分析
- **退款处理**: 处理用户退款申请
- **发票管理**: 生成和管理用户发票
- **财务报表**: 月度/年度财务报表

**支付管理**
- **支付通道**: 监控支付接口状态
- **异常订单**: 处理支付异常和失败订单
- **对账功能**: 与支付平台对账

#### 5. 安全监控
**安全防护**
- **登录监控**: 异常登录行为检测
- **操作日志**: 记录所有管理员操作
- **安全扫描**: 检测系统安全漏洞
- **权限审计**: 定期审计用户权限分配

**风控管理**
- **行为分析**: 分析用户行为模式
- **风险预警**: 检测可疑活动并预警
- **黑名单管理**: 管理恶意用户和IP

### 技术实现方案

#### 访问控制
```python
# 管理员权限装饰器
from functools import wraps
from fastapi import HTTPException

def admin_required(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        user = get_current_user()
        if not user or not user.is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        return await func(*args, **kwargs)
    return wrapper
```

#### 双门户部署
```yaml
# docker-compose.yml
version: '3.8'
services:
  # 用户门户
  frontend:
    build: ./frontend
    environment:
      - PORTAL_TYPE=user
    ports:
      - "3000:3000"

  # 管理员门户
  admin-frontend:
    build: ./admin-frontend
    environment:
      - PORTAL_TYPE=admin
    ports:
      - "3001:3001"
```

#### 域名配置
```nginx
# nginx配置
server {
    listen 80;
    server_name yourdomain.com;
    location / {
        proxy_pass http://frontend:3000;
    }
}

server {
    listen 80;
    server_name admin.yourdomain.com;
    location / {
        proxy_pass http://admin-frontend:3001;
    }
}
```

### 管理员权限等级

#### 系统管理员 (Admin)
- **所有管理功能权限** - 完整的管理员门户访问权限
- **会员监控和管理** - 查看和管理所有用户账号
- **系统配置管理** - 调整会员定价、功能开关等
- **财务管理** - 查看收入统计、处理退款等
- **数据管理** - 数据备份、恢复、清理等
- **安全监控** - 查看日志、处理异常等

#### 普通管理员 (可选)
- **只读权限** - 仅可查看数据，无法修改
- **客服支持** - 处理用户问题和基础操作
- **报告查看** - 查看各类统计报表

**说明**：
- 作为个人开发者，您只需要**一个系统管理员**账号即可
- 普通管理员角色仅为未来团队扩展预留，初期不需要创建

## 项目文件结构设计

### 整体项目结构
```
weld-system/
├── README.md                     # 项目说明文档
├── docker-compose.yml            # Docker编排配置
├── docker-compose.dev.yml        # 开发环境Docker配置
├── .env.example                  # 环境变量模板
├── .gitignore                    # Git忽略文件
├── Makefile                      # 常用命令快捷方式
│
├── docs/                         # 项目文档
│   ├── api.md                    # API文档
│   ├── database.md               # 数据库设计
│   ├── deployment.md             # 部署指南
│   └── development.md            # 开发指南
│
├── scripts/                      # 部署和工具脚本
│   ├── init-db.sql               # 数据库初始化脚本
│   ├── backup.sh                 # 数据备份脚本
│   ├── deploy.sh                 # 部署脚本
│   └── setup-dev.sh              # 开发环境设置脚本
│
├── config/                       # 配置文件
│   ├── nginx/                    # Nginx配置
│   │   ├── nginx.conf
│   │   └── ssl/
│   ├── monitoring/               # 监控配置
│   │   └── prometheus.yml
│   └── ssl/                      # SSL证书
│
├── backend/                      # 后端服务
│   ├── requirements.txt          # Python依赖
│   ├── pyproject.toml           # Poetry配置
│   ├── Dockerfile               # 后端Docker文件
│   ├── alembic.ini              # 数据库迁移配置
│   ├── main.py                  # 应用入口
│   │
│   ├── app/                     # 应用核心代码
│   │   ├── __init__.py
│   │   ├── core/                # 核心配置和工具
│   │   │   ├── __init__.py
│   │   │   ├── config.py        # 应用配置
│   │   │   ├── database.py      # 数据库连接
│   │   │   ├── security.py      # 安全相关
│   │   │   ├── redis.py         # Redis连接
│   │   │   └── utils.py         # 工具函数
│   │   │
│   │   ├── models/              # 数据模型
│   │   │   ├── __init__.py
│   │   │   ├── base.py          # 基础模型
│   │   │   ├── user.py          # 用户模型
│   │   │   ├── wps.py           # WPS模型
│   │   │   ├── pqr.py           # PQR模型
│   │   │   ├── company.py       # 企业模型
│   │   │   └── equipment.py     # 设备模型
│   │   │
│   │   ├── schemas/             # Pydantic模式
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── wps.py
│   │   │   └── response.py
│   │   │
│   │   ├── api/                 # API路由
│   │   │   ├── __init__.py
│   │   │   ├── deps.py          # 依赖注入
│   │   │   ├── v1/              # API版本1
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py      # 认证相关
│   │   │   │   ├── users.py     # 用户管理
│   │   │   │   ├── wps.py       # WPS管理
│   │   │   │   ├── pqr.py       # PQR管理
│   │   │   │   ├── materials.py # 焊材管理
│   │   │   │   ├── welders.py   # 焊工管理
│   │   │   │   ├── equipment.py # 设备管理
│   │   │   │   ├── production.py# 生产管理
│   │   │   │   ├── quality.py   # 质量管理
│   │   │   │   ├── reports.py   # 报表统计
│   │   │   │   └── admin.py     # 管理员功能
│   │   │   └── websocket.py     # WebSocket连接
│   │   │
│   │   ├── services/            # 业务逻辑服务
│   │   │   ├── __init__.py
│   │   │   ├── user_service.py
│   │   │   ├── wps_service.py
│   │   │   ├── pqr_service.py
│   │   │   ├── auth_service.py
│   │   │   ├── payment_service.py
│   │   │   └── notification_service.py
│   │   │
│   │   ├── ai/                  # AI相关功能
│   │   │   ├── __init__.py
│   │   │   ├── recommendation.py # 智能推荐
│   │   │   ├── optimization.py   # 参数优化
│   │   │   └── prediction.py     # 预测分析
│   │   │
│   │   ├── hardware/            # 硬件交互
│   │   │   ├── __init__.py
│   │   │   ├── sensors.py       # 传感器接口
│   │   │   ├── modbus_client.py # Modbus通信
│   │   │   └── monitoring.py    # 实时监控
│   │   │
│   │   ├── drawing/             # 图纸生成
│   │   │   ├── __init__.py
│   │   │   ├── wps_generator.py # WPS文件生成
│   │   │   ├── layout_generator.py # 布置图生成
│   │   │   └── pdf_generator.py # PDF生成
│   │   │
│   │   ├── tasks/               # 异步任务
│   │   │   ├── __init__.py
│   │   │   ├── celery_app.py    # Celery配置
│   │   │   ├── backup_tasks.py  # 备份任务
│   │   │   └── report_tasks.py  # 报表��成任务
│   │   │
│   │   └── middleware/          # 中间件
│   │       ├── __init__.py
│   │       ├── auth.py          # 认证中间件
│   │       ├── cors.py          # CORS中间件
│   │       └── logging.py       # 日志中间件
│   │
│   ├── alembic/                 # 数据库迁移
│   │   ├── versions/            # 迁移版本
│   │   ├── env.py
│   │   └── script.py.mako
│   │
│   └── tests/                   # 测试文件
│       ├── __init__.py
│       ├── conftest.py          # pytest配置
│       ├── test_auth.py
│       ├── test_wps.py
│       └── test_users.py
│
├── frontend/                    # 用户门户前端
│   ├── package.json             # 前端依赖
│   ├── tsconfig.json           # TypeScript配置
│   ├── vite.config.ts          # Vite配置
│   ├── Dockerfile              # 前端Docker文件
│   ├── index.html              # HTML模板
│   ├── .env.local              # 本地环境变量
│   │
│   ├── public/                 # 静态资源
│   │   ├── favicon.ico
│   │   └── images/
│   │
│   └── src/                    # 源代码
│       ├── main.tsx            # 应用入口
│       ├── App.tsx             # 根组件
│       ├── vite-env.d.ts       # Vite类型定义
│       │
│       ├── components/         # 通用组件
│       │   ├── Layout/         # 布局组件
│       │   ├── Forms/          # 表单组件
│       │   ├── Tables/         # 表格组件
│       │   └── Charts/         # 图表组件
│       │
│       ├── pages/              # 页面组件
│       │   ├── Dashboard/      # 仪表盘
│       │   ├── WPS/           # WPS管理
│       │   ├── PQR/           # PQR管理
│       │   ├── Materials/     # 焊材管理
│       │   ├── Welders/       # 焊工管理
│       │   ├── Equipment/     # 设备管理
│       │   ├── Production/    # 生产管理
│       │   ├── Quality/       # 质量管理
│       │   ├── Reports/       # 报表统计
│       │   ├── Employees/     # 员工管理
│       │   ├── Profile/       # 个人中心
│       │   └── Auth/          # 认证页面
│       │
│       ├── hooks/              # 自定义Hooks
│       │   ├── useAuth.ts
│       │   ├── useWPS.ts
│       │   └── useWebSocket.ts
│       │
│       ├── services/           # API服务
│       │   ├── api.ts          # API客户端
│       │   ├── auth.ts         # 认证服务
│       │   ├── wps.ts          # WPS服务
│       │   └── websocket.ts    # WebSocket服务
│       │
│       ├── store/              # 状态管理
│       │   ├── index.ts
│       │   ├── authStore.ts
│       │   └── wpsStore.ts
│       │
│       ├── types/              # TypeScript类型
│       │   ├── auth.ts
│       │   ├── wps.ts
│       │   └── api.ts
│       │
│       ├── utils/              # 工具函数
│       │   ├── constants.ts
│       │   ├── helpers.ts
│       │   └── validators.ts
│       │
│       └── styles/             # 样式文件
│           ├── globals.css
│           └── components.css
│
├── admin-frontend/             # 管理员门户前端
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   │
│   └── src/                   # 管理员前端源代码
│       ├── main.tsx
│       ├── App.tsx
│       │
│       ├── pages/             # 管理员页面
│       │   ├── Dashboard/     # 管理员仪表盘
│       │   ├── Users/         # 用户管理
│       │   ├── Companies/     # 企业管理
│       │   ├── System/        # 系统管理
│       │   ├── Finance/       # 财务管理
│       │   └── Security/      # 安全监控
│       │
│       ├── components/        # 管理员专用组件
│       │   ├── UserTable/
│       │   ├── CompanyChart/
│       │   └── SystemMonitor/
│       │
│       └── services/          # 管理员API服务
│           ├── admin.ts
│           ├── users.ts
│           └── reports.ts
│
├── database/                   # 数据库相关
│   ├── init/                  # 初始化脚本
│   │   ├── 01-create-database.sql
│   │   └── 02-create-admin.sql
│   └── migrations/            # 数据迁移文件
│
├── storage/                    # 文件存储
│   ├── uploads/               # 用户上传文件
│   ├── reports/               # 生成的报表
│   ├── drawings/              # 生成的图纸
│   └── backups/               # 数据备份
│
└── monitoring/                 # 监控和日志
    ├── logs/                  # 应用日志
    ├── metrics/               # 性能指标
    └── alerts/                # 告警配置
```

### 关键配置文件说明

#### 1. 根目录配置文件

**docker-compose.yml**
```yaml
version: '3.8'
services:
  # 后端API服务
  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/weld_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    ports:
      - "8000:8000"

  # 用户门户前端
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  # 管理员门户前端
  admin-frontend:
    build: ./admin-frontend
    ports:
      - "3001:3001"
    depends_on:
      - backend

  # 数据库
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=weld_db
      - POSTGRES_USER=weld_user
      - POSTGRES_PASSWORD=weld_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # 缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # 消息队列
  rabbitmq:
    image: rabbitmq:3-management
    environment:
      - RABBITMQ_DEFAULT_USER=weld_user
      - RABBITMQ_DEFAULT_PASS=weld_pass
    ports:
      - "5672:5672"
      - "15672:15672"

volumes:
  postgres_data:
```

**Makefile**
```makefile
.PHONY: help build up down logs clean test

help:
	@echo "Available commands:"
	@echo "  build    - Build all Docker images"
	@echo "  up       - Start all services"
	@echo "  down     - Stop all services"
	@echo "  logs     - Show logs"
	@echo "  clean    - Remove all containers and images"
	@echo "  test     - Run tests"

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

clean:
	docker-compose down -v --rmi all

test:
	docker-compose exec backend pytest
```

#### 2. 开发环境配置

**.env.example**
```env
# 数据库配置
DATABASE_URL=postgresql://weld_user:weld_pass@localhost:5432/weld_db
REDIS_URL=redis://localhost:6379

# JWT配置
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 支付配置
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 硬件配置
SERIAL_PORT=/dev/ttyUSB0
MODBUS_HOST=192.168.1.100

# 文件存储
UPLOAD_DIR=./storage/uploads
MAX_FILE_SIZE=10MB

# 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

这个项目结构设计具有以下特点：

### 1. **清晰的模块分离**
- 前端、后端、管理员门户完全分离
- 数据库、配置、脚本独立管理
- 便于团队协作和维护

### 2. **微服务友好**
- 后端API按功能模块组织
- 支持独立部署和扩展
- 清晰的服务边界

### 3. **开发体验优化**
- Docker一键启动开发环境
- 完整的测试框架
- 详细的文档和配置

### 4. **生产就绪**
- 包含监控、日志、备份
- 安全配置和部署脚本
- 支持CI/CD集成

---

## 数据库设计

### 核心数据表结构

#### 1. 用户相关表

**users (用户表)**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'zh-CN',
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    membership_tier VARCHAR(50) DEFAULT 'free', -- free, pro, advanced, flagship
    membership_type VARCHAR(50) DEFAULT 'personal', -- personal, enterprise
    subscription_status VARCHAR(50) DEFAULT 'active', -- active, expired, cancelled
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    trial_end_date TIMESTAMP,
    auto_renewal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    password_changed_at TIMESTAMP,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    preferences JSONB, -- 用户偏好设置
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_membership (membership_tier, membership_type),
    INDEX idx_subscription_status (subscription_status)
);
```

**companies (企业表)**
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    membership_tier VARCHAR(50) NOT NULL, -- enterprise, enterprise_pro, enterprise_pro_max
    max_factories INTEGER DEFAULT 1,
    max_employees INTEGER DEFAULT 10,
    max_wps_records INTEGER DEFAULT 200, -- 基于会员等级的WPS记录限制
    max_pqr_records INTEGER DEFAULT 200, -- 基于会员等级的PQR记录限制
    business_license VARCHAR(255), -- 营业执照号码
    contact_person VARCHAR(100), -- 联系人
    contact_phone VARCHAR(20), -- 联系电话
    contact_email VARCHAR(255), -- 联系邮箱
    address TEXT, -- 公司地址
    website VARCHAR(255), -- 公司网站
    industry VARCHAR(100), -- 行业类型
    company_size VARCHAR(50), -- 公司规模
    description TEXT, -- 公司描述
    logo_url VARCHAR(500), -- 公司logo
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE, -- 是否已认证
    subscription_status VARCHAR(50) DEFAULT 'active', -- active, expired, cancelled
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    trial_end_date TIMESTAMP,
    auto_renewal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_owner (owner_id),
    INDEX idx_membership_tier (membership_tier),
    INDEX idx_subscription_status (subscription_status)
);
```

**factories (工厂表)**
```sql
CREATE TABLE factories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE, -- 工厂编码
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'China',
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
    description TEXT,
    established_date DATE, -- 成立日期
    certification_info JSONB, -- 认证信息
    is_active BOOLEAN DEFAULT TRUE,
    is_headquarters BOOLEAN DEFAULT FALSE, -- 是否为总部
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_company (company_id),
    INDEX idx_code (code),
    INDEX idx_location (city, province)
);
```

**company_employees (企业员工关联表)**
```sql
CREATE TABLE company_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    factory_id UUID REFERENCES factories(id) ON DELETE SET NULL,
    role VARCHAR(50) DEFAULT 'employee', -- admin, manager, employee
    permissions JSONB, -- 自定义权限配置
    is_active BOOLEAN DEFAULT TRUE,
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    joined_at TIMESTAMP,
    UNIQUE(company_id, user_id),
    INDEX idx_company_user (company_id, user_id)
);
```

#### 2. WPS/PQR相关表

**wps_records (WPS记录表)**
```sql
CREATE TABLE wps_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    factory_id UUID REFERENCES factories(id) ON DELETE SET NULL,
    wps_number VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    version VARCHAR(50) DEFAULT '1.0',
    revision INTEGER DEFAULT 1, -- 修订版本号
    status VARCHAR(50) DEFAULT 'draft', -- draft, review, approved, archived, obsolete
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent

    -- 标准和规范
    standard VARCHAR(100), -- 使用的标准 (如AWS, ISO, GB等)
    specification_number VARCHAR(100), -- 规范编号
    pqr_support_uuids JSONB, -- 支持的PQR记录UUID列表

    -- 焊接工艺参数
    base_material VARCHAR(255),
    base_material_group VARCHAR(100), -- 母材组号
    base_material_thickness DECIMAL(8,2), -- 母材厚度范围
    filler_material VARCHAR(255),
    filler_material_classification VARCHAR(100), -- 焊材分类
    welding_process VARCHAR(100),
    welding_process_variant VARCHAR(100), -- 焊接工艺变体
    joint_type VARCHAR(100),
    joint_design VARCHAR(255), -- 接头设计详情
    welding_position VARCHAR(50),
    welding_position_progression VARCHAR(50), -- 焊接位置进展
    preheat_temp_min DECIMAL(10,2),
    preheat_temp_max DECIMAL(10,2),
    interpass_temp_min DECIMAL(10,2),
    interpass_temp_max DECIMAL(10,2),
    post_weld_heat_treatment JSONB, -- 焊后热处理参数
    current_range VARCHAR(50),
    voltage_range VARCHAR(50),
    travel_speed VARCHAR(50),
    heat_input_range VARCHAR(50),
    gas_shield_type VARCHAR(100), -- 保护气体类型
    gas_flow_rate DECIMAL(8,2), -- 气体流量
    tungsten_electrode_type VARCHAR(100), -- 钨极类型
    electrode_diameter DECIMAL(6,2), -- 电极直径

    -- 技术信息
    technique_description TEXT, -- 工艺描述
    welder_qualification_requirement VARCHAR(255), -- 焊工资质要求
    inspection_requirements JSONB, -- 检验要求

    -- 附加信息
    notes TEXT,
    attachments JSONB, -- 附件信息
    tags JSONB, -- 标签

    -- 审核和批准信息
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    effective_date DATE, -- 生效日期
    expiry_date DATE, -- 过期日期

    -- 统计信息
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),

    INDEX idx_user (user_id),
    INDEX idx_company (company_id),
    INDEX idx_factory (factory_id),
    INDEX idx_wps_number (wps_number),
    INDEX idx_status (status),
    INDEX idx_standard (standard),
    INDEX idx_approval (approved_by, approved_at),
    INDEX idx_effective_date (effective_date, expiry_date)
);
```

**pqr_records (PQR记录表)**
```sql
CREATE TABLE pqr_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    factory_id UUID REFERENCES factories(id) ON DELETE SET NULL,
    pqr_number VARCHAR(100) NOT NULL,
    wps_id UUID REFERENCES wps_records(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    test_date DATE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, qualified, failed

    -- 测试参数
    test_organization VARCHAR(255),
    welder_name VARCHAR(100),
    base_material VARCHAR(255),
    filler_material VARCHAR(255),
    welding_process VARCHAR(100),

    -- 测试结果
    tensile_strength DECIMAL(10,2),
    yield_strength DECIMAL(10,2),
    elongation DECIMAL(10,2),
    impact_energy JSONB, -- 冲击能量数据
    bend_test_result VARCHAR(50),
    macro_examination TEXT,

    -- 附加信息
    notes TEXT,
    attachments JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user (user_id),
    INDEX idx_company (company_id),
    INDEX idx_pqr_number (pqr_number),
    INDEX idx_wps (wps_id)
);
```

**ppqr_records (pPQR预备评定记录表)**
```sql
CREATE TABLE ppqr_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    ppqr_number VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, under_review, approved, rejected
    planned_test_date DATE,

    -- 预备参数
    proposed_parameters JSONB,
    review_comments TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user (user_id),
    INDEX idx_company (company_id)
);
```

#### 3. 焊材和焊工管理表

**welding_materials (焊材表)**
```sql
CREATE TABLE welding_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    factory_id UUID REFERENCES factories(id) ON DELETE SET NULL,

    material_code VARCHAR(100) NOT NULL,
    material_name VARCHAR(255) NOT NULL,
    material_type VARCHAR(100), -- electrode, wire, flux, gas
    specification VARCHAR(255),
    manufacturer VARCHAR(255),

    -- 库存信息
    current_stock DECIMAL(10,2),
    unit VARCHAR(50),
    min_stock_level DECIMAL(10,2),
    storage_location VARCHAR(255),

    -- 价格信息
    unit_price DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'CNY',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user (user_id),
    INDEX idx_company (company_id),
    INDEX idx_material_code (material_code)
);
```

**welders (焊工表)**
```sql
CREATE TABLE welders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    factory_id UUID REFERENCES factories(id) ON DELETE SET NULL,

    welder_code VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    id_number VARCHAR(50),
    phone VARCHAR(20),

    -- 资质信息
    certification_number VARCHAR(100),
    certification_level VARCHAR(50),
    certification_date DATE,
    expiry_date DATE,
    qualified_processes JSONB, -- 合格的焊接方法

    -- 状态
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user (user_id),
    INDEX idx_company (company_id),
    INDEX idx_welder_code (welder_code)
);
```

#### 4. 设备和生产管理表

**equipment (设备表)**
```sql
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    factory_id UUID REFERENCES factories(id) ON DELETE SET NULL,

    equipment_code VARCHAR(100) NOT NULL,
    equipment_name VARCHAR(255) NOT NULL,
    equipment_type VARCHAR(100), -- welding_machine, cutting_machine, etc.
    manufacturer VARCHAR(255),
    model VARCHAR(100),
    serial_number VARCHAR(100),

    -- 状态信息
    status VARCHAR(50) DEFAULT 'operational', -- operational, maintenance, broken
    purchase_date DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user (user_id),
    INDEX idx_company (company_id)
);
```

**production_tasks (生产任务表)**
```sql
CREATE TABLE production_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    factory_id UUID REFERENCES factories(id) ON DELETE SET NULL,

    task_number VARCHAR(100) NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    wps_id UUID REFERENCES wps_records(id),

    -- 任务信息
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    priority VARCHAR(50) DEFAULT 'normal', -- low, normal, high, urgent

    -- 分配信息
    assigned_welder_id UUID REFERENCES welders(id),
    assigned_equipment_id UUID REFERENCES equipment(id),

    -- 进度信息
    progress_percentage INTEGER DEFAULT 0,
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user (user_id),
    INDEX idx_company (company_id),
    INDEX idx_status (status)
);
```

#### 5. 质量管理表

**quality_inspections (质量检验表)**
```sql
CREATE TABLE quality_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    production_task_id UUID REFERENCES production_tasks(id),

    inspection_number VARCHAR(100) NOT NULL,
    inspection_date DATE NOT NULL,
    inspector_name VARCHAR(100),

    -- 检验结果
    inspection_type VARCHAR(100), -- visual, radiographic, ultrasonic, etc.
    result VARCHAR(50) DEFAULT 'pending', -- pass, fail, conditional
    defects_found JSONB,

    -- 处理措施
    corrective_actions TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user (user_id),
    INDEX idx_company (company_id),
    INDEX idx_task (production_task_id)
);
```

#### 6. 系统管理表

**subscriptions (订阅记录表)**
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

    plan_type VARCHAR(50) NOT NULL, -- free, pro, advanced, flagship, enterprise, etc.
    billing_cycle VARCHAR(50) DEFAULT 'monthly', -- monthly, quarterly, yearly
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'CNY',

    -- 订阅周期
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    auto_renew BOOLEAN DEFAULT TRUE,

    -- 支付信息
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
    transaction_id VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user (user_id),
    INDEX idx_company (company_id),
    INDEX idx_status (payment_status)
);
```

**audit_logs (审计日志表)**
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- create, update, delete, login, etc.
    resource_type VARCHAR(100), -- wps, pqr, user, etc.
    resource_id UUID,

    -- 详细信息
    ip_address VARCHAR(50),
    user_agent TEXT,
    changes JSONB, -- 变更详情

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_created_at (created_at)
);
```

#### 6. 系统管理和审计表

**audit_logs (审计日志表)**
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- create, update, delete, login, logout, etc.
    resource_type VARCHAR(100) NOT NULL, -- wps, pqr, user, company, etc.
    resource_id UUID, -- 被操作资源的ID
    old_values JSONB, -- 修改前的值
    new_values JSONB, -- 修改后的值
    ip_address INET, -- 操作IP地址
    user_agent TEXT, -- 用户代理
    session_id VARCHAR(255), -- 会话ID
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT, -- 操作描述
    risk_level VARCHAR(20) DEFAULT 'low', -- low, medium, high, critical

    INDEX idx_user (user_id),
    INDEX idx_company (company_id),
    INDEX idx_action (action),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_risk_level (risk_level)
);
```

**user_sessions (用户会话表)**
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user (user_id),
    INDEX idx_session_token (session_token),
    INDEX idx_refresh_token (refresh_token),
    INDEX idx_expires_at (expires_at)
);
```

**system_notifications (系统通知表)**
```sql
CREATE TABLE system_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- info, warning, error, success, maintenance
    target_audience VARCHAR(50) DEFAULT 'all', -- all, users, admins, enterprises
    target_user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- 特定用户通知
    target_company_id UUID REFERENCES companies(id) ON DELETE CASCADE, -- 特定公司通知
    is_active BOOLEAN DEFAULT TRUE,
    is_read BOOLEAN DEFAULT FALSE,
    scheduled_at TIMESTAMP, -- 定时发送
    expires_at TIMESTAMP, -- 过期时间
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,

    INDEX idx_target_user (target_user_id),
    INDEX idx_target_company (target_company_id),
    INDEX idx_type (notification_type),
    INDEX idx_active (is_active),
    INDEX idx_scheduled (scheduled_at)
);
```

**file_attachments (文件附件表)**
```sql
CREATE TABLE file_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    resource_type VARCHAR(100) NOT NULL, -- wps, pqr, company_user, etc.
    resource_id UUID NOT NULL, -- 关联资源ID

    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_hash VARCHAR(64) NOT NULL, -- SHA-256 hash for integrity

    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user (user_id),
    INDEX idx_company (company_id),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_file_hash (file_hash)
);
```

**subscription_payments (订阅支付记录表)**
```sql
CREATE TABLE subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

    payment_method VARCHAR(50) NOT NULL, -- alipay, wechat, credit_card, bank_transfer
    payment_gateway VARCHAR(100), -- 支付网关
    transaction_id VARCHAR(255) UNIQUE, -- 交易ID
    order_id VARCHAR(255) UNIQUE, -- 订单ID

    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'CNY',
    payment_status VARCHAR(50) NOT NULL, -- pending, completed, failed, refunded, cancelled

    membership_tier VARCHAR(50) NOT NULL, -- 购买的会员等级
    membership_type VARCHAR(50) NOT NULL, -- personal, enterprise
    subscription_duration INTEGER NOT NULL, -- 订阅月数

    payment_date TIMESTAMP,
    refunded_at TIMESTAMP,
    refund_amount DECIMAL(12,2),
    refund_reason TEXT,

    gateway_response JSONB, -- 支付网关响应
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user (user_id),
    INDEX idx_company (company_id),
    INDEX idx_transaction (transaction_id),
    INDEX idx_order (order_id),
    INDEX idx_status (payment_status),
    INDEX idx_payment_date (payment_date)
);
```

### 数据库索引策略

1. **主键索引**: 所有表使用UUID作为主键
2. **外键索引**: 所有外键字段自动创建索引
3. **查询优化索引**:
   - 用户邮箱、用户名（唯一索引）
   - 会员等级和类型（组合索引）
   - 记录编号（如WPS编号、PQR编号）
   - 状态字段（用于筛选）
   - 时间字段（用于排序和范围查询）

### 数据库性能优化

1. **分区策略**:
   - 审计日志表按月分区
   - 历史数据归档策略

2. **缓存策略**:
   - 用户会员信息缓存（Redis）
   - 常用查询结果缓存
   - 会话数据缓存

3. **查询优化**:
   - 使用EXPLAIN分析慢查询
   - 避免N+1查询问题
   - 使用连接池管理数据库连接

---

## API接口设计规范

### RESTful API设计原则

#### 1. URL命名规范

```
# 资源命名使用复数形式
GET    /api/v1/users              # 获取用户列表
POST   /api/v1/users              # 创建用户
GET    /api/v1/users/{id}         # 获取单个用户
PUT    /api/v1/users/{id}         # 更新用户
DELETE /api/v1/users/{id}         # 删除用户

# 嵌套资源
GET    /api/v1/companies/{id}/employees    # 获取企业员工列表
POST   /api/v1/companies/{id}/employees    # 添加企业员工

# 特殊操作使用动词
POST   /api/v1/users/{id}/activate         # 激活用户
POST   /api/v1/subscriptions/{id}/renew    # 续费订阅
```

#### 2. HTTP状态码使用规范

```
200 OK                  - 请求成功
201 Created             - 资源创建成功
204 No Content          - 删除成功
400 Bad Request         - 请求参数错误
401 Unauthorized        - 未认证
403 Forbidden           - 无权限
404 Not Found           - 资源不存在
409 Conflict            - 资源冲突
422 Unprocessable Entity - 验证失败
429 Too Many Requests   - 请求过于频繁
500 Internal Server Error - 服务器错误
```

#### 3. 统一响应格式

**成功响应**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "example"
  },
  "message": "操作成功",
  "timestamp": "2025-10-15T10:00:00Z"
}
```

**列表响应**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "page_size": 20,
    "total_pages": 5
  },
  "message": "查询成功"
}
```

**错误响应**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "验证失败",
    "details": {
      "email": ["邮箱格式不正确"],
      "password": ["密码长度至少8位"]
    }
  },
  "timestamp": "2025-10-15T10:00:00Z"
}
```

### 核心API端点

#### 认证相关
```
POST   /api/v1/auth/register          # 用户注册
POST   /api/v1/auth/login             # 用户登录
POST   /api/v1/auth/logout            # 用户登出
POST   /api/v1/auth/refresh           # 刷新Token
POST   /api/v1/auth/forgot-password   # 忘记密码
POST   /api/v1/auth/reset-password    # 重置密码
GET    /api/v1/auth/verify-email      # 验证邮箱
```

#### 用户管理
```
GET    /api/v1/users/me               # 获取当前用户信息
PUT    /api/v1/users/me               # 更新当前用户信息
GET    /api/v1/users/me/subscription  # 获取订阅信息
POST   /api/v1/users/me/upgrade       # 升级会员
```

#### WPS管理
```
GET    /api/v1/wps                    # 获取WPS列表（支持分页、搜索、筛选）
POST   /api/v1/wps                    # 创建WPS
GET    /api/v1/wps/{id}               # 获取WPS详情
PUT    /api/v1/wps/{id}               # 更新WPS
DELETE /api/v1/wps/{id}               # 删除WPS
POST   /api/v1/wps/{id}/approve       # 审批WPS
POST   /api/v1/wps/{id}/reject        # 拒绝WPS
POST   /api/v1/wps/{id}/archive       # 归档WPS
GET    /api/v1/wps/{id}/versions      # 获取版本历史
POST   /api/v1/wps/{id}/duplicate     # 复制WPS
GET    /api/v1/wps/{id}/export/pdf    # 导出PDF
GET    /api/v1/wps/{id}/export/excel  # 导出Excel
POST   /api/v1/wps/batch              # 批量操作WPS
GET    /api/v1/wps/search             # 高级搜索WPS
GET    /api/v1/wps/templates          # 获取WPS模板
POST   /api/v1/wps/from-template      # 从模板创建WPS
```

#### PQR管理
```
GET    /api/v1/pqr                    # 获取PQR列表
POST   /api/v1/pqr                    # 创建PQR
GET    /api/v1/pqr/{id}               # 获取PQR详情
PUT    /api/v1/pqr/{id}               # 更新PQR
DELETE /api/v1/pqr/{id}               # 删除PQR
POST   /api/v1/pqr/{id}/qualify       # 标记为合格
POST   /api/v1/pqr/{id}/fail          # 标记为不合格
GET    /api/v1/pqr/{id}/export/pdf    # 导出PDF
POST   /api/v1/pqr/batch              # 批量操作PQR
```

#### pPQR管理
```
GET    /api/v1/ppqr                   # 获取pPQR列表
POST   /api/v1/ppqr                   # 创建pPQR
GET    /api/v1/ppqr/{id}              # 获取pPQR详情
PUT    /api/v1/ppqr/{id}              # 更新pPQR
DELETE /api/v1/ppqr/{id}              # 删除pPQR
POST   /api/v1/ppqr/{id}/submit       # 提交审核
POST   /api/v1/ppqr/{id}/approve      # 审批通过
POST   /api/v1/ppqr/{id}/reject       # 审批拒绝
```

#### 焊工管理
```
GET    /api/v1/welders                # 获取焊工列表
POST   /api/v1/welders                # 添加焊工
GET    /api/v1/welders/{id}           # 获取焊工详情
PUT    /api/v1/welders/{id}           # 更新焊工信息
DELETE /api/v1/welders/{id}           # 删除焊工
POST   /api/v1/welders/{id}/certify   # 添加资质证书
GET    /api/v1/welders/{id}/history   # 获取焊工历史记录
POST   /api/v1/welders/import         # 批量导入焊工
```

#### 焊材管理
```
GET    /api/v1/materials              # 获取焊材列表
POST   /api/v1/materials              # 添加焊材
GET    /api/v1/materials/{id}         # 获取焊材详情
PUT    /api/v1/materials/{id}         # 更新焊材信息
DELETE /api/v1/materials/{id}         # 删除焊材
POST   /api/v1/materials/{id}/stock   # 更新库存
GET    /api/v1/materials/low-stock    # 获取低库存预警
POST   /api/v1/materials/consume      # 记录焊材消耗
GET    /api/v1/materials/history      # 获取库存历史
```

#### 设备管理
```
GET    /api/v1/equipment              # 获取设备列表
POST   /api/v1/equipment              # 添加设备
GET    /api/v1/equipment/{id}         # 获取设备详情
PUT    /api/v1/equipment/{id}         # 更新设备信息
DELETE /api/v1/equipment/{id}         # 删除设备
POST   /api/v1/equipment/{id}/maintain # 记录维护
GET    /api/v1/equipment/{id}/schedule # 获取维护计划
POST   /api/v1/equipment/{id}/status   # 更新设备状态
```

#### 企业管理
```
GET    /api/v1/companies              # 获取企业列表
POST   /api/v1/companies              # 创建企业
GET    /api/v1/companies/{id}         # 获取企业详情
PUT    /api/v1/companies/{id}         # 更新企业信息
DELETE /api/v1/companies/{id}         # 删除企业
GET    /api/v1/companies/{id}/employees    # 获取员工列表
POST   /api/v1/companies/{id}/invite       # 邀请员工
PUT    /api/v1/companies/{id}/employees/{user_id}  # 更新员工权限
DELETE /api/v1/companies/{id}/employees/{user_id}  # 移除员工
GET    /api/v1/companies/{id}/factories     # 获取工厂列表
POST   /api/v1/companies/{id}/factories     # 添加工厂
GET    /api/v1/companies/{id}/usage        # 获取使用统计
POST   /api/v1/companies/{id}/upgrade      # 升级会员等级
```

#### 报表统计
```
GET    /api/v1/reports/dashboard       # 仪表盘数据
GET    /api/v1/reports/wps-summary     # WPS统计报表
GET    /api/v1/reports/pqr-summary     # PQR统计报表
GET    /api/v1/reports/usage           # 使用情况报表
GET    /api/v1/reports/materials       # 焊材消耗报表
POST   /api/v1/reports/export          # 导出报表
```

#### 文件管理
```
POST   /api/v1/files/upload            # 上传文件
GET    /api/v1/files/{id}              # 下载文件
DELETE /api/v1/files/{id}              # 删除文件
GET    /api/v1/files/{id}/info         # 获取文件信息
POST   /api/v1/files/batch-upload      # 批量上传文件
```

#### 通知系统
```
GET    /api/v1/notifications           # 获取通知列表
PUT    /api/v1/notifications/{id}/read # 标记已读
POST   /api/v1/notifications/mark-all  # 全部标记已读
DELETE /api/v1/notifications/{id}      # 删除通知
```

#### 管理员API
```
GET    /api/v1/admin/users            # 获取所有用户
POST   /api/v1/admin/users/{id}/ban   # 封禁用户
POST   /api/v1/admin/users/{id}/unban # 解封用户
PUT    /api/v1/admin/users/{id}/role  # 修改用户角色
GET    /api/v1/admin/companies        # 获取所有企业
PUT    /api/v1/admin/companies/{id}/verify # 认证企业
GET    /api/v1/admin/statistics       # 获取系统统计
GET    /api/v1/admin/subscriptions    # 获取订阅列表
POST   /api/v1/admin/subscriptions/{id}/cancel # 取消订阅
GET    /api/v1/admin/audit-logs       # 获取审计日志
GET    /api/v1/admin/system-health    # 系统健康检查
POST   /api/v1/admin/maintenance      # 系统维护模式
GET    /api/v1/admin/backup           # 数据库备份
POST   /api/v1/admin/notifications   # 发送系统通知
```

#### 支付和订阅
```
GET    /api/v1/plans                  # 获取订阅计划
POST   /api/v1/subscriptions          # 创建订阅
GET    /api/v1/subscriptions/{id}     # 获取订阅详情
POST   /api/v1/subscriptions/{id}/renew # 续费订阅
POST   /api/v1/subscriptions/{id}/cancel # 取消订阅
GET    /api/v1/payments               # 获取支付记录
POST   /api/v1/payments/create        # 创建支付订单
GET    /api/v1/payments/{id}/status   # 查询支付状态
POST   /api/v1/payments/webhook       # 支付回调接口
```

### API认证和授权

#### JWT Token认证
```python
# Token结构
{
  "user_id": "uuid",
  "email": "user@example.com",
  "membership_tier": "pro",
  "is_admin": false,
  "exp": 1234567890,
  "iat": 1234567890
}

# 请求头
Authorization: Bearer <access_token>
```

#### 权限验证装饰器
```python
from functools import wraps
from fastapi import HTTPException, Depends

def require_membership(min_tier: str):
    """要求最低会员等级"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user=Depends(get_current_user), **kwargs):
            if not check_membership_tier(current_user.membership_tier, min_tier):
                raise HTTPException(
                    status_code=403,
                    detail="需要更高的会员等级"
                )
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

# 使用示例
@router.post("/ppqr")
@require_membership("pro")
async def create_ppqr(data: PPQRCreate, current_user: User = Depends(get_current_user)):
    # 只有专业版及以上会员可以创建pPQR
    pass
```

### API详细规范

#### 分页参数规范
```
# 所有列表API都支持分页
GET /api/v1/wps?page=1&page_size=20&sort=created_at&order=desc

# 查询参数
page: 页码 (默认: 1)
page_size: 每页数量 (默认: 20, 最大: 100)
sort: 排序字段
order: 排序方向 (asc/desc)
search: 搜索关键词
```

#### 搜索和筛选
```
# 高级搜索支持
GET /api/v1/wps?search=管道焊接&status=approved&standard=AWS&created_after=2024-01-01

# 常用筛选参数
status: 状态筛选
standard: 标准筛选
company_id: 企业筛选
factory_id: 工厂筛选
created_after: 创建时间筛选（之后）
created_before: 创建时间筛选（之前）
updated_after: 更新时间筛选（之后）
```

#### API请求示例

**创建WPS**
```bash
curl -X POST "https://api.weld-system.com/v1/wps" \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "wps_number": "WPS-2024-001",
    "title": "碳钢管道对接焊工艺",
    "standard": "AWS D1.1",
    "base_material": "ASTM A36",
    "filler_material": "E7018",
    "welding_process": "SMAW",
    "joint_type": "Butt Joint",
    "welding_position": "1G",
    "preheat_temp_min": 50,
    "preheat_temp_max": 100,
    "current_range": "90-130A",
    "voltage_range": "22-28V",
    "travel_speed": "3-5 cm/min"
  }'
```

**批量操作**
```bash
curl -X POST "https://api.weld-system.com/v1/wps/batch" \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "archive",
    "ids": ["uuid1", "uuid2", "uuid3"]
  }'
```

**文件上传**
```bash
curl -X POST "https://api.weld-system.com/v1/files/upload" \
  -H "Authorization: Bearer {access_token}" \
  -F "file=@document.pdf" \
  -F "resource_type=wps" \
  -F "resource_id=uuid-here" \
  -F "description=WPS支持文档"
```

#### API响应示例

**成功响应**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "wps_number": "WPS-2024-001",
    "title": "碳钢管道对接焊工艺",
    "status": "draft",
    "created_at": "2024-10-15T10:00:00Z",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  "message": "WPS创建成功",
  "timestamp": "2024-10-15T10:00:00Z"
}
```

**列表响应**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid1",
        "wps_number": "WPS-001",
        "title": "工艺1",
        "status": "approved",
        "created_at": "2024-10-15T10:00:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "page_size": 20,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  },
  "message": "查询成功"
}
```

**错误响应**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数验证失败",
    "details": {
      "wps_number": ["WPS编号已存在"],
      "current_range": ["电流范围格式不正确"]
    },
    "request_id": "req_123456789"
  },
  "timestamp": "2024-10-15T10:00:00Z"
}
```

#### API错误码规范
```
# 通用错误码
VALIDATION_ERROR: 参数验证失败
UNAUTHORIZED: 未认证
FORBIDDEN: 权限不足
NOT_FOUND: 资源不存在
CONFLICT: 资源冲突
RATE_LIMIT_EXCEEDED: 请求频率超限
INTERNAL_ERROR: 服务器内部错误

# 业务错误码
MEMBERSHIP_REQUIRED: 需要会员权限
QUOTA_EXCEEDED: 配额已用完
SUBSCRIPTION_EXPIRED: 订阅已过期
COMPANY_NOT_VERIFIED: 企业未认证
WPS_ALREADY_APPROVED: WPS已审批，无法修改
```

#### API版本控制
```
# 当前版本: v1
# 版本在URL中指定: /api/v1/
# 向后兼容性: 保持至少两个版本的兼容性
# 废弃通知: 提前3个月通知API废弃

# 版本升级策略
- 添加字段: 不影响现有版本
- 删除字段: 发布新版本
- 修改字段类型: 发布新版本
- 修改业务逻辑: 发布新版本
```

## 安全性设计

### 1. 认证安全

#### 密码安全策略
```python
from passlib.context import CryptContext
import secrets

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 密码要求
PASSWORD_MIN_LENGTH = 8
PASSWORD_REQUIRE_UPPERCASE = True
PASSWORD_REQUIRE_LOWERCASE = True
PASSWORD_REQUIRE_DIGIT = True
PASSWORD_REQUIRE_SPECIAL = True

def hash_password(password: str) -> str:
    """使用bcrypt加密密码"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)

def generate_secure_token(length: int = 32) -> str:
    """生成安全的随机token"""
    return secrets.token_urlsafe(length)
```

#### JWT Token安全
```python
from datetime import datetime, timedelta
from jose import JWTError, jwt

SECRET_KEY = "your-secret-key-here"  # 从环境变量读取
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

def create_access_token(data: dict) -> str:
    """创建访问令牌"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    """创建刷新令牌"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

#### 登录保护
```python
from fastapi import HTTPException
from datetime import datetime, timedelta
import redis

redis_client = redis.Redis(host='localhost', port=6379, db=0)

MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION = 15  # 分钟

async def check_login_attempts(email: str):
    """检查登录尝试次数"""
    key = f"login_attempts:{email}"
    attempts = redis_client.get(key)

    if attempts and int(attempts) >= MAX_LOGIN_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail=f"登录尝试次数过多，请{LOCKOUT_DURATION}分钟后再试"
        )

async def record_failed_login(email: str):
    """记录失败的登录尝试"""
    key = f"login_attempts:{email}"
    redis_client.incr(key)
    redis_client.expire(key, LOCKOUT_DURATION * 60)

async def clear_login_attempts(email: str):
    """清除登录尝试记录"""
    key = f"login_attempts:{email}"
    redis_client.delete(key)
```

### 2. 数据安全

#### 数据加密
```python
from cryptography.fernet import Fernet
import os

# 敏感数据加密
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
cipher_suite = Fernet(ENCRYPTION_KEY)

def encrypt_sensitive_data(data: str) -> str:
    """加密敏感数据"""
    return cipher_suite.encrypt(data.encode()).decode()

def decrypt_sensitive_data(encrypted_data: str) -> str:
    """解密敏感数据"""
    return cipher_suite.decrypt(encrypted_data.encode()).decode()
```

#### SQL注入防护
```python
from sqlalchemy import text

# ❌ 错误示例 - 容易受到SQL注入攻击
def get_user_unsafe(email: str):
    query = f"SELECT * FROM users WHERE email = '{email}'"
    return db.execute(query)

# ✅ 正确示例 - 使用参数化查询
def get_user_safe(email: str):
    query = text("SELECT * FROM users WHERE email = :email")
    return db.execute(query, {"email": email})

# ✅ 使用ORM（推荐）
def get_user_orm(email: str):
    return db.query(User).filter(User.email == email).first()
```

#### XSS防护
```python
from html import escape
from bleach import clean

def sanitize_html_input(content: str) -> str:
    """清理HTML输入，防止XSS攻击"""
    allowed_tags = ['p', 'br', 'strong', 'em', 'u']
    allowed_attributes = {}
    return clean(content, tags=allowed_tags, attributes=allowed_attributes, strip=True)

def escape_user_input(text: str) -> str:
    """转义用户输入"""
    return escape(text)
```

### 3. API安全

#### CORS配置
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourdomain.com",
        "https://admin.yourdomain.com"
    ],  # 生产环境只允许特定域名
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    max_age=3600,
)
```

#### 请求限流
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 使用示例
@app.post("/api/v1/auth/login")
@limiter.limit("5/minute")  # 每分钟最多5次请求
async def login(request: Request, credentials: LoginCredentials):
    pass

@app.get("/api/v1/wps")
@limiter.limit("100/minute")  # 普通API限制
async def get_wps_list(request: Request):
    pass
```

#### CSRF保护
```python
from fastapi_csrf_protect import CsrfProtect
from pydantic import BaseModel

class CsrfSettings(BaseModel):
    secret_key: str = "your-csrf-secret-key"
    cookie_samesite: str = "lax"
    cookie_secure: bool = True
    cookie_httponly: bool = True

@CsrfProtect.load_config
def get_csrf_config():
    return CsrfSettings()

# 使用示例
@app.post("/api/v1/wps")
async def create_wps(
    request: Request,
    data: WPSCreate,
    csrf_protect: CsrfProtect = Depends()
):
    await csrf_protect.validate_csrf(request)
    # 处理请求
```

### 4. 文件上传安全

```python
from fastapi import UploadFile, HTTPException
import magic
import os

ALLOWED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

async def validate_file_upload(file: UploadFile):
    """验证上传文件"""
    # 检查文件扩展名
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型: {file_ext}"
        )

    # 检查文件大小
    file.file.seek(0, 2)  # 移动到文件末尾
    file_size = file.file.tell()
    file.file.seek(0)  # 重置文件指针

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"文件大小超过限制 ({MAX_FILE_SIZE / 1024 / 1024}MB)"
        )

    # 验证文件MIME类型
    file_content = await file.read(1024)
    file.file.seek(0)
    mime_type = magic.from_buffer(file_content, mime=True)

    allowed_mimes = {
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }

    if mime_type not in allowed_mimes:
        raise HTTPException(
            status_code=400,
            detail="文件类型验证失败"
        )

    return True
```

### 5. 数据访问控制

```python
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

async def check_resource_ownership(
    resource_id: str,
    resource_type: str,
    current_user: User,
    db: Session
):
    """检查用户是否有权访问资源"""

    # 管理员可以访问所有资源
    if current_user.is_admin:
        return True

    # 检查个人资源所有权
    if resource_type == "wps":
        resource = db.query(WPSRecord).filter(WPSRecord.id == resource_id).first()
    elif resource_type == "pqr":
        resource = db.query(PQRRecord).filter(PQRRecord.id == resource_id).first()
    else:
        raise HTTPException(status_code=400, detail="未知的资源类型")

    if not resource:
        raise HTTPException(status_code=404, detail="资源不存在")

    # 检查是否是资源所有者
    if resource.user_id == current_user.id:
        return True

    # 检查企业权限
    if resource.company_id:
        employee = db.query(CompanyEmployee).filter(
            CompanyEmployee.company_id == resource.company_id,
            CompanyEmployee.user_id == current_user.id,
            CompanyEmployee.is_active == True
        ).first()

        if employee:
            # 检查员工权限
            permissions = employee.permissions or {}
            if permissions.get(f"{resource_type}_read", False):
                return True

    raise HTTPException(status_code=403, detail="无权访问此资源")
```

### 6. 审计日志

```python
from datetime import datetime
from fastapi import Request

async def log_audit_event(
    user_id: str,
    action: str,
    resource_type: str,
    resource_id: str,
    request: Request,
    changes: dict = None,
    db: Session = None
):
    """记录审计日志"""
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent"),
        changes=changes,
        created_at=datetime.utcnow()
    )
    db.add(audit_log)
    db.commit()

# 使用示例
@app.put("/api/v1/wps/{wps_id}")
async def update_wps(
    wps_id: str,
    data: WPSUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wps = db.query(WPSRecord).filter(WPSRecord.id == wps_id).first()
    old_data = wps.dict()

    # 更新WPS
    for key, value in data.dict(exclude_unset=True).items():
        setattr(wps, key, value)

    db.commit()

    # 记录审计日志
    await log_audit_event(
        user_id=current_user.id,
        action="update",
        resource_type="wps",
        resource_id=wps_id,
        request=request,
        changes={"old": old_data, "new": wps.dict()},
        db=db
    )

    return wps
```

---

## 性能优化策略

### 1. 数据库优化

#### 查询优化
```python
from sqlalchemy.orm import joinedload, selectinload

# ❌ N+1查询问题
def get_wps_with_user_bad():
    wps_list = db.query(WPSRecord).all()
    for wps in wps_list:
        user = wps.user  # 每次都会执行一次查询
        print(user.name)

# ✅ 使用预加载
def get_wps_with_user_good():
    wps_list = db.query(WPSRecord).options(
        joinedload(WPSRecord.user)
    ).all()
    for wps in wps_list:
        print(wps.user.name)  # 不会触发额外查询

# ✅ 批量查询
def get_multiple_wps(ids: list):
    return db.query(WPSRecord).filter(WPSRecord.id.in_(ids)).all()
```

#### 分页查询
```python
from fastapi import Query

@app.get("/api/v1/wps")
async def get_wps_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    # 计算偏移量
    offset = (page - 1) * page_size

    # 查询总数
    total = db.query(WPSRecord).count()

    # 分页查询
    items = db.query(WPSRecord)\
        .offset(offset)\
        .limit(page_size)\
        .all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }
```

#### 数据库连接池
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 配置连接池
engine = create_engine(
    DATABASE_URL,
    pool_size=20,          # 连接池大小
    max_overflow=10,       # 超过pool_size后最多创建的连接数
    pool_timeout=30,       # 获取连接的超时时间
    pool_recycle=3600,     # 连接回收时间（秒）
    pool_pre_ping=True,    # 使用前检查连接是否有效
    echo=False             # 生产环境关闭SQL日志
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

### 2. 缓存策略

#### Redis缓存
```python
import redis
import json
from functools import wraps
from typing import Optional

redis_client = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=True
)

def cache_result(expire: int = 300):
    """缓存装饰器"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 生成缓存键
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"

            # 尝试从缓存获取
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)

            # 执行函数
            result = await func(*args, **kwargs)

            # 存入缓存
            redis_client.setex(
                cache_key,
                expire,
                json.dumps(result, default=str)
            )

            return result
        return wrapper
    return decorator

# 使用示例
@cache_result(expire=600)  # 缓存10分钟
async def get_user_statistics(user_id: str):
    # 复杂的统计查询
    return db.query(...).all()
```

#### 会员信息缓存
```python
async def get_user_membership_cached(user_id: str) -> dict:
    """获取用户会员信息（带缓存）"""
    cache_key = f"user_membership:{user_id}"

    # 尝试从缓存获取
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    # 从数据库查询
    user = db.query(User).filter(User.id == user_id).first()
    membership_info = {
        "tier": user.membership_tier,
        "type": user.membership_type,
        "status": user.subscription_status,
        "limits": get_membership_limits(user.membership_tier)
    }

    # 存入缓存（1小时）
    redis_client.setex(cache_key, 3600, json.dumps(membership_info))

    return membership_info

async def invalidate_user_membership_cache(user_id: str):
    """清除用户会员信息缓存"""
    cache_key = f"user_membership:{user_id}"
    redis_client.delete(cache_key)
```

### 3. 异步任务处理

#### Celery配置
```python
from celery import Celery

celery_app = Celery(
    'weld_system',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/0'
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Asia/Shanghai',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30分钟超时
)

# 异步任务示例
@celery_app.task
def generate_report_async(user_id: str, report_type: str):
    """异步生成报表"""
    # 复杂的报表生成逻辑
    report_data = generate_complex_report(user_id, report_type)

    # 保存报表
    save_report_to_storage(report_data)

    # 发送通知
    send_notification(user_id, "报表生成完成")

    return {"status": "completed", "report_id": report_data.id}

# API端点
@app.post("/api/v1/reports/generate")
async def request_report_generation(
    report_type: str,
    current_user: User = Depends(get_current_user)
):
    # 提交异步任务
    task = generate_report_async.delay(current_user.id, report_type)

    return {
        "task_id": task.id,
        "status": "processing",
        "message": "报表正在生成中，完成后将通知您"
    }
```

### 4. 前端性能优化

#### API响应压缩
```python
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)
```

#### 分页和懒加载
```typescript
// React Query实现无限滚动
import { useInfiniteQuery } from '@tanstack/react-query';

function WPSList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['wps'],
    queryFn: ({ pageParam = 1 }) => fetchWPS(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  return (
    <div>
      {data?.pages.map((page) =>
        page.items.map((wps) => <WPSCard key={wps.id} data={wps} />)
      )}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>
          加载更多
        </button>
      )}
    </div>
  );
}
```

### 5. 静态资源优化

#### CDN配置
```nginx
# Nginx配置
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /static/ {
    alias /var/www/static/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 开发规范和最佳实践

### 1. 代码风格规范

#### Python代码规范（PEP 8）
```python
# 使用Black进行代码格式化
# pyproject.toml
[tool.black]
line-length = 100
target-version = ['py311']
include = '\.pyi?$'

# 使用isort进行导入排序
[tool.isort]
profile = "black"
line_length = 100
multi_line_output = 3

# 使用flake8进行代码检查
[flake8]
max-line-length = 100
extend-ignore = E203, W503
exclude = .git,__pycache__,venv
```

#### TypeScript代码规范
```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "react/react-in-jsx-scope": "off"
  }
}

// prettier.config.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
};
```

### 2. Git工作流规范

#### 分支管理策略
```
main          - 生产环境分支（受保护）
├── develop   - 开发环境分支
│   ├── feature/user-auth      - 功能分支
│   ├── feature/wps-management - 功能分支
│   ├── bugfix/login-error     - 修复分支
│   └── hotfix/security-patch  - 紧急修复分支
```

#### 提交信息规范
```bash
# 提交信息格式
<type>(<scope>): <subject>

<body>

<footer>

# 类型说明
feat:     新功能
fix:      修复bug
docs:     文档更新
style:    代码格式调整
refactor: 重构代码
test:     测试相关
chore:    构建/工具链更新

# 示例
feat(auth): 添加JWT认证功能

- 实现用户登录接口
- 添加Token刷新机制
- 增加登录失败限制

Closes #123
```

#### Pre-commit钩子
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black

  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort

  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
```

### 3. 项目结构最佳实践

#### 后端模块组织
```python
# app/services/base_service.py
from typing import Generic, TypeVar, Type, Optional, List
from sqlalchemy.orm import Session
from app.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseService(Generic[ModelType]):
    """基础服务类"""

    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db

    def get(self, id: str) -> Optional[ModelType]:
        """获取单个对象"""
        return self.db.query(self.model).filter(self.model.id == id).first()

    def get_multi(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """获取多个对象"""
        return self.db.query(self.model).offset(skip).limit(limit).all()

    def create(self, obj_in: dict) -> ModelType:
        """创建对象"""
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, id: str, obj_in: dict) -> Optional[ModelType]:
        """更新对象"""
        db_obj = self.get(id)
        if db_obj:
            for key, value in obj_in.items():
                setattr(db_obj, key, value)
            self.db.commit()
            self.db.refresh(db_obj)
        return db_obj

    def delete(self, id: str) -> bool:
        """删除对象"""
        db_obj = self.get(id)
        if db_obj:
            self.db.delete(db_obj)
            self.db.commit()
            return True
        return False

# app/services/wps_service.py
from app.services.base_service import BaseService
from app.models.wps import WPSRecord

class WPSService(BaseService[WPSRecord]):
    """WPS服务类"""

    def get_by_user(self, user_id: str, skip: int = 0, limit: int = 100):
        """获取用户的WPS记录"""
        return self.db.query(self.model)\
            .filter(self.model.user_id == user_id)\
            .offset(skip)\
            .limit(limit)\
            .all()

    def approve_wps(self, wps_id: str, approver_id: str):
        """审批WPS"""
        wps = self.get(wps_id)
        if wps:
            wps.status = 'approved'
            wps.approved_by = approver_id
            wps.approved_at = datetime.utcnow()
            self.db.commit()
            return wps
        return None
```

#### 前端组件组织
```typescript
// src/components/WPS/WPSCard.tsx
import React from 'react';
import { Card, Tag, Button } from 'antd';
import { WPS } from '@/types/wps';

interface WPSCardProps {
  data: WPS;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const WPSCard: React.FC<WPSCardProps> = ({ data, onEdit, onDelete }) => {
  return (
    <Card
      title={data.title}
      extra={<Tag color={getStatusColor(data.status)}>{data.status}</Tag>}
      actions={[
        <Button key="edit" onClick={() => onEdit?.(data.id)}>编辑</Button>,
        <Button key="delete" danger onClick={() => onDelete?.(data.id)}>删除</Button>,
      ]}
    >
      <p>WPS编号: {data.wps_number}</p>
      <p>版本: {data.version}</p>
      <p>基材: {data.base_material}</p>
    </Card>
  );
};

// src/hooks/useWPS.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wpsApi } from '@/services/wps';

export const useWPSList = (page: number = 1, pageSize: number = 20) => {
  return useQuery({
    queryKey: ['wps', page, pageSize],
    queryFn: () => wpsApi.getList(page, pageSize),
  });
};

export const useCreateWPS = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wpsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wps'] });
    },
  });
};
```

### 4. 错误处理规范

#### 后端错误处理
```python
# app/core/exceptions.py
from fastapi import HTTPException, status

class WeldSystemException(Exception):
    """基础异常类"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class ResourceNotFoundException(WeldSystemException):
    """资源不存在异常"""
    def __init__(self, resource_type: str, resource_id: str):
        message = f"{resource_type} with id {resource_id} not found"
        super().__init__(message, status_code=404)

class PermissionDeniedException(WeldSystemException):
    """权限不足异常"""
    def __init__(self, message: str = "Permission denied"):
        super().__init__(message, status_code=403)

class MembershipLimitException(WeldSystemException):
    """会员限制异常"""
    def __init__(self, resource_type: str, limit: int):
        message = f"Membership limit reached for {resource_type} (max: {limit})"
        super().__init__(message, status_code=403)

# 全局异常处理器
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(WeldSystemException)
async def weld_system_exception_handler(request: Request, exc: WeldSystemException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.__class__.__name__,
                "message": exc.message
            }
        }
    )
```

#### 前端错误处理
```typescript
// src/utils/errorHandler.ts
import { message } from 'antd';
import { AxiosError } from 'axios';

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export const handleAPIError = (error: unknown) => {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data?.error as APIError;

    if (apiError) {
      // 显示错误消息
      message.error(apiError.message);

      // 处理验证错误
      if (apiError.details) {
        return apiError.details;
      }
    } else {
      message.error('网络错误，请稍后重试');
    }
  } else {
    message.error('未知错误');
  }

  return null;
};

// 使用示例
const handleSubmit = async (values: WPSFormData) => {
  try {
    await createWPS(values);
    message.success('创建成功');
  } catch (error) {
    const validationErrors = handleAPIError(error);
    if (validationErrors) {
      form.setFields(
        Object.entries(validationErrors).map(([name, errors]) => ({
          name,
          errors,
        }))
      );
    }
  }
};
```

---

## 测试策略

### 1. 后端测试

#### 单元测试
```python
# tests/test_services/test_wps_service.py
import pytest
from app.services.wps_service import WPSService
from app.models.wps import WPSRecord

@pytest.fixture
def wps_service(db_session):
    return WPSService(WPSRecord, db_session)

@pytest.fixture
def sample_wps_data():
    return {
        "wps_number": "WPS-001",
        "title": "Test WPS",
        "base_material": "Q235",
        "welding_process": "SMAW",
        "user_id": "test-user-id"
    }

def test_create_wps(wps_service, sample_wps_data):
    """测试创建WPS"""
    wps = wps_service.create(sample_wps_data)

    assert wps.id is not None
    assert wps.wps_number == "WPS-001"
    assert wps.title == "Test WPS"

def test_get_wps(wps_service, sample_wps_data):
    """测试获取WPS"""
    created_wps = wps_service.create(sample_wps_data)
    retrieved_wps = wps_service.get(created_wps.id)

    assert retrieved_wps is not None
    assert retrieved_wps.id == created_wps.id

def test_update_wps(wps_service, sample_wps_data):
    """测试更新WPS"""
    wps = wps_service.create(sample_wps_data)
    updated_wps = wps_service.update(wps.id, {"title": "Updated Title"})

    assert updated_wps.title == "Updated Title"

def test_delete_wps(wps_service, sample_wps_data):
    """测试删除WPS"""
    wps = wps_service.create(sample_wps_data)
    result = wps_service.delete(wps.id)

    assert result is True
    assert wps_service.get(wps.id) is None
```

#### API测试
```python
# tests/test_api/test_wps_api.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_wps_api(auth_headers):
    """测试创建WPS API"""
    response = client.post(
        "/api/v1/wps",
        json={
            "wps_number": "WPS-001",
            "title": "Test WPS",
            "base_material": "Q235"
        },
        headers=auth_headers
    )

    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["wps_number"] == "WPS-001"

def test_get_wps_list_api(auth_headers):
    """测试获取WPS列表API"""
    response = client.get("/api/v1/wps", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert "items" in data["data"]
    assert "total" in data["data"]

def test_unauthorized_access():
    """测试未授权访问"""
    response = client.get("/api/v1/wps")
    assert response.status_code == 401
```

#### 集成测试
```python
# tests/test_integration/test_wps_workflow.py
def test_complete_wps_workflow(client, db_session):
    """测试完整的WPS工作流"""
    # 1. 注册用户
    register_response = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "Test123!@#",
        "username": "testuser"
    })
    assert register_response.status_code == 201

    # 2. 登录
    login_response = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "Test123!@#"
    })
    assert login_response.status_code == 200
    token = login_response.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. 创建WPS
    create_response = client.post("/api/v1/wps", json={
        "wps_number": "WPS-001",
        "title": "Test WPS"
    }, headers=headers)
    assert create_response.status_code == 201
    wps_id = create_response.json()["data"]["id"]

    # 4. 获取WPS
    get_response = client.get(f"/api/v1/wps/{wps_id}", headers=headers)
    assert get_response.status_code == 200

    # 5. 更新WPS
    update_response = client.put(f"/api/v1/wps/{wps_id}", json={
        "title": "Updated WPS"
    }, headers=headers)
    assert update_response.status_code == 200

    # 6. 删除WPS
    delete_response = client.delete(f"/api/v1/wps/{wps_id}", headers=headers)
    assert delete_response.status_code == 204
```

### 2. 前端测试

#### 组件测试
```typescript
// src/components/WPS/__tests__/WPSCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { WPSCard } from '../WPSCard';

const mockWPS = {
  id: '1',
  wps_number: 'WPS-001',
  title: 'Test WPS',
  version: '1.0',
  status: 'draft',
  base_material: 'Q235',
};

describe('WPSCard', () => {
  it('renders WPS information correctly', () => {
    render(<WPSCard data={mockWPS} />);

    expect(screen.getByText('Test WPS')).toBeInTheDocument();
    expect(screen.getByText('WPS编号: WPS-001')).toBeInTheDocument();
    expect(screen.getByText('版本: 1.0')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<WPSCard data={mockWPS} onEdit={onEdit} />);

    fireEvent.click(screen.getByText('编辑'));
    expect(onEdit).toHaveBeenCalledWith('1');
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = jest.fn();
    render(<WPSCard data={mockWPS} onDelete={onDelete} />);

    fireEvent.click(screen.getByText('删除'));
    expect(onDelete).toHaveBeenCalledWith('1');
  });
});
```

#### Hook测试
```typescript
// src/hooks/__tests__/useWPS.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWPSList } from '../useWPS';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useWPSList', () => {
  it('fetches WPS list successfully', async () => {
    const { result } = renderHook(() => useWPSList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.items).toBeInstanceOf(Array);
  });
});
```

### 3. 测试覆盖率

```bash
# 后端测试覆盖率
pytest --cov=app --cov-report=html --cov-report=term

# 前端测试覆盖率
npm run test -- --coverage

# 覆盖率目标
# - 单元测试覆盖率: >= 80%
# - 集成测试覆盖率: >= 60%
# - 关键业务逻辑: >= 90%
```

## 部署流程

### 1. 开发环境部署

#### 本地开发环境设置
```bash
# 1. 克隆项目
git clone https://github.com/yourusername/weld-system.git
cd weld-system

# 2. 复制环境变量文件
cp .env.example .env

# 3. 启动Docker服务
docker-compose -f docker-compose.dev.yml up -d

# 4. 初始化数据库
docker-compose exec backend alembic upgrade head

# 5. 创建管理员账号
docker-compose exec backend python scripts/create_admin.py

# 6. 访问应用
# 用户门户: http://localhost:3000
# 管理员门户: http://localhost:3001
# API文档: http://localhost:8000/docs
```

#### 开发环境Docker配置
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    volumes:
      - ./backend:/app
    environment:
      - DEBUG=True
      - RELOAD=True
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

  admin-frontend:
    build:
      context: ./admin-frontend
      dockerfile: Dockerfile.dev
    volumes:
      - ./admin-frontend:/app
      - /app/node_modules
    command: npm run dev
```

### 2. 生产环境部署

#### 服务器要求
```
最低配置:
- CPU: 2核
- 内存: 4GB
- 硬盘: 50GB SSD
- 带宽: 5Mbps

推荐配置:
- CPU: 4核
- 内存: 8GB
- 硬盘: 100GB SSD
- 带宽: 10Mbps

操作系统: Ubuntu 22.04 LTS
```

#### 部署步骤

**1. 服务器初始化**
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 安装Nginx
sudo apt install nginx -y

# 安装SSL证书工具
sudo apt install certbot python3-certbot-nginx -y
```

**2. 配置SSL证书**
```bash
# 获取SSL证书
sudo certbot --nginx -d yourdomain.com -d admin.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

**3. Nginx配置**
```nginx
# /etc/nginx/sites-available/weld-system
# 用户门户
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 前端
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 静态文件
    location /static/ {
        alias /var/www/weld-system/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# 管理员门户
server {
    listen 443 ssl http2;
    server_name admin.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**4. 部署应用**
```bash
# 克隆代码
git clone https://github.com/yourusername/weld-system.git
cd weld-system

# 配置环境变量
cp .env.example .env
nano .env  # 编辑生产环境配置

# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 初始化数据库
docker-compose exec backend alembic upgrade head

# 创建管理员
docker-compose exec backend python scripts/create_admin.py

# 重启Nginx
sudo systemctl restart nginx
```

**5. 部署脚本**
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "开始部署..."

# 拉取最新代码
git pull origin main

# 备份数据库
docker-compose exec -T db pg_dump -U weld_user weld_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 停止服务
docker-compose down

# 构建新镜像
docker-compose build

# 启动服务
docker-compose up -d

# 运行数据库迁移
docker-compose exec -T backend alembic upgrade head

# 清理旧镜像
docker image prune -f

echo "部署完成！"
```

### 3. CI/CD配置

#### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt

      - name: Run tests
        run: |
          cd backend
          pytest --cov=app

      - name: Run linting
        run: |
          cd backend
          flake8 app

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/weld-system
            ./scripts/deploy.sh
```

### 4. 数据库备份策略

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/var/backups/weld-system"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
docker-compose exec -T db pg_dump -U weld_user weld_db > $BACKUP_FILE

# 压缩备份
gzip $BACKUP_FILE

# 删除30天前的备份
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "备份完成: $BACKUP_FILE.gz"

# 上传到云存储（可选）
# aws s3 cp $BACKUP_FILE.gz s3://your-bucket/backups/
```

**设置定时备份**
```bash
# 添加到crontab
crontab -e

# 每天凌晨2点备份
0 2 * * * /opt/weld-system/scripts/backup.sh
```

---

## 监控和日志

### 1. 应用监控

#### Prometheus配置
```yaml
# config/monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'weld-system-backend'
    static_configs:
      - targets: ['backend:8000']

  - job_name: 'postgres'
    static_configs:
      - targets: ['db:5432']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
```

#### 应用指标收集
```python
# app/core/metrics.py
from prometheus_client import Counter, Histogram, Gauge
import time

# 请求计数器
request_count = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

# 请求延迟
request_latency = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency',
    ['method', 'endpoint']
)

# 活跃用户数
active_users = Gauge(
    'active_users_total',
    'Number of active users'
)

# 中间件
from fastapi import Request
import time

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()

    response = await call_next(request)

    # 记录指标
    duration = time.time() - start_time
    request_count.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()

    request_latency.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(duration)

    return response
```

### 2. 日志管理

#### 日志配置
```python
# app/core/logging.py
import logging
from logging.handlers import RotatingFileHandler
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    """JSON格式日志"""
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }

        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data)

# 配置日志
def setup_logging():
    logger = logging.getLogger("weld_system")
    logger.setLevel(logging.INFO)

    # 文件处理器
    file_handler = RotatingFileHandler(
        "logs/app.log",
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    file_handler.setFormatter(JSONFormatter())

    # 控制台处理器
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    ))

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    return logger

logger = setup_logging()
```

#### 日志使用示例
```python
from app.core.logging import logger

@app.post("/api/v1/wps")
async def create_wps(data: WPSCreate, current_user: User = Depends(get_current_user)):
    logger.info(
        f"User {current_user.id} creating WPS",
        extra={
            "user_id": current_user.id,
            "wps_number": data.wps_number,
            "action": "create_wps"
        }
    )

    try:
        wps = wps_service.create(data.dict())
        logger.info(f"WPS {wps.id} created successfully")
        return wps
    except Exception as e:
        logger.error(
            f"Failed to create WPS: {str(e)}",
            exc_info=True,
            extra={"user_id": current_user.id}
        )
        raise
```

### 3. 错误追踪

#### Sentry集成
```python
# app/core/sentry.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

def init_sentry():
    sentry_sdk.init(
        dsn="your-sentry-dsn",
        integrations=[
            FastApiIntegration(),
            SqlalchemyIntegration(),
        ],
        traces_sample_rate=0.1,
        environment="production",
        release="weld-system@1.0.0"
    )

# 在main.py中初始化
from app.core.sentry import init_sentry

if not DEBUG:
    init_sentry()
```

### 4. 性能监控

#### 慢查询监控
```python
# app/core/database.py
from sqlalchemy import event
from sqlalchemy.engine import Engine
import time
import logging

logger = logging.getLogger("sqlalchemy.performance")

@event.listens_for(Engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    conn.info.setdefault('query_start_time', []).append(time.time())

@event.listens_for(Engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total = time.time() - conn.info['query_start_time'].pop(-1)

    # 记录慢查询（超过1秒）
    if total > 1.0:
        logger.warning(
            f"Slow query detected: {total:.2f}s",
            extra={
                "query": statement,
                "duration": total
            }
        )
```

---

## 常见问题和解决方案

### 1. 数据库相关

**问题: 数据库连接池耗尽**
```
sqlalchemy.exc.TimeoutError: QueuePool limit of size 20 overflow 10 reached
```

解决方案:
```python
# 增加连接池大小
engine = create_engine(
    DATABASE_URL,
    pool_size=30,
    max_overflow=20
)

# 确保正确关闭连接
@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    response = Response("Internal server error", status_code=500)
    try:
        request.state.db = SessionLocal()
        response = await call_next(request)
    finally:
        request.state.db.close()
    return response
```

**问题: 数据库迁移冲突**
```
alembic.util.exc.CommandError: Multiple head revisions are present
```

解决方案:
```bash
# 合并迁移分支
alembic merge heads -m "merge migrations"

# 应用迁移
alembic upgrade head
```

### 2. 性能问题

**问题: API响应缓慢**

排查步骤:
```bash
# 1. 检查数据库慢查询
docker-compose exec db psql -U weld_user -d weld_db -c "
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;"

# 2. 检查Redis连接
docker-compose exec redis redis-cli ping

# 3. 查看应用日志
docker-compose logs -f backend | grep "Slow query"

# 4. 检查系统资源
docker stats
```

解决方案:
- 添加数据库索引
- 使用缓存
- 优化查询（使用预加载）
- 增加服务器资源

### 3. 部署问题

**问题: Docker容器无法启动**
```
Error: Cannot start service backend: driver failed programming external connectivity
```

解决方案:
```bash
# 检查端口占用
sudo lsof -i :8000

# 停止占用端口的进程
sudo kill -9 <PID>

# 或修改docker-compose.yml中的端口映射
ports:
  - "8001:8000"  # 使用不同的主机端口
```

**问题: SSL证书过期**

解决方案:
```bash
# 手动续期
sudo certbot renew

# 重启Nginx
sudo systemctl restart nginx

# 设置自动续期
sudo crontab -e
# 添加: 0 0 1 * * certbot renew --quiet
```

### 4. 会员系统问题

**问题: 会员限制检查失败**

解决方案:
```python
async def check_membership_limit(
    user_id: str,
    resource_type: str,
    db: Session
) -> bool:
    """检查会员限制"""
    # 获取用户会员信息（带缓存）
    membership = await get_user_membership_cached(user_id)

    # 获取限制
    limits = MEMBERSHIP_LIMITS[membership['tier']]
    max_count = limits.get(resource_type, 0)

    # 查询当前数量
    if resource_type == 'wps':
        current_count = db.query(WPSRecord).filter(
            WPSRecord.user_id == user_id
        ).count()

    if current_count >= max_count:
        raise MembershipLimitException(resource_type, max_count)

    return True
```

### 5. 前端问题

**问题: Token过期导致请求失败**

解决方案:
```typescript
// src/utils/axios.ts
import axios from 'axios';
import { refreshToken } from '@/services/auth';

const api = axios.create({
  baseURL: '/api/v1',
});

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token过期
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshToken();
        localStorage.setItem('access_token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // 刷新失败，跳转到登录页
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 开发路线图

### 第一阶段 - MVP (1-2个月)
- [x] 项目架构设计
- [ ] 用户认证系统
- [ ] 基础会员体系
- [ ] WPS/PQR基础功能
- [ ] 用户门户前端
- [ ] 基础API开发

### 第二阶段 - 核心功能 (2-3个月)
- [ ] 企业会员功能
- [ ] 员工管理系统
- [ ] 焊材管理
- [ ] 焊工管理
- [ ] 支付集成
- [ ] 管理员门户

### 第三阶段 - 扩展功能 (3-4个月)
- [ ] 设备管理
- [ ] 生产管理
- [ ] 质量管理
- [ ] 报表统计
- [ ] 数据导出功能
- [ ] 移动端适配

### 第四阶段 - 高级功能 (后期)
- [ ] 硬件设备集成
- [ ] 实时参数监控
- [ ] 图纸自动生成
- [ ] AI智能推荐
- [ ] 高级数据分析

---

## 附录

### A. 会员等级限制配置

```python
# app/core/membership.py
MEMBERSHIP_LIMITS = {
    "free": {
        "wps": 10,
        "pqr": 10,
        "ppqr": 0,
        "materials": 0,
        "welders": 0,
        "equipment": 0,
        "storage_mb": 100,
    },
    "pro": {
        "wps": 30,
        "pqr": 30,
        "ppqr": 30,
        "materials": 50,
        "welders": 20,
        "equipment": 0,
        "storage_mb": 500,
    },
    "advanced": {
        "wps": 50,
        "pqr": 50,
        "ppqr": 50,
        "materials": 100,
        "welders": 50,
        "equipment": 20,
        "storage_mb": 1024,
    },
    "flagship": {
        "wps": 100,
        "pqr": 100,
        "ppqr": 100,
        "materials": 200,
        "welders": 100,
        "equipment": 50,
        "storage_mb": 2048,
    },
    "enterprise": {
        "wps": 200,
        "pqr": 200,
        "ppqr": 200,
        "materials": 500,
        "welders": 200,
        "equipment": 100,
        "storage_mb": 5120,
        "factories": 1,
        "employees": 10,
    },
    "enterprise_pro": {
        "wps": 200,
        "pqr": 200,
        "ppqr": 200,
        "materials": 1000,
        "welders": 500,
        "equipment": 200,
        "storage_mb": 10240,
        "factories": 3,
        "employees": 20,
    },
    "enterprise_pro_max": {
        "wps": 200,
        "pqr": 200,
        "ppqr": 200,
        "materials": -1,  # 无限制
        "welders": -1,
        "equipment": -1,
        "storage_mb": 20480,
        "factories": 5,
        "employees": 50,
    },
}
```

### B. API错误码参考

```python
ERROR_CODES = {
    # 认证相关 (1xxx)
    "AUTH_001": "用户名或密码错误",
    "AUTH_002": "Token已过期",
    "AUTH_003": "Token无效",
    "AUTH_004": "邮箱未验证",
    "AUTH_005": "账号已被禁用",

    # 权限相关 (2xxx)
    "PERM_001": "权限不足",
    "PERM_002": "需要更高的会员等级",
    "PERM_003": "资源访问被拒绝",

    # 资源相关 (3xxx)
    "RES_001": "资源不存在",
    "RES_002": "资源已存在",
    "RES_003": "资源已被删除",

    # 会员相关 (4xxx)
    "MEM_001": "已达到会员限制",
    "MEM_002": "订阅已过期",
    "MEM_003": "支付失败",

    # 验证相关 (5xxx)
    "VAL_001": "参数验证失败",
    "VAL_002": "文件格式不支持",
    "VAL_003": "文件大小超限",
}
```

### C. 环境变量完整列表

```env
# 应用配置
APP_NAME=焊接工艺管理系统
APP_VERSION=1.0.0
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=yourdomain.com,admin.yourdomain.com

# 数据库配置
DATABASE_URL=postgresql://weld_user:weld_pass@db:5432/weld_db
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10

# Redis配置
REDIS_URL=redis://redis:6379/0
REDIS_PASSWORD=

# JWT配置
JWT_SECRET_KEY=your-jwt-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com

# 支付配置
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 文件存储
UPLOAD_DIR=/var/www/uploads
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=.pdf,.jpg,.jpeg,.png,.doc,.docx

# 监控配置
SENTRY_DSN=https://...@sentry.io/...
PROMETHEUS_ENABLED=True

# 日志配置
LOG_LEVEL=INFO
LOG_FILE=/var/log/weld-system/app.log
```

---

*文档最后更新: 2025-10-15*
*版本: 2.0*
*维护者: 开发团队*