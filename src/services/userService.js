/**
 * Servicio de usuarios. Mock actual; reemplazar por llamadas HTTP a API REST.
 */

import { mockUsers } from '@/mock/mockUsers'

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms))

/**
 * @param {string} id
 * @returns {Promise<import('@/types').User | null>}
 */
export async function getUser(id) {
  await delay()
  return mockUsers.find((u) => u.id === id) ?? null
}

/**
 * @returns {Promise<import('@/types').User[]>}
 */
export async function getUsers() {
  await delay()
  return [...mockUsers]
}

/**
 * @param {string[]} ids
 * @returns {Promise<import('@/types').User[]>}
 */
export async function getUsersByIds(ids) {
  await delay()
  return mockUsers.filter((u) => ids.includes(u.id))
}
