import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

export const button = cva(
  "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-sage-300 text-ink hover:bg-sage-100",
        ghost: "border border-white/60 text-white hover:bg-white/10",
        ghostDark: "border border-ink/30 text-ink hover:bg-ink/5",
        dark: "bg-ink text-white hover:bg-ink/85",
      },
      size: {
        default: "px-5 py-3 text-sm",
        sm: "px-4 py-2 text-xs",
        lg: "px-7 py-3.5 text-base font-semibold",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={`${button({ variant, size })} ${className}`.trim()}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
