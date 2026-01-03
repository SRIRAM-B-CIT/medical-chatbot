'use server'

import { type Chat } from '@/lib/types'

// Placeholder functions - no persistence without Redis/Clerk
export async function getChats(userId?: string | null) {
  return []
}

export async function getChat(id: string, userId: string) {
  return null
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  return null
}

export async function clearChats() {
  return null
}

export async function getSharedChat(id: string) {
  return null
}

export async function shareChat(chat: Chat) {
  return null
}
