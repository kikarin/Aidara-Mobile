import * as React from "react";
import { ArrowLeft, ChevronRight, Moon, FileText, Shield, Scale } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ThemeToggle } from "../ui/theme-toggle";

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const navigate = useNavigate();

  const legalItems = [
    { icon: FileText, label: "Syarat & Ketentuan", path: "/legal/terms" },
    { icon: Shield, label: "Kebijakan Privasi", path: "/legal/privacy" },
    { icon: Scale, label: "Perlindungan Data Pribadi (PDP)", path: "/legal/pdp" },
  ];

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl h-9 w-9 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-base font-bold">Pengaturan</h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Tema Tampilan</p>
                <p className="text-xs text-muted-foreground">Mode terang atau gelap</p>
              </div>
            </div>
            <ThemeToggle variant="button" />
          </div>
        </Card>

        <Card>
          <div className="divide-y divide-border">
            {legalItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center justify-between px-4 py-4 hover:bg-surface-2/50 transition-colors"
                >
                  <div className="flex items-center gap-3 text-left">
                    <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground">{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
