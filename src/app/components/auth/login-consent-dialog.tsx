import * as React from "react";
import { Link } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { ShieldCheck } from "lucide-react";

interface LoginConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const LoginConsentDialog: React.FC<LoginConsentDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}) => {
  const [agreed, setAgreed] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setAgreed(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] rounded-2xl gap-0 p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 via-surface to-surface px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <DialogHeader className="text-left space-y-1">
              <DialogTitle className="text-base">Persetujuan Pengguna</DialogTitle>
              <DialogDescription className="text-xs">
                Baca dan setujui kebijakan sebelum masuk ke Aidara.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-[50vh] overflow-y-auto">
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Aidara memproses data pribadi Anda (identitas, data olahraga, pemeriksaan, dan dokumen)
              untuk keperluan manajemen keolahragaan Dispora Kabupaten Bogor.
            </p>
            <p>
              Dengan melanjutkan, Anda menyetujui pemrosesan data sesuai{" "}
              <strong className="text-foreground font-medium">UU Perlindungan Data Pribadi</strong> dan
              kebijakan berikut:
            </p>
          </div>

          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/legal/terms" className="text-primary hover:underline font-medium">
                Syarat & Ketentuan
              </Link>
              <span className="text-muted-foreground"> — aturan penggunaan layanan Aidara</span>
            </li>
            <li>
              <Link to="/legal/privacy" className="text-primary hover:underline font-medium">
                Kebijakan Privasi
              </Link>
              <span className="text-muted-foreground"> — cara data pribadi dikumpulkan dan digunakan</span>
            </li>
            <li>
              <Link to="/legal/pdp" className="text-primary hover:underline font-medium">
                Perlindungan Data Pribadi (PDP)
              </Link>
              <span className="text-muted-foreground"> — hak dan kewajiban terkait data pribadi</span>
            </li>
          </ul>

          <label className="flex items-start gap-3 rounded-xl border border-border bg-surface-2/50 p-3 cursor-pointer">
            <Checkbox
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-foreground leading-relaxed">
              Saya telah membaca dan menyetujui{" "}
              <span className="font-medium">Syarat & Ketentuan</span>,{" "}
              <span className="font-medium">Kebijakan Privasi</span>, dan{" "}
              <span className="font-medium">Perlindungan Data Pribadi (PDP)</span>.
            </span>
          </label>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border sm:justify-stretch gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={!agreed || loading}
            loading={loading}
            onClick={onConfirm}
          >
            Lanjutkan Masuk
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
