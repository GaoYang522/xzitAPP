export function getFileType(file) {
  const name = (file.name || '').toLowerCase()
  const mime = file.type || ''
  if (mime.startsWith('image/') || /\.(png|jpg|jpeg|gif|bmp|webp)$/.test(name)) return 'image'
  if (mime === 'application/pdf' || name.endsWith('.pdf')) return 'pdf'
  if (name.endsWith('.docx') || name.endsWith('.doc')) return 'word'
  if (name.endsWith('.txt') || name.endsWith('.md') || mime.startsWith('text/')) return 'text'
  return 'unknown'
}

export async function parseText(file) {
  const buffer = await file.arrayBuffer()
  const content = new TextDecoder().decode(buffer)
  return { type: 'text', content, fileName: file.name, fileSize: file.size }
}

export async function parseImage(file) {
  const Tesseract = await import('tesseract.js')
  const result = await Tesseract.recognize(file, 'chi_sim+eng')
  return {
    type: 'image',
    content: result.data.text || '',
    fileName: file.name,
    fileSize: file.size,
  }
}

export async function parsePdf(file) {
  const pdfjsLib = await import('pdfjs-dist')
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.mjs?url')).default
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
  const pdf = await loadingTask.promise

  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    text += textContent.items.map((item) => item.str).join(' ') + '\n'
  }

  return { type: 'pdf', content: text.trim(), fileName: file.name, fileSize: file.size }
}

export async function parseWord(file) {
  const mammoth = await import('mammoth/mammoth.browser.js')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return {
    type: 'word',
    content: result.value || '',
    fileName: file.name,
    fileSize: file.size,
  }
}

export async function parseFile(file) {
  const type = getFileType(file)
  try {
    switch (type) {
      case 'image':
        return await parseImage(file)
      case 'pdf':
        return await parsePdf(file)
      case 'word':
        return await parseWord(file)
      case 'text':
        return await parseText(file)
      default:
        return {
          type: 'unknown',
          content: '',
          fileName: file.name,
          fileSize: file.size,
          error: '不支持的文件类型，支持图片、PDF、Word、文本',
        }
    }
  } catch (e) {
    return {
      type,
      content: '',
      fileName: file.name,
      fileSize: file.size,
      error: `文件解析失败: ${e.message}`,
    }
  }
}