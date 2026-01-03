'use server'

import { type Chat, type ServerActionResult } from '@/lib/types'

// Placeholder functions - no persistence without Redis/Clerk
export async function getChats(userId?: string | null): Promise<Chat[]> {
  return []
}

export async function getChat(id: string, userId: string): Promise<Chat | null> {
  return null
}

export async function removeChat({ id, path }: { id: string; path: string }): Promise<void> {
  return
}

export async function clearChats(): Promise<void> {
  return
}

export async function getSharedChat(id: string): Promise<Chat | null> {
  return null
}

export async function shareChat(chat: Chat): ServerActionResult<Chat> {
  return { error: 'Sharing not available' }
}
