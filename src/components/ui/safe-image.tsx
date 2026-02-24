import Image from "next/image"

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
  const isRemote = /^https?:\/\//.test(src)
  const isProxiedLocalImage = src.startsWith("/api/img?")

  if (isRemote || isProxiedLocalImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn(fill ? "absolute inset-0 size-full" : undefined, className)}
        draggable={draggable}
        loading={loading ?? "lazy"}
        onLoad={onLoad}
        onError={onError}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      draggable={draggable}
      onLoad={onLoad}
      onError={onError}
    />
  )
}
