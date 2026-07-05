import * as React from "react";
import * as authApi from "@/api/auth";
import { setUnauthorizedHandler } from "@/api/client";
import type { User } from "@/api/types";
import { queryClient } from "@/app/lib/query-client";
import { clearAllAppStorage } from "@/app/lib/app-storage";
import { getToken, hasToken } from "@/app/lib/token-storage";
import { getValidationErrors, parseApiError } from "@/hooks/use-api-error";

type LoginResult = "success" | "otp_required";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isSubmitting: boolean;
  pendingEmail: string | null;
  error: string | null;
  fieldErrors: Record<string, string[]>;
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyOtp: (otp: string) => Promise<void>;
  resendOtp: () => Promise<number | null>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [pendingEmail, setPendingEmail] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const clearError = React.useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const resetSession = React.useCallback(() => {
    clearAllAppStorage();
    setUser(null);
    setPendingEmail(null);
    queryClient.clear();
  }, []);

  React.useEffect(() => {
    setUnauthorizedHandler(() => {
      resetSession();
      setError("Sesi Anda telah berakhir. Silakan login kembali.");
    });
  }, [resetSession]);

  React.useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!hasToken()) {
        setIsInitializing(false);
        return;
      }

      try {
        const response = await authApi.getProfile();
        if (!cancelled && response.status === "success" && response.data?.user) {
          setUser(response.data.user);
        }
      } catch {
        if (!cancelled) {
          resetSession();
        }
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [resetSession]);

  const login = React.useCallback(async (email: string, password: string): Promise<LoginResult> => {
    setIsSubmitting(true);
    clearError();

    try {
      const response = await authApi.login(email, password);

      if (response.status === "otp_required") {
        setPendingEmail(email);
        return "otp_required";
      }

      if (response.status === "success" && response.data && "user" in response.data) {
        setUser(response.data.user);
        setPendingEmail(null);
        return "success";
      }

      throw new Error(response.message || "Login gagal");
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
      setFieldErrors(getValidationErrors(err));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [clearError]);

  const verifyOtp = React.useCallback(async (otp: string) => {
    if (!pendingEmail) {
      setError("Email tidak ditemukan. Silakan login ulang.");
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      const response = await authApi.verifyOtp(pendingEmail, otp);

      if (response.status === "success" && response.data?.user) {
        setUser(response.data.user);
        setPendingEmail(null);
        return;
      }

      throw new Error(response.message || "Verifikasi OTP gagal");
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [pendingEmail, clearError]);

  const resendOtp = React.useCallback(async (): Promise<number | null> => {
    if (!pendingEmail) {
      setError("Email tidak ditemukan. Silakan login ulang.");
      return null;
    }

    clearError();

    try {
      const response = await authApi.resendOtp(pendingEmail);
      if (response.status !== "success") {
        throw new Error(response.message || "Gagal mengirim ulang OTP");
      }
      return null;
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);

      if (parsed.statusCode === 429) {
        const match = parsed.message.match(/Tunggu\s+(\d+)\s+detik/i);
        return match ? Number.parseInt(match[1], 10) : 60;
      }

      throw err;
    }
  }, [pendingEmail, clearError]);

  const logout = React.useCallback(async () => {
    setIsSubmitting(true);
    clearError();

    try {
      if (getToken()) {
        await authApi.logout();
      }
    } catch {
      // Always clear local session even if API logout fails
    } finally {
      resetSession();
      setIsSubmitting(false);
    }
  }, [clearError, resetSession]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isInitializing,
      isSubmitting,
      pendingEmail,
      error,
      fieldErrors,
      login,
      verifyOtp,
      resendOtp,
      logout,
      clearError,
    }),
    [
      user,
      isInitializing,
      isSubmitting,
      pendingEmail,
      error,
      fieldErrors,
      login,
      verifyOtp,
      resendOtp,
      logout,
      clearError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
