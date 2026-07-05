import * as React from "react";
import { Upload, File, X, Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  files: UploadedFile[];
  onUpload: (files: File[]) => Promise<void>;
  onRemove: (fileId: string) => void;
  label?: string;
  description?: string;
  loading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = "*/*",
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  files,
  onUpload,
  onRemove,
  label = "Upload File",
  description,
  loading = false
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const fileArray = Array.from(selectedFiles);
    const validFiles = fileArray.filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} terlalu besar. Maksimal ${maxSize / 1024 / 1024}MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      await onUpload(validFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return ImageIcon;
    if (type.includes("pdf")) return FileText;
    return File;
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}

      {/* Upload Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {loading ? (
          <div className="py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Mengunggah...</p>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-foreground mb-1">
              Klik untuk upload atau drag & drop
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4"
            >
              Pilih File
            </Button>
          </>
        )}
      </div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(file => {
            const Icon = getFileIcon(file.type);
            return (
              <Card key={file.id} className="flex items-center gap-3 p-3">
                <div className="h-10 w-10 rounded-lg bg-surface-2 border border-border flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(file.id)}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
