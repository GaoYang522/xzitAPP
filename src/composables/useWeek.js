import { formatDate, daysBetween } from './useDate'

export function getCurrentWeek(semesterStart, totalWeeks = 20) {
  if (!semesterStart) return null
  const start = new Date(semesterStart)
  if (isNaN(start.getTime())) return null
  const todayStr = formatDate(new Date())
  const diff = daysBetween(semesterStart, todayStr)
  if (diff < 0) return null
  const week = Math.floor(diff / 7) + 1
  if (week > totalWeeks) return null
  return week
}

export function isCourseInWeek(course, currentWeek) {
  if (!currentWeek) return false
  return currentWeek >= course.startWeek && currentWeek <= course.endWeek
}