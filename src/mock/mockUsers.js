/**
 * Usuarios mock. Reemplazar por llamadas a API (userService).
 */

/** @type {import('@/types').User[]} */
export const mockUsers = [
  {
    id: 'u1',
    name: 'Martín García',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=martin',
    age: 28,
    position: 'mediocampista',
    ratings: {
      habilidad: 4.2,
      puntualidad: 4.8,
      asistencia: 4.5,
      amabilidad: 4.9,
      fair_play: 4.7,
    },
  },
  {
    id: 'u2',
    name: 'Laura Fernández',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=laura',
    age: 25,
    position: 'delantero',
    ratings: {
      habilidad: 4.5,
      puntualidad: 4.2,
      asistencia: 4.0,
      amabilidad: 4.8,
      fair_play: 4.6,
    },
  },
  {
    id: 'u3',
    name: 'Carlos López',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
    age: 32,
    position: 'arquero',
    ratings: {
      habilidad: 4.0,
      puntualidad: 5.0,
      asistencia: 4.9,
      amabilidad: 4.3,
      fair_play: 4.5,
    },
  },
  {
    id: 'u4',
    name: 'Ana Martínez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
    age: 27,
    position: 'defensor',
    ratings: {
      habilidad: 3.8,
      puntualidad: 4.6,
      asistencia: 4.4,
      amabilidad: 4.7,
      fair_play: 4.9,
    },
  },
  {
    id: 'u5',
    name: 'Diego Rodríguez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diego',
    age: 30,
    position: 'mediocampista',
    ratings: {
      habilidad: 4.6,
      puntualidad: 3.9,
      asistencia: 4.2,
      amabilidad: 4.4,
      fair_play: 4.1,
    },
  },
  {
    id: 'u6',
    name: 'Sofía Pérez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia',
    age: 24,
    position: 'delantero',
    ratings: {
      habilidad: 4.3,
      puntualidad: 4.7,
      asistencia: 4.8,
      amabilidad: 5.0,
      fair_play: 4.8,
    },
  },
  {
    id: 'mock-current',
    name: 'Yo (Usuario actual)',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
    age: 26,
    position: 'defensor',
    ratings: {
      habilidad: 4.0,
      puntualidad: 4.5,
      asistencia: 4.3,
      amabilidad: 4.6,
      fair_play: 4.4,
    },
  },
]
