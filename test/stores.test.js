import { setActivePinia, createPinia } from 'pinia'
import { useStudyStore } from '../src/stores/study'
import { useToolsStore } from '../src/stores/tools'
import { useLifeStore } from '../src/stores/life'
import { useClubStore } from '../src/stores/club'
import { useHealthStore } from '../src/stores/health'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('study store', () => {
  test('课程 CRUD', () => {
    const store = useStudyStore()
    store.addCourse({ name: '高数', day: 1 })
    expect(store.courses).toHaveLength(1)
    expect(store.courses[0].name).toBe('高数')
    const id = store.courses[0].id
    store.updateCourse(id, { name: '线性代数' })
    expect(store.courses[0].name).toBe('线性代数')
    store.removeCourse(id)
    expect(store.courses).toHaveLength(0)
  })

  test('作业 CRUD + 完成标记', () => {
    const store = useStudyStore()
    store.addHomework({ subject: '高数', content: '习题1' })
    expect(store.homework).toHaveLength(1)
    const id = store.homework[0].id
    store.toggleHomeworkDone(id)
    expect(store.homework[0].done).toBe(true)
    store.toggleHomeworkDone(id)
    expect(store.homework[0].done).toBe(false)
  })

  test('考试和成绩 CRUD', () => {
    const store = useStudyStore()
    store.addExam({ subject: '高数', date: '2026-12-01' })
    store.addGrade({ subject: '高数', score: 85, credit: 4 })
    expect(store.exams).toHaveLength(1)
    expect(store.grades).toHaveLength(1)
  })
})

describe('tools store', () => {
  test('待办 CRUD + 完成', () => {
    const store = useToolsStore()
    store.addTodo({ title: '买书', priority: 'high' })
    expect(store.todos).toHaveLength(1)
    store.toggleTodoDone(store.todos[0].id)
    expect(store.todos[0].done).toBe(true)
  })

  test('习惯打卡和连续天数', () => {
    const store = useToolsStore()
    store.addHabit({ name: '早起' })
    const id = store.habits[0].id
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    store.toggleHabitCheck(id, todayStr)
    expect(store.habits[0].checkins).toContain(todayStr)
    expect(store.getHabitStreak(id)).toBe(1)
    store.toggleHabitCheck(id, todayStr)
    expect(store.getHabitStreak(id)).toBe(0)
  })
})

describe('life store', () => {
  test('一卡通记账扣减余额', () => {
    const store = useLifeStore()
    store.addCardRecord({ type: 'expense', amount: 10, location: '食堂' })
    expect(store.cardBalance).toBe(-10)
    store.addCardRecord({ type: 'income', amount: 100 })
    expect(store.cardBalance).toBe(90)
  })

  test('删除一卡通记录恢复余额', () => {
    const store = useLifeStore()
    store.addCardRecord({ type: 'expense', amount: 10 })
    const id = store.cardRecords[0].id
    expect(store.cardBalance).toBe(-10)
    store.removeCardRecord(id)
    expect(store.cardBalance).toBe(0)
    expect(store.cardRecords).toHaveLength(0)
  })

  test('快递标记已取', () => {
    const store = useLifeStore()
    store.addPackage({ code: '123', location: '菜鸟驿站' })
    const id = store.packages[0].id
    store.togglePackageTaken(id)
    expect(store.packages[0].taken).toBe(true)
  })
})

describe('club store', () => {
  test('社团/活动/动态 CRUD', () => {
    const store = useClubStore()
    store.addClub({ name: '编程社' })
    store.addActivity({ name: '招新', club: '编程社' })
    store.addPost({ title: '大家好', content: 'test' })
    expect(store.clubs).toHaveLength(1)
    expect(store.activities).toHaveLength(1)
    expect(store.posts).toHaveLength(1)
  })
})

describe('health store', () => {
  test('打卡/体测/运动/心情 CRUD', () => {
    const store = useHealthStore()
    store.addCheckin({ date: '2026-10-16', mood: 4 })
    store.addFitness({ date: '2026-10-16', weight: 70, height: 1.75 })
    store.addExercise({ date: '2026-10-16', type: '跑步', duration: 30 })
    store.addMood({ date: '2026-10-16', mood: 4 })
    expect(store.checkins).toHaveLength(1)
    expect(store.fitness).toHaveLength(1)
    expect(store.exercises).toHaveLength(1)
    expect(store.moods).toHaveLength(1)
  })
})