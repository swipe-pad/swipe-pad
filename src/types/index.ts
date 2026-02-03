export type SwipeDirection = "left" | "right" | "up" | "down";

export interface Campaign {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  fundingGoal: number;
  currentFunding: number;
  sponsorBoosted?: boolean;
}
