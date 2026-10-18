import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import Study from '../src/views/Study.vue'
import CourseManager from '../src/components/study/CourseManager.vue'
import HomeworkManager from '../src/components/study/HomeworkManager.vue'
import ExamManager from '../src/components/study/ExamManager.vue'
import GradeManager from '../src/components/study/GradeManager.vue'
import { useStudyStore } from '../src/stores/study'
import { useSettingsStore } from '../src/stores/settings'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

function setSemester() {
  const settings = useSettingsStore()
  const past = new Date()
  past.setDate(past.getDate() - 7)
  settings.semesterStart = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`
}

describe('Study 页面', () => {
  test('渲染 4 个标签', () => {
    const wrapper = mount(Study)
    expect(wrapper.text()).toContain('课表')
    expect(wrapper.text()).toContain('作业')
    expect(wrapper.text()).toContain('考试')
    expect(wrapper.text()).toContain('成绩')
  })

  test('默认显示课表管理', () => {
    const wrapper = mount(Study)
    expect(wrapper.findComponent(CourseManager).exists()).toBe(true)
  })
})

describe('CourseManager 课表管理', () => {
  test('空状态显示提示', () => {
    const wrapper = mount(CourseManager)
    expect(wrapper.text()).toContain('还没有课程')
  })

  test('课程显示在课表中', () => {
    setSemester()
    const store = useStudyStore()
    store.addCourse({ name: '高数', day: 1, startSection: 1, endSection: 2, location: '教1', startWeek: 1, endWeek: 16, color: 'blue' })
    const wrapper = mount(CourseManager)
    expect(wrapper.text()).toContain('高数')
  })

  test('课表渲染14节（支持第13、14节）', () => {
    setSemester()
    const store = useStudyStore()
    store.addCourse({ name: '晚自习', day: 1, startSection: 13, endSection: 14, location: '图书馆', startWeek: 1, endWeek: 16, color: 'blue' })
    const wrapper = mount(CourseManager)
    expect(wrapper.text()).toContain('晚自习')
    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(14)
  })

  test('location为空时显示未排地点', () => {
    setSemester()
    const store = useStudyStore()
    store.addCourse({ name: '大学生心理健康教育', day: 1, startSection: 12, endSection: 12, location: '', startWeek: 1, endWeek: 16, color: 'blue' })
    const wrapper = mount(CourseManager)
    expect(wrapper.text()).toContain('大学生心理健康教育')
    expect(wrapper.text()).toContain('未排地点')
  })
})

describe('HomeworkManager 作业管理', () => {
  test('空状态显示提示', () => {
    const wrapper = mount(HomeworkManager)
    expect(wrapper.text()).toContain('没有作业')
  })

  test('作业列表显示内容', () => {
    const store = useStudyStore()
    store.addHomework({ subject: '高数', content: '习题1', priority: 'high' })
    const wrapper = mount(HomeworkManager)
    expect(wrapper.text()).toContain('高数')
    expect(wrapper.text()).toContain('习题1')
  })

  test('作业筛选按科目', () => {
    const store = useStudyStore()
    store.addHomework({ subject: '高数', content: '习题1', priority: 'medium' })
    store.addHomework({ subject: '英语', content: '作文', priority: 'low' })
    const wrapper = mount(HomeworkManager)
    expect(wrapper.text()).toContain('高数')
    expect(wrapper.text()).toContain('英语')
  })
})

describe('ExamManager 考试管理', () => {
  test('空状态显示提示', () => {
    const wrapper = mount(ExamManager)
    expect(wrapper.text()).toContain('没有考试安排')
  })

  test('考试显示倒计时', () => {
    const store = useStudyStore()
    store.addExam({ subject: '高数', date: '2026-12-01', location: '教1' })
    const wrapper = mount(ExamManager)
    expect(wrapper.text()).toContain('高数')
    expect(wrapper.text()).toContain('天')
  })
})

describe('GradeManager 成绩管理', () => {
  test('空状态显示提示', () => {
    const wrapper = mount(GradeManager)
    expect(wrapper.text()).toContain('还没有成绩记录')
  })

  test('显示成绩和GPA', () => {
    const store = useStudyStore()
    store.addGrade({ subject: '高数', score: 85, credit: 4 })
    store.addGrade({ subject: '英语', score: 90, credit: 2 })
    const wrapper = mount(GradeManager)
    expect(wrapper.text()).toContain('高数')
    expect(wrapper.text()).toContain('英语')
    expect(wrapper.text()).toContain('GPA')
  })
})