import * as React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { FileText, Eye, Download, Trash2, Plus, File } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export interface Document {
  id: string;
  type: string;
  documentNumber: string;
  fileUrl: string;
  fileType: string;
  uploadDate: Date;
}

interface DokumenTabProps {
  documents: Document[];
  onAdd?: () => void;
  onPreview: (doc: Document) => void;
  onDownload: (doc: Document) => void;
  onDelete?: (docId: string) => void;
  loading?: boolean;
  canAdd?: boolean;
  canDelete?: boolean;
}

export const DokumenTab: React.FC<DokumenTabProps> = ({
  documents,
  onAdd,
  onPreview,
  onDownload,
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

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="h-20 w-20 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-4">
          <FileText className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Belum Ada Dokumen
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Simpan dokumen penting seperti KTP, KK, dan lainnya
        </p>
        <Button onClick={onAdd} disabled={!canAdd || !onAdd}>
          <Plus className="h-4 w-4" />
          Tambah Dokumen
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Documents List */}
      <div className="space-y-3">
        {documents.map(doc => (
          <Card key={doc.id}>
            <div className="flex gap-4">
              {/* Icon */}
              <div className="h-14 w-14 rounded-xl bg-accent-2/10 border border-accent-2/20 flex items-center justify-center flex-shrink-0">
                <FileText className="h-7 w-7 text-accent-2" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <h4 className="font-semibold text-foreground">{doc.type}</h4>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-mono">
                    {doc.documentNumber}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <File className="h-3 w-3" />
                      {doc.fileType}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {format(doc.uploadDate, "dd MMM yyyy", { locale: id })}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPreview(doc)}
                    className="h-8"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Lihat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload(doc)}
                    className="h-8"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  {canDelete && onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(doc.id)}
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
