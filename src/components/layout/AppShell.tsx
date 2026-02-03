"use client";

import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative flex flex-col h-full w-full max-w-md mx-auto bg-background overflow-hidden border-x border-white/5">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 relative">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
