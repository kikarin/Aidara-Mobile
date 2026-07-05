import * as React from "react";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";

interface OTPScreenProps {
  email: string;
  onVerify: (otp: string) => void | Promise<void>;
  onResend: () => void | Promise<void>;
  onBack: () => void;
  loading?: boolean;
  error?: string;
  resendCountdown?: number;
}

export const OTPScreen: React.FC<OTPScreenProps> = ({
  email,
  onVerify,
  onResend,
  onBack,
  loading,
  error,
  resendCountdown,
}) => {
  const [otp, setOtp] = React.useState("");
  const [countdown, setCountdown] = React.useState(60);

  React.useEffect(() => {
    if (resendCountdown != null) {
      setCountdown(resendCountdown);
    }
  }, [resendCountdown]);

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleComplete = (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      setTimeout(() => onVerify(value), 100);
    }
  };

  const handleVerify = () => {
    if (otp.length === 6) {
      onVerify(otp);
    }
  };

  const handleResend = async () => {
    try {
      await onResend();
      setCountdown(60);
      setOtp("");
    } catch {
      // Error handled by parent
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 bg-background transition-colors duration-300">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Kembali</span>
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full space-y-8">
        {/* Title & Description */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-foreground">Verifikasi OTP</h1>
          <p className="text-muted-foreground">
            Kode verifikasi telah dikirim ke
          </p>
          <p className="text-foreground font-semibold">{email}</p>
        </div>

        {/* OTP Input */}
        <div className="space-y-6">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            onComplete={handleComplete}
            containerClassName="flex justify-center gap-2"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="h-14 w-12 rounded-button text-2xl border-border bg-input-background focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <InputOTPSlot index={1} className="h-14 w-12 rounded-button text-2xl border-border bg-input-background focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <InputOTPSlot index={2} className="h-14 w-12 rounded-button text-2xl border-border bg-input-background focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <InputOTPSlot index={3} className="h-14 w-12 rounded-button text-2xl border-border bg-input-background focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <InputOTPSlot index={4} className="h-14 w-12 rounded-button text-2xl border-border bg-input-background focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <InputOTPSlot index={5} className="h-14 w-12 rounded-button text-2xl border-border bg-input-background focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </InputOTPGroup>
          </InputOTP>

          {error && (
            <div className="text-sm text-error bg-error/5 border border-error/30 rounded-lg px-4 py-3 text-center">
              {error}
            </div>
          )}

          <Button
            onClick={handleVerify}
            className="w-full"
            size="lg"
            loading={loading}
            disabled={otp.length !== 6}
          >
            Verifikasi
          </Button>

          {/* Resend */}
          <div className="text-center space-y-2">
            {countdown > 0 ? (
              <p className="text-sm text-muted-foreground">
                Kirim ulang kode dalam <span className="font-semibold text-foreground">{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-sm text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Kirim Ulang Kode
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
