import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./AuthContext";

// Enable MSW in development mode
async function enableMocking() {
  if (import.meta.env.MODE !== "development") {
    return;
  }

  const { worker } = await import("./mocks/browser");

  // Start the worker and wait for it to be ready
  return worker.start({
    onUnhandledRequest: "bypass", // Don't warn about unhandled requests
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>
  );
});
