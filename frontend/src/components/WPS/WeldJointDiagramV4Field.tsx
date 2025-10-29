/**
 * 焊接接头示意图生成器 V4 字段组件
 * 用于在WPS模块中集成V4版本的示意图生成器
 */
import React, { useState } from 'react'
import { Button, Space, Upload, Modal, message, UploadFile } from 'antd'
import { PictureOutlined, UploadOutlined, ToolOutlined } from '@ant-design/icons'
import WeldJointDiagramGeneratorV4, { WeldJointParamsV4 } from './WeldJointDiagramGeneratorV4'

interface WeldJointDiagramV4FieldProps {
  value?: UploadFile[]
  onChange?: (fileList: UploadFile[]) => void
  disabled?: boolean
  label?: string
  // 从表单中获取的参数
  formValues?: Partial<WeldJointParamsV4>
}

const WeldJointDiagramV4Field: React.FC<WeldJointDiagramV4FieldProps> = ({
  value = [],
  onChange,
  disabled = false,
  label = '焊接接头示意图',
  formValues
}) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [generatorParams, setGeneratorParams] = useState<WeldJointParamsV4>({
    grooveType: 'V',
    groovePosition: 'outer',
    alignment: 'centerline',
    leftThickness: 12,
    leftGrooveAngle: 30,
    leftGrooveDepth: 10,
    leftBevel: false,
    leftBevelPosition: 'outer',
    leftBevelLength: 15,
    leftBevelHeight: 2,
    rightThickness: 10,
    rightGrooveAngle: 30,
    rightGrooveDepth: 8,
    rightBevel: false,
    rightBevelPosition: 'outer',
    rightBevelLength: 15,
    rightBevelHeight: 2,
    bluntEdge: 2,
    rootGap: 2,
  })

  // 当模态框打开时，从表单值中初始化参数
  React.useEffect(() => {
    if (modalVisible && formValues) {
      setGeneratorParams(prev => ({
        ...prev,
        grooveType: formValues.grooveType || prev.grooveType,
        groovePosition: formValues.groovePosition || prev.groovePosition,
        alignment: formValues.alignment || prev.alignment,
        leftThickness: formValues.leftThickness || prev.leftThickness,
        leftGrooveAngle: formValues.leftGrooveAngle || prev.leftGrooveAngle,
        leftGrooveDepth: formValues.leftGrooveDepth || prev.leftGrooveDepth,
        leftBevel: formValues.leftBevel || prev.leftBevel,
        leftBevelPosition: formValues.leftBevelPosition || prev.leftBevelPosition,
        leftBevelLength: formValues.leftBevelLength || prev.leftBevelLength,
        leftBevelHeight: formValues.leftBevelHeight || prev.leftBevelHeight,
        rightThickness: formValues.rightThickness || prev.rightThickness,
        rightGrooveAngle: formValues.rightGrooveAngle || prev.rightGrooveAngle,
        rightGrooveDepth: formValues.rightGrooveDepth || prev.rightGrooveDepth,
        rightBevel: formValues.rightBevel || prev.rightBevel,
        rightBevelPosition: formValues.rightBevelPosition || prev.rightBevelPosition,
        rightBevelLength: formValues.rightBevelLength || prev.rightBevelLength,
        rightBevelHeight: formValues.rightBevelHeight || prev.rightBevelHeight,
        bluntEdge: formValues.bluntEdge || prev.bluntEdge,
        rootGap: formValues.rootGap || prev.rootGap,
      }))
    }
  }, [modalVisible, formValues])

  // 处理图表生成
  const handleGenerate = (canvas: HTMLCanvasElement) => {
    // 将 canvas 转换为 blob
    canvas.toBlob((blob) => {
      if (!blob) {
        message.error('生成图表失败')
        return
      }

      // 创建文件对象
      const file = new File([blob], `weld_joint_v4_${Date.now()}.png`, { type: 'image/png' })
      
      // 创建 UploadFile 对象
      const uploadFile: UploadFile = {
        uid: `-${Date.now()}`,
        name: file.name,
        status: 'done',
        url: URL.createObjectURL(blob),
        originFileObj: file as any
      }

      // 更新值
      onChange?.([uploadFile])
      setModalVisible(false)
      message.success('焊接接头示意图生成成功！')
    }, 'image/png')
  }

  // 处理文件上传
  const handleUploadChange = (info: any) => {
    let fileList = [...info.fileList]
    
    // 只保留最新的一个文件
    fileList = fileList.slice(-1)
    
    // 更新文件列表
    onChange?.(fileList)
  }

  // 处理文件删除
  const handleRemove = () => {
    onChange?.([])
  }

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* 图片预览 */}
        {value && value.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <img
              src={value[0].url || value[0].thumbUrl}
              alt={label}
              style={{ maxWidth: '100%', maxHeight: 300, border: '1px solid #d9d9d9', borderRadius: 4 }}
            />
          </div>
        )}

        {/* 操作按钮 */}
        <Space>
          <Button
            icon={<ToolOutlined />}
            onClick={() => setModalVisible(true)}
            disabled={disabled}
          >
            自动生成
          </Button>
          
          <Upload
            disabled={disabled}
            maxCount={1}
            accept="image/*"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleUploadChange}
          >
            <Button icon={<UploadOutlined />} disabled={disabled}>
              上传图片
            </Button>
          </Upload>

          {value && value.length > 0 && (
            <Button danger onClick={handleRemove} disabled={disabled}>
              删除
            </Button>
          )}
        </Space>
      </Space>

      {/* 生成器模态框 */}
      <Modal
        title="焊接接头示意图生成器 V4"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={1200}
        destroyOnClose
      >
        <WeldJointDiagramGeneratorV4 
          onGenerate={handleGenerate}
          initialParams={generatorParams}
        />
      </Modal>
    </div>
  )
}

export default WeldJointDiagramV4Field

