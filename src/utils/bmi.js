export function calculateBMI(weightKg, heightM) {
  if (!weightKg || !heightM || heightM <= 0) return 0
  return Math.round((weightKg / (heightM * heightM)) * 100) / 100
}

export function getBMICategory(bmi) {
  if (bmi === 0) return '未知'
  if (bmi < 18.5) return '偏瘦'
  if (bmi < 24) return '正常'
  if (bmi < 28) return '偏胖'
  return '肥胖'
}