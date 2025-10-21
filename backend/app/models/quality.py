"""
Quality models for the welding system backend.
质量管理数据模型
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
    """质量检验模型"""
    
    __tablename__ = "quality_inspections"
    
    # 主键
    id = Column(Integer, primary_key=True, index=True)
    
    # ==================== 数据隔离核心字段 ====================
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, comment="创建用户ID")
    workspace_type = Column(String(20), nullable=False, default="personal", index=True, comment="工作区类型")
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True, comment="企业ID")
    factory_id = Column(Integer, ForeignKey("factories.id", ondelete="SET NULL"), nullable=True, index=True, comment="工厂ID")
    
    # 数据访问控制
    is_shared = Column(Boolean, default=False, comment="是否在企业内共享")
    access_level = Column(String(20), default="private", comment="访问级别")
    
    # ==================== 基本信息 ====================
    inspection_number = Column(String(100), nullable=False, unique=True, index=True, comment="检验编号")
    inspection_type = Column(String(50), nullable=False, comment="检验类型")
    inspection_standard = Column(String(255), comment="检验标准")
    inspection_procedure = Column(String(255), comment="检验程序")
    
    # ==================== 关联信息 ====================
    production_task_id = Column(Integer, ForeignKey("production_tasks.id"), comment="生产任务ID")
    wps_id = Column(Integer, ForeignKey("wps.id"), comment="WPS ID")
    pqr_id = Column(Integer, ForeignKey("pqr.id"), comment="PQR ID")
    
    # ==================== 时间信息 ====================
    inspection_date = Column(Date, nullable=False, comment="检验日期")
    inspection_time = Column(DateTime, comment="检验时间")
    report_date = Column(Date, comment="报告日期")
    
    # ==================== 检验人员 ====================
    inspector_id = Column(Integer, ForeignKey("users.id"), comment="检验员ID")
    inspector_name = Column(String(100), comment="检验员姓名")
    inspector_certification = Column(String(100), comment="检验员资质")
    witness_name = Column(String(100), comment="见证人")
    
    # ==================== 检验对象 ====================
    item_description = Column(Text, comment="检验对象描述")
    item_quantity = Column(Float, comment="检验数量")
    item_unit = Column(String(50), comment="单位")
    batch_number = Column(String(100), comment="批次号")
    serial_number = Column(String(100), comment="序列号")
    
    # ==================== 检验位置 ====================
    inspection_location = Column(String(255), comment="检验位置")
    weld_joint_number = Column(String(100), comment="焊缝编号")
    
    # ==================== 检验结果 ====================
    result = Column(String(50), default="pending", comment="检验结果")
    acceptance_criteria = Column(Text, comment="验收标准")
    actual_measurements = Column(Text, comment="实际测量值(JSON)")
    
    # ==================== 缺陷信息 ====================
    defects_found = Column(Integer, default=0, comment="发现缺陷数")
    defect_details = Column(Text, comment="缺陷详情(JSON)")
    defect_locations = Column(Text, comment="缺陷位置(JSON)")
    max_defect_severity = Column(String(50), comment="最大缺陷严重程度")
    
    # ==================== 处理措施 ====================
    corrective_actions = Column(Text, comment="纠正措施")
    rework_required = Column(Boolean, default=False, comment="是否需要返工")
    rework_description = Column(Text, comment="返工描述")
    follow_up_required = Column(Boolean, default=False, comment="是否需要跟进")
    follow_up_date = Column(Date, comment="跟进日期")
    
    # ==================== 环境条件 ====================
    temperature = Column(Float, comment="温度(°C)")
    humidity = Column(Float, comment="湿度(%)")
    environmental_conditions = Column(Text, comment="环境条件")
    
    # ==================== 设备信息 ====================
    equipment_used = Column(Text, comment="使用设备(JSON)")
    equipment_calibration_date = Column(Date, comment="设备校准日期")
    
    # ==================== 附加信息 ====================
    description = Column(Text, comment="描述")
    notes = Column(Text, comment="备注")
    recommendations = Column(Text, comment="建议")
    report_file_url = Column(String(500), comment="报告文件URL")
    images = Column(Text, comment="图片(JSON)")
    attachments = Column(Text, comment="附件(JSON)")
    
    # ==================== 审批信息 ====================
    reviewed_by = Column(Integer, ForeignKey("users.id"), comment="审核人ID")
    reviewed_date = Column(Date, comment="审核日期")
    approved_by = Column(Integer, ForeignKey("users.id"), comment="批准人ID")
    approved_date = Column(Date, comment="批准日期")
    
    # ==================== 状态信息 ====================
    status = Column(String(50), default="draft", comment="状态")
    is_active = Column(Boolean, default=True, comment="是否启用")
    
    # ==================== 审计字段 ====================
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, comment="创建人ID")
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True, comment="更新人ID")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False, comment="更新时间")
    
    # ==================== 关系 ====================
    # owner = relationship("User", foreign_keys=[user_id], back_populates="quality_inspections")
    # company = relationship("Company", back_populates="quality_inspections")
    # factory = relationship("Factory", back_populates="quality_inspections")
    # production_task = relationship("ProductionTask", back_populates="quality_inspections")
    # inspector = relationship("User", foreign_keys=[inspector_id])
    
    def __repr__(self):
        return f"<QualityInspection(id={self.id}, number={self.inspection_number})>"


class NonconformanceRecord(Base):
    """不合格品记录模型"""
    
    __tablename__ = "nonconformance_records"
    
    # 主键
    id = Column(Integer, primary_key=True, index=True)
    
    # ==================== 数据隔离核心字段 ====================
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, comment="创建用户ID")
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
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, comment="创建用户ID")
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

