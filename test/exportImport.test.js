import { setActivePinia, createPinia } from 'pinia'
import {
  exportAllData,
  importAllData,
  clearModule,
  clearAll,
  generateBackupFilename,
} from '../src/utils/exportImport'
import { useStudyStore } from '../src/stores/study'
import { useToolsStore } from '../src/stores/tools'
import { useLifeStore } from '../src/stores/life'
import { useSettingsStore } from '../src/stores/settings'
import { useAssistantStore } from '../src/stores/assistant'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('exportAllData 导出', () => {
  test('导出包含所有模块数据', () => {
    const study = useStudyStore()
    study.addCourse({ name: '高数', day: 1 })
    study.addHomework({ subject: '高数', content: '习题1' })

    const data = exportAllData()
    expect(data.version).toBe('2.0.0')
    expect(data.study.courses).toHaveLength(1)
    expect(data.study.homework).toHaveLength(1)
  })

  test('导出包含设置', () => {
    const settings = useSettingsStore()
    settings.setSemesterStart('2026-09-01')
    settings.setTotalWeeks(18)

    const data = exportAllData()
    expect(data.settings.semesterStart).toBe('2026-09-01')
    expect(data.settings.totalWeeks).toBe(18)
  })
})

describe('importAllData 导入', () => {
  test('导入恢复所有数据', () => {
    const data = {
      version: '1.0.0',
      study: { courses: [{ id: '1', name: '高数' }], homework: [], exams: [], grades: [] },
      tools: { todos: [], notes: [], countdowns: [], habits: [] },
      life: { cardBalance: 100, cardRecords: [], canteen: [], places: [], packages: [] },
      club: { clubs: [], activities: [], posts: [] },
      health: { checkins: [], fitness: [], exercises: [], moods: [] },
      settings: { theme: 'dark', semesterStart: '2026-09-01', totalWeeks: 18 },
    }

    importAllData(data)

    const study = useStudyStore()
    expect(study.courses).toHaveLength(1)
    expect(study.courses[0].name).toBe('高数')

    const life = useLifeStore()
    expect(life.cardBalance).toBe(100)

    const settings = useSettingsStore()
    expect(settings.theme).toBe('dark')
    expect(settings.semesterStart).toBe('2026-09-01')
    expect(settings.totalWeeks).toBe(18)
  })

  test('无效文件抛出错误', () => {
    expect(() => importAllData(null)).toThrow('无效的备份文件')
    expect(() => importAllData({})).toThrow('无效的备份文件')
  })
})

describe('clearModule 清空模块', () => {
  test('清空学业模块', () => {
    const study = useStudyStore()
    study.addCourse({ name: '高数' })
    study.addHomework({ subject: '高数' })
    expect(study.courses).toHaveLength(1)

    clearModule('study')
    expect(study.courses).toHaveLength(0)
    expect(study.homework).toHaveLength(0)
  })

  test('清空工具模块', () => {
    const tools = useToolsStore()
    tools.addTodo({ title: 'test' })
    clearModule('tools')
    expect(tools.todos).toHaveLength(0)
  })

  test('清空生活模块', () => {
    const life = useLifeStore()
    life.addCardRecord({ type: 'expense', amount: 10 })
    clearModule('life')
    expect(life.cardRecords).toHaveLength(0)
    expect(life.cardBalance).toBe(0)
  })

  test('清空不影响其他模块', () => {
    const study = useStudyStore()
    const tools = useToolsStore()
    study.addCourse({ name: '高数' })
    tools.addTodo({ title: 'test' })

    clearModule('study')
    expect(study.courses).toHaveLength(0)
    expect(tools.todos).toHaveLength(1)
  })
})

describe('clearAll 清空所有', () => {
  test('清空所有模块数据', () => {
    const study = useStudyStore()
    const tools = useToolsStore()
    const life = useLifeStore()
    study.addCourse({ name: '高数' })
    tools.addTodo({ title: 'test' })
    life.addCardRecord({ type: 'expense', amount: 10 })

    clearAll()
    expect(study.courses).toHaveLength(0)
    expect(tools.todos).toHaveLength(0)
    expect(life.cardRecords).toHaveLength(0)
  })
})

describe('generateBackupFilename', () => {
  test('生成带时间戳的文件名', () => {
    const filename = generateBackupFilename()
    expect(filename).toMatch(/^campus-app-backup-\d{8}-\d{4}\.json$/)
  })
})

describe('导出导入闭环', () => {
  test('导出后导入数据一致', () => {
    const study = useStudyStore()
    study.addCourse({ name: '高数', day: 1, startSection: 1, endSection: 2, location: '教1', startWeek: 1, endWeek: 16, color: 'blue' })
    study.addHomework({ subject: '高数', content: '习题1', priority: 'high', done: false })

    const tools = useToolsStore()
    tools.addTodo({ title: '买书', priority: 'high' })

    const data = exportAllData()

    clearAll()
    const studyAfter = useStudyStore()
    expect(studyAfter.courses).toHaveLength(0)

    importAllData(data)
    const studyFinal = useStudyStore()
    expect(studyFinal.courses).toHaveLength(1)
    expect(studyFinal.courses[0].name).toBe('高数')
    expect(studyFinal.homework).toHaveLength(1)

    const toolsFinal = useToolsStore()
    expect(toolsFinal.todos).toHaveLength(1)
    expect(toolsFinal.todos[0].title).toBe('买书')
  })
})
describe('assistant 数据导出', () => {
  test('导出包含 assistant 模块数据', () => {
    const assistant = useAssistantStore()
    const session = assistant.createSession()
    session.messages.push({ role: 'user', content: '测试消息', timestamp: new Date().toISOString() })

    const data = exportAllData()
    expect(data.assistant).toBeDefined()
    expect(data.assistant.sessions).toHaveLength(1)
    expect(data.assistant.sessions[0].messages).toHaveLength(1)
  })

  test('默认导出不包含 API Key', () => {
    const assistant = useAssistantStore()
    assistant.setApiConfig({ llmApiKey: 'sk-secret-key', compileApiKey: 'compile-secret' })

    const data = exportAllData()
    expect(data.assistant.apiConfig.llmApiKey).toBe('')
    expect(data.assistant.apiConfig.compileApiKey).toBe('')
  })

  test('includeApiKey=true 时导出包含 API Key', () => {
    const assistant = useAssistantStore()
    assistant.setApiConfig({ llmApiKey: 'sk-secret-key', compileApiKey: 'compile-secret' })

    const data = exportAllData(true)
    expect(data.assistant.apiConfig.llmApiKey).toBe('sk-secret-key')
    expect(data.assistant.apiConfig.compileApiKey).toBe('compile-secret')
  })

  test('导出包含 currentSessionId', () => {
    const assistant = useAssistantStore()
    const session = assistant.createSession()

    const data = exportAllData()
    expect(data.assistant.currentSessionId).toBe(session.id)
  })
})

describe('assistant 数据导入', () => {
  test('导入恢复 assistant 会话数据', () => {
    const data = {
      version: '2.0.0',
      assistant: {
        sessions: [{ id: 's1', title: '测试会话', messages: [], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }],
        currentSessionId: 's1',
        apiConfig: { llmProvider: 'deepseek', llmApiKey: '', llmBaseUrl: 'https://api.deepseek.com', llmModel: 'deepseek-chat', compileApiUrl: '', compileApiKey: '' },
      },
    }

    importAllData(data)
    const assistant = useAssistantStore()
    expect(assistant.sessions).toHaveLength(1)
    expect(assistant.sessions[0].title).toBe('测试会话')
    expect(assistant.currentSessionId).toBe('s1')
  })

  test('导入恢复 assistant API 配置', () => {
    const data = {
      version: '2.0.0',
      assistant: {
        sessions: [],
        currentSessionId: null,
        apiConfig: { llmProvider: 'deepseek', llmApiKey: 'sk-restored', llmBaseUrl: 'https://api.deepseek.com', llmModel: 'deepseek-chat', compileApiUrl: 'http://compile.api', compileApiKey: 'ck-restored' },
      },
    }

    importAllData(data)
    const assistant = useAssistantStore()
    expect(assistant.apiConfig.llmApiKey).toBe('sk-restored')
    expect(assistant.apiConfig.compileApiKey).toBe('ck-restored')
  })

  test('无 assistant 数据时导入不报错', () => {
    const data = { version: '2.0.0' }
    expect(() => importAllData(data)).not.toThrow()
  })
})

describe('clearModule assistant', () => {
  test('清空 assistant 模块', () => {
    const assistant = useAssistantStore()
    assistant.createSession()
    assistant.createSession()
    expect(assistant.sessions).toHaveLength(2)

    clearModule('assistant')
    expect(assistant.sessions).toHaveLength(0)
    expect(assistant.currentSessionId).toBeNull()
  })

  test('清空 assistant 不影响其他模块', () => {
    const study = useStudyStore()
    const assistant = useAssistantStore()
    study.addCourse({ name: '高数' })
    assistant.createSession()

    clearModule('assistant')
    expect(assistant.sessions).toHaveLength(0)
    expect(study.courses).toHaveLength(1)
  })
})

describe('clearAll 包含 assistant', () => {
  test('clearAll 清空 assistant 数据', () => {
    const assistant = useAssistantStore()
    const study = useStudyStore()
    assistant.createSession()
    study.addCourse({ name: '高数' })

    clearAll()
    expect(assistant.sessions).toHaveLength(0)
    expect(study.courses).toHaveLength(0)
  })
})

describe('assistant 导出导入闭环', () => {
  test('assistant 数据导出后导入一致', () => {
    const assistant = useAssistantStore()
    assistant.setApiConfig({ llmApiKey: 'sk-test', llmModel: 'deepseek-chat' })
    const session = assistant.createSession()
    session.messages.push({ role: 'user', content: '你好', timestamp: '2026-01-01T00:00:00Z' })
    session.messages.push({ role: 'assistant', content: '你好！', timestamp: '2026-01-01T00:00:01Z' })

    const data = exportAllData(true)

    clearAll()
    const assistantCleared = useAssistantStore()
    expect(assistantCleared.sessions).toHaveLength(0)

    importAllData(data)
    const assistantFinal = useAssistantStore()
    expect(assistantFinal.sessions).toHaveLength(1)
    expect(assistantFinal.sessions[0].title).toBe(session.title)
    expect(assistantFinal.sessions[0].messages).toHaveLength(2)
    expect(assistantFinal.sessions[0].messages[0].content).toBe('你好')
    expect(assistantFinal.apiConfig.llmApiKey).toBe('sk-test')
  })

  test('不含 API Key 导出后导入不恢复密钥', () => {
    const assistant = useAssistantStore()
    assistant.setApiConfig({ llmApiKey: 'sk-secret' })
    assistant.createSession()

    const data = exportAllData(false)

    clearAll()
    importAllData(data)
    const assistantFinal = useAssistantStore()
    expect(assistantFinal.sessions).toHaveLength(1)
    expect(assistantFinal.apiConfig.llmApiKey).toBe('')
  })
})