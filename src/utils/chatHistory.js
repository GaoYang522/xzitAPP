export function buildHistoryMessages(history, maxMessages = 10) {
  if (!history || !Array.isArray(history)) return []
  return history.slice(-maxMessages).map((msg) => ({
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: msg.content,
  }))
}