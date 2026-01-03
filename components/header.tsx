import * as React from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import Image from 'next/image'

export async function Header() {

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-gradient-to-b from-background/10 via-background/50 to-background/80 px-4 backdrop-blur-xl">
      <div className="flex items-center">
        <Link href="/" target="_blank" rel="nofollow">
          <Image src="/med-bot.png" alt="Medi Bot" width={40} height={48} />
        </Link>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <ThemeToggle />
      </div>
    </header>
  )
}
