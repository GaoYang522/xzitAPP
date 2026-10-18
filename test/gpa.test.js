import { calculateGPA, calculateWeightedAvg, scoreToGradePoint } from '../src/utils/gpa'

describe('GPA 计算', () => {
  test('scoreToGradePoint 绩点转换', () => {
    expect(scoreToGradePoint(95)).toBe(4.0)
    expect(scoreToGradePoint(90)).toBe(4.0)
    expect(scoreToGradePoint(85)).toBe(3.7)
    expect(scoreToGradePoint(80)).toBe(3.0)
    expect(scoreToGradePoint(60)).toBe(1.0)
    expect(scoreToGradePoint(59)).toBe(0.0)
  })

  test('calculateGPA: 80分3学分 + 90分2学分 = 3.4', () => {
    expect(calculateGPA([{ score: 80, credit: 3 }, { score: 90, credit: 2 }])).toBe(3.4)
  })

  test('calculateGPA 空数组返回0', () => {
    expect(calculateGPA([])).toBe(0)
    expect(calculateGPA(null)).toBe(0)
  })

  test('calculateWeightedAvg: 80分3学分 + 90分2学分 = 84', () => {
    expect(calculateWeightedAvg([{ score: 80, credit: 3 }, { score: 90, credit: 2 }])).toBe(84)
  })
})