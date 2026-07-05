import * as React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Award, Eye, Trash2, Plus, File } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export interface Certificate {
  id: string;
  name: string;
  organizer: string;
  issueDate: Date;
  fileUrl?: string;
  fileType?: string;
}

interface SertifikatTabProps {
  certificates: Certificate[];
  onAdd?: () => void;
  onPreview: (cert: Certificate) => void;
  onDelete?: (certId: string) => void;
  loading?: boolean;
  canAdd?: boolean;
  canDelete?: boolean;
}

export const SertifikatTab: React.FC<SertifikatTabProps> = ({
  certificates,
  onAdd,
  onPreview,
  onDelete,
  loading = false,
  canAdd = true,
  canDelete = true,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="h-20 w-20 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-4">
          <Award className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Belum Ada Sertifikat
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Tambahkan sertifikat pelatihan dan keahlian Anda
        </p>
        <Button onClick={onAdd} disabled={!canAdd || !onAdd}>
          <Plus className="h-4 w-4" />
          Tambah Sertifikat
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Certificates Grid */}
      <div className="space-y-3">
        {certificates.map(cert => (
          <Card key={cert.id} className="relative">
            <div className="flex gap-4">
              {/* Preview Icon */}
              <div className="h-14 w-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                <Award className="h-7 w-7 text-accent" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <h4 className="font-semibold text-foreground">{cert.name}</h4>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {cert.organizer}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {format(cert.issueDate, "dd MMM yyyy", { locale: id })}
                    </Badge>
                    {cert.fileUrl && (
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <File className="h-3 w-3" />
                        {cert.fileType || "PDF"}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPreview(cert)}
                    className="h-8"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Lihat
                  </Button>
                  {canDelete && onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(cert.id)}
                      className="h-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* FAB */}
      {canAdd && onAdd && (
        <button
          onClick={onAdd}
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-primary text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center z-40"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};
