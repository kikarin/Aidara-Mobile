import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-colors duration-200",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        success: "bg-success/20 text-success border-success/30",
        warning: "bg-warning/20 text-warning border-warning/30",
        error: "bg-error/20 text-error border-error/30",
        physical: "bg-sport-physical/20 text-sport-physical border-sport-physical/30",
        strategy: "bg-sport-strategy/20 text-sport-strategy border-sport-strategy/30",
        technique: "bg-sport-technique/20 text-sport-technique border-sport-technique/30",
        mental: "bg-sport-mental/20 text-sport-mental border-sport-mental/30",
        recovery: "bg-sport-recovery/20 text-sport-recovery border-sport-recovery/30",
        gold: "bg-medal-gold/20 text-medal-gold border-medal-gold/30",
        silver: "bg-medal-silver/20 text-medal-silver border-medal-silver/30",
        bronze: "bg-medal-bronze/20 text-medal-bronze border-medal-bronze/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
