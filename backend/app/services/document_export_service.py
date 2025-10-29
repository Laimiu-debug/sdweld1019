"""
文档导出服务
处理WPS/PQR/pPQR文档导出为Word和PDF
"""
from sqlalchemy.orm import Session
from typing import Optional, BinaryIO
import io
from datetime import datetime
from bs4 import BeautifulSoup

# 注意：这些库需要安装
# pip install python-docx weasyprint beautifulsoup4
try:
    from docx import Document
    from docx.shared import Inches, Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False
    print("警告: python-docx未安装，Word导出功能不可用")

try:
    from weasyprint import HTML, CSS
    WEASYPRINT_AVAILABLE = True
except (ImportError, OSError) as e:
    WEASYPRINT_AVAILABLE = False
    print(f"警告: weasyprint不可用，PDF导出功能不可用 ({str(e)[:100]})")

from app.models.wps import WPS


class DocumentExportService:
    """文档导出服务类"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def export_wps_to_word(self, wps: WPS) -> io.BytesIO:
        """
        导出WPS为Word文档
        
        Args:
            wps: WPS对象
            
        Returns:
            Word文档的BytesIO流
        """
        if not DOCX_AVAILABLE:
            raise ImportError("python-docx未安装，请运行: pip install python-docx")
        
        # 创建Word文档
        doc = Document()
        
        # 设置页面（A4）
        section = doc.sections[0]
        section.page_height = Inches(11.69)  # A4高度
        section.page_width = Inches(8.27)    # A4宽度
        section.top_margin = Inches(0.79)
        section.bottom_margin = Inches(0.79)
        section.left_margin = Inches(0.79)
        section.right_margin = Inches(0.79)
        
        # 获取HTML内容
        html_content = wps.document_html or self._generate_default_html(wps)
        
        # 解析HTML并转换为Word
        self._html_to_word(doc, html_content)
        
        # 添加页脚
        footer = section.footer
        footer_para = footer.paragraphs[0]
        footer_para.text = f"打印日期: {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        footer_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # 保存到内存
        file_stream = io.BytesIO()
        doc.save(file_stream)
        file_stream.seek(0)
        
        return file_stream
    
    def export_wps_to_pdf(self, wps: WPS) -> io.BytesIO:
        """
        导出WPS为PDF文档
        
        Args:
            wps: WPS对象
            
        Returns:
            PDF文档的BytesIO流
        """
        if not WEASYPRINT_AVAILABLE:
            raise ImportError("weasyprint未安装，请运行: pip install weasyprint")
        
        # 获取HTML内容
        html_content = wps.document_html or self._generate_default_html(wps)
        
        # 生成完整的HTML文档
        full_html = self._generate_pdf_html(wps, html_content)
        
        # 生成PDF
        pdf_bytes = HTML(string=full_html).write_pdf()
        
        return io.BytesIO(pdf_bytes)
    
    def _html_to_word(self, doc: Document, html_content: str):
        """
        将HTML内容转换为Word文档
        
        Args:
            doc: Word文档对象
            html_content: HTML内容
        """
        soup = BeautifulSoup(html_content, 'html.parser')
        
        for element in soup.find_all(['h1', 'h2', 'h3', 'p', 'table', 'hr']):
            if element.name == 'h1':
                # 一级标题
                heading = doc.add_heading(element.get_text(), level=1)
                heading.alignment = WD_ALIGN_PARAGRAPH.CENTER
                
            elif element.name == 'h2':
                # 二级标题
                heading = doc.add_heading(element.get_text(), level=2)
                
            elif element.name == 'h3':
                # 三级标题
                doc.add_heading(element.get_text(), level=3)
                
            elif element.name == 'p':
                # 段落
                text = element.get_text().strip()
                if text:  # 只添加非空段落
                    para = doc.add_paragraph(text)
                    # 检查对齐方式
                    style = element.get('style', '')
                    if 'text-align: center' in style or 'text-align:center' in style:
                        para.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    elif 'text-align: right' in style or 'text-align:right' in style:
                        para.alignment = WD_ALIGN_PARAGRAPH.RIGHT
                        
            elif element.name == 'table':
                # 表格
                self._add_table_to_word(doc, element)
                
            elif element.name == 'hr':
                # 分隔线
                doc.add_paragraph('_' * 50)
    
    def _add_table_to_word(self, doc: Document, table_element):
        """
        将HTML表格添加到Word文档
        
        Args:
            doc: Word文档对象
            table_element: BeautifulSoup表格元素
        """
        rows = table_element.find_all('tr')
        if not rows:
            return
        
        # 计算列数
        first_row = rows[0]
        cols = len(first_row.find_all(['td', 'th']))
        
        if cols == 0:
            return
        
        # 创建表格
        table = doc.add_table(rows=len(rows), cols=cols)
        table.style = 'Light Grid Accent 1'
        
        # 填充数据
        for row_idx, row in enumerate(rows):
            cells = row.find_all(['td', 'th'])
            for col_idx, cell in enumerate(cells):
                if row_idx < len(table.rows) and col_idx < len(table.rows[row_idx].cells):
                    cell_text = cell.get_text().strip()
                    table.rows[row_idx].cells[col_idx].text = cell_text
                    
                    # 表头加粗
                    if cell.name == 'th':
                        for paragraph in table.rows[row_idx].cells[col_idx].paragraphs:
                            for run in paragraph.runs:
                                run.font.bold = True
    
    def _generate_pdf_html(self, wps: WPS, content: str) -> str:
        """
        生成用于PDF导出的完整HTML
        
        Args:
            wps: WPS对象
            content: HTML内容
            
        Returns:
            完整的HTML字符串
        """
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @page {{
                    size: A4;
                    margin: 2cm;
                    @bottom-center {{
                        content: "第 " counter(page) " 页";
                    }}
                }}
                body {{
                    font-family: 'SimSun', 'Microsoft YaHei', 'Arial', sans-serif;
                    font-size: 12pt;
                    line-height: 1.6;
                    color: #333;
                }}
                h1 {{
                    text-align: center;
                    font-size: 24pt;
                    margin-bottom: 10pt;
                    color: #000;
                }}
                h2 {{
                    font-size: 18pt;
                    background-color: #f0f0f0;
                    padding: 8pt;
                    margin-top: 15pt;
                    color: #000;
                }}
                h3 {{
                    font-size: 14pt;
                    margin-top: 10pt;
                    color: #000;
                }}
                table {{
                    width: 100%;
                    border-collapse: collapse;
                    margin: 10pt 0;
                    page-break-inside: avoid;
                }}
                td, th {{
                    border: 1px solid #000;
                    padding: 6pt 8pt;
                    text-align: left;
                }}
                th {{
                    background-color: #f0f0f0;
                    font-weight: bold;
                }}
                img {{
                    max-width: 100%;
                    page-break-inside: avoid;
                }}
                p {{
                    margin: 0.5em 0;
                }}
                hr {{
                    border: none;
                    border-top: 2px solid #ddd;
                    margin: 2em 0;
                }}
            </style>
        </head>
        <body>
            {content}
        </body>
        </html>
        """
    
    def _generate_default_html(self, wps: WPS) -> str:
        """
        生成默认的HTML内容（当document_html为空时）
        
        Args:
            wps: WPS对象
            
        Returns:
            HTML字符串
        """
        return f"""
        <h1>{wps.title or 'WPS文档'}</h1>
        <p style="text-align: center;">文档编号: {wps.wps_number} | 版本: {wps.revision or 'A'}</p>
        <hr />
        <h2>基本信息</h2>
        <table>
            <tbody>
                <tr>
                    <td style="width: 30%; font-weight: bold;">WPS编号</td>
                    <td style="width: 70%;">{wps.wps_number}</td>
                </tr>
                <tr>
                    <td style="width: 30%; font-weight: bold;">标题</td>
                    <td style="width: 70%;">{wps.title or '-'}</td>
                </tr>
                <tr>
                    <td style="width: 30%; font-weight: bold;">版本</td>
                    <td style="width: 70%;">{wps.revision or 'A'}</td>
                </tr>
                <tr>
                    <td style="width: 30%; font-weight: bold;">状态</td>
                    <td style="width: 70%;">{wps.status or '-'}</td>
                </tr>
            </tbody>
        </table>
        <p></p>
        <p style="text-align: center; color: #999; margin-top: 2em;">
            此文档尚未使用文档编辑器编辑，显示的是默认内容。
        </p>
        """

