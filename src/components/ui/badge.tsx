import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/80 text-primary-foreground [a&]:hover:bg-primary/70",
        secondary:
          "border-transparent bg-secondary/80 text-secondary-foreground [a&]:hover:bg-secondary/70",
        destructive:
          "border-transparent bg-destructive/80 text-white [a&]:hover:bg-destructive/70 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/40",
        outline:
          "text-foreground/80 [a&]:hover:bg-accent/80 [a&]:hover:text-accent-foreground/80",
        success:
          "border-transparent bg-green-700/80 text-white [a&]:hover:bg-green-800/70 focus-visible:ring-green-700/20 dark:focus-visible:ring-green-700/40",
        interest:
          "border-transparent bg-yellow-700/80 text-white [a&]:hover:bg-yellow-800/70 focus-visible:ring-yellow-700/20 dark:focus-visible:ring-yellow-700/40",
        pushEvent:
          "border-transparent bg-blue-600/80 text-white [a&]:hover:bg-blue-700/70 focus-visible:ring-blue-600/20 dark:focus-visible:ring-blue-600/40",
        pullRequestEvent:
          "border-transparent bg-purple-600/80 text-white [a&]:hover:bg-purple-700/70 focus-visible:ring-purple-600/20 dark:focus-visible:ring-purple-600/40",
        watchEvent:
          "border-transparent bg-amber-600/80 text-white [a&]:hover:bg-amber-700/70 focus-visible:ring-amber-600/20 dark:focus-visible:ring-amber-600/40",
        deleteEvent:
          "border-transparent bg-red-600/80 text-white [a&]:hover:bg-red-700/70 focus-visible:ring-red-600/20 dark:focus-visible:ring-red-600/40",
        createEvent:
          "border-transparent bg-emerald-600/80 text-white [a&]:hover:bg-emerald-700/70 focus-visible:ring-emerald-600/20 dark:focus-visible:ring-emerald-600/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
