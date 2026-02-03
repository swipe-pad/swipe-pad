"use client";

import { motion, PanInfo } from "framer-motion";
import { Campaign } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSwipeAnimation } from "./use-swipe-animation";
import { useSwipeGestures } from "./use-swipe-gestures";
import { type SwipeDirection } from "@/types";
import Image from "next/image";

interface SwipeCardProps {
  campaign: Campaign;
  onSwipe: (direction: SwipeDirection) => void;
  index: number; // 0 is top
}

export function SwipeCard({ campaign, onSwipe, index }: SwipeCardProps) {
  const { x, y, rotate, opacity, handleSwipeComplete } = useSwipeAnimation(index);

  const handleSwipe = (direction: SwipeDirection) => {
    handleSwipeComplete(direction);
    onSwipe(direction);
  };

  const { handleDragEnd, isDraggable } = useSwipeGestures({
    x,
    y,
    onSwipe: handleSwipe,
    active: index === 0,
  });

  if (index > 2) return null; // Only render top 3 cards

  return (
    <motion.div
      style={{
        zIndex: 50 - index,
        x,
        y,
        rotate,
        opacity: index === 0 ? 1 : 1 - index * 0.1,
        scale: 1 - index * 0.05,
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0, // Stack them on top of each other
      }}
      drag={isDraggable}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 p-4"
    >
      <Card className="h-full w-full overflow-hidden border-none shadow-xl bg-card">
        <div className="relative h-3/5 w-full bg-muted">
             {/* Fallback image if validation fails or placeholders */}
            <Image
                src={campaign.imageUrl}
                alt={campaign.title}
                fill
                className="object-cover pointer-events-none"
                draggable={false}
            />
            <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="backdrop-blur-md bg-white/30 text-white border-white/20">
                    {campaign.category}
                </Badge>
            </div>
        </div>
        
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">{campaign.title}</h2>
            <p className="text-muted-foreground line-clamp-3">
                {campaign.description}
            </p>
            
            <div className="mt-4 flex justify-between items-center text-sm">
                <div className="flex flex-col">
                    <span className="text-muted-foreground">Goal</span>
                    <span className="font-semibold">${campaign.fundingGoal}</span>
                </div>
                 <div className="flex flex-col text-right">
                    <span className="text-muted-foreground">Raised</span>
                    <span className="font-semibold text-primary">${campaign.currentFunding}</span>
                </div>
            </div>
        </div>
      </Card>
    </motion.div>
  );
}
