import * as React from "react";
import { X, Camera, MapPin, Clock, AlertTriangle, CheckCircle, Loader2, SwitchCamera } from "lucide-react";
import { cn } from "../ui/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import {
  captureGeoPhotoFromVideo,
  formatGeoPhotoTimestamp,
  reverseGeocode,
} from "@/app/lib/geo-photo";

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  file: File;
  timestamp: Date;
  lat?: number;
  lng?: number;
  address?: string;
}

type FacingMode = "user" | "environment";

interface GpsCameraModalProps {
  open: boolean;
  onClose: () => void;
  onCapture: (photo: CapturedPhoto) => void;
  /** Default camera: "user" = front/selfie, "environment" = rear. */
  defaultFacingMode?: FacingMode;
}

type GpsState = "loading" | "success" | "error";
type AddressState = "idle" | "loading" | "success" | "error";

async function getCameraStream(preferredFacing: FacingMode): Promise<MediaStream> {
  const attempts: MediaStreamConstraints[] = [
    { video: { facingMode: { exact: preferredFacing } } },
    { video: { facingMode: preferredFacing } },
    { video: { facingMode: preferredFacing === "user" ? "environment" : "user" } },
    { video: true },
  ];

  let lastError: unknown;
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

export const GpsCameraModal: React.FC<GpsCameraModalProps> = ({
  open,
  onClose,
  onCapture,
  defaultFacingMode = "user",
}) => {
  const [gpsState, setGpsState] = React.useState<GpsState>("loading");
  const [addressState, setAddressState] = React.useState<AddressState>("idle");
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = React.useState<string | null>(null);
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [capturing, setCapturing] = React.useState(false);
  const [cameraActive, setCameraActive] = React.useState(false);
  const [facingMode, setFacingMode] = React.useState<FacingMode>(defaultFacingMode);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const isReady = gpsState === "success" && addressState === "success" && !!address && !!coords;

  React.useEffect(() => {
    if (!open) return;
    timerRef.current = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;

    setGpsState("loading");
    setAddressState("idle");
    setCoords(null);
    setAddress(null);

    if (!navigator.geolocation) {
      setGpsState("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        setGpsState("success");
        setAddressState("loading");

        try {
          const resolvedAddress = await reverseGeocode(lat, lng);
          setAddress(resolvedAddress);
          setAddressState("success");
        } catch {
          setAddressState("error");
        }
      },
      () => setGpsState("error"),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [open]);

  React.useEffect(() => {
    if (open) setFacingMode(defaultFacingMode);
  }, [open, defaultFacingMode]);

  React.useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setCameraActive(false);

    const startCamera = async () => {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        const stream = await getCameraStream(facingMode);
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraActive(true);
      } catch {
        if (!cancelled) setCameraActive(false);
      }
    };

    startCamera();
    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [open, facingMode]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    onClose();
  };

  const handleCapture = async () => {
    if (!isReady || !coords || !address || !videoRef.current) return;

    setCapturing(true);

    try {
      const timestamp = new Date();
      const { blob, dataUrl } = await captureGeoPhotoFromVideo(
        videoRef.current,
        { timestamp, address },
        { mirror: facingMode === "user" }
      );

      const filename = `foto-absen-${timestamp.getTime()}.jpg`;
      const file = new File([blob], filename, { type: "image/jpeg" });

      const photo: CapturedPhoto = {
        id: timestamp.getTime().toString(),
        dataUrl,
        file,
        timestamp,
        lat: coords.lat,
        lng: coords.lng,
        address,
      };

      handleClose();
      onCapture(photo);
    } catch {
      toast.error("Gagal mengambil foto. Coba lagi.");
      setCapturing(false);
    }
  };

  if (!open) return null;

  const wibTime = format(currentTime, "HH:mm:ss", { locale: idLocale });
  const fullDate = format(currentTime, "EEEE, d MMMM yyyy", { locale: idLocale });
  const previewTimestamp = formatGeoPhotoTimestamp(currentTime);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            facingMode === "user" && cameraActive && "scale-x-[-1]"
          )}
        />

        {!cameraActive && (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center px-6">
              <Camera className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/70 text-sm">Kamera tidak tersedia atau izin ditolak</p>
              <p className="text-white/50 text-xs mt-2">Aktifkan izin kamera di browser untuk mengambil foto absen</p>
            </div>
          </div>
        )}

        {/* Live preview watermark (mirrors what will be burned into photo) */}
        {isReady && cameraActive && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-4 py-3 pointer-events-none">
            <p className="text-white text-xs font-semibold leading-snug">
              Waktu: {previewTimestamp}
            </p>
            <p className="text-white/90 text-[11px] mt-1 leading-snug line-clamp-3">
              Lokasi: {address}
            </p>
          </div>
        )}

        <div className="absolute top-0 left-0 right-0 p-4 flex flex-col gap-0">
          <div className="flex justify-between mb-3">
            <button
              type="button"
              onClick={toggleFacingMode}
              disabled={!cameraActive}
              className={cn(
                "w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white",
                !cameraActive && "opacity-40 cursor-not-allowed"
              )}
              aria-label={facingMode === "user" ? "Ganti ke kamera belakang" : "Ganti ke kamera depan"}
            >
              <SwitchCamera className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-white/70" />
              <div>
                <p className="text-white font-bold text-xl leading-none tracking-tight">{wibTime} WIB</p>
                <p className="text-white/60 text-xs mt-0.5">{fullDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className={cn(
                "h-4 w-4 shrink-0 mt-0.5",
                gpsState === "loading" || addressState === "loading" ? "text-amber-400 animate-pulse" :
                isReady ? "text-green-400" : "text-red-400"
              )} />
              <div className="flex-1 min-w-0">
                {gpsState === "loading" && (
                  <p className="text-amber-300 text-xs flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Menunggu sinyal GPS...
                  </p>
                )}
                {gpsState === "success" && addressState === "loading" && (
                  <p className="text-amber-300 text-xs flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Mendeteksi alamat lokasi...
                  </p>
                )}
                {isReady && address && (
                  <>
                    <p className="text-green-300 text-xs font-semibold">Lokasi ditemukan</p>
                    <p className="text-white/80 text-xs mt-0.5 leading-snug">{address}</p>
                  </>
                )}
                {(gpsState === "error" || addressState === "error") && (
                  <p className="text-red-300 text-xs flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {gpsState === "error"
                      ? "GPS tidak ditemukan. Aktifkan GPS dan izin lokasi."
                      : "Alamat lokasi gagal dideteksi. Coba lagi."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black px-6 pt-5 pb-8 flex flex-col items-center gap-4">
        {!isReady ? (
          <div className={cn(
            "px-4 py-2 rounded-full text-sm font-medium text-center",
            gpsState === "error" || addressState === "error"
              ? "bg-red-900/50 text-red-300"
              : "bg-amber-900/50 text-amber-300"
          )}>
            {gpsState === "loading" && "Menunggu sinyal GPS..."}
            {gpsState === "success" && addressState === "loading" && "Mendeteksi alamat lokasi..."}
            {gpsState === "error" && "GPS tidak tersedia"}
            {gpsState === "success" && addressState === "error" && "Alamat lokasi gagal dideteksi"}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-400 text-xs font-medium">
            <CheckCircle className="h-4 w-4" />
            Geo Photo siap · Waktu & lokasi akan tercetak di foto
          </div>
        )}

        <button
          onClick={handleCapture}
          disabled={!isReady || capturing || !cameraActive}
          className={cn(
            "w-20 h-20 rounded-full border-4 transition-all active:scale-95",
            isReady && !capturing && cameraActive
              ? "bg-white border-white/30 shadow-lg"
              : "bg-white/30 border-white/10 cursor-not-allowed"
          )}
        >
          {capturing ? (
            <Loader2 className="h-8 w-8 text-black/50 mx-auto animate-spin" />
          ) : (
            <div className="w-full h-full rounded-full bg-white/90 m-auto" />
          )}
        </button>

        <p className="text-white/40 text-xs text-center">
          Timestamp dan alamat lengkap akan tercetak permanen di foto
        </p>
      </div>
    </div>
  );
};
