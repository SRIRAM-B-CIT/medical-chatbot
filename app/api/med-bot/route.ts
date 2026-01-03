import { StreamingTextResponse } from 'ai'
import { GoogleGenerativeAI } from '@google/generative-ai'

import {
  System02PrepareNotes,
  System03Diagnosis,
  System04Clinical,
  System05Referrals
} from '@/prompts/system'
import { BOT_STEPS } from '@/lib/types'

export const runtime = 'edge'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)

interface Message {
  id: string
  role: string
  content: string
}

const convertMessagesToTextBlock = (messages: Message[]): string => {
  return messages.reduce((acc, message) => {
    const prefix = message.role === 'user' ? 'PATIENT: ' : 'INTAKE: '
    return acc
      ? `${acc}\n\n${prefix}${message.content}`
      : `${prefix}${message.content}`
  }, '')
}

export async function POST(req: Request) {
  const json = await req.json()
  const {
    messages,
    step
  }: {
    messages: any
    step: BOT_STEPS
  } = json

  if (!step) {
    return new Response('Missing step', {
      status: 400
    })
  }

  let systemPrompt
  let prompt
  switch (step) {
    case 'PREPARE_NOTES':
      systemPrompt = System02PrepareNotes
      const intakeChatMessage = convertMessagesToTextBlock(messages)
      const intakeChatLog = `<<BEGIN PATIENT INTAKE CHAT>>\n\n${intakeChatMessage}\n\n<<END PATIENT INTAKE CHAT>>`
      prompt = intakeChatLog
      break
    case 'DIAGNOSIS':
      systemPrompt = System03Diagnosis
      const diagnosisMsg = messages.find(
        (message: Message) => message.id === 'PREPARE_NOTES'
      )
      prompt = diagnosisMsg?.content || ''
      break
    case 'CLINICAL':
      systemPrompt = System04Clinical
      const clinicalMsg = messages.find(
        (message: Message) => message.id === 'PREPARE_NOTES'
      )
      prompt = clinicalMsg?.content || ''
      break
    case 'REFERRAL':
      systemPrompt = System05Referrals
      const referralMsg = messages.find(
        (message: Message) => message.id === 'PREPARE_NOTES'
      )
      prompt = referralMsg?.content || ''
      break
    default:
      systemPrompt = System02PrepareNotes
      prompt = ''
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const result = await model.generateContentStream({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `${systemPrompt}\n\n${prompt}`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0,
              maxOutputTokens: 4096
            }
          })

          for await (const chunk of result.stream) {
            const text = chunk.text()
            controller.enqueue(new TextEncoder().encode(text))
          }

          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      }
    })

    return new StreamingTextResponse(readable)
  } catch (error) {
    console.error('Med-bot error:', error)
    return new Response('Error', {
      status: 500
    })
  }
}
