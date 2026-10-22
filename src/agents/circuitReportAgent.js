import { chatWithLLM } from '../utils/llmProvider.js'
import { getAgentById } from './agentConfig.js'
import { exportMarkdownToDocx, generateDocxBlob } from '../utils/exportDocx.js'
import { exportMarkdownToPdf, generatePdfBlob } from '../utils/exportPdf.js'
import { buildHistoryMessages } from '../utils/chatHistory.js'

export async function handle(userInput, context = {}, options = {}) {
  const agent = getAgentById('circuit-report')
  const messages = [
    { role: 'system', content: agent.systemPrompt },
  ]

  messages.push(...buildHistoryMessages(context.history))

  if (context.previousResult) {
    messages.push({ role: 'user', content: `之前的分析结果：\n${context.previousResult}` })
    messages.push({ role: 'user', content: `基于以上背景，请生成电路实验报告：\n${userInput}` })
  } else {
    messages.push({ role: 'user', content: userInput })
  }

  const result = await chatWithLLM(messages, options)
  if (result.error) {
    return { error: result.error, message: result.message }
  }

  return {
    content: result.content,
    agentId: 'circuit-report',
    agentName: agent.shortName,
    canExport: true,
  }
}

export async function exportReport(markdown, format, filename) {
  if (format === 'docx') {
    const name = filename || '电路实验报告.docx'
    return exportMarkdownToDocx(markdown, name)
  } else if (format === 'pdf') {
    const name = filename || '电路实验报告.pdf'
    return exportMarkdownToPdf(markdown, name)
  }
  return { error: 'UNSUPPORTED_FORMAT', message: `不支持的导出格式: ${format}` }
}

export async function generateReportBlob(markdown, format) {
  if (format === 'docx') {
    return generateDocxBlob(markdown)
  } else if (format === 'pdf') {
    return generatePdfBlob(markdown)
  }
  return null
}