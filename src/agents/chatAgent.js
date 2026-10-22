import { chatWithLLM } from '../utils/llmProvider.js'
import { getAppDataSummary } from '../utils/appDataContext.js'
import { useToolsStore } from '../stores/tools.js'
import { buildHistoryMessages } from '../utils/chatHistory.js'

const TODO_REGEX = /\[CREATE_TODO:(\{[^}]+\})\]/g

export function extractTodoCommands(content) {
  const commands = []
  let match
  TODO_REGEX.lastIndex = 0
  while ((match = TODO_REGEX.exec(content)) !== null) {
    try {
      const cmd = JSON.parse(match[1])
      commands.push({
        title: cmd.title || '未命名待办',
        dueDate: cmd.dueDate || '',
        priority: cmd.priority || '',
      })
    } catch (e) {
      // ignore
    }
  }
  const cleanContent = content.replace(TODO_REGEX, '').trim()
  return { commands, cleanContent }
}

export async function handle(userInput, context = {}, options = {}) {
  const dataSummary = getAppDataSummary()

  const systemPrompt = `你是一个校园生活智能助手，同时也是通用聊天伙伴。以下是用户当前的应用数据：

${dataSummary}

你的能力：
1. 数据查询：根据上述数据摘要回答用户关于课表、待办、作业、考试、成绩、一卡通、健康等问题
2. 创建待办：当用户表达了要做某事的意图时，创建待办事项
3. 闲聊问答：日常聊天、常识问题、学习建议等
4. 引导补充：当用户表达不完整时，主动询问缺失信息

创建待办指令：
当确定需要创建待办时，在回复末尾另起一行添加指令：
[CREATE_TODO:{"title":"待办标题","dueDate":"YYYY-MM-DD或空","priority":"high/medium/low或空"}]

引导规则：
- 用户说"我下午要去跑步"但没说几点 → 询问"下午几点去跑步？"
- 用户表示不清楚或随便 → 不设时间，直接创建待办（dueDate 留空）
- 用户说"帮我记一下"但没说记什么 → 询问"需要记什么内容？"
- 不要过度询问，能合理推断的就直接处理

回复要求：
- 用中文回复
- 查询数据时基于提供的数据摘要，不要编造
- 创建待办后告知用户"已为你创建待办：XXX"
- 语气友好自然，像一个同学在聊天`

  const messages = [
    { role: 'system', content: systemPrompt },
  ]

  messages.push(...buildHistoryMessages(context.history))

  if (context.previousResult) {
    messages.push({ role: 'assistant', content: context.previousResult })
  }

  if (context.fileContent) {
    messages.push({ role: 'user', content: `[文件内容]\n${context.fileContent}\n\n[用户消息]\n${userInput}` })
  } else {
    messages.push({ role: 'user', content: userInput })
  }

  const result = await chatWithLLM(messages, options)
  if (result.error) {
    return { error: result.error, message: result.message }
  }

  const { commands, cleanContent } = extractTodoCommands(result.content || '')

  const createdTodos = []
  if (commands.length > 0) {
    const tools = useToolsStore()
    for (const cmd of commands) {
      const todo = {
        title: cmd.title,
        done: false,
      }
      if (cmd.dueDate) todo.dueDate = cmd.dueDate
      if (cmd.priority) todo.priority = cmd.priority
      tools.addTodo(todo)
      createdTodos.push(cmd)
    }
  }

  return {
    content: cleanContent,
    createdTodos: createdTodos.length > 0 ? createdTodos : undefined,
  }
}