import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useAuthContext } from "@/context/AuthContext";
import { adaptNextSession } from "@/lib/planGenerator";
import { Checkin as CheckinType } from "@/types";
import type { HelpedMost } from "@/constants/conditions";
import { HELPED_MOST_LABELS } from "@/constants/conditions";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import PageIllustration from "@/components/illustrations/PageIllustration";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

function SliderField({ label, value, onChange, ariaLabel, minLabel, maxLabel }: {
  label: string; value: number; onChange: (v: number) => void; ariaLabel?: string; minLabel?: string; maxLabel?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[15px] font-medium">{label}</span>
        <span className="text-sm font-bold text-accent bg-accent/10 rounded-full w-8 h-8 flex items-center justify-center">{value}</span>
      </div>
      <input type="range" min={0} max={10} value={value}
        onChange={(e) => onChange(Number(e.target.value))} className="w-full"
        aria-label={ariaLabel || label} aria-valuemin={0} aria-valuemax={10} aria-valuenow={value} />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}

const HELPED_OPTIONS: HelpedMost[] = ["breath", "movement", "release"];

export default function CheckinPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { state, updateState } = useApp();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  // Pre-populate "before" from last session's "after" values, default to 0
  const lastAfter = useMemo(() => {
    try {
      const raw = localStorage.getItem("vinys_last_checkin_after");
      if (raw) return JSON.parse(raw) as { pain: number; fatigue: number };
    } catch {}
    return null;
  }, []);

  const [painBefore, setPainBefore] = useState(lastAfter?.pain ?? 0);
  const [painAfter, setPainAfter] = useState(0);
  const [fatigueBefore, setFatigueBefore] = useState(lastAfter?.fatigue ?? 0);
  const [fatigueAfter, setFatigueAfter] = useState(0);
  const [tooMuch, setTooMuch] = useState(false);
  const [helpedMost, setHelpedMost] = useState<HelpedMost>("breath");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!sessionId) return;

    const checkin: CheckinType = {
      id: `checkin_${Date.now()}`, sessionId, createdAt: new Date().toISOString(),
      painBefore, painAfter, fatigueBefore, fatigueAfter, tooMuch, helpedMost,
    };

    let plan = state.currentPlan;
    if (plan) {
      plan = adaptNextSession(plan, sessionId, tooMuch, painAfter - painBefore, state.profile.flareToday, state.profile.minutesPerSession, state.exerciseLibrary, state.profile.conditions);
    }

    updateState({ checkins: [...state.checkins, checkin], currentPlan: plan });

    // Persist "after" values so next session's "before" can pre-populate
    localStorage.setItem("vinys_last_checkin_after", JSON.stringify({ pain: painAfter, fatigue: fatigueAfter }));

    // Save to Supabase
    if (user) {
      await supabase.from("user_checkins").insert({
        user_id: user.id,
        source: "end_of_practice",
        pain_before: painBefore,
        pain_after: painAfter,
        fatigue_before: fatigueBefore,
        fatigue_after: fatigueAfter,
      });
    }

    setSaved(true);
    setTimeout(() => navigate("/complete"), 1500);
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-lg mx-auto">
        <PageIllustration theme="check" />

        <div className="text-center">
          <h1 className="text-foreground">Quick Check-In</h1>
          <p className="text-sm text-muted-foreground mt-1">This helps us adapt your next practice session.</p>
        </div>

        <div className="card-premium p-6 space-y-5">
          <SliderField label="Pain before" value={painBefore} onChange={setPainBefore} minLabel="0 — None" maxLabel="10 — Severe" />
          <SliderField label="Pain after" value={painAfter} onChange={setPainAfter} minLabel="0 — None" maxLabel="10 — Severe" />
          <SliderField label="Fatigue before" value={fatigueBefore} onChange={setFatigueBefore} minLabel="0 — None" maxLabel="10 — Severe" />
          <SliderField label="Fatigue after" value={fatigueAfter} onChange={setFatigueAfter} minLabel="0 — None" maxLabel="10 — Severe" />
        </div>

        <div className="card-premium p-6 space-y-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setTooMuch(!tooMuch)}
              className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                tooMuch ? "bg-destructive" : "bg-input"
              }`}>
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${
                tooMuch ? "right-1" : "right-[calc(100%-1.75rem)]"
              }`} />
            </div>
            <span className="text-[15px] font-medium">Was it too much?</span>
          </label>

          <div className="space-y-2">
            <span className="text-[15px] font-medium">What helped most?</span>
            <div className="flex gap-2">
              {HELPED_OPTIONS.map((opt) => (
                <button key={opt} onClick={() => setHelpedMost(opt)}
                  className={`flex-1 text-sm py-2.5 rounded-[16px] border-2 font-medium transition-all ${
                    helpedMost === opt
                      ? "border-accent bg-accent/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-accent/30"
                  }`}>
                  {HELPED_MOST_LABELS[opt]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {saved ? (
          <div className="card-premium p-4 flex items-center gap-3 animate-fade-in">
            <CheckCircle2 size={20} className="text-accent flex-shrink-0" />
            <p className="text-sm text-foreground font-medium">Saved — we'll adapt your next session based on this.</p>
          </div>
        ) : (
          <Button variant="hero" size="lg" onClick={handleSave} className="w-full">
            Save & continue
          </Button>
        )}
      </div>
    </Layout>
  );
}
