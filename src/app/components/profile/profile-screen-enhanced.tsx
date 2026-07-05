import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ProfileHeader } from "./profile-header";
import { ProfileNavTabs, Tab } from "./profile-nav-tabs";
import { BiodataView } from "./biodata-view";
import { SertifikatTab } from "./sertifikat-tab";
import { PrestasiTab } from "./prestasi-tab";
import { DokumenTab } from "./dokumen-tab";
import { BiodataEditScreen } from "./biodata-edit-screen";
import { SertifikatFormDialog } from "./sertifikat-form-dialog";
import { PrestasiFormDialog } from "./prestasi-form-dialog";
import { DokumenFormDialog } from "./dokumen-form-dialog";
import { Button } from "../ui/button";
import { ConfirmDeleteDialog } from "../ui/confirm-delete-dialog";
import { ErrorState } from "../ui/error-state";
import { PageLoadingSkeleton } from "../ui/page-loading-skeleton";
import {
  mapBiodataToHeader,
  mapBiodataToSections,
  mapDokumenItem,
  mapPrestasiItem,
  mapSertifikatItem,
  openAuthenticatedFile,
} from "@/app/lib/profile-mappers";
import * as profileApi from "@/api/profile";
import {
  canAddDokumen,
  canAddPrestasi,
  canAddSertifikat,
  canDeleteDokumen,
  canDeletePrestasi,
  canDeleteSertifikat,
  canEditBiodata,
} from "@/app/lib/profile-permissions";
import { parseApiError } from "@/hooks/use-api-error";
import {
  useDeleteDokumen,
  useDeletePrestasi,
  useDeleteSertifikat,
  useProfileBiodata,
  useProfileDokumen,
  useProfilePrestasi,
  useProfileSertifikat,
  useStoreDokumen,
  useStorePrestasi,
  useStoreSertifikat,
  useUpdateBiodata,
} from "@/hooks/use-profile";
import type { UpdateBiodataPayload } from "@/api/profile-types";

interface ProfileScreenEnhancedProps {
  onBack: () => void;
}

type ProfileView = "main" | "edit-biodata";

export const ProfileScreenEnhanced: React.FC<ProfileScreenEnhancedProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = React.useState<Tab>("biodata");
  const [view, setView] = React.useState<ProfileView>("main");
  const [sertifikatDialogOpen, setSertifikatDialogOpen] = React.useState(false);
  const [prestasiDialogOpen, setPrestasiDialogOpen] = React.useState(false);
  const [dokumenDialogOpen, setDokumenDialogOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<
    { type: "sertifikat" | "prestasi" | "dokumen"; id: string } | null
  >(null);

  const biodataQuery = useProfileBiodata();
  const sertifikatQuery = useProfileSertifikat();
  const prestasiQuery = useProfilePrestasi();
  const dokumenQuery = useProfileDokumen();

  const updateBiodata = useUpdateBiodata();
  const storeSertifikat = useStoreSertifikat();
  const deleteSertifikat = useDeleteSertifikat();
  const storePrestasi = useStorePrestasi();
  const deletePrestasi = useDeletePrestasi();
  const storeDokumen = useStoreDokumen();
  const deleteDokumen = useDeleteDokumen();

  const biodataData = biodataQuery.data;
  const role = biodataData?.role;
  const permissions = biodataData?.permissions ?? [];

  const profileHeader = biodataData
    ? mapBiodataToHeader(biodataData.biodata, biodataData.role)
    : null;
  const biodataSections = biodataData
    ? mapBiodataToSections(biodataData.biodata, biodataData.role)
    : [];

  const certificates = React.useMemo(
    () => (sertifikatQuery.data?.sertifikat ?? []).map(mapSertifikatItem),
    [sertifikatQuery.data]
  );
  const achievements = React.useMemo(
    () => (prestasiQuery.data?.prestasi ?? []).map(mapPrestasiItem),
    [prestasiQuery.data]
  );
  const documents = React.useMemo(
    () => (dokumenQuery.data?.dokumen ?? []).map(mapDokumenItem),
    [dokumenQuery.data]
  );

  const canEdit = role ? canEditBiodata(role, permissions) : false;

  const handleSaveBiodata = async (payload: UpdateBiodataPayload, file?: File) => {
    await updateBiodata.mutateAsync({ payload, file });
    toast.success("Biodata berhasil diperbarui");
    setView("main");
  };

  const handleDeleteSertifikat = (certId: string) => {
    setDeleteTarget({ type: "sertifikat", id: certId });
  };

  const handleDeletePrestasi = (prestasiId: string) => {
    setDeleteTarget({ type: "prestasi", id: prestasiId });
  };

  const handleDeleteDokumen = (docId: string) => {
    setDeleteTarget({ type: "dokumen", id: docId });
  };

  const deleteDialogCopy = {
    sertifikat: { title: "Hapus sertifikat?", description: "Sertifikat yang dihapus tidak dapat dipulihkan." },
    prestasi: { title: "Hapus prestasi?", description: "Data prestasi yang dihapus tidak dapat dipulihkan." },
    dokumen: { title: "Hapus dokumen?", description: "Dokumen yang dihapus tidak dapat dipulihkan." },
  } as const;

  const isDeletePending =
    deleteSertifikat.isPending || deletePrestasi.isPending || deleteDokumen.isPending;

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const id = Number.parseInt(deleteTarget.id, 10);
      if (deleteTarget.type === "sertifikat") {
        await deleteSertifikat.mutateAsync(id);
        toast.success("Sertifikat berhasil dihapus");
      } else if (deleteTarget.type === "prestasi") {
        await deletePrestasi.mutateAsync(id);
        toast.success("Prestasi berhasil dihapus");
      } else {
        await deleteDokumen.mutateAsync(id);
        toast.success("Dokumen berhasil dihapus");
      }
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  const handlePreviewSertifikat = async (certId: string) => {
    try {
      await openAuthenticatedFile(() =>
        profileApi.downloadSertifikatFile(Number.parseInt(certId, 10))
      );
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  const handlePreviewDokumen = async (docId: string) => {
    try {
      await openAuthenticatedFile(() =>
        profileApi.downloadDokumenFile(Number.parseInt(docId, 10))
      );
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  if (view === "edit-biodata" && biodataData) {
    return (
      <BiodataEditScreen
        role={biodataData.role}
        biodata={biodataData.biodata}
        loading={updateBiodata.isPending}
        onBack={() => setView("main")}
        onSave={handleSaveBiodata}
      />
    );
  }

  if (biodataQuery.isLoading) {
    return <PageLoadingSkeleton variant="form" />;
  }

  if (biodataQuery.isError || !biodataData || !profileHeader || !role) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="flex items-center gap-3 px-6 py-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="h-9 w-9 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-bold text-foreground">Profil Lengkap</h2>
          </div>
        </div>
        <ErrorState
          type="generic"
          message={biodataQuery.error ? parseApiError(biodataQuery.error).message : "Gagal memuat profil"}
          onRetry={() => void biodataQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="flex items-center gap-3 px-6 py-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-9 w-9 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold text-foreground">Profil Lengkap</h2>
        </div>
      </div>

      <div className="px-6 pt-6 pb-4">
        <ProfileHeader
          profile={profileHeader}
          canEdit={canEdit}
          onEdit={() => setView("edit-biodata")}
        />
      </div>

      <ProfileNavTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="px-6 pt-4">
        {activeTab === "biodata" && (
          <BiodataView
            sections={biodataSections}
            canEdit={canEdit}
            onEdit={() => setView("edit-biodata")}
          />
        )}

        {activeTab === "sertifikat" && (
          <SertifikatTab
            certificates={certificates}
            loading={sertifikatQuery.isLoading}
            canAdd={canAddSertifikat(role, permissions)}
            canDelete={canDeleteSertifikat(role, permissions)}
            onAdd={() => setSertifikatDialogOpen(true)}
            onPreview={(cert) => void handlePreviewSertifikat(cert.id)}
            onDelete={handleDeleteSertifikat}
          />
        )}

        {activeTab === "prestasi" && (
          <PrestasiTab
            achievements={achievements}
            loading={prestasiQuery.isLoading}
            canAdd={canAddPrestasi(role, permissions)}
            canDelete={canDeletePrestasi(role, permissions)}
            onAdd={() => setPrestasiDialogOpen(true)}
            onView={(achievement) => toast.info(`Prestasi: ${achievement.eventName}`)}
            onDelete={handleDeletePrestasi}
          />
        )}

        {activeTab === "dokumen" && (
          <DokumenTab
            documents={documents}
            loading={dokumenQuery.isLoading}
            canAdd={canAddDokumen(role, permissions)}
            canDelete={canDeleteDokumen(role, permissions)}
            onAdd={() => setDokumenDialogOpen(true)}
            onPreview={(doc) => void handlePreviewDokumen(doc.id)}
            onDownload={(doc) => void handlePreviewDokumen(doc.id)}
            onDelete={handleDeleteDokumen}
          />
        )}
      </div>

      <SertifikatFormDialog
        open={sertifikatDialogOpen}
        onOpenChange={setSertifikatDialogOpen}
        loading={storeSertifikat.isPending}
        onSubmit={async (payload) => {
          await storeSertifikat.mutateAsync(payload);
          toast.success("Sertifikat berhasil ditambahkan");
        }}
      />

      <PrestasiFormDialog
        open={prestasiDialogOpen}
        onOpenChange={setPrestasiDialogOpen}
        role={role}
        loading={storePrestasi.isPending}
        onSubmit={async (payload) => {
          await storePrestasi.mutateAsync(payload);
          toast.success("Prestasi berhasil ditambahkan");
        }}
      />

      <DokumenFormDialog
        open={dokumenDialogOpen}
        onOpenChange={setDokumenDialogOpen}
        loading={storeDokumen.isPending}
        onSubmit={async (payload) => {
          await storeDokumen.mutateAsync(payload);
          toast.success("Dokumen berhasil ditambahkan");
        }}
      />

      <ConfirmDeleteDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={deleteTarget ? deleteDialogCopy[deleteTarget.type].title : "Hapus?"}
        description={deleteTarget ? deleteDialogCopy[deleteTarget.type].description : undefined}
        onConfirm={handleConfirmDelete}
        loading={isDeletePending}
      />
    </div>
  );
};
