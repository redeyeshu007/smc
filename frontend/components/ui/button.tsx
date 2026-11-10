import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default:
          "bg-dark text-dark-foreground hover:bg-dark-hover active:bg-dark",
        gold:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-[#A48350]",
        outline:
          "border border-border bg-white text-foreground hover:bg-muted active:bg-[#F0F0F0]",
        outlineDark:
          "border border-foreground bg-white text-foreground hover:bg-dark hover:text-white",
        ghost:
          "text-foreground hover:bg-muted active:bg-[#EEEEEE]",
        secondary:
          "bg-muted text-secondary hover:text-foreground",
        danger:
          "border border-red-200 text-red-600 hover:bg-red-50",
      },
      size: {
        default: "h-11 px-6 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-sm tracking-wide",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
