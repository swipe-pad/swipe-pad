"use client";

import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="
      relative mx-auto flex size-full max-w-md flex-col overflow-hidden border-x
      border-white/5 bg-background
    ">
      <main className="no-scrollbar relative flex-1 overflow-y-auto pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
