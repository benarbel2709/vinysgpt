import { useState, useCallback, useEffect } from "react";
import VinysDiagnostic from "@/components/VinysDiagnostic";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import type { ConditionKey, EnergyLevel } from "@/constants/conditions";
import { CONDITION_LABELS } from "@/constants/conditions";
import type { GenericAssessmentData, Assessment } from "@/types";
// V1 planGenerator no longer used — sessions are generated on-demand by sessionService
import { trackEvent } from "@/lib/analytics";
import BrandLogo from "@/components/BrandLogo";
import DurationSelector from "@/components/onboarding/DurationSelector";
import FlowProgress from "@/components/FlowProgress";
import { Button } from "@/components/ui/button";
import { X, Check, Pencil, Clock, Lock, ChevronLeft, AlertTriangle } from "lucide-react";
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
const CLOSING_OPTIONS = [
  { value: "savasana" as const, label: "Savasana", desc: "Traditional lying-down rest and integration (3 minutes)" },
  { value: "body_rest" as const, label: "Body Rest & Integration", desc: "Gentle movement-based wind-down (3 minutes)" },
  { value: "meditation" as const, label: "Guided Stillness", desc: "Brief breath-led meditation (3 minutes)" },
];

const RESTRICTION_OPTIONS = [
  "Currently pregnant",
  "Recent surgery (within 6 months)",
  "Currently under physiotherapy or medical care",
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
  { label: "Osteoporosis or low bone density", key: "osteoporosis" },
  { label: "Menopause or perimenopause", key: "menopause" },
  { label: "PCOS (polycystic ovary syndrome)", key: "pcos" },
  { label: "Long COVID or post-viral fatigue", key: "long_covid" },
];

const AGE_GROUP_OPTIONS = [
  { value: "under_40", label: "Under 40" },
  { value: "40_59", label: "40–59" },
  { value: "60_69", label: "60–69" },
  { value: "70_plus", label: "70+" },
];

const NONE_OPTION = "None of the above";

const SYSTEMIC_RED_FLAGS = [
  "I'm pregnant or recently gave birth",
  "I've had recent surgery or an injury",
  "I'm currently seeing a physio or doctor for this condition",
  "I have significant balance issues",
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
// 1 = diagnostic
// 2 = profile summary
// 3 = restrictions
// 4 = session duration + equipment
// 5 = closing preference
// 6 = confirmation
const STEPPER_STEPS = 7;
const TOTAL_STEPS = 7;

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

  useEffect(() => { document.title = "Build Your Plan — Vinys"; }, []);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selected, setSelected] = useState<ConditionKey[]>([]);
  const [conditionDetails, setConditionDetails] = useState<Record<string, string[]>>({});
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [systemicRedFlags, setSystemicRedFlags] = useState<string[]>([]);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([]);
  const [ageGroup, setAgeGroup] = useState<string>("");
  const [restrictionOther, setRestrictionOther] = useState("");
  const [minutesPerSession, setMinutesPerSession] = useState(profile.minutesPerSession || 20);
  const [equipment, setEquipment] = useState<string[]>(["mat"]);
  const [closingPref, setClosingPref] = useState<string>("");
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>("medium");
  const [durationSelected, setDurationSelected] = useState(false);
  const [showStartOverConfirm, setShowStartOverConfirm] = useState(false);
  const [isSystemicFlow, setIsSystemicFlow] = useState(false);
  const [systemicConditionKey, setSystemicConditionKey] = useState<ConditionKey | null>(null);
  const [localIrritability, setLocalIrritability] = useState(2);
  const [safetyFlags, setSafetyFlags] = useState<string[]>([]);
  // Condition-specific clinical answers
  const [menopauseSymptom, setMenopauseSymptom] = useState<string>("");
  const [fibroFlareState, setFibroFlareState] = useState<string>("");
  const [fatigueEnergyYesterday, setFatigueEnergyYesterday] = useState<string>("");
  const [stressAnxietyState, setStressAnxietyState] = useState<string>("");

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
      setAgeGroup("");
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
        if (isSystemicFlow) {
          if (systemicConditionKey === "menopause") return !!menopauseSymptom && !!ageGroup;
          if (systemicConditionKey === "fibromyalgia") return !!fibroFlareState;
          if (systemicConditionKey === "long_covid" || systemicConditionKey === "chronic_fatigue_syndrome") return !!fatigueEnergyYesterday;
          if (systemicConditionKey === "stress_anxiety") return !!stressAnxietyState;
        }
        return true; // restrictions are optional for non-systemic
      case 4:
        return true; // duration + equipment has defaults
      case 5:
        return !!closingPref;
      case 6:
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
    const finalEquipment = equipment.length > 0 ? equipment : ["mat"];

    // For systemic flow, inject diagnostic-like data from condition
    if (isSystemicFlow && systemicConditionKey) {
      // Build condition-specific clinical data
      const clinicalData: Record<string, any> = {};
      if (systemicConditionKey === "menopause") {
        clinicalData.menopauseSymptom = menopauseSymptom;
      } else if (systemicConditionKey === "fibromyalgia") {
        clinicalData.fibroFlareState = fibroFlareState;
      } else if (systemicConditionKey === "long_covid" || systemicConditionKey === "chronic_fatigue_syndrome") {
        clinicalData.fatigueEnergyYesterday = fatigueEnergyYesterday;
      } else if (systemicConditionKey === "stress_anxiety") {
        clinicalData.stressAnxietyState = stressAnxietyState;
      }

      updateProfile({
        conditions: [systemicConditionKey],
        energyLevel,
        flareToday: false,
        sessionsPerWeek: 3,
        minutesPerSession,
        practiceTime: "morning",
        closingPreference: closingPref as "savasana" | "meditation" | "body_rest",
        availableEquipment: finalEquipment,
        restrictions: [],
        safetyFlags: safetyFlags.filter(f => f !== "none"),
        diagnoses: [],
        diagnosticResult: { area: 'SYSTEMIC', primary: 'ST', secondary: null },
        diagnosticArea: 'SYSTEMIC',
        diagnosticProfile: 'ST',
        diagnosticIrritability: localIrritability,
        irritability: localIrritability,
        ageGroup: ageGroup || undefined,
        clinicalData,
      } as any);
    } else {
      updateProfile({
        conditions: selected,
        energyLevel,
        flareToday: false,
        sessionsPerWeek: 3,
        minutesPerSession,
        practiceTime: "morning",
        closingPreference: closingPref as "savasana" | "meditation" | "body_rest",
        availableEquipment: finalEquipment,
        restrictions: restrictions.filter(r => r !== NONE_OPTION),
        diagnoses: selectedDiagnoses,
        ageGroup: ageGroup || undefined,
      } as any);
    }

    const assessmentId = `assessment_${Date.now()}`;
    const allRestrictions = restrictions.filter(r => r !== NONE_OPTION);
    if (restrictionOther.trim()) allRestrictions.push(restrictionOther.trim());
    const data: GenericAssessmentData = {
      mainIssue: selected.join(", "),
      pain: 5,
      limits: allRestrictions.join("; "),
      equipment: finalEquipment,
      redFlags: [],
    };
    const assessment: Assessment = { id: assessmentId, createdAt: new Date().toISOString(), type: "generic", data };

    const expMap: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
      low: 'beginner', medium: 'intermediate', high: 'advanced',
    };

    const areaCodes: string[] = [];
    if (selectedArea && !isSystemicFlow) {
      const code = AREA_TO_ENGINE[selectedArea];
      if (code) areaCodes.push(code);
    }

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
    if (isSystemicFlow) {
      if (step === 3) { setStep(4); return; }
      if (step === 4) { setStep(5); return; }
      if (step === 5) { setStep(7); return; }
      if (step === 7) { setStep(6); return; }
    }
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 0) {
      navigate("/");
      return;
    }
    if (isSystemicFlow) {
      if (step === 3) { setStep(0); setIsSystemicFlow(false); setSystemicConditionKey(null); setSelected([]); return; }
      if (step === 4) { setStep(3); return; }
      if (step === 5) { setStep(4); return; }
      if (step === 7) { setStep(5); return; }
      if (step === 6) { setStep(7); return; }
    }
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
    isSystemicFlow
      ? systemicConditionKey === "menopause" ? "What's affecting you most right now?"
      : systemicConditionKey === "stress_anxiety" ? "How would you describe how you're feeling right now?"
      : systemicConditionKey === "long_covid" || systemicConditionKey === "chronic_fatigue_syndrome" ? "How was your energy yesterday?"
      : systemicConditionKey === "fibromyalgia" ? "How is your pain today vs your usual baseline?"
      : "How are you feeling today?"
    : "Any health considerations we should know about?",
    "How long should each session be?",
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

  // Post-assessment step counter
  const SYSTEMIC_STEP_MAP: Record<number, number> = { 3: 1, 4: 2, 5: 3, 7: 4 };
  const POST_ASSESSMENT_TOTAL = isSystemicFlow ? 4 : 3;
  const getPostAssessmentStep = (s: number) => {
    if (isSystemicFlow) return SYSTEMIC_STEP_MAP[s] || null;
    if (s >= 3 && s <= 5) return s - 2;
    return null;
  };
  const postStep = getPostAssessmentStep(step);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* ── HEADER (logo + stepper + X in one row) ── */}
      <header className="shrink-0 z-50 w-full bg-background" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center h-[56px] px-6 lg:px-[100px]">
          {step > 0 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2"
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
              <span className="text-sm font-medium">Back</span>
            </button>
          ) : (
            <BrandLogo size="md" linkToHome={false} />
          )}
          <div className="flex-1 flex justify-center">
            {step < 6 && step !== 1 && step !== 7 && <FlowProgress current={step + 1} total={STEPPER_STEPS} />}
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
        {step !== 1 && step !== 2 && step !== 6 && step !== 7 && (
          <>
            <h1
              className="font-display text-foreground font-bold text-2xl text-center shrink-0"
              style={{ marginTop: postStep ? "6px" : "30px" }}
            >
              {STEP_TITLES[step]}
            </h1>
          </>
        )}
        {step === 3 && !isSystemicFlow && (
          <p className="text-muted-foreground text-center text-sm mt-1 shrink-0">
            Select everything that applies — this helps us personalise your practice and filter out anything that could cause harm.
          </p>
        )}
        {step === 3 && isSystemicFlow && systemicConditionKey !== "menopause" && (
          <p className="text-muted-foreground text-center text-sm mt-1 shrink-0">
            This helps us set the right intensity for your practice.
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

          const SYSTEMIC_CONDITIONS = [
            { id: "MENO", label: "Menopause & Hormonal Changes", desc: "Hot flashes, joint pain, mood or energy shifts", conditionKey: "menopause" as ConditionKey, color: "#9B4A6F" },
            { id: "LCOVID", label: "Long COVID & Post-Viral Fatigue", desc: "Fatigue, breathlessness, or lingering symptoms", conditionKey: "long_covid" as ConditionKey, color: "#4A7B7B" },
            { id: "FIBRO", label: "Fibromyalgia", desc: "Widespread pain, fatigue, or sensitivity", conditionKey: "fibromyalgia" as ConditionKey, color: "#7B4A9B" },
            { id: "CFS", label: "Chronic Fatigue (ME/CFS)", desc: "Low energy, post-exertional malaise", conditionKey: "chronic_fatigue_syndrome" as ConditionKey, color: "#9B7B4A" },
            { id: "STRESS", label: "General Stress & Anxiety", desc: "Tension, sleep issues, nervous system overload", conditionKey: "stress_anxiety" as ConditionKey, color: "#4A6B9B" },
          ];

          const SYSTEMIC_ICONS: Record<string, React.ReactNode> = {
            MENO:   <path d="M8 2a6 6 0 1 1 0 12A6 6 0 0 1 8 2zm0 3c-1.7 0-3 1.3-3 3s1.3 3 3 3" stroke="currentColor" fill="none" strokeWidth="1.2"/>,
            LCOVID: <><path d="M8 1v3M8 12v3M1 8h3M12 8h3" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="8" r="3" stroke="currentColor" fill="none" strokeWidth="1.2"/></>,
            FIBRO:  <><circle cx="8" cy="8" r="6" stroke="currentColor" fill="none" strokeWidth="1.2"/><circle cx="5" cy="6" r="1" fill="currentColor"/><circle cx="11" cy="6" r="1" fill="currentColor"/><circle cx="8" cy="10" r="1" fill="currentColor"/><circle cx="5" cy="11" r="1" fill="currentColor"/><circle cx="11" cy="11" r="1" fill="currentColor"/></>,
            CFS:    <><rect x="4" y="5" width="8" height="8" rx="2" stroke="currentColor" fill="none" strokeWidth="1.2"/><line x1="6" y1="3" x2="10" y2="3" stroke="currentColor" strokeWidth="1.2"/><rect x="5.5" y="9" width="5" height="3" rx="0.5" fill="currentColor" opacity="0.2"/></>,
            STRESS: <path d="M2 10Q5 4 8 10Q11 16 14 10M2 7Q5 1 8 7Q11 13 14 7" stroke="currentColor" fill="none" strokeWidth="1.2"/>,
          };

          const SystemicCard = ({ cond }: { cond: typeof SYSTEMIC_CONDITIONS[0] }) => {
            const accent = cond.color;
            const isSelected = selectedArea === cond.id;
            return (
              <button
                onClick={() => {
                  setSelectedArea(cond.id);
                  setIsSystemicFlow(true);
                  setSystemicConditionKey(cond.conditionKey);
                  setSelected([cond.conditionKey]);
                  setTimeout(() => setStep(3), 200);
                }}
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
                      {SYSTEMIC_ICONS[cond.id]}
                    </svg>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#1C2B26", lineHeight: 1.2 }}>{cond.label}</span>
                </div>
                <span style={{ fontSize: 12, color: "#7A8E89", lineHeight: 1.35 }}>{cond.desc}</span>
              </button>
            );
          };

          return (
            <div className="w-full" style={{ marginTop: "16px", maxWidth: "520px", margin: "16px auto 0" }}>
              <p className="text-muted-foreground text-center text-[15px] mb-6 leading-relaxed">
                Select the area you want to assess, or choose a whole-body condition below.
              </p>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#7A8E89", textTransform: "uppercase" as const, marginBottom: 10 }}>UPPER BODY</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {upperBody.map(id => <AreaCard key={id} areaId={id} />)}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#7A8E89", textTransform: "uppercase" as const, marginBottom: 10 }}>LOWER BODY</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {lowerBody.map(id => <AreaCard key={id} areaId={id} />)}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#7A8E89", textTransform: "uppercase" as const, marginBottom: 10 }}>WHOLE BODY & SYSTEMIC CONDITIONS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {SYSTEMIC_CONDITIONS.map(cond => <SystemicCard key={cond.id} cond={cond} />)}
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
                  diagnosticSecondaryProfile: result.secondaryProfile || null,
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
                {diagnosticResult.secondaryProfile && (() => {
                  const secInfo = PROFILE_LABELS[diagnosticResult.secondaryProfile] || { label: diagnosticResult.secondaryProfile, desc: "" };
                  return (
                    <>
                      <hr className="border-border" />
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-muted-foreground text-sm shrink-0">Secondary Profile</span>
                        <div className="text-right">
                          <span className="font-semibold text-secondary/70 block">{secInfo.label}</span>
                          <span className="text-xs text-muted-foreground">{secInfo.desc}</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
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

        {/* ═══ STEP 3: Condition-specific clinical questions (systemic) ═══ */}
        {step === 3 && isSystemicFlow && (
          <div className="w-full text-left" style={{ marginTop: "24px", maxWidth: "560px" }}>

            {/* ── MENOPAUSE ── */}
            {systemicConditionKey === "menopause" && (
              <>
                <p className="text-sm text-muted-foreground mb-4">Select the one that affects you most — we'll shape your practice around it.</p>
                <div className="flex flex-col gap-2 mb-8">
                  {([
                    { value: "hot-flushes", label: "Hot flushes & temperature regulation" },
                    { value: "joint-pain", label: "Joint stiffness & pain" },
                    { value: "mood-sleep", label: "Mood & sleep" },
                    { value: "low-energy", label: "Low energy & fatigue" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setMenopauseSymptom(opt.value)}
                      className={`w-full p-3 rounded-[12px] border-2 text-left transition-all ${menopauseSymptom === opt.value ? "border-secondary bg-secondary/10" : "border-border bg-card hover:border-secondary/40"}`}
                    >
                      <span className="text-sm font-medium text-foreground">{opt.label}</span>
                    </button>
                  ))}
                </div>

                {/* Age group — REQUIRED for menopause */}
                <p className="text-sm font-semibold text-foreground mb-3">What is your age group?</p>
                <div className="flex flex-wrap gap-2">
                  {AGE_GROUP_OPTIONS.map((ag) => (
                    <button
                      key={ag.value}
                      onClick={() => setAgeGroup(prev => prev === ag.value ? "" : ag.value)}
                      className={`px-4 py-2 rounded-[8px] border-2 text-sm font-medium transition-all ${ageGroup === ag.value ? "border-secondary bg-secondary/10 text-foreground" : "border-border bg-card text-foreground hover:border-secondary/40"}`}
                    >
                      {ag.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ── FIBROMYALGIA ── */}
            {systemicConditionKey === "fibromyalgia" && (
              <>
                <p className="text-sm text-muted-foreground mb-4">This helps us calibrate the right intensity for today.</p>
                <div className="flex flex-col gap-2 mb-8">
                  {([
                    { value: "flare-high", label: "Much higher — definite flare" },
                    { value: "flare-slight", label: "Slightly higher than usual" },
                    { value: "baseline", label: "About my usual level" },
                    { value: "good-day", label: "Lower than usual — good day" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFibroFlareState(opt.value)}
                      className={`w-full p-3 rounded-[12px] border-2 text-left transition-all ${fibroFlareState === opt.value ? "border-secondary bg-secondary/10" : "border-border bg-card hover:border-secondary/40"}`}
                    >
                      <span className="text-sm font-medium text-foreground">{opt.label}</span>
                    </button>
                  ))}
                </div>

                {/* Trajectory question */}
                <div className="mb-8">
                  <p className="text-sm font-semibold text-foreground mb-3">How has your condition been lately?</p>
                  <div className="flex flex-col gap-2">
                    {([
                      { value: 1, label: "I'm actually improving", desc: "Feeling better — ready for a fuller practice" },
                      { value: 3, label: "About the same", desc: "Steady — keep it balanced" },
                      { value: 5, label: "I'm dipping", desc: "Symptoms are flaring — I need the gentlest approach" },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setLocalIrritability(opt.value)}
                        className={`w-full p-3 rounded-[12px] border-2 text-left transition-all ${localIrritability === opt.value ? "border-secondary bg-secondary/10" : "border-border bg-card hover:border-secondary/40"}`}
                      >
                        <span className="font-semibold text-sm text-foreground">{opt.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age group (optional) */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-3">What is your age group? <span className="font-normal text-muted-foreground">(optional)</span></p>
                  <div className="flex flex-wrap gap-2">
                    {AGE_GROUP_OPTIONS.map((ag) => (
                      <button
                        key={ag.value}
                        onClick={() => setAgeGroup(prev => prev === ag.value ? "" : ag.value)}
                        className={`px-4 py-2 rounded-[8px] border-2 text-sm font-medium transition-all ${ageGroup === ag.value ? "border-secondary bg-secondary/10 text-foreground" : "border-border bg-card text-foreground hover:border-secondary/40"}`}
                      >
                        {ag.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── LONG COVID & ME/CFS (shared) ── */}
            {(systemicConditionKey === "long_covid" || systemicConditionKey === "chronic_fatigue_syndrome") && (
              <>
                <p className="text-sm text-muted-foreground mb-4">We'll pace your practice based on your current capacity.</p>

                <div className="mb-8">
                  <p className="text-xs text-muted-foreground mb-3">Post-exertional symptoms often appear 12–48 hours after activity</p>
                  <div className="flex flex-col gap-2">
                    {([
                      { value: "very-low", label: "Very low — mostly resting" },
                      { value: "low", label: "Low — light activity only" },
                      { value: "moderate", label: "Moderate — managed some tasks" },
                      { value: "good", label: "Good — fairly active" },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setFatigueEnergyYesterday(opt.value)}
                        className={`w-full p-3 rounded-[12px] border-2 text-left transition-all ${fatigueEnergyYesterday === opt.value ? "border-secondary bg-secondary/10" : "border-border bg-card hover:border-secondary/40"}`}
                      >
                        <span className="text-sm font-medium text-foreground">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trajectory question */}
                <div className="mb-8">
                  <p className="text-sm font-semibold text-foreground mb-3">How has your condition been lately?</p>
                  <div className="flex flex-col gap-2">
                    {([
                      { value: 1, label: "I'm actually improving", desc: "Feeling better — ready for a fuller practice" },
                      { value: 3, label: "About the same", desc: "Steady — keep it balanced" },
                      { value: 5, label: "I'm dipping", desc: "Symptoms are flaring — I need the gentlest approach" },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setLocalIrritability(opt.value)}
                        className={`w-full p-3 rounded-[12px] border-2 text-left transition-all ${localIrritability === opt.value ? "border-secondary bg-secondary/10" : "border-border bg-card hover:border-secondary/40"}`}
                      >
                        <span className="font-semibold text-sm text-foreground">{opt.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age group (optional) */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-3">What is your age group? <span className="font-normal text-muted-foreground">(optional)</span></p>
                  <div className="flex flex-wrap gap-2">
                    {AGE_GROUP_OPTIONS.map((ag) => (
                      <button
                        key={ag.value}
                        onClick={() => setAgeGroup(prev => prev === ag.value ? "" : ag.value)}
                        className={`px-4 py-2 rounded-[8px] border-2 text-sm font-medium transition-all ${ageGroup === ag.value ? "border-secondary bg-secondary/10 text-foreground" : "border-border bg-card text-foreground hover:border-secondary/40"}`}
                      >
                        {ag.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── STRESS & ANXIETY ── */}
            {systemicConditionKey === "stress_anxiety" && (
              <>
                <p className="text-sm text-muted-foreground mb-4">We'll match your practice to how your nervous system feels right now.</p>
                <div className="flex flex-col gap-2 mb-8">
                  {([
                    { value: "wound-up", label: "Wound up or anxious" },
                    { value: "depleted", label: "Exhausted or depleted" },
                    { value: "mixed", label: "A mix of both" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStressAnxietyState(opt.value)}
                      className={`w-full p-3 rounded-[12px] border-2 text-left transition-all ${stressAnxietyState === opt.value ? "border-secondary bg-secondary/10" : "border-border bg-card hover:border-secondary/40"}`}
                    >
                      <span className="text-sm font-medium text-foreground">{opt.label}</span>
                    </button>
                  ))}
                </div>

                {/* Age group (optional) */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-3">What is your age group? <span className="font-normal text-muted-foreground">(optional)</span></p>
                  <div className="flex flex-wrap gap-2">
                    {AGE_GROUP_OPTIONS.map((ag) => (
                      <button
                        key={ag.value}
                        onClick={() => setAgeGroup(prev => prev === ag.value ? "" : ag.value)}
                        className={`px-4 py-2 rounded-[8px] border-2 text-sm font-medium transition-all ${ageGroup === ag.value ? "border-secondary bg-secondary/10 text-foreground" : "border-border bg-card text-foreground hover:border-secondary/40"}`}
                      >
                        {ag.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

          </div>
        )}
        {step === 3 && !isSystemicFlow && (
          <div className="w-full text-center" style={{ marginTop: "40px", maxWidth: "560px" }}>
            {/* Age group question */}
            <div className="mb-6 text-left">
              <p className="text-sm font-semibold text-foreground mb-3">What is your age group?</p>
              <div className="flex flex-wrap gap-2">
                {AGE_GROUP_OPTIONS.map((ag) => {
                  const isSelected = ageGroup === ag.value;
                  return (
                    <button
                      key={ag.value}
                      onClick={() => setAgeGroup(prev => prev === ag.value ? "" : ag.value)}
                      className={`px-4 py-2 rounded-[8px] border-2 text-sm font-medium transition-all ${isSelected ? "border-secondary bg-secondary/10 text-foreground" : "border-border bg-card text-foreground hover:border-secondary/40"}`}
                    >
                      {ag.label}
                    </button>
                  );
                })}
              </div>
            </div>

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
                  restrictions.length === 0 && selectedDiagnoses.length === 0 && !ageGroup
                    ? "border-muted-foreground/30 bg-card"
                    : "border-border bg-card"
                }`}
              >
                <div className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all ${
                  restrictions.length === 0 && selectedDiagnoses.length === 0 && !ageGroup
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

        {/* ═══ STEP 4: Duration + Equipment ═══ */}
        {step === 4 && (
          <div className="w-full text-center" style={{ marginTop: "20px", maxWidth: "560px" }}>
            <DurationSelector value={minutesPerSession} onChange={(v) => { setMinutesPerSession(v); setDurationSelected(true); }} />

            <div style={{ marginTop: "32px" }}>
              <h2 className="font-display text-foreground font-bold text-lg text-center mb-4">What equipment do you have?</h2>
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
          </div>
        )}

        {/* ═══ STEP 5: Session Closing ═══ */}
        {step === 5 && (
          <div className="w-full text-center" style={{ marginTop: "40px", maxWidth: "440px" }}>
            <div className="flex flex-col" style={{ gap: "12px" }}>
              {CLOSING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setClosingPref(opt.value); setTimeout(() => setStep(isSystemicFlow ? 7 : 6), 250); }}
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

        {/* ═══ STEP 7: Systemic Safety Screen ═══ */}
        {step === 7 && isSystemicFlow && (() => {
          const SAFETY_OPTIONS = [
            "I'm pregnant or recently gave birth",
            "I've had recent surgery or an injury",
            "I'm currently seeing a physio or doctor for this condition",
            "I have significant balance issues",
          ];
          const noneSelected = safetyFlags.includes("none");

          const toggleSafetyFlag = (flag: string) => {
            if (flag === "none") {
              setSafetyFlags(["none"]);
              return;
            }
            setSafetyFlags(prev => {
              const without = prev.filter(f => f !== "none");
              return without.includes(flag) ? without.filter(f => f !== flag) : [...without, flag];
            });
          };

          return (
            <div className="w-full text-center" style={{ marginTop: "40px", maxWidth: "560px" }}>
              <h1 className="font-display text-foreground font-bold text-2xl mb-2">Before we build your plan…</h1>
              <p className="text-muted-foreground text-sm mb-6">
                We want to make sure your practice is safe. Please check any that apply — we'll adjust your practice accordingly.
              </p>
              <div className="flex flex-col gap-2">
                {SAFETY_OPTIONS.map((flag) => {
                  const isChecked = safetyFlags.includes(flag);
                  return (
                    <button
                      key={flag}
                      onClick={() => toggleSafetyFlag(flag)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] border-2 transition-all text-left ${
                        isChecked ? "border-secondary bg-secondary/10" : "border-border bg-card hover:border-secondary/40"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all ${
                        isChecked ? "border-secondary bg-secondary" : "border-border bg-card"
                      }`}>
                        {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-sm font-medium text-foreground">{flag}</span>
                    </button>
                  );
                })}
                <button
                  onClick={() => toggleSafetyFlag("none")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] border-2 transition-all text-left ${
                    noneSelected ? "border-secondary bg-secondary/10" : "border-border bg-card hover:border-secondary/40"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all ${
                    noneSelected ? "border-secondary bg-secondary" : "border-border bg-card"
                  }`}>
                    {noneSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-sm font-medium text-foreground">None of the above</span>
                </button>
              </div>
            </div>
          );
        })()}

        {step === 6 &&
          (() => {
            const doStartOver = () => {
              setStep(0);
              setSelected([]);
              setConditionDetails({});
              setRestrictions([]);
              setRestrictionOther("");
              setDurationSelected(false);
              setEquipment(["mat"]);
              setClosingPref("");
              setEnergyLevel("medium");
              setMinutesPerSession(20);
              setShowStartOverConfirm(false);
              setDiagnosticResult(null);
              setIsSystemicFlow(false);
              setSystemicConditionKey(null);
              setLocalIrritability(2);
              setSystemicRedFlags([]);
              setAgeGroup("");
              setSafetyFlags([]);
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
                  {editRow("Duration", `${minutesPerSession} min`, 4)}
                  {editRow("Session closing", CLOSING_OPTIONS.find((o) => o.value === closingPref)?.label || "", 5)}
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
      {(step !== 1 && step !== 0 && step < 6 || step === 7) && (
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
            ) : step === 7 ? (
              <Button
                variant="hero"
                onClick={handleNext}
                disabled={safetyFlags.length === 0}
                className="text-base h-[35px] rounded-full px-5"
              >
                Continue →
              </Button>
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
