import { useQuery } from "@tanstack/react-query";
import * as prestasiApi from "@/api/prestasi";
import type { PrestasiListParams } from "@/api/prestasi-types";
import { useAuth } from "@/hooks/use-auth";

export const prestasiKeys = {
  list: (params?: PrestasiListParams) => ["prestasi", "list", params ?? {}] as const,
};

export function usePrestasiList(params?: PrestasiListParams) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: prestasiKeys.list(params),
    queryFn: () => prestasiApi.getPrestasiList(params),
    enabled: isAuthenticated,
  });
}

export function usePrestasiPreview() {
  return usePrestasiList({ limit: 5 });
}
