"use client"

import { useEffect } from "react"
import type { ReactNode } from "react"

export function DevScrollUnlock({ children }: { children: ReactNode }) {
  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousBodyOverflow = document.body.style.overflow
    const previousBodyOverflowY = document.body.style.overflowY

    document.documentElement.style.overflow = "auto"
    document.body.style.overflow = "auto"
    document.body.style.overflowY = "auto"

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousBodyOverflow
      document.body.style.overflowY = previousBodyOverflowY
    }
  }, [])

  return <>{children}</>
}
