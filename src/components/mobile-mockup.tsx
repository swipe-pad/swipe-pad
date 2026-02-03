"use client"

import type { ReactNode } from "react"

interface MobileMockupProps {
  children: ReactNode
}

export function MobileMockup({ children }: MobileMockupProps) {
  return (
    <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
      {/* iPhone Frame */}
      <div className="relative">
        {/* Phone Body */}
        <div className="relative bg-black rounded-[3rem] p-2 shadow-2xl">
          {/* Screen */}
          <div className="bg-black rounded-[2.5rem] overflow-hidden w-[375px] h-[812px] relative">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-6 bg-black rounded-b-2xl z-20"></div>

            {/* Screen Content */}
            <div className="w-full h-full bg-gray-900 overflow-hidden">{children}</div>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full"></div>
      </div>
    </div>
  )
}
