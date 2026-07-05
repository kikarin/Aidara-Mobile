import * as React from "react";
import { Button } from "./button";
import { AlertCircle, WifiOff, Lock, ServerCrash } from "lucide-react";

interface ErrorStateProps {
  type?: "403" | "422" | "500" | "offline" | "generic";
  message?: string;
  onRetry?: () => void;
}

const errorConfig = {
  "403": {
    icon: Lock,
    title: "Akses Ditolak",
    description: "Anda tidak memiliki izin untuk mengakses halaman ini",
    showRetry: false
  },
  "422": {
    icon: AlertCircle,
    title: "Data Tidak Valid",
    description: "Terdapat kesalahan pada data yang dikirimkan",
    showRetry: true
  },
  "500": {
    icon: ServerCrash,
    title: "Terjadi Kesalahan Server",
    description: "Mohon maaf, terjadi kesalahan pada server. Silakan coba lagi nanti",
    showRetry: true
  },
  "offline": {
    icon: WifiOff,
    title: "Tidak Ada Koneksi Internet",
    description: "Periksa koneksi internet Anda dan coba lagi",
    showRetry: true
  },
  "generic": {
    icon: AlertCircle,
    title: "Terjadi Kesalahan",
    description: "Mohon maaf, terjadi kesalahan. Silakan coba lagi",
    showRetry: true
  }
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  type = "generic",
  message,
  onRetry
}) => {
  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="h-20 w-20 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-4">
        <Icon className="h-10 w-10 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {config.title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {message || config.description}
      </p>
      {config.showRetry && onRetry && (
        <Button onClick={onRetry} variant="outline">
          Coba Lagi
        </Button>
      )}
    </div>
  );
};
