/**
 * Production-only guards: enforce HTTPS for the app shell and validate API base URL.
 */
export function enforceProductionSecurity(): void {
  if (!import.meta.env.PROD || typeof window === "undefined") {
    return;
  }

  if (window.location.protocol === "http:" && !isLocalhost(window.location.hostname)) {
    window.location.replace(window.location.href.replace(/^http:/, "https:"));
    return;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL ?? "";
  if (apiBase.startsWith("http://") && !apiBase.includes("localhost")) {
    console.error("[Aidara Security] VITE_API_BASE_URL must use HTTPS in production.");
  }
}

function isLocalhost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}
