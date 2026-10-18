import { calculateBMI, getBMICategory } from '../src/utils/bmi'

describe('BMI 计算', () => {
  test('calculateBMI: 70kg / 1.75m = 22.86', () => {
    expect(calculateBMI(70, 1.75)).toBe(22.86)
  })

  test('calculateBMI 无效输入返回0', () => {
    expect(calculateBMI(0, 1.75)).toBe(0)
    expect(calculateBMI(70, 0)).toBe(0)
    expect(calculateBMI(70, -1)).toBe(0)
  })

  test('getBMICategory 分类', () => {
    expect(getBMICategory(17)).toBe('偏瘦')
    expect(getBMICategory(22)).toBe('正常')
    expect(getBMICategory(26)).toBe('偏胖')
    expect(getBMICategory(30)).toBe('肥胖')
    expect(getBMICategory(0)).toBe('未知')
  })
})