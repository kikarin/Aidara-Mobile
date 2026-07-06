import * as React from "react";
import { Calendar } from "lucide-react";

import { cn } from "./utils";

interface DateInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  error?: boolean;
}

function DateInput({ className, error, ...props }: DateInputProps) {
  return (
    <div className="relative">
      <Calendar className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="date"
        data-slot="date-input"
        className={cn(
          "date-with-icon flex h-12 w-full rounded-button border border-border bg-input-background py-3 pl-11 pr-4",
          "text-foreground placeholder:text-muted-foreground",
          "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring",
          "transition-all duration-300",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-error aria-invalid:focus:ring-error",
          error && "border-error",
          className,
        )}
        aria-invalid={error}
        {...props}
      />
    </div>
  );
}

export { DateInput };
