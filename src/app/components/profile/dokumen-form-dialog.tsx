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
import { OptionsMasterDataPicker } from "../ui/options-master-data-picker";
import type { MasterDataOption } from "../ui/master-data-picker";
import type { StoreDokumenPayload } from "@/api/profile-types";
import { getValidationErrors, parseApiError } from "@/hooks/use-api-error";
import { validateUploadFile } from "@/app/lib/file-validation";
import { toast } from "sonner";

interface DokumenFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit: (payload: StoreDokumenPayload) => Promise<void>;
}

export const DokumenFormDialog: React.FC<DokumenFormDialogProps> = ({
  open,
  onOpenChange,
  loading,
  onSubmit,
}) => {
  const [nomor, setNomor] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [jenisDokumen, setJenisDokumen] = React.useState<MasterDataOption | null>(null);
  const [jenisOpen, setJenisOpen] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setNomor("");
      setFile(null);
      setJenisDokumen(null);
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
      setError("File dokumen wajib diupload");
      return;
    }

    setError(null);
    setFieldErrors({});

    try {
      await onSubmit({
        jenis_dokumen_id: jenisDokumen ? Number.parseInt(jenisDokumen.value, 10) : null,
        nomor: nomor || undefined,
        file,
      });
      onOpenChange(false);
    } catch (err) {
      setFieldErrors(getValidationErrors(err));
      setError(parseApiError(err).message);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Tambah Dokumen</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Jenis Dokumen</label>
              <Button variant="outline" className="w-full justify-start mt-1.5" onClick={() => setJenisOpen(true)}>
                {jenisDokumen?.label || "Pilih jenis dokumen"}
              </Button>
              {fieldErrors.jenis_dokumen_id?.[0] && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.jenis_dokumen_id[0]}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Nomor Dokumen</label>
              <Input value={nomor} onChange={(e) => setNomor(e.target.value)} className="mt-1.5" />
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
            <Button onClick={() => void handleSubmit()} loading={loading} disabled={!file}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OptionsMasterDataPicker
        open={jenisOpen}
        onOpenChange={setJenisOpen}
        optionKey="jenis_dokumen"
        onSelect={setJenisDokumen}
        selectedId={jenisDokumen?.id}
      />
    </>
  );
};
