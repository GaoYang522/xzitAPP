export function buildGradeTrendOption(grades) {
  if (!grades || grades.length === 0) {
    return { title: { text: '暂无成绩数据', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } } }
  }
  const subjects = grades.map((g) => g.subject || g.name || '未知')
  const scores = grades.map((g) => Number(g.score || g.grade || 0))
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: subjects, axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: '分数', min: 0, max: 100 },
    series: [
      {
        name: '成绩',
        type: 'line',
        data: scores,
        smooth: true,
        itemStyle: { color: '#3b82f6' },
        areaStyle: { color: 'rgba(59, 130, 246, 0.1)' },
      },
    ],
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
  }
}

export function buildGpaTrendOption(gpaList) {
  if (!gpaList || gpaList.length === 0) {
    return { title: { text: '暂无GPA数据', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } } }
  }
  const semesters = gpaList.map((g) => g.semester || `学期${g.index || ''}`)
  const gpas = gpaList.map((g) => Number(g.gpa || 0))
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: semesters },
    yAxis: { type: 'value', name: 'GPA', min: 0, max: 4 },
    series: [
      {
        name: 'GPA',
        type: 'bar',
        data: gpas,
        itemStyle: { color: '#8b5cf6' },
      },
    ],
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
  }
}

export function buildExerciseStatsOption(exercises) {
  if (!exercises || exercises.length === 0) {
    return { title: { text: '暂无运动数据', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } } }
  }
  const last7 = exercises.slice(-7)
  const dates = last7.map((e) => (e.date || '').slice(5))
  const durations = last7.map((e) => Number(e.duration || 0))
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value', name: '分钟' },
    series: [
      {
        name: '运动时长',
        type: 'bar',
        data: durations,
        itemStyle: { color: '#10b981' },
      },
    ],
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
  }
}

export function buildMoodTrendOption(moods) {
  if (!moods || moods.length === 0) {
    return { title: { text: '暂无心情数据', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } } }
  }
  const moodMap = { '😊': 5, '🙂': 4, '😐': 3, '😕': 2, '😢': 1 }
  const last7 = moods.slice(-7)
  const dates = last7.map((m) => (m.date || '').slice(5))
  const values = last7.map((m) => moodMap[m.mood] || Number(m.score) || 3)
  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const moodLabels = ['', '😢', '😕', '😐', '🙂', '😊']
        return `${params[0].name}<br/>心情: ${moodLabels[params[0].value] || '😐'}`
      },
    },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value', name: '心情', min: 1, max: 5, axisLabel: { formatter: (v) => ['', '😢', '😕', '😐', '🙂', '😊'][v] || '' } },
    series: [
      {
        name: '心情',
        type: 'line',
        data: values,
        smooth: true,
        itemStyle: { color: '#f59e0b' },
      },
    ],
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
  }
}

export function buildPomodoroStatsOption(sessions) {
  if (!sessions || sessions.length === 0) {
    return { title: { text: '暂无专注数据', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } } }
  }
  const focusSessions = sessions.filter((s) => s.type === 'focus')
  const byDate = {}
  for (const s of focusSessions) {
    const date = (s.completedAt || '').slice(0, 10)
    byDate[date] = (byDate[date] || 0) + (s.duration || 0)
  }
  const sortedDates = Object.keys(byDate).sort().slice(-7)
  const dates = sortedDates.map((d) => d.slice(5))
  const minutes = sortedDates.map((d) => byDate[d])
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value', name: '分钟' },
    series: [
      {
        name: '专注时长',
        type: 'bar',
        data: minutes,
        itemStyle: { color: '#ef4444' },
      },
    ],
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
  }
}