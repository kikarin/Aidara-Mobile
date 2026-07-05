import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./app/App";
import { queryClient } from "./app/lib/query-client";
import { AuthProvider } from "./context/auth-context";
import { enforceProductionSecurity } from "./app/lib/production-security";
import "./styles/index.css";

enforceProductionSecurity();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
