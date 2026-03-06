/**
 * Valoraciones mock. Reemplazar por llamadas a API (ratingService).
 */

/** @type {import('@/types').Rating[]} */
export const mockRatings = [
  {
    id: 'r1',
    fromUserId: 'u1',
    toUserId: 'u2',
    matchId: 'm1',
    scores: {
      habilidad: 5,
      puntualidad: 4,
      asistencia: 5,
      amabilidad: 5,
      fair_play: 4,
    },
    createdAt: '2025-02-20T20:00:00Z',
  },
  {
    id: 'r2',
    fromUserId: 'u2',
    toUserId: 'u1',
    matchId: 'm1',
    scores: {
      habilidad: 4,
      puntualidad: 5,
      asistencia: 4,
      amabilidad: 5,
      fair_play: 5,
    },
    createdAt: '2025-02-20T20:05:00Z',
  },
]
