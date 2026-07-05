import axios from "axios";
import type { ApiErrorShape, ApiResponse } from "@/api/types";

function getFirstFieldError(errors?: Record<string, string[]>): string | undefined {
  if (!errors) return undefined;
  for (const messages of Object.values(errors)) {
    if (messages[0]) return messages[0];
  }
  return undefined;
}

export function parseApiError(error: unknown): ApiErrorShape {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse | undefined;

    if (data) {
      return {
        message:
          data.message ||
          getFirstFieldError(data.errors) ||
          "Terjadi kesalahan. Silakan coba lagi.",
        status: data.status === "otp_required" ? "otp_required" : "error",
        statusCode: error.response?.status,
        errors: data.errors,
      };
    }

    if (!error.response) {
      return {
        message: "Tidak ada koneksi internet. Periksa jaringan Anda.",
        status: "network",
      };
    }
  }

  return {
    message: "Terjadi kesalahan. Silakan coba lagi.",
    status: "error",
  };
}

export function getValidationErrors(error: unknown): Record<string, string[]> {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse | undefined;
    return data?.errors ?? {};
  }
  return {};
}

export function parseResendCooldownSeconds(message: string): number | null {
  const match = message.match(/Tunggu\s+(\d+)\s+detik/i);
  return match ? Number.parseInt(match[1], 10) : null;
}
