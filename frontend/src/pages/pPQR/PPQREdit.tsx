import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Button, Space, Form, Spin, message, Alert, Input, Radio } from 'antd'
import { ArrowLeftOutlined, SaveOutlined, FormOutlined, FileWordOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import ppqrService from '@/services/ppqr'
import ModuleFormRenderer from '@/components/WPS/ModuleFormRenderer'
import WPSDocumentEditor from '@/components/DocumentEditor/WPSDocumentEditor'
import { WPSTemplate } from '@/services/wpsTemplates'
import wpsTemplateService from '@/services/wpsTemplates'
import { getPPQRModuleById } from '@/constants/ppqrModules'
import { convertModulesToTipTapHTML } from '@/utils/moduleToTipTapHTML'

const { Title } = Typography

interface PPQREditData {
  id: number
  title: string
  ppqr_number: string
  revision: string
  status: string
  template_id?: string
  modules_data?: Record<string, any>
  document_html?: string
  [key: string]: any
}

const PPQREdit: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [ppqrData, setPPQRData] = useState<PPQREditData | null>(null)
  const [template, setTemplate] = useState<WPSTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState<'form' | 'document'>('form')
  const [documentHTML, setDocumentHTML] = useState<string>('')

  // 处理编辑模式切换
  const handleEditModeChange = (mode: 'form' | 'document') => {
    setEditMode(mode)

    // 如果切换到文档模式，从当前表单数据生成HTML
    if (mode === 'document' && template && ppqrData) {
      const formValues = form.getFieldsValue()

      // 重新构建modules_data从表单值
      const modulesData: Record<string, any> = {}

      template.module_instances.forEach(instance => {
        const moduleData: Record<string, any> = {
          moduleId: instance.moduleId,
          customName: instance.customName,
          data: {}
        }

        const module = getPPQRModuleById(instance.moduleId)
        if (module) {
          Object.keys(module.fields).forEach(fieldKey => {
            const formFieldName = `${instance.instanceId}_${fieldKey}`
            const fieldValue = formValues[formFieldName]

            // 包含所有字段，即使是空值
            if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
              const fieldDef = module.fields[fieldKey]
              let processedValue = fieldValue

              // 如果是日期字段且值是 dayjs 对象，转换为字符串
              if (fieldDef?.type === 'date' && dayjs.isDayjs(fieldValue)) {
                processedValue = fieldValue.format('YYYY-MM-DD')
              }

              moduleData.data[fieldKey] = processedValue
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
          title: ppqrData.title || '',
          number: ppqrData.ppqr_number || '',
          revision: ppqrData.revision || 'A'
        },
        'ppqr'
      )

      setDocumentHTML(html)
    }
  }

  // 获取 pPQR 详情和模板
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        setLoading(true)

        // 获取 pPQR 详情
        console.log('[PPQREdit] 获取pPQR详情, id:', id)
        const ppqrResponse = await ppqrService.get(parseInt(id))
        console.log('[PPQREdit] pPQR响应:', ppqrResponse)
        const ppqr = ppqrResponse
        setPPQRData(ppqr)
        console.log('[PPQREdit] pPQR数据:', ppqr)
        console.log('[PPQREdit] template_id:', ppqr.template_id)
        console.log('[PPQREdit] modules_data:', ppqr.modules_data)

        // 如果有 document_html，初始化文档内容
        if (ppqr.document_html) {
          setDocumentHTML(ppqr.document_html)
        }

        // 如果有 template_id，尝试获取模板
        let templateData = null
        if (ppqr.template_id) {
          try {
            console.log('[PPQREdit] 获取模板, template_id:', ppqr.template_id)
            const templateResponse = await wpsTemplateService.getTemplate(ppqr.template_id)
            console.log('[PPQREdit] 模板响应:', templateResponse)
            // templateResponse 是 ApiResponse<WPSTemplate>，需要访问 .data
            templateData = templateResponse.data || null
            console.log('[PPQREdit] 模板数据:', templateData)
            setTemplate(templateData)
          } catch (error) {
            console.warn('获取模板失败（模板可能已被删除）:', error)
            // 模板不存在时不显示错误，因为文档数据仍然完整
          }
        }

        // 初始化表单数据
        const formValues: Record<string, any> = {
          title: ppqr.title,
          ppqr_number: ppqr.ppqr_number,
          revision: ppqr.revision,
        }

        // 从 modules_data 中恢复表单值
        if (ppqr.modules_data) {
          Object.entries(ppqr.modules_data).forEach(([instanceId, moduleContent]: [string, any]) => {
            if (moduleContent && moduleContent.data) {
              // 如果有模板，找到对应的模块实例
              const moduleInstance = templateData?.module_instances?.find(
                (inst: any) => inst.instanceId === instanceId
              )

              Object.entries(moduleContent.data).forEach(([fieldKey, fieldValue]: [string, any]) => {
                const formFieldName = `${instanceId}_${fieldKey}`

                // 获取字段定义
                const module = moduleInstance
                  ? getPPQRModuleById(moduleInstance.moduleId)
                  : getPPQRModuleById(moduleContent.moduleId)
                const fieldDef = module?.fields?.[fieldKey]

                // 如果是日期字段且值是字符串，转换为 dayjs 对象
                if (fieldDef?.type === 'date' && fieldValue && typeof fieldValue === 'string') {
                  try {
                    const dayjsDate = dayjs(fieldValue)
                    if (dayjsDate.isValid()) {
                      console.log(`[PPQREdit] 转换日期字段 ${formFieldName}:`, fieldValue, '→', dayjsDate)
                      formValues[formFieldName] = dayjsDate
                      return
                    }
                  } catch (e) {
                    console.warn(`无法转换日期字段 ${formFieldName}:`, fieldValue, e)
                  }
                }

                formValues[formFieldName] = fieldValue
              })
            }
          })
        }

        console.log('[PPQREdit] 设置表单值:', formValues)
        form.setFieldsValue(formValues)
      } catch (error: any) {
        console.error('获取数据失败:', error)
        message.error(error.response?.data?.detail || '获取数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, form])

  // 处理保存
  const handleSave = async () => {
    try {
      setSaving(true)

      // 验证表单
      const values = await form.validateFields()

      // 重新构建 modules_data
      let ppqrNumber = ''
      let ppqrTitle = ''
      let ppqrRevision = 'A'
      const modulesData: Record<string, any> = {}

      // 如果有模板，使用模板结构
      if (template && template.module_instances) {
        template.module_instances.forEach(instance => {
          const moduleData: Record<string, any> = {}
          const module = getPPQRModuleById(instance.moduleId)

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

                // 从 ppqr_basic_info 模块中提取 ppqr_number, title, revision
                if (instance.moduleId === 'ppqr_basic_info') {
                  if (fieldKey === 'ppqr_number') {
                    ppqrNumber = values[formFieldName]
                  } else if (fieldKey === 'title') {
                    ppqrTitle = values[formFieldName]
                  } else if (fieldKey === 'revision') {
                    ppqrRevision = values[formFieldName]
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
      } else if (ppqrData?.modules_data) {
        // 没有模板时，保留原有的 modules_data 结构，只更新表单值
        Object.entries(ppqrData.modules_data).forEach(([instanceId, moduleContent]: [string, any]) => {
          if (moduleContent && moduleContent.data) {
            const moduleData: Record<string, any> = {}
            const module = getPPQRModuleById(moduleContent.moduleId)

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
                rowIndex: moduleContent.rowIndex,
                columnIndex: moduleContent.columnIndex,
                data: moduleData,
              }
            }
          }
        })
      }

      // 构建更新数据
      const updateData: any = {
        title: ppqrTitle || values.title,
        ppqr_number: ppqrNumber || values.ppqr_number,
        revision: ppqrRevision || values.revision,
      }

      if (Object.keys(modulesData).length > 0) {
        updateData.modules_data = modulesData
      }

      // 调用 API 更新
      await ppqrService.update(parseInt(id!), updateData)
      message.success('保存成功')
      navigate('/ppqr')
    } catch (error: any) {
      console.error('保存失败:', error)
      message.error(error.response?.data?.detail || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  // 保存文档HTML
  const handleSaveDocument = async (html: string) => {
    try {
      setSaving(true)
      setDocumentHTML(html)

      // 更新数据库中的 document_html
      const updateData = {
        document_html: html
      }

      await ppqrService.update(parseInt(id!), updateData)
      message.success('文档已保存')
    } catch (error: any) {
      console.error('保存文档失败:', error)
      message.error(error.response?.data?.detail || '保存文档失败')
    } finally {
      setSaving(false)
    }
  }

  // 导出为Word
  const handleExportWord = async () => {
    try {
      message.info('Word导出功能开发中...')
    } catch (error: any) {
      console.error('导出Word失败:', error)
      message.error('导出Word失败')
    }
  }

  // 导出为PDF
  const handleExportPDF = async () => {
    try {
      message.info('PDF导出功能开发中...')
    } catch (error: any) {
      console.error('导出PDF失败:', error)
      message.error('导出PDF失败')
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }} />
      </div>
    )
  }

  if (!ppqrData) {
    return (
      <div className="page-container">
        <div className="page-header">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/ppqr')}
          >
            返回列表
          </Button>
          <Title level={2}>编辑pPQR</Title>
        </div>
        <Card>
          <Alert message="未找到pPQR数据" type="error" />
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
            onClick={() => navigate('/ppqr')}
          >
            返回列表
          </Button>
          <Title level={2}>编辑pPQR</Title>
        </Space>
      </div>

      <Card>
        {/* 如果模板被删除，显示警告信息 */}
        {!template && ppqrData?.modules_data && (
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
        {ppqrData?.modules_data ? (
          <>
            {editMode === 'form' ? (
              <Form
                form={form}
                layout="vertical"
              >
                {/* 模块表单 - 使用模板或从 modules_data 重建 */}
                {template && template.module_instances ? (
                  <ModuleFormRenderer
                    modules={template.module_instances || []}
                    form={form}
                    moduleType="ppqr"
                  />
                ) : (
                  <ModuleFormRenderer
                    modules={Object.entries(ppqrData.modules_data).map(([instanceId, content]: [string, any]) => ({
                      instanceId,
                      moduleId: content.moduleId,
                      customName: content.customName || '',
                      rowIndex: content.rowIndex,
                      columnIndex: content.columnIndex,
                      order: 0,
                    }))}
                    form={form}
                    moduleType="ppqr"
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
                <Button onClick={() => navigate('/ppqr')}>
                  取消
                </Button>
              </Space>
            )}
          </>
        ) : (
          <Alert
            message="无法编辑此pPQR"
            description="此pPQR没有模块数据，无法编辑"
            type="error"
            showIcon
          />
        )}
      </Card>
    </div>
  )
}

export default PPQREdit