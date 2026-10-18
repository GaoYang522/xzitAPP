function scoreToGradePoint(score) {
  if (score >= 90) return 4.0
  if (score >= 85) return 3.7
  if (score >= 82) return 3.3
  if (score >= 78) return 3.0
  if (score >= 75) return 2.7
  if (score >= 72) return 2.3
  if (score >= 68) return 2.0
  if (score >= 64) return 1.5
  if (score >= 60) return 1.0
  return 0.0
}

export function calculateGPA(grades) {
  if (!grades || grades.length === 0) return 0
  let totalPoints = 0
  let totalCredits = 0
  for (const g of grades) {
    const gp = scoreToGradePoint(g.score)
    totalPoints += gp * g.credit
    totalCredits += g.credit
  }
  if (totalCredits === 0) return 0
  return Math.round((totalPoints / totalCredits) * 100) / 100
}

export function calculateWeightedAvg(grades) {
  if (!grades || grades.length === 0) return 0
  let totalScore = 0
  let totalCredits = 0
  for (const g of grades) {
    totalScore += g.score * g.credit
    totalCredits += g.credit
  }
  if (totalCredits === 0) return 0
  return Math.round((totalScore / totalCredits) * 100) / 100
}

export { scoreToGradePoint }