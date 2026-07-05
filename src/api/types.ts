export type ApiStatus = "success" | "error" | "otp_required";

export interface ApiResponse<T = unknown> {
  status: ApiStatus;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: PaginatedMeta;
}

export interface PaginatedMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiErrorShape {
  message: string;
  status: ApiStatus | "network";
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface UserRole {
  id: number;
  name: string;
  init_page_login?: string | null;
  bg?: string | null;
  is_allow_login?: number;
  is_vertical_menu?: number;
}

export interface UserRoleSummary {
  id: number;
  name: string;
  description?: string | null;
}

export type UserRoleSlug = "atlet" | "pelatih" | "tenaga_pendukung" | (string & {});

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  no_hp?: string | null;
  tanggal_lahir?: string | null;
  is_active: number;
  is_verifikasi?: number;
  current_role?: UserRole;
  all_roles?: UserRoleSummary[];
  created_at?: string;
  updated_at?: string;
  last_login?: string | null;
}

export interface AuthTokenData {
  user: User;
  token: string;
  token_type: "Bearer";
}

export interface OtpRequiredData {
  email: string;
  requires_otp: true;
}

export interface RefreshTokenData {
  token: string;
  token_type: "Bearer";
}

export interface ProfileData {
  user: User;
}
