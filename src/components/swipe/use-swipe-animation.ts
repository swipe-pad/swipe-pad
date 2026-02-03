import { MotionValue, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { SwipeDirection } from "@/types";

export interface SwipeAnimationState {
  showRightEmoji: boolean;
  showLeftEmoji: boolean;
  showUpEmoji: boolean;
  showDownEmoji: boolean;
  showSuperLikeEmoji: boolean;
}

interface SwipeAnimationResult {
  x: MotionValue<number>;
  y: MotionValue<number>;
  rotate: MotionValue<string>;
  opacity: MotionValue<number>;
  animationState: SwipeAnimationState;
  handleSwipeComplete: (direction: SwipeDirection) => void;
  resetAnimationState: () => void;
}

const ROTATION_FACTOR = 25;
const EXIT_DISTANCE = 200;

export function useSwipeAnimation(cardIndex: number = 0): SwipeAnimationResult {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateRaw = useTransform([x, y], ([latestX, latestY]: number[]) => {
    const angle = Math.atan2(latestY, latestX) * (180 / Math.PI);
    const distance = Math.sqrt(latestX * latestX + latestY * latestY);
    const normalizedDistance = Math.min(distance / EXIT_DISTANCE, 1);
    return ROTATION_FACTOR * normalizedDistance * Math.sign(angle);
  });

  const rotate = useTransform(() => {
    let offset = 0;
    if (cardIndex > 0) {
      offset = cardIndex % 2 === 0 ? -1.5 - cardIndex : 1.5 + cardIndex;
    }
    return `${rotateRaw.get() + offset}deg`;
  });

  const opacity = useTransform(x, [-EXIT_DISTANCE, 0, EXIT_DISTANCE], [0, 1, 0]);

  const [animationState, setAnimationState] = useState<SwipeAnimationState>({
    showRightEmoji: false,
    showLeftEmoji: false,
    showUpEmoji: false,
    showDownEmoji: false,
    showSuperLikeEmoji: false,
  });

  useEffect(() => {
    if (Object.values(animationState).some(Boolean)) {
      const timer = setTimeout(() => {
        resetAnimationState();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [animationState]);

  const handleSwipeComplete = (direction: SwipeDirection) => {
    const angle =
      direction === "right"
        ? 0
        : direction === "left"
        ? Math.PI
        : direction === "up"
        ? -Math.PI / 2
        : Math.PI / 2;

    const finalX = Math.cos(angle) * EXIT_DISTANCE * 5; // Send far away
    const finalY = Math.sin(angle) * EXIT_DISTANCE * 5;

    x.set(finalX);
    y.set(finalY);

    setAnimationState((prev) => ({
      ...prev,
      showRightEmoji: direction === "right",
      showLeftEmoji: direction === "left",
      showUpEmoji: direction === "up",
      showDownEmoji: direction === "down",
    }));
  };

  const resetAnimationState = () => {
    setAnimationState({
      showRightEmoji: false,
      showLeftEmoji: false,
      showUpEmoji: false,
      showDownEmoji: false,
      showSuperLikeEmoji: false,
    });
  };

  return {
    x,
    y,
    rotate,
    opacity,
    animationState,
    handleSwipeComplete,
    resetAnimationState,
  };
}
