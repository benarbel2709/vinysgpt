import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.MODE === "production",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.0,
  replaysOnErrorSampleRate: 0.5,
});

// One-time migration of legacy localStorage keys to vinys_* prefix
(function migrateLegacyStorage() {
  const migrations: [string, string][] = [
    ['pranvaAppState', 'vinys_app_state'],
    ['pranvaRecentExercises', 'vinys_recent_exercises'],
    ['pranvaGuestMode', 'vinys_guest_mode'],
    ['pranvaDisableAnimations', 'vinys_disable_animations'],
  ];
  migrations.forEach(([oldKey, newKey]) => {
    try {
      const val = localStorage.getItem(oldKey);
      if (val !== null && localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, val);
        localStorage.removeItem(oldKey);
      }
    } catch {}
  });
})();

createRoot(document.getElementById("root")!).render(<App />);
