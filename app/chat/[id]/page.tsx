import { type Metadata } from 'next'

import { Chat } from '@/components/chat'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: 'Chat'
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params
  return <Chat id={id} />
}
