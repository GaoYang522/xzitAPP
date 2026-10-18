// 节次时间段映射表（典型大学作息时间）
// 每节对应 { start, end } 格式 "HH:MM"
export const SECTION_TIMES = [
  null,
  { start: '08:00', end: '08:45' },
  { start: '08:55', end: '09:40' },
  { start: '10:00', end: '10:45' },
  { start: '10:55', end: '11:40' },
  { start: '14:00', end: '14:45' },
  { start: '14:55', end: '15:40' },
  { start: '16:00', end: '16:45' },
  { start: '16:55', end: '17:40' },
  { start: '19:00', end: '19:45' },
  { start: '19:55', end: '20:40' },
  { start: '21:00', end: '21:45' },
  { start: '21:55', end: '22:40' },
  { start: '22:50', end: '23:35' },
  { start: '23:45', end: '00:30' },
]

// 获取某节次的时间段字符串，如 "08:00-08:45"
export function getSectionTime(section) {
  const t = SECTION_TIMES[section]
  if (!t) return ''
  return `${t.start}-${t.end}`
}