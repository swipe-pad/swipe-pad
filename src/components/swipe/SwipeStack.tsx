"use client";

import { useState } from "react";
import { SwipeCard } from "./SwipeCard";
import { Campaign, SwipeDirection } from "@/types";

interface SwipeStackProps {
  initialCampaigns: Campaign[];
}

export function SwipeStack({ initialCampaigns }: SwipeStackProps) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);

  const handleSwipe = (direction: SwipeDirection) => {
    // Remove the top card locally after a delay to match animation
    setTimeout(() => {
        setCampaigns((prev) => prev.slice(1));
    }, 200); // Wait for animation to start clearing
    
    // Here we would call Convex mutation to record the swipe
    console.log(`Swiped ${direction}`);
  };

  if (campaigns.length === 0) {
    return (
        <div className="flex h-full items-center justify-center p-8 text-center">
            <div>
                <h3 className="text-xl font-semibold mb-2">No more profiles</h3>
                <p className="text-muted-foreground">Check back later for more!</p>
            </div>
        </div>
    );
  }

  return (
    <div className="relative w-full h-full max-h-[700px]">
      {campaigns.map((campaign, index) => (
        <SwipeCard
          key={campaign.id}
          index={index}
          campaign={campaign}
          onSwipe={handleSwipe}
        />
      ))}
    </div>
  );
}
