import { StreamingTextResponse } from 'ai'
import { GoogleGenerativeAI } from '@google/generative-ai'

import { System01Intake } from '@/prompts/system'

export const runtime = 'edge'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)

export async function POST(req: Request) {
  const json = await req.json()
  const { messages } = json

  // Create an AbortController to handle client disconnections
  const abortController = new AbortController()

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'System instructions: ' + System01Intake }]
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I will ask 2-3 follow-up questions before providing a concise assessment.' }]
        },
        ...messages
          .slice(0, -1)
          .map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          }))
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    })

    const userMessage = messages[messages.length - 1].content

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream(userMessage)
          for await (const chunk of result.stream) {
            if (abortController.signal.aborted) {
              controller.close()
              return
            }
            const text = chunk.text()
            controller.enqueue(new TextEncoder().encode(text))
          }
          controller.close()
        } catch (error: any) {
          // Ignore abort errors - these happen when client disconnects
          if (error?.code === 'ECONNRESET' || error?.name === 'AbortError') {
            console.log('Client disconnected')
            controller.close()
            return
          }
          console.error('Streaming error:', error)
          controller.error(error)
        }
      },
      cancel() {
        abortController.abort()
      }
    })

    return new StreamingTextResponse(readable)
  } catch (error: any) {
    // Ignore connection reset errors
    if (error?.code === 'ECONNRESET') {
      return new Response('Client disconnected', { status: 499 })
    }
    
    // Handle rate limit errors
    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      console.error('Rate limit exceeded:', error)
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment and try again.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    console.error('Chat error:', error)
    return new Response(
      JSON.stringify({ error: 'An error occurred. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
