import {
  MotionValue,
  PanInfo,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect, useState } from "react";
import { SwipeDirection } from "@/types";

interface SwipeGesturesConfig {
  onSwipe?: (direction: SwipeDirection) => void;
  active?: boolean;
  x: MotionValue<number>;
  y: MotionValue<number>;
}

export function useSwipeGestures({
  onSwipe,
  active = true,
  x,
  y,
}: SwipeGesturesConfig) {
  const [isDraggable, setIsDraggable] = useState(false);

  useEffect(() => {
    setIsDraggable(active);
  }, [active]);

  const handleDragEnd = async (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (!active) return;

    const offsetX = info.offset.x;
    const offsetY = info.offset.y;
    const velocityX = info.velocity.x;
    const velocityY = info.velocity.y;
    const totalVelocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    const totalOffset = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

    const SWIPE_THRESHOLD = 100;
    const isSwipeValid = totalOffset > SWIPE_THRESHOLD || totalVelocity > 500;

    if (isSwipeValid) {
      const direction: SwipeDirection =
        Math.abs(offsetX) > Math.abs(offsetY)
          ? offsetX > 0
            ? "right"
            : "left"
          : offsetY > 0
          ? "down"
          : "up";

      onSwipe?.(direction);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  return {
    isDraggable,
    handleDragEnd,
  };
}
