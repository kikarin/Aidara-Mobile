const TOKEN_KEY = "aidara_token";
const THEME_KEY = "aidara-theme";
const PWA_INSTALL_DISMISS_KEY = "aidara-pwa-install-dismissed";

/** Keys that may persist across logout (non-sensitive UX preferences). */
const PERSISTENT_KEYS = [THEME_KEY, PWA_INSTALL_DISMISS_KEY] as const;

export function clearAuthStorage(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.clear();
  } catch {
    // ignore storage errors (private browsing, etc.)
  }
}

export function clearAllAppStorage(): void {
  try {
    const preserved = PERSISTENT_KEYS.reduce<Record<string, string | null>>((acc, key) => {
      acc[key] = localStorage.getItem(key);
      return acc;
    }, {});

    localStorage.clear();
    sessionStorage.clear();

    for (const key of PERSISTENT_KEYS) {
      const value = preserved[key];
      if (value != null) {
        localStorage.setItem(key, value);
      }
    }
  } catch {
    clearAuthStorage();
  }
}
