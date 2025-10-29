/**
 * WPS文档编辑器组件
 * 基于TipTap实现的Word式文档编辑器
 */
import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Image } from '@tiptap/extension-image'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Button, Space, Divider, Tooltip, message } from 'antd'
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  TableOutlined,
  PictureOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  SaveOutlined,
  PrinterOutlined,
  UndoOutlined,
  RedoOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import './DocumentEditor.css'

interface WPSDocumentEditorProps {
  initialContent: string
  onSave: (content: string) => void
  onExportWord: () => void
  onExportPDF: () => void
}

const WPSDocumentEditor: React.FC<WPSDocumentEditorProps> = ({
  initialContent,
  onSave,
  onExportWord,
  onExportPDF,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg mx-auto focus:outline-none',
      },
    },
  })

  // 当initialContent变化时更新编辑器内容
  useEffect(() => {
    if (editor && initialContent) {
      // 只在内容不同时更新，避免不必要的重渲染
      const currentContent = editor.getHTML()
      if (currentContent !== initialContent) {
        editor.commands.setContent(initialContent)
      }
    }
  }, [editor, initialContent])

  if (!editor) {
    return null
  }

  const handleSave = () => {
    const content = editor.getHTML()
    onSave(content)
  }

  const handlePrint = () => {
    window.print()
  }

  const addImage = () => {
    const url = window.prompt('请输入图片URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const MenuBar = () => (
    <div className="menu-bar">
      <Space split={<Divider type="vertical" />} wrap>
        {/* 文件操作 */}
        <Space>
          <Tooltip title="保存">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
            >
              保存
            </Button>
          </Tooltip>
          <Tooltip title="导出Word">
            <Button icon={<FileWordOutlined />} onClick={onExportWord}>
              导出Word
            </Button>
          </Tooltip>
          <Tooltip title="导出PDF">
            <Button icon={<FilePdfOutlined />} onClick={onExportPDF}>
              导出PDF
            </Button>
          </Tooltip>
          <Tooltip title="打印">
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              打印
            </Button>
          </Tooltip>
        </Space>

        {/* 撤销/重做 */}
        <Space>
          <Tooltip title="撤销">
            <Button
              icon={<UndoOutlined />}
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            />
          </Tooltip>
          <Tooltip title="重做">
            <Button
              icon={<RedoOutlined />}
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            />
          </Tooltip>
        </Space>

        {/* 文本格式 */}
        <Space>
          <Tooltip title="粗体">
            <Button
              type={editor.isActive('bold') ? 'primary' : 'default'}
              icon={<BoldOutlined />}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
          </Tooltip>
          <Tooltip title="斜体">
            <Button
              type={editor.isActive('italic') ? 'primary' : 'default'}
              icon={<ItalicOutlined />}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
          </Tooltip>
          <Tooltip title="下划线">
            <Button
              type={editor.isActive('underline') ? 'primary' : 'default'}
              icon={<UnderlineOutlined />}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            />
          </Tooltip>
        </Space>

        {/* 对齐 */}
        <Space>
          <Tooltip title="左对齐">
            <Button
              type={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}
              icon={<AlignLeftOutlined />}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            />
          </Tooltip>
          <Tooltip title="居中">
            <Button
              type={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}
              icon={<AlignCenterOutlined />}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            />
          </Tooltip>
          <Tooltip title="右对齐">
            <Button
              type={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}
              icon={<AlignRightOutlined />}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            />
          </Tooltip>
        </Space>

        {/* 标题 */}
        <Space>
          <Button
            type={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            H1
          </Button>
          <Button
            type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </Button>
          <Button
            type={editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            H3
          </Button>
        </Space>

        {/* 表格操作 */}
        <Space>
          <Tooltip title="插入表格">
            <Button
              icon={<TableOutlined />}
              onClick={() =>
                editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
              }
            >
              插入表格
            </Button>
          </Tooltip>
          {editor.isActive('table') && (
            <>
              <Button
                size="small"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
              >
                插入列(前)
              </Button>
              <Button
                size="small"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
              >
                插入列(后)
              </Button>
              <Button
                size="small"
                onClick={() => editor.chain().focus().addRowBefore().run()}
              >
                插入行(上)
              </Button>
              <Button
                size="small"
                onClick={() => editor.chain().focus().addRowAfter().run()}
              >
                插入行(下)
              </Button>
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => editor.chain().focus().deleteTable().run()}
              >
                删除表格
              </Button>
            </>
          )}
        </Space>

        {/* 图片 */}
        <Space>
          <Tooltip title="插入图片">
            <Button icon={<PictureOutlined />} onClick={addImage}>
              插入图片
            </Button>
          </Tooltip>
        </Space>
      </Space>
    </div>
  )

  return (
    <div className="document-editor">
      <MenuBar />
      <div className="editor-container">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default WPSDocumentEditor

