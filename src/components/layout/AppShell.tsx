"use client"

interface AppShellProps {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
}

export function AppShell({ children, header, footer }: AppShellProps) {
  return (
    <div className="
      relative flex size-full flex-col overflow-hidden bg-background
    ">
      {header}
      <main className="no-scrollbar relative flex-1 overflow-y-auto pb-24">
        {children}
      </main>
      {footer}
    </div>
  )
}
