import type { ReactNode } from "react"

import { DevScrollUnlock } from "@/components/dev/DevScrollUnlock"

export default function DevLayout({ children }: { children: ReactNode }) {
  return <DevScrollUnlock>{children}</DevScrollUnlock>
}
