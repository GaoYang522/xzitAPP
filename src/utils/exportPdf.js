import { jsPDF } from 'jspdf'
import { marked } from 'marked'

export function parseMarkdownToPdfLines(markdown) {
  const tokens = marked.lexer(markdown)
  const lines = []

  for (const token of tokens) {
    switch (token.type) {
      case 'heading': {
        const prefix = '#'.repeat(token.depth)
        lines.push({ text: `${prefix} ${token.text}`, size: 18 - token.depth * 2, bold: true })
        break
      }
      case 'paragraph':
        lines.push({ text: token.text, size: 11, bold: false })
        break
      case 'code':
        lines.push({ text: '--- code ---', size: 10, bold: false })
        for (const codeLine of token.text.split('\n')) {
          lines.push({ text: `  ${codeLine}`, size: 9, bold: false })
        }
        lines.push({ text: '--- end code ---', size: 10, bold: false })
        break
      case 'table': {
        if (token.header) {
          lines.push({
            text: token.header.map((c) => c.text).join(' | '),
            size: 10,
            bold: true,
          })
        }
        for (const row of token.rows || []) {
          lines.push({
            text: row.map((c) => c.text).join(' | '),
            size: 10,
            bold: false,
          })
        }
        break
      }
      case 'list':
        for (const item of token.items || []) {
          lines.push({ text: `• ${item.text}`, size: 11, bold: false })
        }
        break
      case 'space':
        lines.push({ text: '', size: 11, bold: false })
        break
      default:
        if (token.text) {
          lines.push({ text: token.text, size: 11, bold: false })
        }
    }
  }

  return lines
}

export function generatePdfBlob(markdown) {
  const lines = parseMarkdownToPdfLines(markdown)
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const lineHeight = 6
  let y = margin

  for (const line of lines) {
    if (y > pageHeight - margin) {
      pdf.addPage()
      y = margin
    }
    pdf.setFontSize(line.size || 11)
    if (line.bold) {
      pdf.setFont('helvetica', 'bold')
    } else {
      pdf.setFont('helvetica', 'normal')
    }
    const splitLines = pdf.splitTextToSize(line.text, pageWidth - margin * 2)
    for (const splitLine of splitLines) {
      if (y > pageHeight - margin) {
        pdf.addPage()
        y = margin
      }
      pdf.text(splitLine, margin, y)
      y += lineHeight
    }
  }

  return pdf.output('blob')
}

export function exportMarkdownToPdf(markdown, filename = 'report.pdf') {
  const blob = generatePdfBlob(markdown)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return { success: true, filename, size: blob.size }
}