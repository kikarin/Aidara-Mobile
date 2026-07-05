import * as React from "react";
import { Navigate, useNavigate } from "react-router";
import { toast } from "sonner";
import { LoginScreen } from "@/app/components/auth/login-screen";
import { OTPScreen } from "@/app/components/auth/otp-screen";
import { useAuth } from "@/hooks/use-auth";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isSubmitting, error, fieldErrors } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await login(email, password);
      if (result === "otp_required") {
        navigate("/otp");
        toast.success("Kode OTP telah dikirim ke email Anda");
        return;
      }
      navigate("/");
      toast.success("Selamat datang di Aidara!");
    } catch {
      // Error ditampilkan via auth context
    }
  };

  return (
    <LoginScreen
      onLogin={handleLogin}
      loading={isSubmitting}
      error={error ?? undefined}
      emailError={fieldErrors.email?.[0]}
    />
  );
}

export function OtpPage() {
  const navigate = useNavigate();
  const { pendingEmail, verifyOtp, resendOtp, clearError, isSubmitting, error } = useAuth();
  const [otpResendCountdown, setOtpResendCountdown] = React.useState<number | undefined>(60);

  if (!pendingEmail) {
    return <Navigate to="/login" replace />;
  }

  const handleVerify = async (otp: string) => {
    try {
      await verifyOtp(otp);
      navigate("/");
      toast.success("Selamat datang di Aidara!");
    } catch {
      // Error ditampilkan via auth context
    }
  };

  const handleResend = async () => {
    try {
      const cooldown = await resendOtp();
      if (cooldown != null) {
        setOtpResendCountdown(cooldown);
      } else {
        setOtpResendCountdown(60);
        toast.success("Kode OTP baru telah dikirim");
      }
    } catch {
      // Error ditampilkan via auth context
    }
  };

  return (
    <OTPScreen
      email={pendingEmail}
      onVerify={handleVerify}
      onResend={handleResend}
      onBack={() => {
        clearError();
        navigate("/login");
      }}
      loading={isSubmitting}
      error={error ?? undefined}
      resendCountdown={otpResendCountdown}
    />
  );
}
