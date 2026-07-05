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
import { Textarea } from "../ui/textarea";
import { OptionsMasterDataPicker } from "../ui/options-master-data-picker";
import type { MasterDataOption } from "../ui/master-data-picker";
import type { PesertaRole, StorePrestasiPayload } from "@/api/profile-types";
import { getValidationErrors, parseApiError } from "@/hooks/use-api-error";

interface PrestasiFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: PesertaRole;
  loading?: boolean;
  onSubmit: (payload: StorePrestasiPayload) => Promise<void>;
}

export const PrestasiFormDialog: React.FC<PrestasiFormDialogProps> = ({
  open,
  onOpenChange,
  role,
  loading,
  onSubmit,
}) => {
  const [namaEvent, setNamaEvent] = React.useState("");
  const [tanggal, setTanggal] = React.useState("");
  const [juara, setJuara] = React.useState("");
  const [medali, setMedali] = React.useState<StorePrestasiPayload["medali"]>("Emas");
  const [keterangan, setKeterangan] = React.useState("");
  const [bonus, setBonus] = React.useState("");
  const [tingkat, setTingkat] = React.useState<MasterDataOption | null>(null);
  const [kategoriPeserta, setKategoriPeserta] = React.useState<MasterDataOption | null>(null);
  const [kategoriPrestasiPelatih, setKategoriPrestasiPelatih] = React.useState<MasterDataOption | null>(null);
  const [kategoriAtlet, setKategoriAtlet] = React.useState<MasterDataOption | null>(null);
  const [tingkatOpen, setTingkatOpen] = React.useState(false);
  const [kategoriPesertaOpen, setKategoriPesertaOpen] = React.useState(false);
  const [kategoriPrestasiOpen, setKategoriPrestasiOpen] = React.useState(false);
  const [kategoriAtletOpen, setKategoriAtletOpen] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setNamaEvent("");
      setTanggal("");
      setJuara("");
      setMedali("Emas");
      setKeterangan("");
      setBonus("");
      setTingkat(null);
      setKategoriPeserta(null);
      setKategoriPrestasiPelatih(null);
      setKategoriAtlet(null);
      setFieldErrors({});
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    setError(null);
    setFieldErrors({});

    const payload: StorePrestasiPayload = {
      nama_event: namaEvent,
      tanggal: tanggal || null,
      juara: juara || null,
      medali,
      jenis_prestasi: "individu",
      keterangan: keterangan || null,
      bonus: bonus ? Number.parseInt(bonus, 10) : null,
      tingkat_id: tingkat ? Number.parseInt(tingkat.value, 10) : null,
      kategori_peserta_id: kategoriPeserta ? Number.parseInt(kategoriPeserta.value, 10) : null,
    };

    if (role === "pelatih") {
      payload.kategori_prestasi_pelatih_id = kategoriPrestasiPelatih
        ? Number.parseInt(kategoriPrestasiPelatih.value, 10)
        : null;
      payload.kategori_atlet_id = kategoriAtlet
        ? Number.parseInt(kategoriAtlet.value, 10)
        : null;
    }

    try {
      await onSubmit(payload);
      onOpenChange(false);
    } catch (err) {
      setFieldErrors(getValidationErrors(err));
      setError(parseApiError(err).message);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[360px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Prestasi</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nama Event</label>
              <Input value={namaEvent} onChange={(e) => setNamaEvent(e.target.value)} className="mt-1.5" />
              {fieldErrors.nama_event?.[0] && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.nama_event[0]}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Tingkat</label>
              <Button variant="outline" className="w-full justify-start mt-1.5" onClick={() => setTingkatOpen(true)}>
                {tingkat?.label || "Pilih tingkat"}
              </Button>
            </div>
            <div>
              <label className="text-sm font-medium">Kategori Peserta</label>
              <Button variant="outline" className="w-full justify-start mt-1.5" onClick={() => setKategoriPesertaOpen(true)}>
                {kategoriPeserta?.label || "Pilih kategori peserta"}
              </Button>
            </div>
            {role === "pelatih" && (
              <>
                <div>
                  <label className="text-sm font-medium">Kategori Prestasi Pelatih</label>
                  <Button variant="outline" className="w-full justify-start mt-1.5" onClick={() => setKategoriPrestasiOpen(true)}>
                    {kategoriPrestasiPelatih?.label || "Pilih kategori prestasi"}
                  </Button>
                </div>
                <div>
                  <label className="text-sm font-medium">Kategori Atlet</label>
                  <Button variant="outline" className="w-full justify-start mt-1.5" onClick={() => setKategoriAtletOpen(true)}>
                    {kategoriAtlet?.label || "Pilih kategori atlet"}
                  </Button>
                </div>
              </>
            )}
            <div>
              <label className="text-sm font-medium">Tanggal</label>
              <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium">Juara</label>
              <Input value={juara} onChange={(e) => setJuara(e.target.value)} placeholder="Juara 1" className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium">Medali</label>
              <select
                value={medali ?? ""}
                onChange={(e) => setMedali(e.target.value as StorePrestasiPayload["medali"])}
                className="w-full h-10 rounded-lg border border-border bg-input-background px-3 text-sm mt-1.5"
              >
                <option value="Emas">Emas</option>
                <option value="Perak">Perak</option>
                <option value="Perunggu">Perunggu</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Bonus (Rp)</label>
              <Input type="number" min={0} value={bonus} onChange={(e) => setBonus(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium">Keterangan</label>
              <Textarea value={keterangan} onChange={(e) => setKeterangan(e.target.value)} rows={3} className="mt-1.5" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button onClick={() => void handleSubmit()} loading={loading} disabled={!namaEvent}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OptionsMasterDataPicker open={tingkatOpen} onOpenChange={setTingkatOpen} optionKey="tingkat" onSelect={setTingkat} selectedId={tingkat?.id} />
      <OptionsMasterDataPicker open={kategoriPesertaOpen} onOpenChange={setKategoriPesertaOpen} optionKey="kategori_peserta" onSelect={setKategoriPeserta} selectedId={kategoriPeserta?.id} />
      {role === "pelatih" && (
        <>
          <OptionsMasterDataPicker open={kategoriPrestasiOpen} onOpenChange={setKategoriPrestasiOpen} optionKey="kategori_prestasi_pelatih" onSelect={setKategoriPrestasiPelatih} selectedId={kategoriPrestasiPelatih?.id} />
          <OptionsMasterDataPicker open={kategoriAtletOpen} onOpenChange={setKategoriAtletOpen} optionKey="kategori_atlet" onSelect={setKategoriAtlet} selectedId={kategoriAtlet?.id} />
        </>
      )}
    </>
  );
};
