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

  const isTabActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname.startsWith("/project/");
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <motion.div
      initial={{ y: 22, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
      className="
      pointer-events-none z-50 flex w-full justify-center px-1 pt-1 pb-4
    ">
      <nav className="
        pointer-events-auto flex items-center gap-1.5 rounded-full border
        border-white/5 bg-secondary/90 p-1 shadow-2xl shadow-black/50
        backdrop-blur-md
      ">
        {tabs.map((tab) => {
          const isActive = isTabActive(tab.href);
          return (
            <button
              key={tab.name}
              onClick={() => router.push(tab.href)}
              className={cn(
                `
                  relative flex size-10 flex-col items-center justify-center
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
              <tab.icon className="size-4" strokeWidth={isActive ? 2.5 : 2} />
            </button>
          );
        })}
      </nav>
    </motion.div>
  );
}
