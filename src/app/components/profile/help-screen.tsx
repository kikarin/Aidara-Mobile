import * as React from "react";
import { ArrowLeft, Mail, Phone, MessageCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface HelpScreenProps {
  onBack: () => void;
}

export const HelpScreen: React.FC<HelpScreenProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl h-9 w-9 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-base font-bold">Bantuan & Dukungan</h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        <Card className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Pusat Bantuan</p>
              <p className="text-sm text-muted-foreground mt-1">
                Butuh bantuan teknis atau akses data? Hubungi administrator Aidara di Dinas Kepemudaan dan Olahraga Kabupaten Bogor.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">dispora@bogorkab.go.id</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Telepon</p>
              <p className="text-sm font-medium text-foreground">(0251) 875 1234</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold text-foreground mb-2">Pertanyaan Umum</p>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>Lupa password? Hubungi admin untuk reset akun.</li>
            <li>Data pemeriksaan belum muncul? Pastikan sudah diinput oleh pelatih/admin.</li>
            <li>Foto absen gagal? Aktifkan izin kamera dan lokasi di browser.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
