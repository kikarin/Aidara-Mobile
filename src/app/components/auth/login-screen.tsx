import * as React from "react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { LoginConsentDialog } from "./login-consent-dialog";

const LOGO_PRIMARY = `${import.meta.env.BASE_URL}icons/logo.png`;
const LOGO_FALLBACK = `${import.meta.env.BASE_URL}icons/logo-512x512.png`;

interface LoginScreenProps {
  onLogin: (email: string, password: string) => void | Promise<void>;
  loading?: boolean;
  error?: string;
  emailError?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, loading, error, emailError }) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [consentOpen, setConsentOpen] = React.useState(false);
  const [logoSrc, setLogoSrc] = React.useState(LOGO_PRIMARY);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConsentOpen(true);
  };

  const handleConfirmLogin = async () => {
    await onLogin(email, password);
    setConsentOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-28 w-28 rounded-3xl bg-surface border border-border shadow-md overflow-hidden flex items-center justify-center p-2">
                <img
                  src={logoSrc}
                  alt="Dispora Sportif"
                  className="h-full w-full object-contain"
                  onError={() => setLogoSrc(LOGO_FALLBACK)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Aidara</h1>
              <p className="text-sm font-medium text-primary">Dinas Kepemudaan dan Olahraga</p>
              <p className="text-xs text-muted-foreground">Kabupaten Bogor</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-4">
            <div className="space-y-1 text-center">
              <h2 className="text-base font-semibold text-foreground">Masuk ke Akun</h2>
              <p className="text-xs text-muted-foreground">
                Platform manajemen keolahragaan terpadu
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                error={!!error || !!emailError}
              />

              <Input
                type="password"
                label="Kata Sandi"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                error={!!error}
              />

              {emailError && !error && (
                <div className="text-sm text-error bg-error/5 border border-error/30 rounded-lg px-4 py-3">
                  {emailError}
                </div>
              )}

              {error && (
                <div className="text-sm text-error bg-error/5 border border-error/30 rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" loading={loading && !consentOpen}>
                Masuk
              </Button>
            </form>
          </div>

          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Kebijakan penggunaan dan perlindungan data pribadi berlaku untuk seluruh pengguna Aidara.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
              <Link to="/legal/terms" className="text-primary hover:underline">
                Syarat & Ketentuan
              </Link>
              <span className="text-muted-foreground/50">•</span>
              <Link to="/legal/privacy" className="text-primary hover:underline">
                Kebijakan Privasi
              </Link>
              <span className="text-muted-foreground/50">•</span>
              <Link to="/legal/pdp" className="text-primary hover:underline">
                PDP
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground/80">
            © {new Date().getFullYear()} Dispora Kabupaten Bogor
          </p>
        </div>
      </div>

      <LoginConsentDialog
        open={consentOpen}
        onOpenChange={setConsentOpen}
        onConfirm={handleConfirmLogin}
        loading={loading}
      />
    </div>
  );
};
