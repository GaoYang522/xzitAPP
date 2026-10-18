export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatDateTime(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${formatDate(date)} ${h}:${min}`
}

export function today() {
  return formatDate(new Date())
}

export function daysBetween(date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24))
}

export function isSameDay(date1, date2) {
  return formatDate(date1) === formatDate(date2)
}

export function getWeekday(date = new Date()) {
  const d = new Date(date)
  let w = d.getDay()
  return w === 0 ? 7 : w
}