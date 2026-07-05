export interface FileUploadRule {
  maxBytes: number;
  mimeTypes: string[];
  extensions: string[];
  label: string;
}

export const FILE_UPLOAD_RULES = {
  profilePhoto: {
    maxBytes: 4 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    extensions: ["jpg", "jpeg", "png", "webp"],
    label: "Foto profil",
  },
  profileDocument: {
    maxBytes: 4 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
    extensions: ["jpg", "jpeg", "png", "webp", "pdf"],
    label: "Dokumen",
  },
  rekapPhoto: {
    maxBytes: 5 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/gif"],
    extensions: ["jpg", "jpeg", "png", "gif"],
    label: "Foto absen",
  },
  rekapDocument: {
    maxBytes: 10 * 1024 * 1024,
    mimeTypes: [
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    extensions: ["pdf", "xls", "xlsx"],
    label: "File nilai",
  },
} satisfies Record<string, FileUploadRule>;

export type FileUploadPreset = keyof typeof FILE_UPLOAD_RULES;

function getExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function formatMaxSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return Number.isInteger(mb) ? `${mb}MB` : `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function validateUploadFile(file: File, preset: FileUploadPreset): string | null {
  const rule = FILE_UPLOAD_RULES[preset];
  const ext = getExtension(file.name);
  const mimeOk = rule.mimeTypes.includes(file.type);
  const extOk = rule.extensions.includes(ext);

  if (!mimeOk && !extOk) {
    return `${rule.label}: format tidak didukung (${rule.extensions.join(", ")})`;
  }

  if (file.size > rule.maxBytes) {
    return `${rule.label} terlalu besar. Maksimal ${formatMaxSize(rule.maxBytes)}`;
  }

  return null;
}
