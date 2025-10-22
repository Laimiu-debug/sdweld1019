import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'antd'
import { ApiResponse, PaginatedResponse } from '@/types'

class ApiService {
  private api: AxiosInstance
  private useMockData = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true'

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截器
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // 后端直接返回数据,不包装在 ApiResponse 中
        // 我们需要将其包装成统一的格式
        return {
          success: true,
          data: response.data,
          timestamp: new Date().toISOString()
        } as ApiResponse
      },
      (error) => {
        const { response } = error

        if (response) {
          switch (response.status) {
            case 401:
              message.error('登录已过期，请重新登录')
              this.handleUnauthorized()
              break
            case 403:
              // 显示后端返回的具体权限错误信息
              const permissionError = response.data?.detail
              if (permissionError && typeof permissionError === 'string') {
                message.error(permissionError)
              } else {
                message.error('权限不足')
              }
              break
            case 404:
              // 不显示404错误消息,让组件自己处理
              console.error('请求的资源不存在:', error.config?.url)
              break
            case 422:
              const validationErrors = response.data?.detail
              if (Array.isArray(validationErrors)) {
                const firstError = validationErrors[0]
                message.error(firstError.msg || '请求参数错误')
              } else if (typeof validationErrors === 'string') {
                message.error(validationErrors)
              } else {
                message.error(response.data?.detail || '请求参数错误')
              }
              break
            case 429:
              message.error('请求过于频繁，请稍后再试')
              break
            case 500:
              // 显示后端返回的具体错误信息，如果有的话
              const serverError = response.data?.detail
              if (serverError && typeof serverError === 'string') {
                message.error(serverError)
              } else {
                message.error('服务器内部错误')
              }
              break
            default:
              message.error(response.data?.detail || '请求失败')
          }
        } else if (error.code === 'ECONNABORTED') {
          message.error('请求超时，请检查网络连接')
        } else {
          message.error('网络连接失败')
        }

        return Promise.reject(error)
      }
    )
  }

  private handleUnauthorized() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  // 通用请求方法
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.api.get(url, config)
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.api.post(url, data, config)
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.api.put(url, data, config)
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.api.patch(url, data, config)
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.api.delete(url, config)
  }

  // 分页请求方法
  async getPaginated<T = any>(
    url: string,
    params: {
      page?: number
      page_size?: number
      sort?: string
      order?: 'asc' | 'desc'
      search?: string
      [key: string]: any
    }
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    return this.api.get(url, { params })
  }

  // 文件上传
  async uploadFile(
    file: File,
    additionalData: {
      resource_type: string
      resource_id: string
      description?: string
    }
  ): Promise<ApiResponse> {
    const formData = new FormData()
    formData.append('file', file)
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value)
    })

    return this.api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          console.log(`Upload progress: ${percentCompleted}%`)
        }
      },
    })
  }

  // 文件下载
  async downloadFile(fileId: string): Promise<Blob> {
    const response = await this.api.get(`/files/${fileId}`, {
      responseType: 'blob',
    })
    return response.data
  }

  // 批量操作
  async batchOperation(
    resourceType: string,
    operation: {
      action: string
      item_ids: string[]
      params?: Record<string, any>
    }
  ): Promise<ApiResponse> {
    return this.api.post(`/${resourceType}/batch`, operation)
  }

  // 导出数据
  async exportData(
    resourceType: string,
    options: {
      format: 'pdf' | 'excel' | 'csv'
      fields?: string[]
      filters?: Record<string, any>
      include_attachments?: boolean
    }
  ): Promise<Blob> {
    const response = await this.api.post(`/${resourceType}/export`, options, {
      responseType: 'blob',
    })
    return response.data
  }

  // 获取系统配置
  async getSystemConfig(): Promise<ApiResponse> {
    return this.api.get('/system/config')
  }

  // 健康检查
  async healthCheck(): Promise<ApiResponse> {
    return this.api.get('/health')
  }

  // 获取服务器时间
  async getServerTime(): Promise<ApiResponse<{ timestamp: string }>> {
    return this.api.get('/system/time')
  }

  // 获取应用版本信息
  async getAppVersion(): Promise<ApiResponse<{ version: string; build_time: string }>> {
    return this.api.get('/system/version')
  }

  // 模拟数据方法（开发时使用）
  private getMockData<T>(endpoint: string): Promise<ApiResponse<T>> {
    // 这里可以根据endpoint返回不同的模拟数据
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: null as T,
          message: 'Mock data response',
          timestamp: new Date().toISOString(),
        })
      }, 500)
    })
  }
}

export const apiService = new ApiService()
export default apiService