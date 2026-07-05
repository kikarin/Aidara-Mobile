import * as React from "react";
import { ArrowLeft, ChevronRight, Lock, ShieldCheck, Database } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface PrivacyScreenProps {
  onBack: () => void;
}

export const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ onBack }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl h-9 w-9 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-base font-bold">Privasi & Keamanan</h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        <Card className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Keamanan Akun</p>
              <p className="text-sm text-muted-foreground mt-1">
                Sesi login dilindungi token autentikasi. Logout akan menghapus data sesi di perangkat Anda.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Akses Berbasis Peran</p>
              <p className="text-sm text-muted-foreground mt-1">
                Data hanya ditampilkan sesuai peran pengguna (atlet, pelatih, tenaga pendukung).
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-accent-2 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Data Pribadi</p>
              <p className="text-sm text-muted-foreground mt-1">
                Aidara memproses data pribadi sesuai UU PDP. Baca kebijakan lengkap di bawah.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="divide-y divide-border">
            {[
              { label: "Kebijakan Privasi", path: "/legal/privacy" },
              { label: "Perlindungan Data Pribadi (PDP)", path: "/legal/pdp" },
              { label: "Syarat & Ketentuan", path: "/legal/terms" },
            ].map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-surface-2/50 transition-colors"
              >
                <span className="text-sm text-foreground">{item.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
