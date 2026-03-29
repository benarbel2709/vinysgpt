import { useState, useCallback } from "react";
import VinysDiagnostic from "@/components/VinysDiagnostic";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import type { ConditionKey, EnergyLevel, PracticeTime } from "@/constants/conditions";
import { CONDITION_LABELS } from "@/constants/conditions";
import type { GenericAssessmentData, Assessment } from "@/types";
import { generatePlan } from "@/lib/planGenerator";
import { trackEvent } from "@/lib/analytics";
import BrandLogo from "@/components/BrandLogo";
import FlowProgress from "@/components/FlowProgress";
import { Button } from "@/components/ui/button";
import { X, Check, Pencil, Clock, Lock } from "lucide-react";
import { useState as useStateReact } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const SESSIONS_OPTIONS = [2, 3, 4, 5];
const MINUTES_OPTIONS = [
  { value: 10, label: "10 min" },
  { value: 20, label: "20 min" },
  { value: 30, label: "30 min" },
];
const TIME_OF_DAY_OPTIONS: { value: PracticeTime; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
];
const CLOSING_OPTIONS = [
  { value: "savasana" as const, label: "Savasana", desc: "Traditional lying-down rest and integration (3 minutes)" },
  { value: "body_rest" as const, label: "Body Rest & Integration", desc: "Gentle movement-based wind-down (3 minutes)" },
  { value: "meditation" as const, label: "Guided Stillness", desc: "Brief breath-led meditation (3 minutes)" },
];

const RESTRICTION_OPTIONS = [
  "Currently pregnant",
  "Recent surgery (within 6 months)",
  "Currently under physiotherapy or medical care",
  "Osteoporosis or bone density concerns",
  "Balance issues or fall risk",
  "None of the above",
];

const EQUIPMENT_CHOICES = [
  { key: "mat", label: "Yoga mat", alwaysOn: true },
  { key: "blocks", label: "Yoga blocks", alwaysOn: false },
  { key: "strap", label: "Yoga strap", alwaysOn: false },
  { key: "bolster", label: "Bolster or firm pillow", alwaysOn: false },
  { key: "chair", label: "Chair", alwaysOn: false },
  { key: "foam roller", label: "Foam roller", alwaysOn: false },
];

// Step mapping:
// 0 = conditions
// 1 = diagnostic (VinysDiagnostic handles its own flow including red flags, intake, postures, clarification, summary)
// 2 = profile summary (from diagnostic result)
// 3 = restrictions
// 4 = equipment
// 5 = schedule
// 6 = closing preference
// 7 = confirmation
const STEPPER_STEPS = 8;
const TOTAL_STEPS = 8;

const tagBase =
  "px-3.5 py-1.5 rounded-[8px] border-2 text-[18px] font-semibold transition-all cursor-pointer leading-tight";
const tagSelected = "border-secondary bg-secondary text-secondary-foreground";
const tagUnselected = "border-border bg-card text-foreground hover:border-secondary/40";
const tag = (sel: boolean) => `${tagBase} ${sel ? tagSelected : tagUnselected}`;
const tagSmall = (sel: boolean) =>
  `px-3 py-1.5 rounded-[8px] border-2 text-[16px] font-semibold transition-all cursor-pointer leading-tight ${sel ? tagSelected : tagUnselected}`;

export default function OnboardingWizard() {
  const { state, updateProfile, updateState } = useApp();
  const navigate = useNavigate();
  const profile = state.profile;

  const [step, setStep] = useState(0);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selected, setSelected] = useState<ConditionKey[]>([]);
  const [conditionDetails, setConditionDetails] = useState<Record<string, string[]>>({});
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [restrictionOther, setRestrictionOther] = useState("");
  const [practiceTime, setPracticeTime] = useState<PracticeTime>(profile.practiceTime || "morning");
  const [minutesPerSession, setMinutesPerSession] = useState(profile.minutesPerSession || 20);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(profile.sessionsPerWeek || 3);
  const [equipment, setEquipment] = useState<string[]>(["mat"]);
  const [closingPref, setClosingPref] = useState<string>("");
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>("medium");
  const [timeSelected, setTimeSelected] = useState(false);
  const [durationSelected, setDurationSelected] = useState(false);
  const [sessionsSelected, setSessionsSelected] = useState(false);
  const [showStartOverConfirm, setShowStartOverConfirm] = useState(false);

  const toggle = useCallback((c: ConditionKey) => {
    setSelected((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
  }, []);

  const toggleDetail = useCallback((condition: string, detail: string) => {
    setConditionDetails((p) => {
      const cur = p[condition] || [];
      return { ...p, [condition]: cur.includes(detail) ? cur.filter((d) => d !== detail) : [...cur, detail] };
    });
  }, []);

  const toggleEquip = useCallback((key: string) => {
    if (key === "mat") return; // mat cannot be deselected
    setEquipment((p) => (p.includes(key) ? p.filter((s) => s !== key) : [...p, key]));
  }, []);

  const toggleRestriction = useCallback((r: string) => {
    if (r === "None of the above") {
      setRestrictions(prev => prev.includes(r) ? [] : ["None of the above"]);
    } else {
      setRestrictions(prev => {
        const without = prev.filter(x => x !== "None of the above");
        return without.includes(r) ? without.filter(x => x !== r) : [...without, r];
      });
    }
  }, []);

  const label = (c: string) =>
    CONDITION_LABELS[c as ConditionKey] || c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const canGoNext = (): boolean => {
    switch (step) {
      case 0:
        return !!selectedArea;
      case 1:
        return !!diagnosticResult;
      case 2:
        return !!diagnosticResult;
      case 3:
        return true; // restrictions are optional
      case 4:
        return true; // equipment always has mat
      case 5:
        return true; // schedule has defaults
      case 6:
        return !!closingPref;
      case 7:
        return true;
      default:
        return true;
    }
  };

  const handleBuild = () => {
    // Ensure equipment is never empty
    const finalEquipment = equipment.length > 0 ? equipment : ["mat"];

    const updatedProfile = {
      ...profile,
      conditions: selected,
      energyLevel,
      flareToday: false,
      sessionsPerWeek,
      minutesPerSession,
      practiceTime,
      closingPreference: closingPref as "savasana" | "meditation" | "body_rest",
      availableEquipment: finalEquipment,
      restrictions: restrictions.filter(r => r !== "None of the above"),
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
      availableEquipment: finalEquipment,
      restrictions: restrictions.filter(r => r !== "None of the above"),
    } as any);

    const assessmentId = `assessment_${Date.now()}`;
    const allRestrictions = restrictions.filter(r => r !== "None of the above");
    if (restrictionOther.trim()) allRestrictions.push(restrictionOther.trim());
    const data: GenericAssessmentData = {
      mainIssue: selected.join(", "),
      pain: 5,
      limits: allRestrictions.join("; "),
      equipment: finalEquipment,
      redFlags: [],
    };
    const assessment: Assessment = { id: assessmentId, createdAt: new Date().toISOString(), type: "generic", data };

    // Use diagnostic irritability to set plan intensity
    const irr = diagnosticResult?.irritability ?? 0;
    const plan = generatePlan(updatedProfile, assessmentId, undefined, state.exerciseLibrary, {
      pain: irr >= 3 ? 7 : 5,
      fatigue: irr >= 3 ? 7 : 5,
      sleep: 5,
      flareNow: irr >= 4 ? "yes" : "no",
    });

    // Ensure NO sessions start as "done" — diagnostic must not count
    const cleanPlan = {
      ...plan,
      sessions: plan.sessions.map(s => ({ ...s, status: "planned" as const })),
    };

    updateState({ assessments: [...state.assessments, assessment], currentPlan: cleanPlan });
    trackEvent("plan_generated", { condition: selected[0], duration: cleanPlan.sessions[0]?.durationMinutes });
    navigate("/plan");
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 0) {
      navigate("/");
      return;
    }
    // Skip step 1 (diagnostic) when going back — go to conditions
    if (step === 2) {
      setStep(0);
      return;
    }
    setStep(step - 1);
  };

  const STEP_TITLES = [
    "Where does your body need support?",
    "Body diagnostic",
    "Here's what we found",
    "Any movements to avoid?",
    "What equipment do you have?",
    "How would you like to practice?",
    "How would you like to end each practice?",
    "You're all set.",
  ];

  const BODY_AREAS = [
    { id: "LB", label: "Lower Back", desc: "Pain, stiffness, sciatica or disc symptoms", icon: "🔹", available: true },
    { id: "HIP", label: "Hip", desc: "Hip joint, groin, outer hip or mobility issues", icon: "🔹", available: true },
    { id: "KNEE", label: "Knee", desc: "Kneecap pain, instability, inner or outer knee", icon: "🔹", available: true },
    { id: "ANKLE", label: "Ankle & Foot", desc: "Achilles, plantar fascia or ankle instability", icon: "🔹", available: true },
    { id: "SHOULDER", label: "Shoulder", desc: "Rotator cuff, frozen shoulder, impingement", icon: "🔸", available: false },
    { id: "NECK", label: "Neck", desc: "Cervical stiffness, tension headaches, radiating pain", icon: "🔸", available: false },
    { id: "UPPER_BACK", label: "Upper Back", desc: "Thoracic stiffness, postural fatigue, rib pain", icon: "🔸", available: false },
    { id: "WRIST", label: "Wrist & Hand", desc: "Carpal tunnel, repetitive strain, grip weakness", icon: "🔸", available: false },
  ];

  // Profile summary data
  const PROFILE_LABELS: Record<string, { label: string; desc: string }> = {
    FL: { label: "Flexion Sensitive", desc: "Your back responds best to extension-based movements. Forward bending tends to increase discomfort." },
    EX: { label: "Extension Sensitive", desc: "Your back prefers flexion and neutral positions. Arching backward tends to increase discomfort." },
    NE: { label: "Neutral Pattern", desc: "Your back tolerates most movements. The focus will be on building strength and mobility evenly." },
    LI: { label: "Load-Sensitive", desc: "Your body benefits from gentle, progressive loading. Consistency is your best tool." },
    ST: { label: "Stiffness-Dominant", desc: "Your movement is limited but not acutely painful. The focus will be on progressive mobility." },
    AN: { label: "Anterior Overload", desc: "Front-of-joint overload pattern. Sessions focus on decompression." },
    LA: { label: "Lateral Pattern", desc: "Side-bending or rotation is your primary sensitivity. Asymmetrical movements need care." },
    PO: { label: "Posterior", desc: "Posterior chain involvement. Sessions address rotation and flexibility." },
    PA: { label: "Patellofemoral", desc: "Kneecap pattern. Sessions focus on quad control and step-down exercises." },
    ME: { label: "Medial Stress", desc: "Inner joint stress pattern. Sessions focus on alignment and hip strength." },
    AC: { label: "Achilles / Posterior", desc: "Achilles pattern. Sessions use graded loading and eccentric work." },
    PF: { label: "Plantar Fascia", desc: "Plantar fasciitis pattern. Sessions include calf release and foot strength." },
    MO: { label: "Mobility-First", desc: "Restricted range without sharp pain. Focus on progressive mobility." },
  };

  const AREA_LABELS: Record<string, string> = { LB: "Lower Back", HIP: "Hip", KNEE: "Knee", ANKLE: "Ankle" };

  // Post-assessment step counter (steps 3-6 = "Step 1 of 4" through "Step 4 of 4")
  const POST_ASSESSMENT_TOTAL = 4;
  const getPostAssessmentStep = (s: number) => {
    if (s >= 3 && s <= 6) return s - 2;
    return null;
  };
  const postStep = getPostAssessmentStep(step);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* ── HEADER (logo + stepper + X in one row) ── */}
      <header className="shrink-0 z-50 w-full bg-background" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center h-[56px] px-6 lg:px-[100px]">
          <BrandLogo size="md" linkToHome={false} />
          <div className="flex-1 flex justify-center">
            {step < 7 && step !== 1 && <FlowProgress current={step + 1} total={STEPPER_STEPS} />}
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-foreground/60 hover:text-foreground transition-colors p-2"
            aria-label="Close onboarding"
          >
            <X size={22} />
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div
        className="flex-1 min-h-0 flex flex-col items-center overflow-y-auto overflow-x-hidden"
        style={{ maxWidth: "1100px", margin: "0 auto", width: "100%", padding: "0 24px 90px" }}
      >
        {step !== 1 && step !== 2 && (
          <>
            {postStep && (
              <p className="text-xs text-muted-foreground/70 font-semibold uppercase tracking-wider text-center" style={{ marginTop: "24px" }}>
                Step {postStep} of {POST_ASSESSMENT_TOTAL}
              </p>
            )}
            <h1
              className="font-display text-foreground font-bold text-2xl text-center shrink-0"
              style={{ marginTop: postStep ? "6px" : "30px" }}
            >
              {STEP_TITLES[step]}
            </h1>
          </>
        )}
        {step === 3 && (
          <p className="text-muted-foreground text-center text-sm mt-1 shrink-0">
            This helps us filter out anything that could cause harm.
          </p>
        )}
        {step === 7 && (
          <p className="text-muted-foreground text-center text-sm mt-1 shrink-0">
            We'll build your personalized practice.
          </p>
        )}

        {/* ═══ STEP 0: Body area picker ═══ */}
        {step === 0 && (
          <div className="w-full" style={{ marginTop: "16px", maxWidth: "520px", margin: "16px auto 0" }}>
            <p className="text-muted-foreground text-center text-[15px] mb-6 leading-relaxed">
              Select the area that's been bothering you most. We'll run a short movement assessment to find the right approach.
            </p>

            <div className="space-y-3">
              {BODY_AREAS.filter(a => a.available).map((area) => (
                <button
                  key={area.id}
                  onClick={() => {
                    setSelectedArea(area.id);
                    setStep(1);
                  }}
                  className={`w-full p-5 rounded-2xl border-2 text-left flex items-center gap-4 transition-all group ${
                    "border-border bg-card hover:border-primary/40 hover:shadow-calm press-scale"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-lg font-bold">{area.label.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[17px] font-bold text-foreground mb-0.5">{area.label}</div>
                    <div className="text-[13px] text-muted-foreground leading-snug">{area.desc}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                    <span className="text-primary text-sm">→</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Coming soon section */}
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3 text-center">Coming soon</p>
              <div className="grid grid-cols-2 gap-2.5">
                {BODY_AREAS.filter(a => !a.available).map((area) => (
                  <ComingSoonCard key={area.id} area={area} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 1: VinysDiagnostic ═══ */}
        {step === 1 && (
          <div className="w-full" style={{ marginTop: "20px" }}>
            <VinysDiagnostic
              initialArea={selectedArea}
              onComplete={(result: any) => {
                const areaToCondKey: Record<string, string> = {
                  LB: "back_pain", HIP: "hip_pain", KNEE: "knee_pain", ANKLE: "back_pain",
                };
                const derivedKey = areaToCondKey[result.area ?? "LB"] ?? "back_pain";
                setSelected((prev) =>
                  prev.includes(derivedKey as any)
                    ? prev
                    : [derivedKey as any, ...prev.filter((c) => c !== derivedKey)],
                );
                setDiagnosticResult(result);
                // Save irritability, acuity, mode to profile (FIX 2)
                updateProfile({
                  diagnosticResult: result,
                  diagnosticArea: result.area,
                  diagnosticProfile: result.primary,
                  diagnosticIrritability: result.irritability ?? 0,
                  irritability: result.irritability ?? 0,
                  acuity: result.acuity ?? "unknown",
                  mode: result.mode ?? "normal",
                  redFlagsPassed: result.redFlagsPassed ?? true,
                } as any);
                setStep(2);
              }}
            />
          </div>
        )}

        {/* ═══ STEP 2: Profile Summary (FIX 7) ═══ */}
        {step === 2 && diagnosticResult && (() => {
          const areaLabel = AREA_LABELS[diagnosticResult.area] || diagnosticResult.area;
          const profileInfo = PROFILE_LABELS[diagnosticResult.primary] || { label: diagnosticResult.primary, desc: "Your plan will be tailored to your specific pattern." };
          const irr = diagnosticResult.irritability ?? 0;

          const sensitivityLabel = irr <= 2 ? "Low" : irr === 3 ? "Moderate" : "High";
          const sensitivityColor = irr <= 2 ? "#22c55e" : irr === 3 ? "#f59e0b" : "#ef4444";

          const confidence = diagnosticResult.confidence || "Medium";
          const confNote = confidence === "High"
            ? "High confidence profile"
            : confidence === "Medium"
            ? "Good confidence — may refine over first sessions"
            : "Initial profile — will refine over your first sessions";

          return (
            <div className="w-full text-center" style={{ marginTop: "40px", maxWidth: "460px" }}>
              <h1 className="font-display text-foreground font-bold text-2xl mb-2">Here's what we found</h1>
              <p className="text-muted-foreground text-sm mb-6">Based on your movement responses, here's your starting profile</p>

              <div className="rounded-2xl bg-surface-warm p-6 text-left space-y-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Area</span>
                  <span className="font-semibold text-foreground">{areaLabel}</span>
                </div>
                <hr className="border-border" />
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground text-sm shrink-0">Movement Profile</span>
                  <div className="text-right">
                    <span className="font-semibold text-secondary block">{profileInfo.label}</span>
                    <span className="text-xs text-muted-foreground">{profileInfo.desc}</span>
                  </div>
                </div>
                <hr className="border-border" />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Sensitivity</span>
                  <span className="font-semibold" style={{ color: sensitivityColor }}>{sensitivityLabel}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-6">{confNote}</p>
            </div>
          );
        })()}

        {/* ═══ STEP 3: Restrictions (FIX 6 Step A) ═══ */}
        {step === 3 && (
          <div className="w-full text-center" style={{ marginTop: "40px", maxWidth: "560px" }}>
            <div className="flex flex-col" style={{ gap: "10px" }}>
              {RESTRICTION_OPTIONS.map((r) => {
                const isChecked = restrictions.includes(r);
                return (
                  <button
                    key={r}
                    onClick={() => toggleRestriction(r)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[8px] border-2 transition-all text-left ${isChecked ? "border-secondary bg-secondary/10" : "border-border bg-card"}`}
                  >
                    <div className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all ${isChecked ? "border-secondary bg-secondary" : "border-border bg-card"}`}>
                      {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-sm font-medium text-foreground">{r}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Not sure? Skip for now — you can update this in your profile later.
            </p>
          </div>
        )}

        {/* ═══ STEP 4: Equipment (FIX 6 Step B) ═══ */}
        {step === 4 && (
          <div className="w-full text-center" style={{ marginTop: "40px", maxWidth: "560px" }}>
            <div className="flex flex-col" style={{ gap: "10px" }}>
              {EQUIPMENT_CHOICES.map((eq) => {
                const isChecked = equipment.includes(eq.key);
                return (
                  <button
                    key={eq.key}
                    onClick={() => toggleEquip(eq.key)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[8px] border-2 transition-all text-left ${
                      isChecked ? "border-secondary bg-secondary/10" : "border-border bg-card"
                    } ${eq.alwaysOn ? "opacity-80" : ""}`}
                  >
                    <div className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all ${
                      isChecked ? "border-secondary bg-secondary" : "border-border bg-card"
                    }`}>
                      {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-sm font-medium text-foreground">{eq.label}</span>
                    {eq.alwaysOn && <span className="text-xs text-muted-foreground ml-auto">(always included)</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ STEP 5: Schedule (FIX 6 Step C) ═══ */}
        {step === 5 && (
          <div className="w-full text-center" style={{ marginTop: "40px", maxWidth: "560px" }}>
            <div>
              <h2 className="font-bold text-[21px]" style={{ color: "#888" }}>Sessions per week</h2>
              <div className="flex justify-center" style={{ gap: "10px", marginTop: "16px" }}>
                {SESSIONS_OPTIONS.map((n) => (
                  <button key={n} onClick={() => { setSessionsPerWeek(n); setSessionsSelected(true); }} className={tagSmall(sessionsPerWeek === n)}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ margin: "24px 0", height: "1px", width: "100%", backgroundColor: "hsl(var(--border) / 0.4)" }} />
            <div>
              <h2 className="font-bold text-[21px]" style={{ color: "#888" }}>Session length</h2>
              <div className="flex justify-center" style={{ gap: "10px", marginTop: "16px" }}>
                {MINUTES_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => { setMinutesPerSession(opt.value); setDurationSelected(true); }} className={tagSmall(minutesPerSession === opt.value)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ margin: "24px 0", height: "1px", width: "100%", backgroundColor: "hsl(var(--border) / 0.4)" }} />
            <div>
              <h2 className="font-bold text-[21px]" style={{ color: "#888" }}>Preferred time</h2>
              <div className="flex justify-center" style={{ gap: "10px", marginTop: "16px" }}>
                {TIME_OF_DAY_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => { setPracticeTime(opt.value); setTimeSelected(true); }} className={tagSmall(practiceTime === opt.value)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 6: Session Closing (FIX 6 Step D) ═══ */}
        {step === 6 && (
          <div className="w-full text-center" style={{ marginTop: "40px", maxWidth: "440px" }}>
            <div className="flex flex-col" style={{ gap: "12px" }}>
              {CLOSING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setClosingPref(opt.value)}
                  className={`w-full text-left p-4 rounded-[12px] border-2 transition-all ${
                    closingPref === opt.value ? tagSelected : tagUnselected
                  }`}
                >
                  <span className="font-semibold text-[16px] block">{opt.label}</span>
                  <span className="text-[13px] text-muted-foreground block mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ STEP 7: Confirmation / Summary ═══ */}
        {step === 7 &&
          (() => {
            const doStartOver = () => {
              setStep(0);
              setSelected([]);
              setConditionDetails({});
              setRestrictions([]);
              setRestrictionOther("");
              setTimeSelected(false);
              setDurationSelected(false);
              setSessionsSelected(false);
              setEquipment(["mat"]);
              setClosingPref("");
              setEnergyLevel("medium");
              setSessionsPerWeek(3);
              setMinutesPerSession(20);
              setPracticeTime("morning");
              setShowStartOverConfirm(false);
              setDiagnosticResult(null);
            };
            const editRow = (lbl: string, value: string, targetStep: number) => (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{lbl}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{value}</span>
                  <button onClick={() => setStep(targetStep)} className="text-muted-foreground/60 hover:text-foreground transition-colors" aria-label={`Edit ${lbl}`}>
                    <Pencil size={16} />
                  </button>
                </div>
              </div>
            );
            const allRestrictions = restrictions.filter(r => r !== "None of the above");
            return (
              <div className="w-full text-center" style={{ marginTop: "40px", maxWidth: "420px" }}>
                <div className="rounded-[12px] bg-surface-warm p-4 text-left space-y-2 text-sm mb-6">
                  {editRow("Conditions", selected.map((k) => label(k)).join(", "), 0)}
                  {allRestrictions.length > 0 && editRow("Restrictions", allRestrictions.join(", "), 3)}
                  {editRow("Equipment", equipment.join(", "), 4)}
                  {editRow("Time of day", practiceTime.charAt(0).toUpperCase() + practiceTime.slice(1), 5)}
                  {editRow("Duration", `${minutesPerSession} min`, 5)}
                  {editRow("Sessions / week", String(sessionsPerWeek), 5)}
                  {editRow("Session closing", CLOSING_OPTIONS.find((o) => o.value === closingPref)?.label || "", 6)}
                </div>

                <Button variant="hero" size="lg" className="w-full rounded-full" onClick={() => handleBuild()}>
                  Start my practice
                </Button>
                <button
                  onClick={() => setShowStartOverConfirm(true)}
                  className="mt-4 w-full h-[35px] rounded-full border border-border text-muted-foreground text-sm font-medium hover:text-foreground hover:border-foreground/40 transition-colors"
                >
                  Start over
                </button>

                <Dialog open={showStartOverConfirm} onOpenChange={setShowStartOverConfirm}>
                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Start over?</DialogTitle>
                      <DialogDescription>This will clear your current selections and take you back to the beginning.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                      <DialogClose asChild><Button variant="outline" className="rounded-full">Cancel</Button></DialogClose>
                      <Button variant="hero" className="rounded-full" onClick={doStartOver}>Start over</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            );
          })()}
      </div>

      {/* ── FIXED BOTTOM BUTTONS ── */}
      {step !== 1 && step !== 0 && step < 7 && (
        <div
          className="fixed bottom-0 inset-x-0 z-40 pointer-events-none bg-background"
          style={{ paddingBottom: "40px", paddingTop: "16px", boxShadow: "0 -2px 8px rgba(0,0,0,0.04)" }}
        >
          <div className="flex justify-between pointer-events-auto px-6 lg:px-[100px]">
            <Button variant="outline" onClick={handleBack} className="text-base h-[35px] rounded-full px-5">
              {step === 0 ? "Home" : "Back"}
            </Button>
            {step === 3 ? (
              <div className="flex items-center gap-3">
                <button onClick={handleNext} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Skip for now
                </button>
                <Button variant="hero" onClick={handleNext} className="text-base h-[35px] rounded-full px-5">
                  Continue →
                </Button>
              </div>
            ) : (
              <Button
                variant="hero"
                onClick={handleNext}
                disabled={!canGoNext()}
                className="text-base h-[35px] rounded-full px-5"
              >
                {step === 2 ? "Continue building your plan →" : "Next →"}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
