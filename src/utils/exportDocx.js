import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  WidthType,
  AlignmentType,
} from 'docx'
import { saveAs } from 'file-saver'
import { marked } from 'marked'

export function parseMarkdownToElements(markdown) {
  const tokens = marked.lexer(markdown)
  const elements = []

  for (const token of tokens) {
    switch (token.type) {
      case 'heading':
        elements.push(
          new Paragraph({
            text: token.text,
            heading:
              token.depth === 1
                ? HeadingLevel.HEADING_1
                : token.depth === 2
                  ? HeadingLevel.HEADING_2
                  : token.depth === 3
                    ? HeadingLevel.HEADING_3
                    : HeadingLevel.HEADING_4,
          })
        )
        break
      case 'paragraph':
        elements.push(
          new Paragraph({
            children: [new TextRun({ text: token.text })],
          })
        )
        break
      case 'code':
        elements.push(
          new Paragraph({
            children: [new TextRun({ text: token.text, font: 'Consolas' })],
            spacing: { before: 100, after: 100 },
          })
        )
        break
      case 'table': {
        const rows = []
        if (token.header) {
          rows.push(
            new TableRow({
              children: token.header.map(
                (cell) =>
                  new TableCell({
                    children: [new Paragraph({ text: cell.text, bold: true })],
                    width: { size: Math.floor(100 / token.header.length), type: WidthType.PERCENTAGE },
                  })
              ),
            })
          )
        }
        for (const row of token.rows || []) {
          rows.push(
            new TableRow({
              children: row.map(
                (cell) =>
                  new TableCell({
                    children: [new Paragraph({ text: cell.text })],
                  })
              ),
            })
          )
        }
        if (rows.length > 0) {
          elements.push(new Table({ rows }))
        }
        break
      }
      case 'list':
        for (const item of token.items || []) {
          elements.push(
            new Paragraph({
              children: [new TextRun({ text: `• ${item.text}` })],
              spacing: { after: 40 },
            })
          )
        }
        break
      case 'space':
        elements.push(new Paragraph({ text: '' }))
        break
      default:
        if (token.text) {
          elements.push(new Paragraph({ children: [new TextRun({ text: token.text })] }))
        }
    }
  }

  return elements
}

export async function exportMarkdownToDocx(markdown, filename = 'report.docx') {
  const elements = parseMarkdownToElements(markdown)
  const doc = new Document({
    sections: [
      {
        children: elements,
      },
    ],
  })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, filename)
  return { success: true, filename, size: blob.size }
}

export async function generateDocxBlob(markdown) {
  const elements = parseMarkdownToElements(markdown)
  const doc = new Document({
    sections: [{ children: elements }],
  })
  return Packer.toBlob(doc)
}