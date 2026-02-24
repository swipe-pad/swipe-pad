"use client";

import { Layers, Search, Trophy, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Swipe", icon: Layers, href: "/" },
  { name: "Discover", icon: Search, href: "/list" },
  { name: "Rank", icon: Trophy, href: "/leaderboard" },
  { name: "Profile", icon: User, href: "/profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="
      pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-2
      pb-3
    ">
      <nav className="
        pointer-events-auto flex items-center gap-2 rounded-full border
        border-white/5 bg-secondary/90 p-1.5 shadow-2xl shadow-black/50
        backdrop-blur-md
      ">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <button
              key={tab.name}
              onClick={() => router.push(tab.href)}
              className={cn(
                `
                  relative flex size-12 flex-col items-center justify-center
                  rounded-full transition-all duration-300
                `,
                isActive ? "text-primary-foreground" : `
                  text-slate-400
                  hover:text-white
                `
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 -z-10 rounded-full bg-primary"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
