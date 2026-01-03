import { UseChatHelpers } from 'ai/react'

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">Welcome to Medi Bot!</h1>
        <p className="mb-4 leading-normal text-muted-foreground">
          I'm here to help you with general health-related questions, symptom
          information, and basic medical guidance. You can ask about common
          illnesses, preventive care, and healthy lifestyle tips.
        </p>
        <p className="mb-4 leading-normal text-muted-foreground">
          To get started enter a medical problem you are currently facing. For
          example: "I have a pain in my head that I keep waking up with each
          day."
        </p>
        <p className="text-xs leading-normal text-muted-foreground">
          This app is for demonstration purposes only and NOT a medical device.
        </p>
      </div>
    </div>
  )
}
