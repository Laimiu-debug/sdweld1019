import api from './api'

// 企业员工管理相关API
export interface CompanyEmployee {
  id: string
  user_id: string
  employee_number: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'employee'
  company_role_id?: string  // 新增：企业角色ID
  company_role_name?: string  // 新增：企业角色名称
  status: 'active' | 'inactive'
  factory_id?: string
  factory_name?: string
  department_id?: string
  department_name?: string
  position?: string
  permissions: Record<string, boolean>
  data_access_scope: 'factory' | 'company'
  joined_at: string
  last_active_at?: string
  total_wps_created: number
  total_tasks_completed: number
}

// 简化的员工信息（用于部门和工厂列表）
export interface SimpleEmployee {
  id: string
  user_id: string
  employee_number: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'manager' | 'employee'
  position: string
  department?: string  // 仅在工厂列表中使用
  joined_at: string
}

export interface Factory {
  id: string
  name: string
  code: string
  address: string
  city: string
  contact_person: string
  contact_phone: string
  employee_count: number
  employees: SimpleEmployee[]  // 添加员工列表
  is_headquarters: boolean
  is_active: boolean
  created_at: string
}

export interface Department {
  id: string
  company_id: string
  factory_id?: string
  factory_name?: string
  department_code: string
  department_name: string
  description: string
  manager_id?: string
  manager_name?: string
  employee_count: number
  employees: SimpleEmployee[]  // 添加员工列表
  created_at: string
}

export interface EmployeeInvitation {
  id: string
  email: string
  invitation_code: string
  role: 'admin' | 'employee'
  factory_id?: string
  factory_name?: string
  department_id?: string
  department_name?: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  permissions: Record<string, boolean>
  expires_at: string
  accepted_at?: string
  created_at: string
}

export interface EmployeeQuota {
  current: number
  max: number
  percentage: number
  tier: string
}

export interface InviteEmployeeData {
  email: string
  role: 'admin' | 'employee'
  factory_id: string
  department_id?: string
  permissions: Record<string, boolean>
}

// 角色管理相关接口
export interface PermissionConfig {
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
}

export interface RolePermissions {
  wps_management?: PermissionConfig
  pqr_management?: PermissionConfig
  ppqr_management?: PermissionConfig
  equipment_management?: PermissionConfig
  materials_management?: PermissionConfig
  welders_management?: PermissionConfig
  employee_management?: PermissionConfig
  factory_management?: PermissionConfig
  department_management?: PermissionConfig
  role_management?: PermissionConfig
  reports_management?: PermissionConfig
}

export interface CompanyRole {
  id: string
  name: string
  code: string
  description: string
  permissions: RolePermissions
  data_access_scope: 'factory' | 'company'
  is_active: boolean
  is_system: boolean
  employee_count: number
  created_at: string
  updated_at: string
}

export interface CreateRoleData {
  name: string
  code?: string
  description?: string
  permissions: RolePermissions
  data_access_scope: 'factory' | 'company'
}

export interface UpdateRoleData {
  name?: string
  code?: string
  description?: string
  permissions?: RolePermissions
  data_access_scope?: 'factory' | 'company'
  is_active?: boolean
}

export interface CreateFactoryData {
  name: string
  code: string
  address: string
  city: string
  contact_person: string
  contact_phone: string
  is_headquarters?: boolean
}

export interface CreateDepartmentData {
  department_name: string
  department_code: string
  factory_id: string
  description?: string
}

// 企业员工管理API类
class EnterpriseService {
  private baseUrl = '/enterprise'

  // 获取企业用户列表 (调用真实API)
  async getEmployees(params?: {
    page?: number
    page_size?: number
    status?: string
    role?: string
    factory_id?: string
    search?: string
  }) {
    console.log('🔍 调用真实企业员工API', params)
    const response = await api.get(`${this.baseUrl}/employees`, {
      params: {
        page: params?.page || 1,
        page_size: params?.page_size || 20,
        search: params?.search,
        status: params?.status,
        role: params?.role,
      }
    })
    return response
  }

  // 获取员工详情 (调用真实API)
  async getEmployee(employeeId: string) {
    console.log('🔍 调用真实员工详情API', employeeId)
    const response = await api.get(`${this.baseUrl}/employees/${employeeId}`)
    return response
  }

  // 创建员工 (调用真实API)
  async createEmployee(data: {
    email: string
    name: string
    phone: string
    password: string
    employee_number: string
    position: string
    department: string
    factory_id: string
    role: string
    company_role_id?: string
    data_access_scope: string
  }) {
    console.log('🔍 调用创建员工API', data)
    const response = await api.post(`${this.baseUrl}/employees`, data)
    return response
  }

  // 邀请员工 (临时实现)
  async inviteEmployee(data: InviteEmployeeData) {
    // 临时返回成功响应，实际需要后端实现
    return {
      success: true,
      message: '邀请已发送',
      data: {
        id: Date.now().toString(),
        email: data.email,
        invitation_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  }

  // 更新员工信息 (调用真实API)
  async updateEmployee(employeeId: string, data: {
    role?: string
    company_role_id?: string
    permissions?: Record<string, boolean>
    data_access_scope?: string
    factory_id?: string
    department?: string
    position?: string
  }) {
    console.log('🔍 调用真实更新员工API', employeeId, data)
    const response = await api.put(`${this.baseUrl}/employees/${employeeId}`, data)
    return response
  }

  // 更新员工权限 (兼容旧方法名)
  async updateEmployeePermissions(employeeId: string, data: {
    role?: string
    company_role_id?: string
    permissions?: Record<string, boolean>
    data_access_scope?: string
    factory_id?: string
    department_id?: string
  }) {
    return this.updateEmployee(employeeId, {
      ...data,
      department: data.department_id
    })
  }

  // 停用员工 (调用真实API)
  async deactivateEmployee(employeeId: string, reason: string = '') {
    console.log('🔍 调用真实停用员工API', employeeId)
    const response = await api.post(`${this.baseUrl}/employees/${employeeId}/disable`, {
      reason
    })
    return response
  }

  // 激活员工 (调用真实API)
  async activateEmployee(employeeId: string) {
    console.log('🔍 调用真实激活员工API', employeeId)
    const response = await api.post(`${this.baseUrl}/employees/${employeeId}/enable`)
    return response
  }

  // 删除员工 (调用真实API)
  async deleteEmployee(employeeId: string) {
    console.log('🔍 调用真实删除员工API', employeeId)
    const response = await api.delete(`${this.baseUrl}/employees/${employeeId}`)
    return response
  }

  // 获取员工配额 (调用真实API)
  async getEmployeeQuota() {
    console.log('🔍 调用真实员工配额API')
    const response = await api.get(`${this.baseUrl}/quota/employees`)
    return response
  }

  // 获取邀请列表 (临时实现)
  async getInvitations(params?: {
    page?: number
    page_size?: number
    status?: string
  }) {
    // 临时返回模拟数据，实际需要后端实现
    return {
      success: true,
      data: {
        items: [],
        total: 0,
        page: params?.page || 1,
        page_size: params?.page_size || 20,
        total_pages: 0
      }
    }
  }

  // 取消邀请 (临时实现)
  async cancelInvitation(invitationId: string) {
    // 临时返回成功响应，实际需要后端实现
    return {
      success: true,
      message: '邀请已取消'
    }
  }

  // 重新发送邀请 (临时实现)
  async resendInvitation(invitationId: string) {
    // 临时返回成功响应，实际需要后端实现
    return {
      success: true,
      message: '邀请已重新发送'
    }
  }

  // 获取工厂列表 (调用真实API)
  async getFactories(params?: {
    page?: number
    page_size?: number
    is_active?: boolean
  }) {
    console.log('🔍 调用真实工厂列表API', params)
    const response = await api.get(`${this.baseUrl}/factories`, {
      params: {
        page: params?.page || 1,
        page_size: params?.page_size || 20,
        is_active: params?.is_active
      }
    })
    return response
  }

  // 获取工厂详情 (调用真实API)
  async getFactory(factoryId: string) {
    console.log('🔍 调用真实工厂详情API', factoryId)
    const response = await api.get(`${this.baseUrl}/factories/${factoryId}`)
    return response
  }

  // 创建工厂 (调用真实API)
  async createFactory(data: CreateFactoryData) {
    console.log('🔍 调用真实创建工厂API', data)
    const response = await api.post(`${this.baseUrl}/factories`, data)
    return response
  }

  // 更新工厂 (调用真实API)
  async updateFactory(factoryId: string, data: Partial<CreateFactoryData>) {
    console.log('🔍 调用真实更新工厂API', factoryId, data)
    const response = await api.put(`${this.baseUrl}/factories/${factoryId}`, data)
    return response
  }

  // 停用工厂 (调用真实API - 通过更新is_active字段)
  async deactivateFactory(factoryId: string) {
    console.log('🔍 调用真实停用工厂API', factoryId)
    const response = await api.put(`${this.baseUrl}/factories/${factoryId}`, {
      is_active: false
    })
    return response
  }

  // 激活工厂 (调用真实API - 通过更新is_active字段)
  async activateFactory(factoryId: string) {
    console.log('🔍 调用真实激活工厂API', factoryId)
    const response = await api.put(`${this.baseUrl}/factories/${factoryId}`, {
      is_active: true
    })
    return response
  }

  // 删除工厂 (调用真实API)
  async deleteFactory(factoryId: string) {
    console.log('🔍 调用真实删除工厂API', factoryId)
    const response = await api.delete(`${this.baseUrl}/factories/${factoryId}`)
    return response
  }

  // 获取部门列表 (调用真实API)
  async getDepartments(params?: {
    page?: number
    page_size?: number
    factory_id?: string
  }) {
    console.log('🔍 调用真实部门列表API', params)
    const response = await api.get(`${this.baseUrl}/departments`, {
      params: {
        page: params?.page || 1,
        page_size: params?.page_size || 20,
        factory_id: params?.factory_id
      }
    })
    return response
  }

  // 获取部门详情 (调用真实API)
  async getDepartment(departmentId: string) {
    console.log('🔍 调用真实部门详情API', departmentId)
    const response = await api.get(`${this.baseUrl}/departments/${departmentId}`)
    return response
  }

  // 创建部门 (调用真实API)
  async createDepartment(data: CreateDepartmentData) {
    console.log('🔍 调用真实创建部门API', data)
    const response = await api.post(`${this.baseUrl}/departments`, data)
    return response
  }

  // 更新部门 (调用真实API)
  async updateDepartment(departmentId: string, data: Partial<CreateDepartmentData>) {
    console.log('🔍 调用真实更新部门API', departmentId, data)
    const response = await api.put(`${this.baseUrl}/departments/${departmentId}`, data)
    return response
  }

  // 删除部门 (调用真实API)
  async deleteDepartment(departmentId: string) {
    console.log('🔍 调用真实删除部门API', departmentId)
    const response = await api.delete(`${this.baseUrl}/departments/${departmentId}`)
    return response
  }

  // 获取员工统计 (调用真实API)
  async getEmployeeStatistics() {
    console.log('🔍 调用真实员工统计API')
    const response = await api.get(`${this.baseUrl}/statistics/employees`)
    return response
  }

  // ==================== 角色管理API ====================

  // 初始化角色表和默认角色
  async initRoles() {
    console.log('🔍 调用初始化角色API')
    const response = await api.post(`${this.baseUrl}/roles/init`)
    return response
  }

  // 获取角色列表
  async getRoles(params?: {
    page?: number
    page_size?: number
    is_active?: boolean
  }) {
    console.log('🔍 调用获取角色列表API', params)
    const response = await api.get(`${this.baseUrl}/roles`, { params })
    return response
  }

  // 创建角色
  async createRole(data: CreateRoleData) {
    console.log('🔍 调用创建角色API', data)
    const response = await api.post(`${this.baseUrl}/roles`, data)
    return response
  }

  // 更新角色
  async updateRole(roleId: string, data: UpdateRoleData) {
    console.log('🔍 调用更新角色API', roleId, data)
    const response = await api.put(`${this.baseUrl}/roles/${roleId}`, data)
    return response
  }

  // 删除角色
  async deleteRole(roleId: string) {
    console.log('🔍 调用删除角色API', roleId)
    const response = await api.delete(`${this.baseUrl}/roles/${roleId}`)
    return response
  }
}

// 创建服务实例
const enterpriseService = new EnterpriseService()

export default enterpriseService