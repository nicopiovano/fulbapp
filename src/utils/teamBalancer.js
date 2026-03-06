/**
 * Balanceador de equipos por rating de habilidad. Divide en 2 equipos con promedios similares.
 */

/**
 * @typedef {{ id: string, skill: number }} PlayerSkill
 */

/**
 * @param {PlayerSkill[]} players - Lista con id y habilidad (1-5)
 * @returns {{ teamA: PlayerSkill[], teamB: PlayerSkill[], avgA: number, avgB: number }}
 */
export function balanceTeams(players) {
  if (players.length < 2) {
    return {
      teamA: players,
      teamB: [],
      avgA: players[0]?.skill ?? 0,
      avgB: 0,
    }
  }

  const sorted = [...players].sort((a, b) => b.skill - a.skill)
  const teamA = []
  const teamB = []

  for (const p of sorted) {
    const sumA = teamA.reduce((s, x) => s + x.skill, 0)
    const sumB = teamB.reduce((s, x) => s + x.skill, 0)
    if (teamA.length <= teamB.length && sumA <= sumB) {
      teamA.push(p)
    } else {
      teamB.push(p)
    }
  }

  const avgA = teamA.length ? teamA.reduce((s, x) => s + x.skill, 0) / teamA.length : 0
  const avgB = teamB.length ? teamB.reduce((s, x) => s + x.skill, 0) / teamB.length : 0

  return { teamA, teamB, avgA, avgB }
}
