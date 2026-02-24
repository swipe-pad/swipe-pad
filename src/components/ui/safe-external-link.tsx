import type { AnchorHTMLAttributes, ReactNode } from "react"

type SafeExternalLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> & {
  href: string
  children: ReactNode
}

export function SafeExternalLink({ href, children, rel, target, ...rest }: SafeExternalLinkProps) {
  return (
    <a
      href={href}
      target={target ?? "_blank"}
      rel={rel ?? "noopener noreferrer nofollow"}
      {...rest}
    >
      {children}
    </a>
  )
}
