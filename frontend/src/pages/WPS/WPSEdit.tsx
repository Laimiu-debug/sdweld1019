import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Button, Space, Form, Spin, message, Alert, Radio } from 'antd'
import { ArrowLeftOutlined, SaveOutlined, FormOutlined, FileWordOutlined } from '@ant-design/icons'
import wpsService from '@/services/wps'
import ModuleFormRenderer from '@/components/WPS/ModuleFormRenderer'
import WPSDocumentEditor from '@/components/DocumentEditor/WPSDocumentEditor'
import { WPSTemplate } from '@/services/wpsTemplates'
import wpsTemplateService from '@/services/wpsTemplates'
import { getModuleById } from '@/constants/wpsModules'
import { convertModulesToTipTapHTML } from '@/utils/moduleToTipTapHTML'
import dayjs from 'dayjs'

const { Title } = Typography

interface WPSEditData {
  id: number
  title: string
  wps_number: string
  revision: string
  status: string
  template_id?: string
  modules_data?: Record<string, any>
  document_html?: string
  [key: string]: any
}

const WPSEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [wpsData, setWpsData] = useState<WPSEditData | null>(null)
  const [template, setTemplate] = useState<WPSTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState<'form' | 'document'>('form')
  const [documentHTML, setDocumentHTML] = useState<string>('')

  // 处理编辑模式切换
  const handleEditModeChange = (mode: 'form' | 'document') => {
    setEditMode(mode)

    // 如果切换到文档模式，从当前表单数据生成HTML
    if (mode === 'document' && template && wpsData) {
      const formValues = form.getFieldsValue()

      // 重新构建modules_data从表单值
      const modulesData: Record<string, any> = {}

      template.module_instances.forEach(instance => {
        const moduleData: Record<string, any> = {
          moduleId: instance.moduleId,
          customName: instance.customName,
          data: {}
        }

        const module = getModuleById(instance.moduleId)
        if (module) {
          Object.keys(module.fields).forEach(fieldKey => {
            const formFieldName = `${instance.instanceId}_${fieldKey}`
            if (formValues[formFieldName] !== undefined && formValues[formFieldName] !== null && formValues[formFieldName] !== '') {
              let fieldValue = formValues[formFieldName]

              // 如果是日期字段且值是 dayjs 对象，转换为字符串
              const fieldDef = module.fields[fieldKey]
              if (fieldDef?.type === 'date' && dayjs.isDayjs(fieldValue)) {
                fieldValue = fieldValue.format('YYYY-MM-DD')
              }

              moduleData.data[fieldKey] = fieldValue
            }
          })
        }

        modulesData[instance.instanceId] = moduleData
      })

      // 生成HTML
      const html = convertModulesToTipTapHTML(
        template.module_instances,
        modulesData,
        {
          title: wpsData.title || '',
          number: wpsData.wps_number || '',
          revision: wpsData.revision || 'A'
        },
        'wps'
      )

      setDocumentHTML(html)
    }
  }

  // 获取 WPS 详情和模板
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        setLoading(true)

        // 获取 WPS 详情
        const wpsResponse = await wpsService.getWPS(parseInt(id))
        if (!wpsResponse.success || !wpsResponse.data) {
          message.error('获取WPS详情失败')
          return
        }

        const wps = wpsResponse.data
        setWpsData(wps)

        // 如果有 template_id，尝试获取模板
        if (wps.template_id) {
          try {
            const templateResponse = await wpsTemplateService.getTemplate(wps.template_id)
            if (templateResponse.success && templateResponse.data) {
              setTemplate(templateResponse.data)
            }
          } catch (error) {
            console.warn('获取模板失败（模板可能已被删除）:', error)
            // 模板不存在时不显示错误，因为文档数据仍然完整
          }
        }

        // 初始化表单数据
        const formValues: Record<string, any> = {
          title: wps.title,
          wps_number: wps.wps_number,
          revision: wps.revision,
        }

        // 从 modules_data 中恢复表单值
        if (wps.modules_data) {
          Object.entries(wps.modules_data).forEach(([moduleId, moduleContent]: [string, any]) => {
            if (moduleContent && moduleContent.data) {
              Object.entries(moduleContent.data).forEach(([fieldKey, fieldValue]: [string, any]) => {
                const formFieldName = `${moduleId}_${fieldKey}`

                // 获取字段定义以检查字段类型
                const module = getModuleById(moduleContent.moduleId)
                const fieldDef = module?.fields?.[fieldKey]

                // 如果是日期字段且值是字符串，转换为 dayjs 对象
                if (fieldDef?.type === 'date' && fieldValue && typeof fieldValue === 'string') {
                  formValues[formFieldName] = dayjs(fieldValue)
                } else {
                  formValues[formFieldName] = fieldValue
                }
              })
            }
          })
        }

        form.setFieldsValue(formValues)

        // 生成文档HTML（用于文档编辑模式）
        if (template && template.module_instances && wps.modules_data) {
          const html = convertModulesToTipTapHTML(
            template.module_instances,
            wps.modules_data,
            {
              title: wps.title || '',
              number: wps.wps_number || '',
              revision: wps.revision || 'A'
            },
            'wps'
          )
          setDocumentHTML(wps.document_html || html)
        }
      } catch (error: any) {
        console.error('获取数据失败:', error)
        message.error(error.response?.data?.detail || '获取数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, form])

  // 处理文档模式保存
  const handleSaveDocument = async (htmlContent: string) => {
    try {
      setSaving(true)

      const updateData: any = {
        document_html: htmlContent
      }

      const response = await wpsService.updateWPS(parseInt(id!), updateData)
      if (response.success) {
        message.success('保存成功')
        setDocumentHTML(htmlContent)
      } else {
        message.error(response.message || '保存失败')
      }
    } catch (error: any) {
      console.error('保存失败:', error)
      message.error(error.response?.data?.detail || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  // 处理Word导出
  const handleExportWord = async () => {
    try {
      message.loading('正在生成Word文档...', 0)

      const response = await fetch(`/api/v1/wps/${id}/export/word`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('导出失败')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `WPS_${wpsData?.wps_number}_${new Date().toISOString().split('T')[0]}.docx`
      link.click()
      URL.revokeObjectURL(url)

      message.destroy()
      message.success('导出成功')
    } catch (error) {
      message.destroy()
      message.error('导出失败，请稍后重试')
      console.error('导出Word失败:', error)
    }
  }

  // 处理PDF导出
  const handleExportPDF = async () => {
    try {
      message.loading('正在生成PDF文档...', 0)

      const response = await fetch(`/api/v1/wps/${id}/export/pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('导出失败')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `WPS_${wpsData?.wps_number}_${new Date().toISOString().split('T')[0]}.pdf`
      link.click()
      URL.revokeObjectURL(url)

      message.destroy()
      message.success('导出成功')
    } catch (error) {
      message.destroy()
      message.error('导出失败，请稍后重试')
      console.error('导出PDF失败:', error)
    }
  }

  // 处理表单模式保存
  const handleSave = async () => {
    try {
      setSaving(true)

      // 验证表单
      const values = await form.validateFields()

      // 重新构建 modules_data
      let wpsNumber = ''
      let wpsTitle = ''
      let wpsRevision = 'A'
      const modulesData: Record<string, any> = {}

      // 如果有模板，使用模板结构
      if (template && template.module_instances) {
        template.module_instances.forEach(instance => {
          const moduleData: Record<string, any> = {}
          const module = getModuleById(instance.moduleId)

          if (module) {
            Object.keys(module.fields).forEach(fieldKey => {
              const formFieldName = `${instance.instanceId}_${fieldKey}`
              if (values[formFieldName] !== undefined && values[formFieldName] !== null && values[formFieldName] !== '') {
                const fieldDef = module.fields[fieldKey]
                let fieldValue = values[formFieldName]

                // 如果是日期字段且值是 dayjs 对象，转换为字符串
                if (fieldDef?.type === 'date' && dayjs.isDayjs(fieldValue)) {
                  fieldValue = fieldValue.format('YYYY-MM-DD')
                }

                moduleData[fieldKey] = fieldValue

                // 从 header_data 模块中提取 wps_number, title, revision
                if (instance.moduleId === 'header_data') {
                  if (fieldKey === 'wps_number') {
                    wpsNumber = values[formFieldName]
                  } else if (fieldKey === 'title') {
                    wpsTitle = values[formFieldName]
                  } else if (fieldKey === 'revision') {
                    wpsRevision = values[formFieldName]
                  }
                }
              }
            })
          }

          if (Object.keys(moduleData).length > 0) {
            modulesData[instance.instanceId] = {
              moduleId: instance.moduleId,
              customName: instance.customName,
              rowIndex: instance.rowIndex,
              columnIndex: instance.columnIndex,
              data: moduleData,
            }
          }
        })
      } else if (wpsData?.modules_data) {
        // 没有模板时，保留原有的 modules_data 结构，只更新表单值
        Object.entries(wpsData.modules_data).forEach(([instanceId, moduleContent]: [string, any]) => {
          if (moduleContent && moduleContent.data) {
            const moduleData: Record<string, any> = {}
            const module = getModuleById(moduleContent.moduleId)

            if (module) {
              Object.keys(module.fields).forEach(fieldKey => {
                const formFieldName = `${instanceId}_${fieldKey}`
                if (values[formFieldName] !== undefined && values[formFieldName] !== null && values[formFieldName] !== '') {
                  const fieldDef = module.fields[fieldKey]
                  let fieldValue = values[formFieldName]

                  // 如果是日期字段且值是 dayjs 对象，转换为字符串
                  if (fieldDef?.type === 'date' && dayjs.isDayjs(fieldValue)) {
                    fieldValue = fieldValue.format('YYYY-MM-DD')
                  }

                  moduleData[fieldKey] = fieldValue
                }
              })
            }

            if (Object.keys(moduleData).length > 0) {
              modulesData[instanceId] = {
                moduleId: moduleContent.moduleId,
                customName: moduleContent.customName,
                data: moduleData,
              }
            }
          }
        })
      }

      // 构建更新数据
      const updateData: any = {
        title: wpsTitle || values.title,
        wps_number: wpsNumber || values.wps_number,
        revision: wpsRevision || values.revision,
      }

      if (Object.keys(modulesData).length > 0) {
        updateData.modules_data = modulesData
      }

      // 调用 API 更新
      const response = await wpsService.updateWPS(parseInt(id!), updateData)
      if (response.success) {
        message.success('保存成功')
        navigate('/wps')
      } else {
        message.error(response.message || '保存失败')
      }
    } catch (error: any) {
      console.error('保存失败:', error)
      message.error(error.response?.data?.detail || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }} />
      </div>
    )
  }

  if (!wpsData) {
    return (
      <div className="page-container">
        <div className="page-header">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/wps')}
          >
            返回列表
          </Button>
          <Title level={2}>编辑WPS</Title>
        </div>
        <Card>
          <Alert message="未找到WPS数据" type="error" />
        </Card>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/wps')}
          >
            返回列表
          </Button>
          <Title level={2}>编辑WPS</Title>
        </Space>
      </div>

      <Card>
        {/* 如果模板被删除，显示警告信息 */}
        {!template && wpsData?.modules_data && (
          <Alert
            message="模板已被删除"
            description="此文档使用的模板已被删除，但文档数据完整，仍可正常编辑。"
            type="warning"
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />
        )}

        {/* 如果有模板，显示模板信息 */}
        {template && (
          <Alert
            message="使用模板编辑"
            description={`当前使用模板: ${template.name || template.id}`}
            type="info"
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />
        )}

        {/* 编辑模式切换 */}
        <div style={{ marginBottom: 16 }}>
          <Radio.Group
            value={editMode}
            onChange={e => handleEditModeChange(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="form">
              <FormOutlined /> 表单编辑
            </Radio.Button>
            <Radio.Button value="document">
              <FileWordOutlined /> 文档编辑
            </Radio.Button>
          </Radio.Group>
        </div>

        {/* 如果有 modules_data（无论是否有模板），都可以编辑 */}
        {wpsData?.modules_data ? (
          <>
            {editMode === 'form' ? (
              <Form
                form={form}
                layout="vertical"
              >
                {/* 基本信息 */}
                <Form.Item
                  label="WPS编号"
                  name="wps_number"
                  rules={[{ required: true, message: '请输入WPS编号' }]}
                >
                  <input type="text" />
                </Form.Item>

                <Form.Item
                  label="标题"
                  name="title"
                  rules={[{ required: true, message: '请输入标题' }]}
                >
                  <input type="text" />
                </Form.Item>

                <Form.Item
                  label="版本"
                  name="revision"
                >
                  <input type="text" />
                </Form.Item>

                {/* 模块表单 - 使用模板或从 modules_data 重建 */}
                {template && template.module_instances ? (
                  <ModuleFormRenderer
                    modules={template.module_instances || []}
                    form={form}
                  />
                ) : (
                  <ModuleFormRenderer
                    modules={Object.entries(wpsData.modules_data).map(([instanceId, content]: [string, any]) => ({
                      instanceId,
                      moduleId: content.moduleId,
                      customName: content.customName || '',
                      rowIndex: content.rowIndex,
                      columnIndex: content.columnIndex,
                      order: 0,
                    }))}
                    form={form}
                  />
                )}
              </Form>
            ) : (
              <WPSDocumentEditor
                initialContent={documentHTML}
                onSave={handleSaveDocument}
                onExportWord={handleExportWord}
                onExportPDF={handleExportPDF}
              />
            )}

            {editMode === 'form' && (
              <Space style={{ marginTop: 24 }}>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={handleSave}
                >
                  保存
                </Button>
                <Button onClick={() => navigate('/wps')}>
                  取消
                </Button>
              </Space>
            )}
          </>
        ) : (
          <Alert
            message="无法编辑此WPS"
            description="此WPS没有模块数据，无法编辑"
            type="error"
            showIcon
          />
        )}
      </Card>
    </div>
  )
}

export default WPSEdit