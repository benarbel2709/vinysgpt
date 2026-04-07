import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

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
