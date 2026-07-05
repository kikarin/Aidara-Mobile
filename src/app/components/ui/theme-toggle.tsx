import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../lib/theme-context";
import { cn } from "./utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "button";
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  variant = "icon"
}) => {
  const { theme, toggleTheme } = useTheme();

  if (variant === "button") {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-button bg-surface-2 hover:bg-muted transition-colors",
          className
        )}
      >
        {theme === "light" ? (
          <>
            <Moon className="h-5 w-5 text-foreground" />
            <span className="text-sm text-foreground">Dark Mode</span>
          </>
        ) : (
          <>
            <Sun className="h-5 w-5 text-foreground" />
            <span className="text-sm text-foreground">Light Mode</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "h-10 w-10 rounded-full bg-surface-2 border border-border flex items-center justify-center hover:bg-muted transition-all shadow-sm active:scale-95",
        className
      )}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-foreground" />
      ) : (
        <Sun className="h-5 w-5 text-foreground" />
      )}
    </button>
  );
};
