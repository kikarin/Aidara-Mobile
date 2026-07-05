import * as React from "react";

import { cn } from "./utils";

interface InputProps extends Omit<React.ComponentProps<"input">, "error"> {
  error?: boolean;
  label?: string;
}

function Input({ className, type, error, label, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-sm text-foreground">
          {label}
        </label>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "flex h-12 w-full rounded-button bg-input-background px-4 py-3",
          "text-foreground placeholder:text-muted-foreground",
          "border border-border",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
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

export { Input };
