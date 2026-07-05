import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { getValidationErrors, parseApiError } from "@/hooks/use-api-error";
import { validateUploadFile } from "@/app/lib/file-validation";
import { toast } from "sonner";
import type { StoreSertifikatPayload } from "@/api/profile-types";

interface SertifikatFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit: (payload: StoreSertifikatPayload) => Promise<void>;
}

export const SertifikatFormDialog: React.FC<SertifikatFormDialogProps> = ({
  open,
  onOpenChange,
  loading,
  onSubmit,
}) => {
  const [nama, setNama] = React.useState("");
  const [penyelenggara, setPenyelenggara] = React.useState("");
  const [tanggal, setTanggal] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setNama("");
      setPenyelenggara("");
      setTanggal("");
      setFile(null);
      setFieldErrors({});
      setError(null);
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      return;
    }

    const validationError = validateUploadFile(selected, "profileDocument");
    if (validationError) {
      toast.error(validationError);
      e.target.value = "";
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("File sertifikat wajib diupload");
      return;
    }

    setError(null);
    setFieldErrors({});

    try {
      await onSubmit({
        nama_sertifikat: nama,
        penyelenggara: penyelenggara || undefined,
        tanggal_terbit: tanggal || undefined,
        file,
      });
      onOpenChange(false);
    } catch (err) {
      setFieldErrors(getValidationErrors(err));
      setError(parseApiError(err).message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Tambah Sertifikat</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nama Sertifikat</label>
            <Input value={nama} onChange={(e) => setNama(e.target.value)} className="mt-1.5" />
            {fieldErrors.nama_sertifikat?.[0] && (
              <p className="text-xs text-destructive mt-1">{fieldErrors.nama_sertifikat[0]}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Penyelenggara</label>
            <Input value={penyelenggara} onChange={(e) => setPenyelenggara(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <label className="text-sm font-medium">Tanggal Terbit</label>
            <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <label className="text-sm font-medium">File</label>
            <Input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={handleFileChange}
              className="mt-1.5"
            />
            {fieldErrors.file?.[0] && (
              <p className="text-xs text-destructive mt-1">{fieldErrors.file[0]}</p>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={() => void handleSubmit()} loading={loading} disabled={!nama || !file}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
