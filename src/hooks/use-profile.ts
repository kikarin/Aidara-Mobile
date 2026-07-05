import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as profileApi from "@/api/profile";
import type {
  StoreDokumenPayload,
  StorePrestasiPayload,
  StoreSertifikatPayload,
  UpdateBiodataPayload,
} from "@/api/profile-types";
import { useAuth } from "@/hooks/use-auth";

export const profileKeys = {
  biodata: ["profile", "biodata"] as const,
  sertifikat: ["profile", "sertifikat"] as const,
  prestasi: ["profile", "prestasi"] as const,
  dokumen: ["profile", "dokumen"] as const,
};

export function useProfileBiodata() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: profileKeys.biodata,
    queryFn: async () => profileApi.unwrapProfileData(await profileApi.getBiodata()),
    enabled: isAuthenticated,
  });
}

export function useProfileSertifikat() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: profileKeys.sertifikat,
    queryFn: async () => profileApi.unwrapProfileData(await profileApi.getSertifikat()),
    enabled: isAuthenticated,
  });
}

export function useProfilePrestasi() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: profileKeys.prestasi,
    queryFn: async () => profileApi.unwrapProfileData(await profileApi.getPrestasi()),
    enabled: isAuthenticated,
  });
}

export function useProfileDokumen() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: profileKeys.dokumen,
    queryFn: async () => profileApi.unwrapProfileData(await profileApi.getDokumen()),
    enabled: isAuthenticated,
  });
}

export function useUpdateBiodata() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ payload, file }: { payload: UpdateBiodataPayload; file?: File }) =>
      profileApi.unwrapProfileData(await profileApi.updateBiodata(payload, file)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.biodata });
    },
  });
}

export function useStoreSertifikat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: StoreSertifikatPayload) =>
      profileApi.unwrapProfileData(await profileApi.storeSertifikat(payload)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.sertifikat });
    },
  });
}

export function useDeleteSertifikat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => profileApi.deleteSertifikat(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.sertifikat });
    },
  });
}

export function useStorePrestasi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: StorePrestasiPayload) =>
      profileApi.unwrapProfileData(await profileApi.storePrestasi(payload)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.prestasi });
    },
  });
}

export function useDeletePrestasi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => profileApi.deletePrestasi(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.prestasi });
    },
  });
}

export function useStoreDokumen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: StoreDokumenPayload) =>
      profileApi.unwrapProfileData(await profileApi.storeDokumen(payload)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.dokumen });
    },
  });
}

export function useDeleteDokumen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => profileApi.deleteDokumen(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.dokumen });
    },
  });
}
