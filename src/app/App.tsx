import { RouterProvider } from "react-router";
import { ThemeProvider } from "./lib/theme-context";
import { router } from "./routes/router";

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
