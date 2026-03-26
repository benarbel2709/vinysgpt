import { useState, useCallback } from "react";
import VinysDiagnostic from "@/components/VinysDiagnostic";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import type { ConditionKey, EnergyLevel, PracticeTime } from "@/constants/conditions";
import { CONDITION_LABELS, RED_FLAGS, EQUIPMENT_OPTIONS } from "@/constants/conditions";
import { CONDITION_CATEGORIES, CONDITION_DETAILS } from "@/constants/conditionCategories";
import type { GenericAssessmentData, Assessment } from "@/types";
import { generatePlan } from "@/lib/planGenerator";
import { trackEvent } from "@/lib/analytics";
import BrandLogo from "@/components/BrandLogo";
import FlowProgress from "@/components/FlowProgress";
import { Button } from "@/components/ui/button";
import { X, Check, Pencil } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";

const SESSIONS_OPTIONS = [1, 2, 3, 4, 5];
const MINUTES_OPTIONS = [10, 15, 20, 30, 45];
const TIME_OF_DAY_OPTIONS: { value: PracticeTime; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
];
const CLOSING_OPTIONS = [
  { value: "savasana" as const, label: "Savasana" },
  { value: "body_rest" as const, label: "Body rest & integration" },
  { value: "meditation" as const, label: "Meditation (Guided stillness)" },
];

const RESTRICTION_OPTIONS = [
  "Recent surgery (within 12 months)",
  "Currently under physiotherapy or medical care",
  "Advised to avoid floor-based exercises",
  "Advised to avoid inversion poses",
  "Advised to avoid twisting movements",
  "Avoid high-impact movements",
  "Avoid deep forward bends",
  "Avoid prone (face-down) positions",
];

const STEPPER_STEPS = 6;
const TOTAL_STEPS = 7; // internal: 0-5 = steps, 6 = confirmation

const tagBase = "px-3.5 py-1.5 rounded-[8px] border-2 text-[18px] font-semibold transition-all cursor-pointer leading-tight";
const tagSelected = "border-secondary bg-secondary text-secondary-foreground";
const tagUnselected = "border-border bg-card text-foreground hover:border-secondary/40";
const tag = (sel: boolean) => `${tagBase} ${sel ? tagSelected : tagUnselected}`;
const tagSmall = (sel: boolean) => `px-3 py-1.5 rounded-[8px] border-2 text-[16px] font-semibold transition-all cursor-pointer leading-tight ${sel ? tagSelected : tagUnselected}`;

export default function OnboardingWizard() {
  const { state, updateProfile, updateState } = useApp();
  const navigate = useNavigate();
  const profile = state.profile;

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<ConditionKey[]>([]);
  const [conditionDetails, setConditionDetails] = useState<Record<string, string[]>>({});
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [restrictionOther, setRestrictionOther] = useState("");
  const [practiceTime, setPracticeTime] = useState<PracticeTime>(profile.practiceTime || "morning");
  const [minutesPerSession, setMinutesPerSession] = useState(profile.minutesPerSession || 20);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(profile.sessionsPerWeek || 3);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [closingPref, setClosingPref] = useState<string>("");
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>("medium");
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [timeSelected, setTimeSelected] = useState(false);
  const [durationSelected, setDurationSelected] = useState(false);
  const [sessionsSelected, setSessionsSelected] = useState(false);
  const [showStartOverConfirm, setShowStartOverConfirm] = useState(false);

  const toggle = useCallback((c: ConditionKey) => {
    setSelected(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
  }, []);

  const toggleDetail = useCallback((condition: string, detail: string) => {
    setConditionDetails(p => {
      const cur = p[condition] || [];
      return { ...p, [condition]: cur.includes(detail) ? cur.filter(d => d !== detail) : [...cur, detail] };
    });
  }, []);

  const toggleEquip = useCallback((o: string) => {
    setEquipment(p => p.includes(o) ? p.filter(s => s !== o) : [...p, o]);
  }, []);

  const toggleRestriction = useCallback((r: string) => {
    setRestrictions(p => p.includes(r) ? p.filter(x => x !== r) : [...p, r]);
  }, []);

  const label = (c: string) => CONDITION_LABELS[c as ConditionKey] || c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const hasAnyDetail = selected.length > 0 && selected.every(k => {
    const details = CONDITION_DETAILS[k];
    if (!details || details.length === 0) return true;
    return (conditionDetails[k] || []).length > 0;
  });

  // Step mapping: 0=conditions, 1=details, 2=restrictions, 3=schedule, 4=closing, 5=energy+safety, 6=confirmation
  const canGoNext = (): boolean => {
    switch (step) {
      case 0: return selected.length > 0;
      case 1: return !!diagnosticResult;
      case 2: return true; // restrictions are optional
      case 3: return timeSelected && durationSelected && sessionsSelected;
      case 4: return !!closingPref;
      case 5: return true;
      case 6: return true;
      default: return true;
    }
  };

  const handleBuild = () => {
    const updatedProfile = {
      ...profile,
      conditions: selected,
      energyLevel,
      flareToday: false,
      sessionsPerWeek,
      minutesPerSession,
      practiceTime,
      closingPreference: closingPref as "savasana" | "meditation" | "body_rest",
    };
    updateState({ disclaimerAccepted: true, onboardingCompleted: true });
    updateProfile({
      conditions: selected,
      energyLevel,
      flareToday: false,
      sessionsPerWeek,
      minutesPerSession,
      practiceTime,
      closingPreference: closingPref as "savasana" | "meditation" | "body_rest",
    });

    const assessmentId = `assessment_${Date.now()}`;
    const allRestrictions = [...restrictions];
    if (restrictionOther.trim()) allRestrictions.push(restrictionOther.trim());
    const data: GenericAssessmentData = { mainIssue: selected.join(", "), pain: 5, limits: allRestrictions.join("; "), equipment, redFlags: [] };
    const assessment: Assessment = { id: assessmentId, createdAt: new Date().toISOString(), type: "generic", data };
    const plan = generatePlan(updatedProfile, assessmentId, undefined, state.exerciseLibrary, { pain: 5, fatigue: 5, sleep: 5, flareNow: "no" });
    updateState({ assessments: [...state.assessments, assessment], currentPlan: plan });
    trackEvent("plan_generated", { condition: selected[0], duration: plan.sessions[0]?.durationMinutes });
    const first = plan.sessions[0];
    navigate(first ? `/workout/${first.id}` : "/plan");
  };

  const handleNext = () => {
    if (step === 5 && redFlags.length > 0) {
      navigate("/onboarding/medical-stop");
      return;
    }
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 0) {
      navigate("/");
      return;
    }
    setStep(step - 1);
  };

  const STEP_TITLES = [
    "Your conditions",
    "Where exactly is the issue?",
    "Any movements to avoid?",
    "Practice time & schedule",
    "Session closing",
    "How are you feeling?",
    "You're all set.",
  ];

  const energyOptions: { value: EnergyLevel; label: string }[] = [
    { value: "low", label: "Gentle day" },
    { value: "medium", label: "Feeling okay" },
    { value: "high", label: "Full energy" },
  ];

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* ── HEADER (logo + stepper + X in one row) ── */}
      <header className="shrink-0 z-50 w-full bg-background" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center h-[56px] px-6 lg:px-[100px]">
          <BrandLogo size="md" linkToHome={false} />
          <div className="flex-1 flex justify-center">
            {step < 6 && <FlowProgress current={step + 1} total={STEPPER_STEPS} />}
          </div>
          <button onClick={() => navigate("/")} className="text-foreground/60 hover:text-foreground transition-colors p-2" aria-label="Close onboarding">
            <X size={22} />
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 min-h-0 flex flex-col items-center overflow-y-auto overflow-x-hidden" style={{ maxWidth: "1100px", margin: "0 auto", width: "100%", padding: "0 24px 90px" }}>
        <h1 className="font-display text-foreground font-bold text-2xl text-center shrink-0" style={{ marginTop: "30px" }}>{STEP_TITLES[step]}</h1>
        {step === 2 && <p className="text-muted-foreground text-center text-sm mt-1 shrink-0">This helps us filter out anything that could cause harm.</p>}
        {step === 6 && <p className="text-muted-foreground text-center text-sm mt-1 shrink-0">We'll build your personalized practice.</p>}

        {/* ═══ STEP 1: Condition category grid ═══ */}
        {step === 0 && (
          <div className="w-full" style={{ marginTop: "20px", maxWidth: "1100px", margin: "20px auto 0" }}>
            <div className="flex flex-wrap justify-center" style={{ gap: "20px", marginBottom: "20px" }}>
              {CONDITION_CATEGORIES.slice(0, 3).map(cat => (
                <div key={cat.name} className="rounded-[12px] bg-surface-warm" style={{ padding: "20px", width: "340px", flexShrink: 0 }}>
                  <h3 className="font-bold text-primary text-center text-[18px]" style={{ marginBottom: "14px" }}>{cat.name}</h3>
                  <div className="flex flex-wrap justify-center" style={{ gap: "10px" }}>
                    {cat.conditions.map(key => (
                      <button key={key} onClick={() => toggle(key)}
                        className={`rounded-[8px] border-2 text-[16px] font-semibold transition-all cursor-pointer ${selected.includes(key) ? tagSelected : tagUnselected}`}
                        style={{ paddingLeft: "10px", paddingRight: "10px", paddingTop: "5px", paddingBottom: "5px", lineHeight: "1.2" }}>
                        {label(key)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center" style={{ gap: "20px" }}>
              {CONDITION_CATEGORIES.slice(3, 5).map(cat => (
                <div key={cat.name} className="rounded-[12px] bg-surface-warm" style={{ padding: "20px", width: "340px", flexShrink: 0 }}>
                  <h3 className="font-bold text-primary text-center text-[18px]" style={{ marginBottom: "14px" }}>{cat.name}</h3>
                  <div className="flex flex-wrap justify-center" style={{ gap: "10px" }}>
                    {cat.conditions.map(key => (
                      <button key={key} onClick={() => toggle(key)}
                        className={`rounded-[8px] border-2 text-[16px] font-semibold transition-all cursor-pointer ${selected.includes(key) ? tagSelected : tagUnselected}`}
                        style={{ paddingLeft: "10px", paddingRight: "10px", paddingTop: "5px", paddingBottom: "5px", lineHeight: "1.2" }}>
                        {label(key)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center" style={{ gap: "20px", marginTop: "20px" }}>
              {CONDITION_CATEGORIES.slice(5).map(cat => (
                <div key={cat.name} className="rounded-[12px] bg-surface-warm" style={{ padding: "20px", width: "340px", flexShrink: 0 }}>
                  <h3 className="font-bold text-primary text-center text-[18px]" style={{ marginBottom: "14px" }}>{cat.name}</h3>
                  <div className="flex flex-wrap justify-center" style={{ gap: "10px" }}>
                    {cat.conditions.map(key => (
                      <button key={key} onClick={() => toggle(key)}
                        className={`rounded-[8px] border-2 text-[16px] font-semibold transition-all cursor-pointer ${selected.includes(key) ? tagSelected : tagUnselected}`}
                        style={{ paddingLeft: "10px", paddingRight: "10px", paddingTop: "5px", paddingBottom: "5px", lineHeight: "1.2" }}>
                        {label(key)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ STEP 2: VinysDiagnostic ═══ */}
        {step === 1 && (
          <div className="w-full" style={{ marginTop: "20px" }}>
            <VinysDiagnostic
              onComplete={(result: any) => {
                setDiagnosticResult(result);
                updateProfile({ diagnosticResult: result } as any);
                setStep(2);
              }}
            />
          </div>
        )}

        {/* ═══ STEP 3: Restrictions / Contraindications ═══ */}
        {step === 2 && (
          <div className="w-full text-center" style={{ marginTop: "40px", maxWidth: "560px" }}>
            <div className="flex flex-col" style={{ gap: "10px" }}>
              {RESTRICTION_OPTIONS.map(r => {
                const isChecked = restrictions.includes(r);
                return (
                  <button key={r} onClick={() => toggleRestriction(r)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[8px] border-2 transition-all text-left ${isChecked ? "border-secondary bg-secondary/10" : "border-border bg-card"}`}>
                    <div className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all ${isChecked ? "border-secondary bg-secondary" : "border-border bg-card"}`}>
                      {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-sm font-medium text-foreground">{r}</span>
                  </button>
                );
              })}
              {/* Other — free text */}
              <div className="w-full flex items-start gap-3 px-4 py-2.5 rounded-[8px] border-2 border-border bg-card text-left">
                <span className="text-sm font-medium text-foreground shrink-0 mt-1">Other:</span>
                <input
                  type="text"
                  value={restrictionOther}
                  onChange={e => setRestrictionOther(e.target.value.slice(0, 100))}
                  placeholder="e.g., avoid weight-bearing on left knee"
                  className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  maxLength={100}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Not sure? Skip this step — you can always update it later in your account settings.</p>
          </div>
        )}

        {/* ═══ STEP 4: Practice time & schedule ═══ */}
        {step === 3 && (
          <div className="w-full text-center" style={{ marginTop: "40px", maxWidth: "560px" }}>
            <div>
              <h2 className="text-primary font-bold text-[21px]">Time of day</h2>
              <div className="flex justify-center" style={{ gap: "10px", marginTop: "16px" }}>
                {TIME_OF_DAY_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => { setPracticeTime(opt.value); setTimeSelected(true); }}
                    className={tagSmall(practiceTime === opt.value && timeSelected)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ margin: "24px 0", height: "1px", width: "100%", backgroundColor: "hsl(var(--border) / 0.4)" }} />
            <div>
              <h2 className="text-primary font-bold text-[21px]">Practice duration</h2>
              <div className="flex justify-center" style={{ gap: "10px", marginTop: "16px" }}>
                {MINUTES_OPTIONS.map(n => (
                  <button key={n} onClick={() => { setMinutesPerSession(n); setDurationSelected(true); }}
                    className={tagSmall(minutesPerSession === n && durationSelected)}>
                    {n} min
                  </button>
                ))}
              </div>
            </div>
            <div style={{ margin: "24px 0", height: "1px", width: "100%", backgroundColor: "hsl(var(--border) / 0.4)" }} />
            <div>
              <h2 className="text-primary font-bold text-[21px]">Sessions per week</h2>
              <div className="flex justify-center" style={{ gap: "10px", marginTop: "16px" }}>
                {SESSIONS_OPTIONS.map(n => (
                  <button key={n} onClick={() => { setSessionsPerWeek(n); setSessionsSelected(true); }} className={tagSmall(sessionsPerWeek === n && sessionsSelected)}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ margin: "24px 0", height: "1px", width: "100%", backgroundColor: "hsl(var(--border) / 0.4)" }} />
            <div>
              <h2 className="text-primary font-bold text-[21px]">Available equipment</h2>
              <div className="flex flex-wrap justify-center" style={{ gap: "10px", marginTop: "16px" }}>
                {EQUIPMENT_OPTIONS.map(opt => (
                  <button key={opt.label} onClick={() => toggleEquip(opt.label)} className={tagSmall(equipment.includes(opt.label))}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 5: Session Closing ═══ */}
        {step === 4 && (
          <div className="w-full text-center" style={{ marginTop: "40px", maxWidth: "440px" }}>
            <p className="text-muted-foreground text-sm mb-4">How would you like to end your session?</p>
            <div className="flex flex-col" style={{ gap: "10px" }}>
              {CLOSING_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setClosingPref(opt.value)}
                  className={`w-full text-center ${tag(closingPref === opt.value)} py-3`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ STEP 6: How are you feeling + Safety check ═══ */}
        {step === 5 && (
          <div className="w-full text-center" style={{ marginTop: "40px", maxWidth: "640px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="flex flex-col md:flex-row md:justify-center" style={{ gap: "20px" }}>
              {energyOptions.map(opt => (
                <button key={opt.value} onClick={() => setEnergyLevel(opt.value)}
                  className={`w-full text-center ${tag(energyLevel === opt.value)} py-3`}>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Energy confirmation messages */}
            {energyLevel === "high" && (
              <p className="text-sm text-secondary bg-secondary/10 rounded-lg px-4 py-2 mx-auto max-w-md">
                Great — we'll build a slightly more challenging session within your safe range today.
              </p>
            )}
            {energyLevel === "low" && (
              <p className="text-sm text-secondary bg-secondary/10 rounded-lg px-4 py-2 mx-auto max-w-md">
                Got it — today's session will be softer and shorter to support your body.
              </p>
            )}

            <div className="space-y-2">
              <h2 className="text-primary font-bold text-[21px]">Safety check</h2>
              <p className="text-xs text-muted-foreground">Are you experiencing any of the following right now?</p>
              <div className="flex flex-col" style={{ gap: "10px" }}>
                {RED_FLAGS.map(flag => {
                  const isChecked = redFlags.includes(flag);
                  return (
                    <button key={flag} onClick={() => setRedFlags(p => p.includes(flag) ? p.filter(f => f !== flag) : [...p, flag])}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[8px] border-2 transition-all text-left ${isChecked ? "border-secondary bg-secondary/10" : "border-border bg-card"}`}>
                      <div className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all ${isChecked ? "border-secondary bg-secondary" : "border-border bg-card"}`}>
                        {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-sm font-medium text-foreground">{flag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 7: Confirmation / Summary ═══ */}
        {step === 6 && (() => {
          const doStartOver = () => {
            setStep(0);
            setSelected([]);
            setConditionDetails({});
            setRestrictions([]);
            setRestrictionOther("");
            setTimeSelected(false);
            setDurationSelected(false);
            setSessionsSelected(false);
            setEquipment([]);
            setClosingPref("");
            setEnergyLevel("medium");
            setRedFlags([]);
            setSessionsPerWeek(3);
            setMinutesPerSession(20);
            setPracticeTime("morning");
            setShowStartOverConfirm(false);
          };
          const editRow = (label: string, value: string, targetStep: number) => (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{label}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{value}</span>
                <button onClick={() => setStep(targetStep)} className="text-muted-foreground/60 hover:text-foreground transition-colors" aria-label={`Edit ${label}`}>
                  <Pencil size={16} />
                </button>
              </div>
            </div>
          );
          const allRestrictions = [...restrictions];
          if (restrictionOther.trim()) allRestrictions.push(restrictionOther.trim());
          return (
            <div className="w-full text-center" style={{ marginTop: "40px", maxWidth: "420px" }}>
              <div className="rounded-[12px] bg-surface-warm p-4 text-left space-y-2 text-sm mb-6">
                {editRow("Conditions", selected.map(k => label(k)).join(", "), 0)}
                {allRestrictions.length > 0 && editRow("Restrictions", allRestrictions.join(", "), 2)}
                {editRow("Time of day", practiceTime.charAt(0).toUpperCase() + practiceTime.slice(1), 3)}
                {editRow("Duration", `${minutesPerSession} min`, 3)}
                {editRow("Sessions / week", String(sessionsPerWeek), 3)}
                {equipment.length > 0 && editRow("Equipment", equipment.join(", "), 3)}
                {editRow("Session closing", CLOSING_OPTIONS.find(o => o.value === closingPref)?.label || "", 4)}
              </div>

              <Button variant="hero" size="lg" className="w-full rounded-full" onClick={handleBuild}>
                Start my practice
              </Button>
              <button onClick={() => setShowStartOverConfirm(true)} className="mt-4 w-full h-[35px] rounded-full border border-border text-muted-foreground text-sm font-medium hover:text-foreground hover:border-foreground/40 transition-colors">
                Start over
              </button>

              {/* Start over confirmation */}
              <Dialog open={showStartOverConfirm} onOpenChange={setShowStartOverConfirm}>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Start over?</DialogTitle>
                    <DialogDescription>
                      This will clear your current selections and take you back to the beginning.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <DialogClose asChild>
                      <Button variant="outline" className="rounded-full">Cancel</Button>
                    </DialogClose>
                    <Button variant="hero" className="rounded-full" onClick={doStartOver}>
                      Start over
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          );
        })()}
      </div>

      {/* ── FIXED BOTTOM BUTTONS ── */}
      {step < 6 && (
        <div className="fixed bottom-0 inset-x-0 z-40 pointer-events-none bg-background" style={{ paddingBottom: "40px", paddingTop: "16px", boxShadow: "0 -2px 8px rgba(0,0,0,0.04)" }}>
          <div className="flex justify-between pointer-events-auto px-6 lg:px-[100px]">
            <Button variant="outline" onClick={handleBack} className="text-base h-[35px] rounded-full px-5">
              {step === 0 ? "Home" : "Back"}
            </Button>
            <Button variant="hero" onClick={handleNext} disabled={!canGoNext()} className="text-base h-[35px] rounded-full px-5">
              Next →
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
