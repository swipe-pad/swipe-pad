import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  `
    inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold
    ring-offset-background transition-all duration-200
    focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
    focus-visible:outline-none
    disabled:pointer-events-none disabled:opacity-50 disabled:saturate-50
  `,
  {
    variants: {
      variant: {
        default: `
          bg-primary text-primary-foreground shadow-lg shadow-primary/20
          hover:bg-primary/95 hover:shadow-primary/35
        `,
        destructive:
          `
            bg-destructive text-destructive-foreground
            hover:bg-destructive/90
          `,
        outline:
          `
            border border-input/80 bg-background/75
            hover:bg-accent/15 hover:text-accent-foreground
          `,
        secondary:
          `
            border border-surface-border bg-surface-2 text-foreground
            hover:bg-surface-3
          `,
        ghost: "hover:bg-accent/15 hover:text-accent-foreground",
        link: `
          text-primary underline-offset-4
          hover:underline
        `,
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
