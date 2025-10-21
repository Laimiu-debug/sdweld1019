"""
数据访问权限中间件
Data Access Middleware for workspace isolation and permission control
"""
from typing import Optional, Type, TypeVar, List, Any
from sqlalchemy.orm import Session, Query
from sqlalchemy import and_, or_
from fastapi import HTTPException, status

from app.models.user import User
from app.models.company import Company, CompanyEmployee, CompanyRole, Factory

# 泛型类型，用于数据模型
T = TypeVar('T')


class WorkspaceType:
    """工作区类型常量"""
    PERSONAL = "personal"
    ENTERPRISE = "enterprise"


class AccessLevel:
    """访问级别常量"""
    PRIVATE = "private"      # 仅创建者可见
    FACTORY = "factory"      # 同工厂成员可见
    COMPANY = "company"      # 全公司成员可见
    PUBLIC = "public"        # 公开（模板等）


class DataAccessAction:
    """数据访问操作类型"""
    VIEW = "view"
    CREATE = "create"
    EDIT = "edit"
    DELETE = "delete"
    SHARE = "share"


class WorkspaceContext:
    """工作区上下文"""
    
    def __init__(
        self,
        user_id: int,
        workspace_type: str = WorkspaceType.PERSONAL,
        company_id: Optional[int] = None,
        factory_id: Optional[int] = None
    ):
        self.user_id = user_id
        self.workspace_type = workspace_type
        self.company_id = company_id
        self.factory_id = factory_id
    
    def is_personal(self) -> bool:
        """是否为个人工作区"""
        return self.workspace_type == WorkspaceType.PERSONAL
    
    def is_enterprise(self) -> bool:
        """是否为企业工作区"""
        return self.workspace_type == WorkspaceType.ENTERPRISE
    
    def validate(self):
        """验证工作区上下文的有效性"""
        if self.is_enterprise() and not self.company_id:
            raise ValueError("企业工作区必须指定company_id")


class DataAccessMiddleware:
    """统一的数据访问权限检查中间件"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def check_access(
        self,
        user: User,
        resource: Any,
        action: str,
        workspace_context: Optional[WorkspaceContext] = None
    ) -> bool:
        """
        检查用户对资源的访问权限
        
        Args:
            user: 当前用户
            resource: 要访问的资源对象
            action: 操作类型 (view, create, edit, delete, share)
            workspace_context: 工作区上下文（可选）
            
        Returns:
            bool: 是否有权限
            
        Raises:
            HTTPException: 如果没有权限
        """
        # 检查资源是否有必需的数据隔离字段
        if not hasattr(resource, 'workspace_type'):
            raise ValueError(f"资源 {type(resource).__name__} 缺少 workspace_type 字段")
        
        # 1. 个人工作区数据：仅创建者可访问
        if resource.workspace_type == WorkspaceType.PERSONAL:
            return self._check_personal_access(user, resource, action)
        
        # 2. 企业工作区数据：检查企业成员身份和权限
        if resource.workspace_type == WorkspaceType.ENTERPRISE:
            return self._check_enterprise_access(user, resource, action)
        
        return False
    
    def _check_personal_access(
        self,
        user: User,
        resource: Any,
        action: str
    ) -> bool:
        """检查个人工作区数据访问权限"""
        # 个人工作区数据只有创建者可以访问
        if resource.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权访问此个人工作区数据"
            )
        return True
    
    def _check_enterprise_access(
        self,
        user: User,
        resource: Any,
        action: str
    ) -> bool:
        """检查企业工作区数据访问权限"""
        # 获取员工信息
        employee = self.db.query(CompanyEmployee).filter(
            CompanyEmployee.user_id == user.id,
            CompanyEmployee.company_id == resource.company_id,
            CompanyEmployee.status == "active"
        ).first()
        
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="您不是该企业的成员"
            )
        
        # 检查访问级别
        if resource.access_level == AccessLevel.PRIVATE:
            # 私有数据：仅创建者可访问
            if resource.user_id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="此数据为私有，仅创建者可访问"
                )
            return True
        
        elif resource.access_level == AccessLevel.FACTORY:
            # 工厂级别：同工厂成员可访问
            if not self._check_factory_access(employee, resource, action):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="无权访问此工厂数据"
                )
            return True
        
        elif resource.access_level == AccessLevel.COMPANY:
            # 公司级别：全公司成员可访问
            # 已经验证是公司成员，检查角色权限
            return self._check_role_permission(employee, resource, action)
        
        elif resource.access_level == AccessLevel.PUBLIC:
            # 公开数据：所有企业成员可查看
            if action == DataAccessAction.VIEW:
                return True
            # 其他操作需要检查权限
            return self._check_role_permission(employee, resource, action)
        
        return False
    
    def _check_factory_access(
        self,
        employee: CompanyEmployee,
        resource: Any,
        action: str
    ) -> bool:
        """检查工厂级别访问权限"""
        # 如果资源没有指定工厂，则按公司级别处理
        if not resource.factory_id:
            return self._check_role_permission(employee, resource, action)
        
        # 如果员工在同一工厂，直接检查角色权限
        if employee.factory_id == resource.factory_id:
            return self._check_role_permission(employee, resource, action)
        
        # 不同工厂，检查跨工厂访问权限
        # TODO: 实现跨工厂访问配置检查
        # 目前默认不允许跨工厂访问
        return False
    
    def _check_role_permission(
        self,
        employee: CompanyEmployee,
        resource: Any,
        action: str
    ) -> bool:
        """检查角色权限"""
        # 如果没有角色，使用默认权限
        if not employee.company_role_id:
            return self._check_default_permission(employee, resource, action)
        
        # 获取角色
        role = self.db.query(CompanyRole).filter(
            CompanyRole.id == employee.company_role_id,
            CompanyRole.is_active == True
        ).first()
        
        if not role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="角色不存在或已禁用"
            )
        
        # 检查模块权限
        resource_type = type(resource).__name__.lower()
        permissions = role.permissions or {}
        module_permissions = permissions.get(f"{resource_type}_management", {})
        
        # 映射操作到权限
        permission_key = self._map_action_to_permission(action)
        
        if not module_permissions.get(permission_key, False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"没有{resource_type}的{action}权限"
            )
        
        return True
    
    def _check_default_permission(
        self,
        employee: CompanyEmployee,
        resource: Any,
        action: str
    ) -> bool:
        """检查默认权限（无角色时）"""
        # 默认权限：可以查看和创建，但不能编辑和删除他人数据
        if action == DataAccessAction.VIEW:
            return True
        
        if action == DataAccessAction.CREATE:
            return True
        
        # 编辑和删除需要是创建者
        if action in [DataAccessAction.EDIT, DataAccessAction.DELETE]:
            return resource.user_id == employee.user_id
        
        return False
    
    def _map_action_to_permission(self, action: str) -> str:
        """映射操作到权限键"""
        mapping = {
            DataAccessAction.VIEW: "view",
            DataAccessAction.CREATE: "create",
            DataAccessAction.EDIT: "edit",
            DataAccessAction.DELETE: "delete",
            DataAccessAction.SHARE: "share"
        }
        return mapping.get(action, action)
    
    def apply_workspace_filter(
        self,
        query: Query,
        model: Type[T],
        user: User,
        workspace_context: WorkspaceContext
    ) -> Query:
        """
        应用工作区过滤器到查询
        
        Args:
            query: SQLAlchemy查询对象
            model: 数据模型类
            user: 当前用户
            workspace_context: 工作区上下文
            
        Returns:
            Query: 过滤后的查询对象
        """
        workspace_context.validate()
        
        # 个人工作区：只查询用户自己的数据
        if workspace_context.is_personal():
            query = query.filter(
                and_(
                    model.workspace_type == WorkspaceType.PERSONAL,
                    model.user_id == user.id
                )
            )
        
        # 企业工作区：查询企业内可访问的数据
        elif workspace_context.is_enterprise():
            # 获取员工信息
            employee = self.db.query(CompanyEmployee).filter(
                CompanyEmployee.user_id == user.id,
                CompanyEmployee.company_id == workspace_context.company_id,
                CompanyEmployee.status == "active"
            ).first()
            
            if not employee:
                # 不是企业成员，返回空结果
                query = query.filter(model.id == -1)
                return query
            
            # 构建企业数据过滤条件
            conditions = [
                model.workspace_type == WorkspaceType.ENTERPRISE,
                model.company_id == workspace_context.company_id
            ]
            
            # 根据访问级别添加过滤条件
            access_conditions = []
            
            # 1. 用户自己创建的数据（所有访问级别）
            access_conditions.append(model.user_id == user.id)
            
            # 2. 公开数据
            access_conditions.append(model.access_level == AccessLevel.PUBLIC)
            
            # 3. 公司级别数据
            access_conditions.append(model.access_level == AccessLevel.COMPANY)
            
            # 4. 工厂级别数据（如果在同一工厂）
            if employee.factory_id:
                access_conditions.append(
                    and_(
                        model.access_level == AccessLevel.FACTORY,
                        model.factory_id == employee.factory_id
                    )
                )
            
            # 组合所有条件
            query = query.filter(
                and_(
                    *conditions,
                    or_(*access_conditions)
                )
            )
        
        return query

