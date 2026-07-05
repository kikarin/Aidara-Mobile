import * as React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { cn } from "./utils";

interface SportsAvatarProps extends React.ComponentProps<typeof Avatar> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const SportsAvatar: React.FC<SportsAvatarProps> = ({
  src,
  alt,
  fallback,
  size = "md",
  className,
  ...props
}) => {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  return (
    <Avatar className={cn(sizes[size], className)} {...props}>
      {src ? (
        <AvatarImage src={src} alt={alt || "Avatar"} />
      ) : (
        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-semibold border border-border">
          {fallback || "?"}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export { SportsAvatar };
