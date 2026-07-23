const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const USER_AGENT = "AidaraMobile/1.0 (Program Latihan Rekap Absen)";

interface NominatimAddress {
  road?: string;
  pedestrian?: string;
  footway?: string;
  neighbourhood?: string;
  suburb?: string;
  village?: string;
  hamlet?: string;
  city?: string;
  town?: string;
  municipality?: string;
  county?: string;
  state?: string;
  country?: string;
}

interface NominatimResponse {
  display_name?: string;
  address?: NominatimAddress;
}

function formatAddressFromNominatim(data: NominatimResponse): string {
  const a = data.address;
  if (a) {
    const parts = [
      a.road || a.pedestrian || a.footway,
      a.neighbourhood || a.suburb || a.village || a.hamlet,
      a.city || a.town || a.municipality || a.county,
      a.state,
      a.country,
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
  }
  return data.display_name ?? "Lokasi tidak dikenali";
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "json",
    "accept-language": "id",
    zoom: "18",
  });

  const response = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { Accept: "application/json", "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil alamat lokasi");
  }

  const data = (await response.json()) as NominatimResponse;
  return formatAddressFromNominatim(data);
}

export function formatGeoPhotoTimestamp(date: Date): string {
  const formatted = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
  return `${formatted} WIB`;
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [text];
}

export interface GeoPhotoWatermark {
  timestamp: Date;
  address: string;
}

export function drawGeoPhotoWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  watermark: GeoPhotoWatermark
): void {
  const padding = Math.max(12, Math.round(width * 0.025));
  const timeLabel = formatGeoPhotoTimestamp(watermark.timestamp);
  const locationLabel = watermark.address;

  const baseFontSize = Math.max(14, Math.round(width * 0.032));
  const timeFontSize = Math.round(baseFontSize * 1.1);
  const locFontSize = baseFontSize;

  ctx.font = `600 ${timeFontSize}px system-ui, -apple-system, sans-serif`;
  const timeLines = [`Waktu: ${timeLabel}`];

  ctx.font = `500 ${locFontSize}px system-ui, -apple-system, sans-serif`;
  const maxTextWidth = width - padding * 2 - 16;
  const locationLines = wrapCanvasText(ctx, `Lokasi: ${locationLabel}`, maxTextWidth);

  const lineHeight = Math.round(locFontSize * 1.35);
  const totalLines = timeLines.length + locationLines.length;
  const boxHeight = padding * 2 + totalLines * lineHeight;
  const boxTop = height - boxHeight;

  ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
  ctx.fillRect(0, boxTop, width, boxHeight);

  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";

  let y = boxTop + padding;
  ctx.font = `600 ${timeFontSize}px system-ui, -apple-system, sans-serif`;
  for (const line of timeLines) {
    ctx.fillText(line, padding, y);
    y += lineHeight;
  }

  ctx.font = `500 ${locFontSize}px system-ui, -apple-system, sans-serif`;
  for (const line of locationLines) {
    ctx.fillText(line, padding, y);
    y += lineHeight;
  }
}

export interface CaptureGeoPhotoOptions {
  /** Mirror horizontally — use for front/selfie camera so saved photo matches preview. */
  mirror?: boolean;
}

export async function captureGeoPhotoFromVideo(
  video: HTMLVideoElement,
  watermark: GeoPhotoWatermark,
  options?: CaptureGeoPhotoOptions
): Promise<{ blob: Blob; dataUrl: string }> {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak tersedia");

  ctx.save();
  if (options?.mirror) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.restore();
  drawGeoPhotoWatermark(ctx, canvas.width, canvas.height, watermark);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("Gagal membuat foto"))),
      "image/jpeg",
      0.92
    );
  });

  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  return { blob, dataUrl };
}
