import { useState, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { useAuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Layout from "@/components/Layout";
import SignInModal from "@/components/SignInModal";
import { readState, writeState } from "@/lib/storage";
import { RotateCcw, Download, Upload, Settings as SettingsIcon, Info, FileText, UserCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { PracticeTime } from "@/constants/conditions";

const TIME_OPTIONS: { value: PracticeTime; label: string; desc: string }[] = [
  { value: "morning", label: "Morning", desc: "06:00–12:00" },
  { value: "afternoon", label: "Afternoon", desc: "12:00–17:00" },
  { value: "evening", label: "Evening", desc: "17:00–21:00" },
  { value: "night", label: "Night", desc: "21:00+" },
];

const CLOSING_OPTIONS: { value: "savasana" | "meditation" | "body_rest"; label: string; desc: string }[] = [
  { value: "savasana", label: "Savasana", desc: "Classic lying-down rest" },
  { value: "body_rest", label: "Body Rest", desc: "Body scan & integration" },
  { value: "meditation", label: "Meditation", desc: "Guided stillness" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { state, updateProfile, resetAll } = useApp();
  const { user, signOut } = useAuthContext();
  const [showSignIn, setShowSignIn] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(
    !readState<boolean>("vinys_disable_animations", false)
  );
  const [importConfirm, setImportConfirm] = useState(false);
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { practiceTime, closingPreference } = state.profile;
  const closing = closingPreference || "savasana";

  const handleToggleAnimations = (checked: boolean) => {
    setAnimationsEnabled(checked);
    writeState("vinys_disable_animations", !checked);
  };

  const handleReset = () => {
    resetAll();
    setConfirmReset(false);
    window.location.href = "/";
  };

  const handleExportData = () => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("pranva") || key.startsWith("yael") || key.startsWith("yogacare") || key === "debugForceAnimate" || key === "debugAnimations")) {
        try { data[key] = JSON.parse(localStorage.getItem(key) || "null"); }
        catch { data[key] = localStorage.getItem(key); }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `vinys-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try { const data = JSON.parse(text); if (typeof data === "object" && data !== null) { setPendingImport(text); setImportConfirm(true); } }
      catch { alert("Invalid file"); }
    };
    reader.readAsText(file); e.target.value = "";
  };

  const confirmImportFn = () => {
    if (!pendingImport) return;
    try {
      const data = JSON.parse(pendingImport);
      Object.entries(data).forEach(([key, value]) => { localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value)); });
      setImportConfirm(false); setPendingImport(null); window.location.reload();
    } catch { alert("Import error"); }
  };

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        <div className="text-center space-y-2">
          <h1 className="text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your preferences and data.</p>
        </div>

        <div className="card-premium p-6 space-y-4">
          <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2"><SettingsIcon size={16} className="text-accent" />Preferences</h2>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[15px] font-medium text-foreground">Exercise animations</span>
              <p className="text-xs text-muted-foreground mt-0.5">Show movement demonstrations</p>
            </div>
            <Switch checked={animationsEnabled} onCheckedChange={handleToggleAnimations} />
          </div>
        </div>

        <div className="card-premium p-6 space-y-3">
          <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2"><SettingsIcon size={16} className="text-accent" />Practice Time</h2>
          <div className="grid grid-cols-2 gap-2">
            {TIME_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => updateProfile({ practiceTime: opt.value })}
                className={`py-3 px-3 rounded-[16px] border-2 text-center transition-all ${
                  practiceTime === opt.value
                    ? "border-accent bg-accent/10 text-foreground shadow-sm"
                    : "border-border bg-card text-foreground hover:border-accent/30"
                }`}>
                <span className="text-sm font-bold block">{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card-premium p-6 space-y-3">
          <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2"><SettingsIcon size={16} className="text-accent" />Session Closing</h2>
          <div className="flex gap-2">
            {CLOSING_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => updateProfile({ closingPreference: opt.value })}
                className={`flex-1 py-3 px-2 rounded-[16px] border-2 text-center transition-all ${
                  closing === opt.value
                    ? "border-accent bg-accent/10 text-foreground shadow-sm"
                    : "border-border bg-card text-foreground hover:border-accent/30"
                }`}>
                <span className="text-sm font-bold block">{opt.label}</span>
                <span className="text-[11px] text-muted-foreground leading-tight">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card-premium p-6 space-y-4">
          <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2"><Download size={16} className="text-accent" />Data Management</h2>
          <div className="flex gap-2">
            <Button variant="outline-calm" size="sm" onClick={handleExportData} className="flex-1 gap-1.5 text-xs"><Download size={14} />Export data</Button>
            <Button variant="outline-calm" size="sm" onClick={() => fileInputRef.current?.click()} className="flex-1 gap-1.5 text-xs"><Upload size={14} />Import data</Button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </div>
          <Button variant="outline-calm" size="sm" onClick={() => navigate("/clinical-export")} className="w-full gap-1.5 text-xs mt-2">
            <FileText size={14} />Clinical Audit Export (JSON)
          </Button>
          {importConfirm && (
            <div className="card-premium p-4 border border-accent/30 space-y-3">
              <p className="text-sm font-medium text-foreground">Import data? This will replace existing data.</p>
              <div className="flex gap-2">
                <Button variant="hero" size="sm" onClick={confirmImportFn} className="flex-1">Yes, import</Button>
                <Button variant="outline" size="sm" onClick={() => { setImportConfirm(false); setPendingImport(null); }} className="flex-1">Cancel</Button>
              </div>
            </div>
          )}
        </div>

        <div className="card-premium p-6 space-y-3">
          <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2"><Info size={16} className="text-accent" />About vinys</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            vinys builds structured, adaptive therapeutic yoga practices designed around your condition, capacity, and how you feel today.
          </p>
          <p className="text-xs text-muted-foreground">
            Designed with a supportive, therapeutic-minded approach informed by clinical teaching experience.
          </p>
          <hr className="border-border" />
          <p className="text-xs text-muted-foreground">
            Educational movement content. Not medical advice. Consult a healthcare professional for any medical concerns.
          </p>
        </div>

        <div className="card-premium p-6 space-y-4 mt-12">
          {!confirmReset ? (
            <>
              <Button variant="outline-calm" size="sm" onClick={() => setConfirmReset(true)} className="w-full gap-2 text-destructive"><RotateCcw size={14} />Full reset — start over</Button>
              <p className="text-xs text-muted-foreground text-center">This will permanently delete your plan and all session history.</p>
            </>
          ) : (
            <div className="p-4 border border-destructive/30 rounded-2xl space-y-3">
              <p className="text-destructive text-sm font-medium">This will delete all data. Are you sure?</p>
              <div className="flex gap-2">
                <Button variant="stop" size="sm" onClick={handleReset} className="flex-1">Yes, delete all</Button>
                <Button variant="outline" size="sm" onClick={() => setConfirmReset(false)} className="flex-1">Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
