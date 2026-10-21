import { useStudyStore } from '../stores/study'
import { useToolsStore } from '../stores/tools'
import { useLifeStore } from '../stores/life'
import { useClubStore } from '../stores/club'
import { useHealthStore } from '../stores/health'
import { useSettingsStore } from '../stores/settings'

export function getDayOfWeek(date = new Date()) {
  const day = date.getDay()
  return day === 0 ? 7 : day
}

export function getCurrentWeek(semesterStart, date = new Date()) {
  if (!semesterStart) return null
  const start = new Date(semesterStart)
  if (isNaN(start.getTime())) return null
  const diffMs = date.getTime() - start.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const week = Math.floor(diffDays / 7) + 1
  return week < 1 ? null : week
}

export function getTodayCourses(courses, date = new Date(), semesterStart = '', totalWeeks = 20) {
  const dayOfWeek = getDayOfWeek(date)
  const currentWeek = getCurrentWeek(semesterStart, date)
  return courses.filter((c) => {
    if (c.day !== dayOfWeek) return false
    if (currentWeek && c.startWeek && c.endWeek) {
      return currentWeek >= c.startWeek && currentWeek <= c.endWeek
    }
    return true
  })
}

export function formatCourseList(courses) {
  if (courses.length === 0) return '今天没有课'
  return courses
    .map((c) => {
      const sections = c.startSection && c.endSection ? `第${c.startSection}-${c.endSection}节` : ''
      const location = c.location ? ` @ ${c.location}` : ''
      const teacher = c.teacher ? ` (${c.teacher})` : ''
      return `- ${c.name} ${sections}${location}${teacher}`
    })
    .join('\n')
}

export function formatTodoList(todos) {
  const pending = todos.filter((t) => !t.done)
  if (pending.length === 0) return '没有待完成的待办'
  return pending
    .map((t) => {
      const priority = t.priority ? `[${t.priority}]` : ''
      const dueDate = t.dueDate ? ` (截止: ${t.dueDate})` : ''
      return `- ${t.title} ${priority}${dueDate}`
    })
    .join('\n')
}

export function formatExamList(exams, date = new Date()) {
  const todayStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  const upcoming = exams.filter((e) => e.date && e.date >= todayStr)
  if (upcoming.length === 0) return '没有即将到来的考试'
  return upcoming
    .map((e) => `- ${e.name || e.subject || '未命名'} ${e.date ? `(${e.date})` : ''}`)
    .join('\n')
}

export function formatHomeworkList(homework) {
  const pending = homework.filter((h) => !h.done)
  if (pending.length === 0) return '没有待完成的作业'
  return pending
    .map((h) => {
      const dueDate = h.dueDate ? ` (截止: ${h.dueDate})` : ''
      return `- ${h.subject || ''} ${h.content || ''}${dueDate}`
    })
    .join('\n')
}

export function formatGradeList(grades) {
  if (grades.length === 0) return '暂无成绩记录'
  return grades
    .map((g) => `- ${g.subject || g.name || '未命名'}: ${g.score || g.grade || '未知'}`)
    .join('\n')
}

export function formatLifeSummary(lifeStore) {
  const parts = []
  parts.push(`一卡通余额: ${lifeStore.cardBalance} 元`)
  if (lifeStore.packages.length > 0) {
    const unclaimed = lifeStore.packages.filter((p) => !p.taken)
    parts.push(`快递: ${unclaimed.length} 个未取`)
  }
  return parts.join('\n')
}

export function formatHealthSummary(healthStore) {
  const parts = []
  parts.push(`健康打卡: ${healthStore.checkins.length} 次`)
  parts.push(`运动记录: ${healthStore.exercises.length} 条`)
  parts.push(`心情记录: ${healthStore.moods.length} 条`)
  return parts.join('\n')
}

export function buildAppDataSummary(stores) {
  const {
    study,
    tools,
    life,
    club,
    health,
    settings,
  } = stores

  const date = new Date()
  const currentWeek = getCurrentWeek(settings.semesterStart, date)
  const todayCourses = getTodayCourses(study.courses, date, settings.semesterStart, settings.totalWeeks)

  const lines = []
  lines.push('=== 当前应用数据摘要 ===')
  lines.push(`当前时间: ${date.toLocaleString('zh-CN')}`)
  if (currentWeek) {
    lines.push(`当前周次: 第 ${currentWeek} 周 (共 ${settings.totalWeeks} 周)`)
  }
  lines.push('')
  lines.push('--- 今日课程 ---')
  lines.push(formatCourseList(todayCourses))
  lines.push('')
  lines.push('--- 待办事项 ---')
  lines.push(formatTodoList(tools.todos))
  lines.push('')
  lines.push('--- 待完成作业 ---')
  lines.push(formatHomeworkList(study.homework))
  lines.push('')
  lines.push('--- 即将到来的考试 ---')
  lines.push(formatExamList(study.exams, date))
  lines.push('')
  lines.push('--- 成绩记录 ---')
  lines.push(formatGradeList(study.grades))
  lines.push('')
  lines.push('--- 校园生活 ---')
  lines.push(formatLifeSummary(life))
  lines.push('')
  lines.push('--- 健康管理 ---')
  lines.push(formatHealthSummary(health))
  lines.push('')
  lines.push('--- 社团活动 ---')
  lines.push(club.activities.length > 0 ? `${club.activities.length} 个活动` : '暂无社团活动')

  return lines.join('\n')
}

export function getAppDataSummary() {
  return buildAppDataSummary({
    study: useStudyStore(),
    tools: useToolsStore(),
    life: useLifeStore(),
    club: useClubStore(),
    health: useHealthStore(),
    settings: useSettingsStore(),
  })
}