import { apiRequest } from "@/api/client";
import type {
  AuthTokenData,
  OtpRequiredData,
  ProfileData,
  RefreshTokenData,
} from "@/api/types";
import { setToken } from "@/app/lib/token-storage";

function getDeviceName(): string {
  return import.meta.env.VITE_APP_NAME || "Aidara Mobile";
}

export async function login(email: string, password: string, deviceName?: string) {
  const response = await apiRequest<AuthTokenData | OtpRequiredData>({
    method: "POST",
    url: "/auth/login",
    data: {
      email,
      password,
      device_name: deviceName ?? getDeviceName(),
    },
  });

  if (response.status === "success" && response.data && "token" in response.data) {
    setToken(response.data.token);
  }

  return response;
}

export async function verifyOtp(email: string, otp: string) {
  const response = await apiRequest<AuthTokenData>({
    method: "POST",
    url: "/auth/verify-otp",
    data: { email, otp },
  });

  if (response.status === "success" && response.data?.token) {
    setToken(response.data.token);
  }

  return response;
}

export async function resendOtp(email: string) {
  return apiRequest({
    method: "POST",
    url: "/auth/resend-otp",
    data: { email },
  });
}

export async function logout() {
  return apiRequest({
    method: "POST",
    url: "/auth/logout",
  });
}

export async function getProfile() {
  return apiRequest<ProfileData>({
    method: "GET",
    url: "/auth/profile",
  });
}

export async function refreshToken() {
  const response = await apiRequest<RefreshTokenData>({
    method: "POST",
    url: "/auth/refresh",
  });

  if (response.status === "success" && response.data?.token) {
    setToken(response.data.token);
  }

  return response;
}