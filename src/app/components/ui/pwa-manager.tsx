import { usePwaInstallPrompt, usePwaUpdate } from "@/hooks/use-pwa";

export function PwaManager() {
  usePwaUpdate();
  usePwaInstallPrompt();
  return null;
}
