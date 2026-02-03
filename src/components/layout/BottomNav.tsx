"use client";

import { Home, Layers, Settings, Wallet } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Swipe", icon: Layers, href: "/" },
  { name: "Wallet", icon: Wallet, href: "/wallet" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 z-50 pointer-events-none flex justify-center">
      <nav className="flex items-center gap-2 bg-secondary/90 backdrop-blur-md border border-white/5 rounded-full p-2 pointer-events-auto shadow-2xl shadow-black/50">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <button
              key={tab.name}
              onClick={() => router.push(tab.href)}
              className={cn(
                "relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                isActive ? "text-primary-foreground" : "text-slate-400 hover:text-white"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-full -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
