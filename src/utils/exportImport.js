import { useStudyStore } from '../stores/study'
import { useToolsStore } from '../stores/tools'
import { useLifeStore } from '../stores/life'
import { useClubStore } from '../stores/club'
import { useHealthStore } from '../stores/health'
import { useSettingsStore } from '../stores/settings'
import { useAssistantStore } from '../stores/assistant'

export function exportAllData(includeApiKey = false) {
  const study = useStudyStore()
  const tools = useToolsStore()
  const life = useLifeStore()
  const club = useClubStore()
  const health = useHealthStore()
  const settings = useSettingsStore()
  const assistant = useAssistantStore()

  const assistantData = assistant.getSessionsForExport(includeApiKey)

  return {
    version: '2.0.0',
    exportDate: new Date().toISOString(),
    study: {
      courses: study.courses,
      homework: study.homework,
      exams: study.exams,
      grades: study.grades,
    },
    tools: {
      todos: tools.todos,
      notes: tools.notes,
      countdowns: tools.countdowns,
      habits: tools.habits,
    },
    life: {
      cardBalance: life.cardBalance,
      cardRecords: life.cardRecords,
      canteen: life.canteen,
      places: life.places,
      packages: life.packages,
    },
    club: {
      clubs: club.clubs,
      activities: club.activities,
      posts: club.posts,
    },
    health: {
      checkins: health.checkins,
      fitness: health.fitness,
      exercises: health.exercises,
      moods: health.moods,
    },
    settings: {
      theme: settings.theme,
      semesterStart: settings.semesterStart,
      totalWeeks: settings.totalWeeks,
    },
    assistant: assistantData,
  }
}

export function importAllData(data) {
  if (!data || !data.version) throw new Error('无效的备份文件')

  const study = useStudyStore()
  const tools = useToolsStore()
  const life = useLifeStore()
  const club = useClubStore()
  const health = useHealthStore()
  const settings = useSettingsStore()
  const assistant = useAssistantStore()

  if (data.study) {
    study.courses = data.study.courses || []
    study.homework = data.study.homework || []
    study.exams = data.study.exams || []
    study.grades = data.study.grades || []
  }
  if (data.tools) {
    tools.todos = data.tools.todos || []
    tools.notes = data.tools.notes || []
    tools.countdowns = data.tools.countdowns || []
    tools.habits = data.tools.habits || []
  }
  if (data.life) {
    life.cardBalance = data.life.cardBalance || 0
    life.cardRecords = data.life.cardRecords || []
    life.canteen = data.life.canteen || []
    life.places = data.life.places || []
    life.packages = data.life.packages || []
  }
  if (data.club) {
    club.clubs = data.club.clubs || []
    club.activities = data.club.activities || []
    club.posts = data.club.posts || []
  }
  if (data.health) {
    health.checkins = data.health.checkins || []
    health.fitness = data.health.fitness || []
    health.exercises = data.health.exercises || []
    health.moods = data.health.moods || []
  }
  if (data.settings) {
    settings.theme = data.settings.theme || 'light'
    settings.semesterStart = data.settings.semesterStart || ''
    settings.totalWeeks = data.settings.totalWeeks || 20
  }
  if (data.assistant) {
    assistant.restoreFromImport(data.assistant)
  }
}

export function clearModule(moduleName) {
  const study = useStudyStore()
  const tools = useToolsStore()
  const life = useLifeStore()
  const club = useClubStore()
  const health = useHealthStore()
  const assistant = useAssistantStore()

  switch (moduleName) {
    case 'study':
      study.courses = []
      study.homework = []
      study.exams = []
      study.grades = []
      break
    case 'tools':
      tools.todos = []
      tools.notes = []
      tools.countdowns = []
      tools.habits = []
      break
    case 'life':
      life.cardBalance = 0
      life.cardRecords = []
      life.canteen = []
      life.places = []
      life.packages = []
      break
    case 'club':
      club.clubs = []
      club.activities = []
      club.posts = []
      break
    case 'health':
      health.checkins = []
      health.fitness = []
      health.exercises = []
      health.moods = []
      break
    case 'assistant':
      assistant.clearAllSessions()
      break
  }
}

export function clearAll() {
  clearModule('study')
  clearModule('tools')
  clearModule('life')
  clearModule('club')
  clearModule('health')
  clearModule('assistant')
}

export function generateBackupFilename() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  return `campus-app-backup-${y}${m}${d}-${h}${min}.json`
}

export function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}