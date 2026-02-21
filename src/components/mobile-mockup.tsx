"use client"

import type { ReactNode } from "react"

interface MobileMockupProps {
  children: ReactNode
}

export function MobileMockup({ children }: MobileMockupProps) {
  return (
    <div className="
      relative z-10 flex min-h-screen items-center justify-center p-8
    ">
      {/* iPhone Frame */}
      <div className="relative">
        {/* Phone Body */}
        <div className="relative rounded-[3rem] bg-black p-2 shadow-2xl">
          {/* Screen */}
          <div className="
            relative h-[812px] w-[375px] overflow-hidden rounded-[2.5rem]
            bg-black
          ">
            {/* Notch */}
            <div className="
              absolute top-0 left-1/2 z-20 h-6 w-36 -translate-x-1/2 transform
              rounded-b-2xl bg-black
            "></div>

            {/* Screen Content */}
            <div className="size-full overflow-hidden bg-gray-900">{children}</div>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="
          absolute bottom-2 left-1/2 h-1 w-32 -translate-x-1/2 transform
          rounded-full bg-gray-600
        "></div>
      </div>
    </div>
  )
}
