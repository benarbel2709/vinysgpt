import { useState, useCallback } from "react";
import VinysDiagnostic from "@/components/VinysDiagnostic";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import type { ConditionKey, EnergyLevel, PracticeTime } from "@/constants/conditions";
import { CONDITION_LABELS } from "@/constants/conditions";
import type { GenericAssessmentData, Assessment } from "@/types";
// V1 planGenerator no longer used — sessions are generated on-demand by sessionService
import { trackEvent } from "@/lib/analytics";
import BrandLogo from "@/components/BrandLogo";
import DurationSelector from "@/components/onboarding/DurationSelector";
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
];

const DIAGNOSIS_OPTIONS: { label: string; key: string }[] = [
  { label: "Herniated or bulging disc", key: "disc_herniation" },
  { label: "Spinal stenosis", key: "spinal_stenosis" },
  { label: "Scoliosis", key: "scoliosis" },
  { label: "Spondylolisthesis", key: "spondylolisthesis" },
  { label: "Osteoarthritis", key: "osteoarthritis" },
  { label: "Rheumatoid arthritis", key: "rheumatoid_arthritis" },
  { label: "Hypermobility (including EDS)", key: "hypermobility" },
  { label: "Sacroiliac joint dysfunction", key: "si_joint" },
  { label: "Sciatica or nerve impingement", key: "sciatica" },
  { label: "Multiple sclerosis", key: "multiple_sclerosis" },
  { label: "Parkinson's disease", key: "parkinsons" },
  { label: "Heart condition or hypertension", key: "hypertension" },
  { label: "Fibromyalgia", key: "fibromyalgia" },
  { label: "Chronic fatigue syndrome (ME/CFS)", key: "chronic_fatigue" },
  { label: "Lupus or other autoimmune condition", key: "autoimmune" },
  { label: "Diabetes", key: "diabetes" },
  { label: "Post-surgical recovery (spine or joint)", key: "post_surgical" },
  { label: "Anxiety or PTSD", key: "anxiety_ptsd" },
  { label: "Depression", key: "depression" },
];

const NONE_OPTION = "None of the above";

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
// 1 = diagnostic
// 2 = profile summary
// 3 = restrictions
// 4 = equipment
// 5 = session duration (DurationSelector)
// 6 = schedule (sessions/week, time of day)
// 7 = closing preference
// 8 = confirmation
const STEPPER_STEPS = 9;
const TOTAL_STEPS = 9;

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
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([]);
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
    if (r === NONE_OPTION) {
      // Clear everything
      setRestrictions([]);
      setSelectedDiagnoses([]);
      return;
    }
    setRestrictions(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  }, []);

  const toggleDiagnosis = useCallback((key: string) => {
    setSelectedDiagnoses(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]);
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
        return true; // duration has default
      case 6:
        return true; // schedule has defaults
      case 7:
        return !!closingPref;
      case 8:
        return true;
      default:
        return true;
    }
  };

  // Map onboarding area IDs to V2 engine area codes
  const AREA_TO_ENGINE: Record<string, string> = {
    LB: 'LB', HIP: 'HI', KNEE: 'KN', ANKLE: 'AN',
    NECK: 'NK', UBACK: 'UB', SHLDR: 'SH', WRIST: 'WR',
  };

  const handleBuild = () => {
    // Ensure equipment is never empty
    const finalEquipment = equipment.length > 0 ? equipment : ["mat"];

    updateProfile({
      conditions: selected,
      energyLevel,
      flareToday: false,
      sessionsPerWeek,
      minutesPerSession,
      practiceTime,
      closingPreference: closingPref as "savasana" | "meditation" | "body_rest",
      availableEquipment: finalEquipment,
      restrictions: restrictions.filter(r => r !== NONE_OPTION),
      diagnoses: selectedDiagnoses,
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

    // Map experience level from energy answer
    const expMap: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
      low: 'beginner', medium: 'intermediate', high: 'advanced',
    };

    // Build userProfile from selected area + any diagnostic areas
    const areaCodes: string[] = [];
    if (selectedArea) {
      const code = AREA_TO_ENGINE[selectedArea];
      if (code) areaCodes.push(code);
    }

    // V2 engine state: save diagnostic output + defaults
    updateState({
      disclaimerAccepted: true,
      onboardingCompleted: true,
      assessments: [...state.assessments, assessment],
      userProfile: areaCodes,
      stage: 1,
      session_count: 0,
      experienceLevel: expMap[energyLevel] || 'intermediate',
      sessionDuration: minutesPerSession || 20,
    });

    trackEvent("plan_generated", { condition: selected[0], duration: minutesPerSession });
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
    "Any health considerations we should know about?",
    "What equipment do you have?",
    "How long should each session be?",
    "How would you like to practice?",
    "How would you like to end each practice?",
    "You're all set.",
  ];

  const BODY_AREAS = [
    { id: "LB", label: "Lower Back", desc: "Pain, stiffness, sciatica or disc symptoms", icon: "🔹", available: true },
    { id: "HIP", label: "Hip", desc: "Hip joint, groin, outer hip or mobility issues", icon: "🔹", available: true },
    { id: "KNEE", label: "Knee", desc: "Kneecap pain, instability, inner or outer knee", icon: "🔹", available: true },
    { id: "ANKLE", label: "Ankle & Foot", desc: "Achilles, plantar fascia or ankle instability", icon: "🔹", available: true },
    { id: "SHLDR", label: "Shoulder", desc: "Rotator cuff, frozen shoulder, impingement", icon: "🔹", available: true },
    { id: "NECK", label: "Neck", desc: "Cervical stiffness, tension headaches, radiating pain", icon: "🔹", available: true },
    { id: "UBACK", label: "Upper Back", desc: "Thoracic stiffness, postural fatigue, rib pain", icon: "🔹", available: true },
    { id: "WRIST", label: "Wrist & Hand", desc: "Carpal tunnel, repetitive strain, grip weakness", icon: "🔹", available: true },
  ];

  // Profile summary data
  const PROFILE_LABELS: Record<string, { label: string; desc: string }> = {
    FL: { label: "Flexion Sensitive", desc: "Forward bending tends to increase discomfort. Your practice avoids deep flexion and prioritises neutral and extended positions." },
    EX: { label: "Extension Sensitive", desc: "Arching backward or looking up tends to increase discomfort. Your practice prioritises neutral and flexion-based positions." },
    NE: { label: "Neural Pattern", desc: "Nerve-related signals detected. Your practice avoids compression and focuses on gentle, decompression-based movements." },
    LI: { label: "Load-Sensitive", desc: "Your body benefits from gentle, progressive loading. Consistency is your best tool." },
    ST: { label: "Strength-Focused", desc: "Muscle weakness or postural fatigue is your primary finding. Sessions focus on building control and endurance." },
    AN: { label: "Anterior Overload", desc: "Front-of-joint overload pattern. Sessions focus on decompression." },
    LA: { label: "Lateral / Rotational", desc: "Side-bending or rotation is your primary sensitivity. Asymmetrical movements need care." },
    PO: { label: "Posterior", desc: "Posterior chain involvement. Sessions address rotation and flexibility." },
    PA: { label: "Patellofemoral", desc: "Kneecap pattern. Sessions focus on quad control and step-down exercises." },
    ME: { label: "Medial Stress", desc: "Inner joint stress pattern. Sessions focus on alignment and hip strength." },
    AC: { label: "Achilles / Posterior", desc: "Achilles pattern. Sessions use graded loading and eccentric work." },
    PF: { label: "Plantar Fascia", desc: "Plantar fasciitis pattern. Sessions include calf release and foot strength." },
    MO: { label: "Mobility-First", desc: "Restricted range without sharp pain. Focus on progressive mobility." },
    // New area profiles
    IM: { label: "Anterior Impingement", desc: "Pain at the front of your shoulder during overhead movements. Sessions focus on scapular stabilisation and rotator cuff strengthening." },
    RC: { label: "Rotator Cuff", desc: "Catching, clicking, or pain with rotation. Sessions use sub-maximal isometric and rhythmic stabilisation." },
    FR: { label: "Frozen / Restricted", desc: "Significantly restricted in all shoulder directions. Gentle, pain-free range of motion to maintain mobility." },
    RO: { label: "Rotational Restriction", desc: "Rotation is more restricted on one side. Sessions focus on restoring symmetrical thoracic rotation." },
    CO: { label: "Compression / Postural", desc: "Pain accumulates with sustained posture and is relieved by movement. Sessions use traction and decompression." },
    NN: { label: "Neural Component", desc: "Tingling or numbness detected. Sessions avoid positions that compress the wrist canal and include nerve gliding." },
  };

  const AREA_LABELS: Record<string, string> = { LB: "Lower Back", HIP: "Hip", KNEE: "Knee", ANKLE: "Ankle & Foot", NECK: "Neck", UBACK: "Upper Back", WRIST: "Wrist & Hand", SHLDR: "Shoulder" };

  // Post-assessment step counter (steps 3-7 = "Step 1 of 5" through "Step 5 of 5")
  const POST_ASSESSMENT_TOTAL = 5;
  const getPostAssessmentStep = (s: number) => {
    if (s >= 3 && s <= 7) return s - 2;
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
            {step < 8 && step !== 1 && <FlowProgress current={step + 1} total={STEPPER_STEPS} />}
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
            Select everything that applies — this helps us personalise your practice and filter out anything that could cause harm.
          </p>
        )}
        {step === 8 && (
          <p className="text-muted-foreground text-center text-sm mt-1 shrink-0">
            We'll build your personalized practice.
          </p>
        )}

        {/* ═══ STEP 0: Body area picker (redesigned 8-area grid) ═══ */}
        {step === 0 && (() => {
          const AREA_COLORS: Record<string, string> = {
            NECK: "#7B6F4A", SHLDR: "#7B4A4A", UBACK: "#4A6B7B", WRIST: "#6B4A7B",
            LB: "#4A7B6F", HIP: "#7B4A6F", KNEE: "#6F7B4A", ANKLE: "#4A6F7B",
          };
          const AREA_ICONS_SVG: Record<string, React.ReactNode> = {
            NECK:  <path d="M8 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 5c-2 0-3 1-3 2v5h6V9c0-1-1-2-3-2z" fill="currentColor"/>,
            SHLDR: <path d="M4 7h8M4 7c-2 1-3 3-3 5h14c0-2-1-4-3-5M8 7V3" stroke="currentColor" fill="none" strokeWidth="1.2"/>,
            UBACK: <path d="M8 1v14M5 5l3-3 3 3M5 11l3 3 3-3M4 8h8" stroke="currentColor" fill="none" strokeWidth="1.2"/>,
            WRIST: <path d="M3 10h10v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3zm1-4c0-2.2 1.8-4 4-4s4 1.8 4 4v4H4V6z" fill="currentColor"/>,
            LB:    <path d="M8 1C5 1 3 3 3 6v3c0 3 2 5 5 5s5-2 5-5V6c0-3-2-5-5-5zm0 7v4" stroke="currentColor" fill="none" strokeWidth="1.2"/>,
            HIP:   <><path d="M2 10c0-4 3-7 6-7s6 3 6 7" stroke="currentColor" fill="none" strokeWidth="1.5"/><circle cx="5" cy="10" r="1.5" fill="currentColor"/><circle cx="11" cy="10" r="1.5" fill="currentColor"/></>,
            KNEE:  <path d="M6 2v5l-3 3h10l-3-3V2h-4zm2 9v5" stroke="currentColor" fill="none" strokeWidth="1.2"/>,
            ANKLE: <path d="M4 4c0-1 1-2 4-2s4 1 4 2v5c0 2-1 3-4 3s-4-1-4-3V4zm0 5l-2 6h12l-2-6" stroke="currentColor" fill="none" strokeWidth="1.2"/>,
          };
          const AREA_DESCS: Record<string, string> = {
            NECK: "Pain, stiffness, or headaches", SHLDR: "Pain or restricted movement",
            UBACK: "Mid-back tightness or aching", WRIST: "Pain, tingling, or grip issues",
            LB: "Lumbar pain or stiffness", HIP: "Pain or restricted range",
            KNEE: "Knee pain or instability", ANKLE: "Ankle pain or balance issues",
          };
          const upperBody = ["NECK", "SHLDR", "UBACK", "WRIST"];
          const lowerBody = ["LB", "HIP", "KNEE", "ANKLE"];

          const AreaCard = ({ areaId }: { areaId: string }) => {
            const ba = BODY_AREAS.find(a => a.id === areaId)!;
            const accent = AREA_COLORS[areaId];
            const isSelected = selectedArea === areaId;
            return (
              <button
                onClick={() => { setSelectedArea(areaId); setTimeout(() => setStep(1), 200); }}
                style={{
                  padding: "14px 14px 12px", borderRadius: 16,
                  border: isSelected ? `2px solid ${accent}` : "1.5px solid #E4DDD6",
                  background: isSelected ? `${accent}15` : "#FFFFFF",
                  textAlign: "left" as const, cursor: "pointer", position: "relative" as const,
                  overflow: "hidden" as const, transition: "all 0.15s ease",
                  WebkitTapHighlightColor: "transparent",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  display: "flex", flexDirection: "column" as const, gap: 6, minHeight: 90,
                }}
              >
                {isSelected && (
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: accent, borderRadius: "16px 0 0 16px" }} />
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accent}1A`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: accent }}>
                      {AREA_ICONS_SVG[areaId]}
                    </svg>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#1C2B26", lineHeight: 1.2 }}>{ba.label}</span>
                </div>
                <span style={{ fontSize: 12, color: "#7A8E89", lineHeight: 1.35 }}>{AREA_DESCS[areaId]}</span>
              </button>
            );
          };

          return (
            <div className="w-full" style={{ marginTop: "16px", maxWidth: "520px", margin: "16px auto 0" }}>
              <p className="text-muted-foreground text-center text-[15px] mb-6 leading-relaxed">
                Select the area you want to assess. We'll guide you through a movement session to understand your pattern.
              </p>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#7A8E89", textTransform: "uppercase" as const, marginBottom: 10 }}>UPPER BODY</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {upperBody.map(id => <AreaCard key={id} areaId={id} />)}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#7A8E89", textTransform: "uppercase" as const, marginBottom: 10 }}>LOWER BODY</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {lowerBody.map(id => <AreaCard key={id} areaId={id} />)}
              </div>
            </div>
          );
        })()}

        {/* ═══ STEP 1: VinysDiagnostic ═══ */}
        {step === 1 && (
          <div className="w-full" style={{ marginTop: "20px" }}>
            <VinysDiagnostic
              initialArea={selectedArea}
              onComplete={(result: any) => {
                const areaToCondKey: Record<string, string> = {
                  LB: "back_pain", HIP: "hip_pain", KNEE: "knee_pain", ANKLE: "ankle_pain",
                  NECK: "neck_pain", UBACK: "upper_back_pain", WRIST: "wrist_pain", SHLDR: "shoulder_pain",
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

        {/* ═══ STEP 3: Health Considerations ═══ */}
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

              {/* Diagnosis section label */}
              <p className="text-xs text-muted-foreground pt-4 pb-1 text-left">
                Have you received a medical diagnosis for any of the following?
              </p>

              {DIAGNOSIS_OPTIONS.map((d) => {
                const isChecked = selectedDiagnoses.includes(d.key);
                return (
                  <button
                    key={d.key}
                    onClick={() => toggleDiagnosis(d.key)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[8px] border-2 transition-all text-left ${isChecked ? "border-secondary bg-secondary/10" : "border-border bg-card"}`}
                  >
                    <div className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all ${isChecked ? "border-secondary bg-secondary" : "border-border bg-card"}`}>
                      {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-sm font-medium text-foreground">{d.label}</span>
                  </button>
                );
              })}

              {/* None of the above */}
              <button
                onClick={() => toggleRestriction(NONE_OPTION)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[8px] border-2 transition-all text-left ${
                  restrictions.length === 0 && selectedDiagnoses.length === 0
                    ? "border-muted-foreground/30 bg-card"
                    : "border-border bg-card"
                }`}
              >
                <div className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all ${
                  restrictions.length === 0 && selectedDiagnoses.length === 0
                    ? "border-muted-foreground/30 bg-card"
                    : "border-border bg-card"
                }`}>
                </div>
                <span className="text-sm font-medium text-foreground">{NONE_OPTION}</span>
              </button>
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

        {/* ═══ STEP 5: Session Duration (DurationSelector) ═══ */}
        {step === 5 && (
          <DurationSelector value={minutesPerSession} onChange={(v) => { setMinutesPerSession(v); setDurationSelected(true); }} />
        )}

        {/* ═══ STEP 6: Schedule (FIX 6 Step C) ═══ */}
        {step === 6 && (
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

        {/* ═══ STEP 7: Session Closing ═══ */}
        {step === 7 && (
          <div className="w-full text-center" style={{ marginTop: "40px", maxWidth: "440px" }}>
            <div className="flex flex-col" style={{ gap: "12px" }}>
              {CLOSING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setClosingPref(opt.value); setTimeout(() => setStep(8), 250); }}
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

        {/* ═══ STEP 8: Confirmation / Summary ═══ */}
        {step === 8 &&
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
                  {editRow("Time of day", practiceTime.charAt(0).toUpperCase() + practiceTime.slice(1), 6)}
                  {editRow("Duration", `${minutesPerSession} min`, 5)}
                  {editRow("Sessions / week", String(sessionsPerWeek), 6)}
                  {editRow("Session closing", CLOSING_OPTIONS.find((o) => o.value === closingPref)?.label || "", 7)}
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
      {step !== 1 && step !== 0 && step < 8 && (
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

function ComingSoonCard({ area }: { area: { id: string; label: string; desc: string } }) {
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 opacity-60 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-center gap-2 mb-0.5">
          <Clock size={12} className="text-muted-foreground/50 shrink-0" />
          <span className="text-[15px] font-semibold text-foreground/50">{area.label}</span>
        </div>
        <div className="text-[11px] text-muted-foreground/60 leading-snug">{area.desc}</div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-0">
          {submitted ? (
            <p className="text-xs text-secondary font-medium">You're on the list — we'll let you know!</p>
          ) : (
            <>
              <p className="text-[11px] text-muted-foreground mb-2">
                We're building the {area.label} program. Want to know when it's ready?
              </p>
              <div className="flex gap-1.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button
                  onClick={() => { if (email.includes("@")) setSubmitted(true); }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
                >
                  Notify me →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
