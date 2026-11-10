import * as React from "react";
import { cn } from "@/utils/cn";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-xs font-medium text-foreground tracking-wide block mb-1.5 uppercase",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";

export { Label };
