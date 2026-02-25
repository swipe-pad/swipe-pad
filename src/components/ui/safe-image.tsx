import { cn } from "@/lib/utils"

type SafeImageProps = {
  src: string
  alt: string
  fill?: boolean
  className?: string
  sizes?: string
  draggable?: boolean
  loading?: "eager" | "lazy"
  onLoad?: () => void
  onError?: () => void
}

export function SafeImage({
  src,
  alt,
  fill = false,
  className,
  sizes,
  draggable,
  loading,
  onLoad,
  onError,
}: SafeImageProps) {
  // Use standard img tag uniformly to avoid Next.js Image component layout shifts and wrapper diffs 
  // during JS-driven swipe animations, which cause UX flicker.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn(fill ? "absolute inset-0 size-full" : undefined, className)}
      draggable={draggable}
      loading={loading ?? "lazy"}
      sizes={sizes}
      onLoad={onLoad}
      onError={onError}
    />
  )
}
