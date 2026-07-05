import { Toaster as Sonner, ToasterProps } from "sonner";

import { useTheme } from "../../lib/theme-context";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "bg-surface border-border text-foreground shadow-lg",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
          error: theme === "dark" ? "bg-error/10 border-error text-error" : "bg-error/5 border-error text-error",
          success: theme === "dark" ? "bg-success/10 border-success text-success" : "bg-success/5 border-success text-success",
          warning: theme === "dark" ? "bg-warning/10 border-warning text-warning" : "bg-warning/5 border-warning text-warning",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
