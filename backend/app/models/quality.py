"""
Quality models for the welding system backend.
质量管理数据模型 - 基于现有数据库结构
"""
from datetime import datetime, date
from typing import Optional

from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, Date, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class InspectionType(str, enum.Enum):
    """检验类型"""
    VISUAL = "visual"  # 目视检验
    DIMENSIONAL = "dimensional"  # 尺寸检验
    RADIOGRAPHIC = "radiographic"  # 射线检验(RT)
    ULTRASONIC = "ultrasonic"  # 超声检验(UT)
    MAGNETIC = "magnetic"  # 磁粉检验(MT)
    PENETRANT = "penetrant"  # 渗透检验(PT)
    HARDNESS = "hardness"  # 硬度测试
    TENSILE = "tensile"  # 拉伸测试
    BEND = "bend"  # 弯曲测试
    IMPACT = "impact"  # 冲击测试
    OTHER = "other"  # 其他


class InspectionResult(str, enum.Enum):
    """检验结果"""
    PASS = "pass"  # 合格
    FAIL = "fail"  # 不合格
    CONDITIONAL = "conditional"  # 有条件合格
    PENDING = "pending"  # 待定
    RETEST = "retest"  # 需要复检


class DefectSeverity(str, enum.Enum):
    """缺陷严重程度"""
    MINOR = "minor"  # 轻微
    MODERATE = "moderate"  # 中等
    MAJOR = "major"  # 严重
    CRITICAL = "critical"  # 致命


class WorkspaceType(str, enum.Enum):
    """工作区类型"""
    PERSONAL = "personal"  # 个人工作区
    ENTERPRISE = "enterprise"  # 企业工作区


class AccessLevel(str, enum.Enum):
    """数据访问级别"""
    PRIVATE = "private"  # 仅创建者可见
    FACTORY = "factory"  # 同工厂成员可见
    COMPANY = "company"  # 全公司成员可见
    PUBLIC = "public"  # 公开


class QualityInspection(Base):
    """质量检验模型 - 基于现有数据库结构"""

    __tablename__ = "quality_inspections"

    # 主键
    id = Column(Integer, primary_key=True, index=True)

    # ==================== 数据隔离核心字段 ====================
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, comment="创建用户ID")
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True, comment="企业ID")
    factory_id = Column(Integer, ForeignKey("factories.id", ondelete="SET NULL"), nullable=True, index=True, comment="工厂ID")

    # ==================== 基本信息 ====================
    inspection_number = Column(String(100), nullable=False, unique=True, index=True, comment="检验编号")
    inspection_result = Column(String(20), comment="检验结果")

    # ==================== 关联信息 ====================
    production_task_id = Column(Integer, ForeignKey("production_tasks.id"), comment="生产任务ID")
    inspector_id = Column(Integer, ForeignKey("users.id"), comment="检验员ID")

    # ==================== 时间信息 ====================
    inspection_date = Column(Date, nullable=True, comment="检验日期")

    # ==================== 缺陷详细计数 ====================
    crack_count = Column(Integer, default=0, comment="裂纹数量")
    porosity_count = Column(Integer, default=0, comment="气孔数量")
    inclusion_count = Column(Integer, default=0, comment="夹渣数量")
    undercut_count = Column(Integer, default=0, comment="咬边数量")
    incomplete_penetration_count = Column(Integer, default=0, comment="未焊透数量")
    incomplete_fusion_count = Column(Integer, default=0, comment="未熔合数量")
    other_defect_count = Column(Integer, default=0, comment="其他缺陷数量")
    other_defect_description = Column(Text, comment="其他缺陷描述")

    # ==================== 处理措施 ====================
    corrective_action_required = Column(Boolean, default=False, comment="是否需要纠正措施")
    repair_required = Column(Boolean, default=False, comment="是否需要修复")
    repair_description = Column(Text, comment="修复描述")

    # ==================== 复检信息 ====================
    reinspection_required = Column(Boolean, default=False, comment="是否需要复检")
    reinspection_date = Column(Date, comment="复检日期")
    reinspection_result = Column(String(50), comment="复检结果")
    reinspection_inspector_id = Column(Integer, ForeignKey("users.id"), comment="复检员ID")
    reinspection_notes = Column(Text, comment="复检备注")

    # ==================== 环境条件 ====================
    ambient_temperature = Column(Float, comment="环境温度(°C)")
    weather_conditions = Column(String(100), comment="天气条件")

    # ==================== 附加信息 ====================
    notes = Column(Text, comment="备注")
    photos = Column(Text, comment="照片(JSON)")
    reports = Column(Text, comment="报告(JSON)")
    tags = Column(String(500), comment="标签")
    defects = Column(Text, comment="缺陷信息(JSON)")

    # ==================== 状态信息 ====================
    status = Column(String(20), comment="状态")

    # ==================== 审计字段 ====================
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False, comment="更新时间")

    # 添加一些模型中需要但数据库表中没有的虚拟字段（使用property）
    @property
    def user_id(self):
        """为了兼容性，映射到owner_id"""
        return self.owner_id

    @property
    def workspace_type(self):
        """根据company_id判断工作区类型"""
        return "enterprise" if self.company_id else "personal"

    @property
    def result(self):
        """为了兼容性，映射到inspection_result"""
        return self.inspection_result

    @result.setter
    def result(self, value):
        """设置result值"""
        self.inspection_result = value

    @property
    def is_active(self):
        """默认为True，因为数据库中没有这个字段"""
        return True

    @property
    def inspection_type(self):
        """默认检验类型"""
        return "visual"

    @inspection_type.setter
    def inspection_type(self, value):
        """设置检验类型（虚拟字段）"""
        pass

    @property
    def inspector_name(self):
        """检验员姓名（虚拟字段，需要关联查询）"""
        return None

    @inspector_name.setter
    def inspector_name(self, value):
        """设置检验员姓名（虚拟字段）"""
        pass

    @property
    def welder_name(self):
        """焊工姓名（虚拟字段，需要关联查询）"""
        return None

    @welder_name.setter
    def welder_name(self, value):
        """设置焊工姓名（虚拟字段）"""
        pass

    @property
    def joint_number(self):
        """焊缝编号（虚拟字段）"""
        return None

    @joint_number.setter
    def joint_number(self, value):
        """设置焊缝编号（虚拟字段）"""
        pass

    # 为了数据访问层兼容性，添加一些必需的字段
    @property
    def access_level(self):
        """访问级别"""
        return "company" if self.company_id else "private"

    @access_level.setter
    def access_level(self, value):
        """设置访问级别（虚拟字段）"""
        pass

    @property
    def is_shared(self):
        """是否共享"""
        return self.company_id is not None

    @is_shared.setter
    def is_shared(self, value):
        """设置共享状态（虚拟字段）"""
        pass

    @property
    def created_by(self):
        """创建人ID，映射到owner_id"""
        return self.owner_id

    @created_by.setter
    def created_by(self, value):
        """设置创建人ID"""
        self.owner_id = value

    @property
    def updated_by(self):
        """更新人ID"""
        return None

    @updated_by.setter
    def updated_by(self, value):
        """设置更新人ID（虚拟字段）"""
        pass

    def __repr__(self):
        return f"<QualityInspection(id={self.id}, number={self.inspection_number})>"


class NonconformanceRecord(Base):
    """不合格品记录模型"""

    __tablename__ = "nonconformance_records"

    # 主键
    id = Column(Integer, primary_key=True, index=True)

    # ==================== 数据隔离核心字段 ====================
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, comment="创建用户ID")
    workspace_type = Column(String(20), nullable=False, default="personal", index=True, comment="工作区类型")
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True, comment="企业ID")
    factory_id = Column(Integer, ForeignKey("factories.id", ondelete="SET NULL"), nullable=True, index=True, comment="工厂ID")

    # ==================== 基本信息 ====================
    ncr_number = Column(String(100), nullable=False, unique=True, index=True, comment="不合格品编号")
    ncr_title = Column(String(255), nullable=False, comment="标题")

    # ==================== 关联信息 ====================
    inspection_id = Column(Integer, ForeignKey("quality_inspections.id"), comment="检验ID")
    production_task_id = Column(Integer, ForeignKey("production_tasks.id"), comment="生产任务ID")
    wps_id = Column(Integer, ForeignKey("wps.id"), comment="WPS ID")

    # ==================== 时间信息 ====================
    occurrence_date = Column(Date, nullable=False, comment="发生日期")
    reported_date = Column(Date, comment="报告日期")

    # ==================== 不合格信息 ====================
    nonconformance_type = Column(String(100), comment="不合格类型")
    nonconformance_category = Column(String(100), comment="不合格类别")
    severity = Column(String(50), comment="严重程度")
    description = Column(Text, nullable=False, comment="描述")

    # ==================== 责任信息 ====================
    responsible_person_id = Column(Integer, ForeignKey("users.id"), comment="责任人ID")
    responsible_department = Column(String(100), comment="责任部门")

    # ==================== 原因分析 ====================
    root_cause = Column(Text, comment="根本原因")
    contributing_factors = Column(Text, comment="促成因素")

    # ==================== 处理措施 ====================
    disposition = Column(String(100), comment="处置方式")
    corrective_actions = Column(Text, comment="纠正措施")
    preventive_actions = Column(Text, comment="预防措施")
    action_plan = Column(Text, comment="行动计划(JSON)")

    # ==================== 处理结果 ====================
    resolution_status = Column(String(50), default="open", comment="解决状态")
    resolution_date = Column(Date, comment="解决日期")
    resolution_description = Column(Text, comment="解决描述")
    verification_result = Column(String(50), comment="验证结果")

    # ==================== 成本影响 ====================
    estimated_cost = Column(Float, comment="预计成本")
    actual_cost = Column(Float, comment="实际成本")
    currency = Column(String(10), default="CNY", comment="货币")

    # ==================== 附加信息 ====================
    notes = Column(Text, comment="备注")
    images = Column(Text, comment="图片(JSON)")
    attachments = Column(Text, comment="附件(JSON)")

    # ==================== 审批信息 ====================
    reviewed_by = Column(Integer, ForeignKey("users.id"), comment="审核人ID")
    reviewed_date = Column(Date, comment="审核日期")
    approved_by = Column(Integer, ForeignKey("users.id"), comment="批准人ID")
    approved_date = Column(Date, comment="批准日期")

    # ==================== 审计字段 ====================
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, comment="创建人ID")
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True, comment="更新人ID")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False, comment="更新时间")

    # ==================== 关系 ====================
    # inspection = relationship("QualityInspection")
    # production_task = relationship("ProductionTask")
    # responsible_person = relationship("User", foreign_keys=[responsible_person_id])

    def __repr__(self):
        return f"<NonconformanceRecord(id={self.id}, number={self.ncr_number})>"


class QualityMetric(Base):
    """质量指标模型"""

    __tablename__ = "quality_metrics"

    # 主键
    id = Column(Integer, primary_key=True, index=True)

    # ==================== 数据隔离核心字段 ====================
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, comment="创建用户ID")
    workspace_type = Column(String(20), nullable=False, default="personal", index=True, comment="工作区类型")
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True, comment="企业ID")
    factory_id = Column(Integer, ForeignKey("factories.id", ondelete="SET NULL"), nullable=True, index=True, comment="工厂ID")

    # ==================== 指标信息 ====================
    metric_name = Column(String(255), nullable=False, comment="指标名称")
    metric_type = Column(String(100), comment="指标类型")
    metric_category = Column(String(100), comment="指标类别")

    # ==================== 时间信息 ====================
    period_start = Column(Date, nullable=False, comment="周期开始")
    period_end = Column(Date, nullable=False, comment="周期结束")

    # ==================== 指标值 ====================
    target_value = Column(Float, comment="目标值")
    actual_value = Column(Float, comment="实际值")
    unit = Column(String(50), comment="单位")
    achievement_rate = Column(Float, comment="达成率(%)")

    # ==================== 统计信息 ====================
    total_inspections = Column(Integer, comment="总检验数")
    passed_inspections = Column(Integer, comment="合格数")
    failed_inspections = Column(Integer, comment="不合格数")
    pass_rate = Column(Float, comment="合格率(%)")

    # ==================== 附加信息 ====================
    description = Column(Text, comment="描述")
    notes = Column(Text, comment="备注")

    # ==================== 审计字段 ====================
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, comment="创建人ID")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False, comment="更新时间")

    def __repr__(self):
        return f"<QualityMetric(id={self.id}, name={self.metric_name})>"