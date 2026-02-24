"use client"

import { useEffect, useRef, useState } from "react"

interface AppShellProps {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
}

export function AppShell({ children, header, footer }: AppShellProps) {
  const headerRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState(header ? 56 : 0)
  const [footerHeight, setFooterHeight] = useState(footer ? 64 : 0)

  useEffect(() => {
    const updateLayoutOffsets = () => {
      setHeaderHeight(headerRef.current?.offsetHeight ?? 0)
      setFooterHeight(footerRef.current?.offsetHeight ?? 0)
    }

    updateLayoutOffsets()

    const resizeObserver = new ResizeObserver(updateLayoutOffsets)
    if (headerRef.current) resizeObserver.observe(headerRef.current)
    if (footerRef.current) resizeObserver.observe(footerRef.current)
    window.addEventListener("resize", updateLayoutOffsets)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateLayoutOffsets)
    }
  }, [header, footer])

  return (
    <div className="
      relative flex size-full flex-col overflow-hidden bg-transparent
    ">
      <main
        className="no-scrollbar relative flex-1 overflow-y-auto"
        style={{
          paddingTop: header ? `${headerHeight}px` : undefined,
          paddingBottom: footer ? `${footerHeight}px` : undefined,
        }}
      >
        {children}
      </main>
      {header ? (
        <div ref={headerRef} className="fixed inset-x-0 top-0 z-40">
          {header}
        </div>
      ) : null}
      {footer ? (
        <div ref={footerRef} className="fixed inset-x-0 bottom-0 z-50">
          {footer}
        </div>
      ) : null}
    </div>
  )
}
