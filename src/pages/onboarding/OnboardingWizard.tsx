import { useState, useCallback, useEffect } from "react";
import VinysDiagnostic from "@/components/VinysDiagnostic";
import { useNavigate } from "react-router-dom";
import BodySilhouetteSelector from "@/components/onboarding/BodySilhouetteSelector";
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

  const [step, setStep] = useState(-1); // -1 = track selection

  useEffect(() => { document.title = "Build Your Plan — Vinys"; }, []);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedBodyZones, setSelectedBodyZones] = useState<string[]>([]);
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
  // Movement response for physical area flows (step 8)
  const [movementResponse, setMovementResponse] = useState<string>("");
  // Quick assessment state
  const [qaArea, setQaArea] = useState<string>("");
  const [qaMovement, setQaMovement] = useState<string>("");
  const [qaIrritability, setQaIrritability] = useState<number>(0);
  const [qaGoal, setQaGoal] = useState<string>("");
  const [qaFlags, setQaFlags] = useState<string[]>([]);
  const [qaStep, setQaStep] = useState(1); // 1-5

  const toggle = useCallback((c: ConditionKey) => {
    setSelected((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
  }, []);

  const toggleBodyZone = useCallback((zoneId: string) => {
    setSelectedBodyZones(prev =>
      prev.includes(zoneId) ? prev.filter(z => z !== zoneId) : [...prev, zoneId]
    );
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
        return selectedBodyZones.length > 0;
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
      case 8:
        return !!movementResponse;
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

  const handleQuickComplete = () => {
    const AREA_MAP: Record<string, ConditionKey> = {
      LB: "back_pain", NK: "neck_pain", SH: "shoulder_pain", KN: "knee_pain",
      HI: "hip_pain", AN: "ankle_pain", GEN: "general_yoga",
    };
    const condKey = AREA_MAP[qaArea] || "general_yoga";
    const flags = qaFlags.filter(f => f !== "NONE");

    updateProfile({
      conditions: [condKey],
      energyLevel: "medium",
      flareToday: false,
      sessionsPerWeek: 3,
      minutesPerSession: 20,
      practiceTime: "morning",
      closingPreference: "savasana",
      availableEquipment: ["mat"],
      restrictions: flags.includes("PREG") ? ["Currently pregnant"] : [],
    } as any);

    const assessmentId = `assessment_${Date.now()}`;
    const assessment: Assessment = {
      id: assessmentId,
      createdAt: new Date().toISOString(),
      type: "generic",
      data: { mainIssue: condKey, pain: qaIrritability * 2, limits: "", equipment: ["mat"], redFlags: [] },
    };

    updateState({
      disclaimerAccepted: true,
      onboardingCompleted: true,
      assessments: [...state.assessments, assessment],
      userProfile: qaArea !== "GEN" ? [qaArea] : [],
      stage: 1,
      session_count: 0,
      experienceLevel: "intermediate",
      sessionDuration: 20,
      quickAssessment: {
        assessment_type: "quick",
        confidence_level: "low",
        primary_area: qaArea,
        movement_profile: qaMovement,
        irritability: qaIrritability,
        goal_preference: qaGoal,
        safety_flags: flags,
      },
      quickSessionCount: 0,
    });

    trackEvent("quick_assessment_completed", { area: qaArea });
    navigate("/plan");
  };

  const handleNext = () => {
    if (step === 0 && selectedBodyZones.length > 0 && !isSystemicFlow) {
      setSelectedArea(selectedBodyZones[0]);
      setStep(1);
      return;
    }
    if (isSystemicFlow) {
      if (step === 3) { setStep(4); return; }
      if (step === 4) { setStep(5); return; }
      if (step === 5) { setStep(7); return; }
      if (step === 7) { setStep(6); return; }
    }
    // Physical area flow: step 2 → 8 (movement assessment) → 3
    if (!isSystemicFlow && step === 2) { setStep(8); return; }
    if (!isSystemicFlow && step === 8) { setStep(3); return; }
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === -1) {
      navigate("/");
      return;
    }
    if (step === 0) {
      setStep(-1);
      return;
    }
    // Quick assessment back
    if (step === 10) {
      if (qaStep === 1) { setStep(-1); return; }
      setQaStep(qaStep - 1);
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
    // Physical area flow: step 3 back to 8, step 8 back to 2
    if (!isSystemicFlow && step === 3) { setStep(8); return; }
    if (step === 8) { setStep(2); return; }
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

  const BODY_AREAS_UPPER = [
    { id: "NECK", label: "Neck", desc: "Pain, stiffness, or headaches", icon: "neck" },
    { id: "SHLDR", label: "Shoulder", desc: "Pain or restricted movement", icon: "shoulder" },
    { id: "UBACK", label: "Upper Back", desc: "Mid-back tightness or aching", icon: "upper-back" },
    { id: "WRIST", label: "Wrist & Hand", desc: "Pain, tingling, or grip issues", icon: "wrist" },
  ];
  const BODY_AREAS_LOWER = [
    { id: "LB", label: "Lower Back", desc: "Lumbar pain or stiffness", icon: "lower-back" },
    { id: "HIP", label: "Hip", desc: "Pain or restricted range", icon: "hip" },
    { id: "KNEE", label: "Knee", desc: "Knee pain or instability", icon: "knee" },
    { id: "ANKLE", label: "Ankle & Foot", desc: "Ankle pain or balance issues", icon: "ankle" },
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
          {step > 0 || step === 10 ? (
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
            {step === 10 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Step {qaStep} of 5</span>
                <div className="w-24 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(qaStep / 5) * 100}%` }} />
                </div>
              </div>
            )}
            {step >= 0 && step < 6 && step !== 1 && step !== 7 && step !== 8 && <FlowProgress current={step + 1} total={STEPPER_STEPS} />}
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
        {step >= 0 && step !== 1 && step !== 2 && step !== 6 && step !== 7 && step !== 8 && step !== 10 && (
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

        {/* ═══ STEP -1: Track Selection ═══ */}
        {step === -1 && (
          <div className="w-full flex flex-col items-center" style={{ marginTop: "40px", maxWidth: "720px" }}>
            <h1 className="font-display text-foreground font-bold text-center mb-2" style={{ fontSize: "clamp(24px, 3vw, 32px)" }}>
              How would you like to begin?
            </h1>
            <p className="text-muted-foreground text-center text-sm mb-8 max-w-[520px] leading-relaxed">
              Both paths lead to a real, personalised therapeutic practice — choose what works for you right now.
            </p>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* LEFT — Quick start */}
              <button
                onClick={() => setStep(10)}
                className="text-left p-6 rounded-2xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-all"
              >
                <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Start today</span>
                <h3 className="font-bold text-foreground text-lg mt-2 mb-2">Begin right now, refine over time</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Answer 5 questions and get your first session immediately. Your plan evolves as we learn how your body moves.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {["~60 seconds", "First session today", "Plan evolves with you"].map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary">{t}</span>
                  ))}
                </div>
                <span className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  Start practicing
                </span>
                <p className="text-[11px] text-muted-foreground mt-3 leading-snug">
                  After 3 sessions we will invite you to complete your full profile.
                </p>
              </button>
              {/* RIGHT — Full assessment */}
              <button
                onClick={() => setStep(0)}
                className="text-left p-6 rounded-2xl border-2 border-border hover:border-foreground/30 transition-all"
              >
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Most precise</span>
                <h3 className="font-bold text-foreground text-lg mt-2 mb-2">Map your movement first</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  A guided movement assessment so every session is precisely matched to how your body actually moves — from day one.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {["~8 minutes", "Complete movement profile", "Highest accuracy from session 1"].map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">{t}</span>
                  ))}
                </div>
                <span className="inline-flex items-center justify-center px-5 py-2 rounded-full border-2 border-foreground text-foreground text-sm font-semibold">
                  Take the full assessment
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 10: Quick Assessment (5 questions) ═══ */}
        {step === 10 && (() => {
          const QA_AREAS = [
            { code: "LB", label: "Lower back" },
            { code: "NK", label: "Neck" },
            { code: "SH", label: "Shoulders" },
            { code: "KN", label: "Knees" },
            { code: "HI", label: "Hips" },
            { code: "AN", label: "Ankles and feet" },
            { code: "GEN", label: "Whole body or general" },
          ];
          const QA_MOVEMENT = [
            { code: "FL", label: "Bending forward — sitting or rounding" },
            { code: "EX", label: "Arching backward" },
            { code: "LI", label: "Standing or putting load on my legs" },
            { code: "ST", label: "Anything unstable — hard to control" },
            { code: "NE", label: "Not sure, or everything feels sensitive" },
          ];
          const QA_DAILY = [
            { label: "Mild — I notice it but it does not hold me back", value: 2 },
            { label: "Moderate — it limits me sometimes", value: 3 },
            { label: "High — it restricts my movement or activity", value: 4 },
          ];
          const QA_GOAL = [
            { code: "BREATH", label: "Gentle breathing and calming movement" },
            { code: "MOBILITY", label: "Stretching and opening up" },
            { code: "STRENGTH", label: "Building strength and stability" },
            { code: "REST", label: "Slow, restorative rest" },
            { code: "NONE", label: "Not sure yet" },
          ];
          const QA_SAFETY = [
            { code: "PREG", label: "I am pregnant" },
            { code: "INJURY", label: "Recent injury" },
            { code: "RADICULAR", label: "Pain that radiates into my arm or leg" },
            { code: "POST_SURGERY", label: "Previous surgery in the affected area" },
            { code: "NONE", label: "None of the above" },
          ];

          const canContinueQA = () => {
            if (qaStep === 1) return !!qaArea;
            if (qaStep === 2) return !!qaMovement;
            if (qaStep === 3) return qaIrritability > 0;
            if (qaStep === 4) return !!qaGoal;
            if (qaStep === 5) return qaFlags.length > 0;
            return false;
          };

          const handleQANext = () => {
            if (qaStep < 5) { setQaStep(qaStep + 1); return; }
            handleQuickComplete();
          };

          const toggleQAFlag = (code: string) => {
            if (code === "NONE") { setQaFlags(["NONE"]); return; }
            setQaFlags(prev => {
              const without = prev.filter(f => f !== "NONE");
              return without.includes(code) ? without.filter(f => f !== code) : [...without, code];
            });
          };

          const optionBtn = (selected: boolean) =>
            `w-full p-3.5 rounded-[12px] border-2 text-left transition-all ${selected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"}`;

          return (
            <div className="w-full flex flex-col items-center" style={{ marginTop: "30px", maxWidth: "560px" }}>
              {qaStep === 1 && (
                <>
                  <h1 className="font-display text-foreground font-bold text-2xl text-center mb-6">Where do you feel the main issue right now?</h1>
                  <div className="w-full flex flex-col gap-2">
                    {QA_AREAS.map(a => (
                      <button key={a.code} onClick={() => setQaArea(a.code)} className={optionBtn(qaArea === a.code)}>
                        <span className="text-sm font-medium text-foreground">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {qaStep === 2 && (
                <>
                  <h1 className="font-display text-foreground font-bold text-2xl text-center mb-6">What type of movement tends to make it worse?</h1>
                  <div className="w-full flex flex-col gap-2">
                    {QA_MOVEMENT.map(m => (
                      <button key={m.code} onClick={() => setQaMovement(m.code)} className={optionBtn(qaMovement === m.code)}>
                        <span className="text-sm font-medium text-foreground">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {qaStep === 3 && (
                <>
                  <h1 className="font-display text-foreground font-bold text-2xl text-center mb-6">How much does it affect your daily life?</h1>
                  <div className="w-full flex flex-col gap-2">
                    {QA_DAILY.map(d => (
                      <button key={d.value} onClick={() => setQaIrritability(d.value)} className={optionBtn(qaIrritability === d.value)}>
                        <span className="text-sm font-medium text-foreground">{d.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {qaStep === 4 && (
                <>
                  <h1 className="font-display text-foreground font-bold text-2xl text-center mb-6">What kind of movement tends to feel good for you?</h1>
                  <div className="w-full flex flex-col gap-2">
                    {QA_GOAL.map(g => (
                      <button key={g.code} onClick={() => setQaGoal(g.code)} className={optionBtn(qaGoal === g.code)}>
                        <span className="text-sm font-medium text-foreground">{g.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {qaStep === 5 && (
                <>
                  <h1 className="font-display text-foreground font-bold text-2xl text-center mb-2">Anything we should keep in mind?</h1>
                  <p className="text-muted-foreground text-center text-sm mb-6">Select all that apply</p>
                  <div className="w-full flex flex-col gap-2">
                    {QA_SAFETY.map(s => {
                      const isChecked = qaFlags.includes(s.code);
                      return (
                        <button key={s.code} onClick={() => toggleQAFlag(s.code)}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-[12px] border-2 text-left transition-all ${isChecked ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"}`}
                        >
                          <div className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all ${isChecked ? "border-primary bg-primary" : "border-border bg-card"}`}>
                            {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                          </div>
                          <span className="text-sm font-medium text-foreground">{s.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* QA bottom CTA */}
              <div className="w-full mt-8">
                <Button variant="hero" size="lg" className="w-full rounded-full" onClick={handleQANext} disabled={!canContinueQA()}>
                  {qaStep === 5 ? "Let's go →" : "Continue →"}
                </Button>
              </div>
            </div>
          );
        })()}

        {/* ═══ STEP 0: Card-based body area + systemic selector ═══ */}
        {step === 0 && (() => {
          const SYSTEMIC_CONDITIONS = [
            { id: "MENO", label: "Menopause & Hormonal Changes", desc: "Hot flashes, joint pain, mood or energy shifts", conditionKey: "menopause" as ConditionKey, lucideIcon: "Flower2" },
            { id: "LCOVID", label: "Long COVID & Post-Viral Fatigue", desc: "Fatigue, breathlessness, or lingering symptoms", conditionKey: "long_covid" as ConditionKey, lucideIcon: "Wind" },
            { id: "FIBRO", label: "Fibromyalgia", desc: "Widespread pain, fatigue, or sensitivity", conditionKey: "fibromyalgia" as ConditionKey, lucideIcon: "Zap" },
            { id: "CFS", label: "Chronic Fatigue (ME/CFS)", desc: "Low energy, post-exertional malaise", conditionKey: "chronic_fatigue_syndrome" as ConditionKey, lucideIcon: "Battery" },
            { id: "STRESS", label: "General Stress & Anxiety", desc: "Tension, sleep issues, nervous system overload", conditionKey: "stress_anxiety" as ConditionKey, lucideIcon: "Brain" },
          ];

          const AREA_ICONS: Record<string, React.ReactNode> = {
            "neck": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 0-5 5v2a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z"/><path d="M10 14v8"/><path d="M14 14v8"/></svg>,
            "shoulder": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6v6"/><path d="M6 12c0-4 2-6 6-6s6 2 6 6"/><path d="M4 14h16"/></svg>,
            "upper-back": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M9 15h6"/></svg>,
            "wrist": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 13"/></svg>,
            "lower-back": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c-2 4-4 6-4 10s2 8 4 8 4-4 4-8-2-6-4-10z"/></svg>,
            "hip": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="4"/><path d="M8 14l-4 8"/><path d="M16 14l4 8"/></svg>,
            "knee": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v7"/><circle cx="12" cy="12" r="3"/><path d="M12 15v7"/></svg>,
            "ankle": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v10"/><path d="M12 12l-4 6h8l-4-6z"/><path d="M6 20h12"/></svg>,
          };

          const SYSTEMIC_ICONS: Record<string, React.ReactNode> = {
            "Flower2": <Flower2 size={18} />,
            "Wind": <Wind size={18} />,
            "Zap": <Zap size={18} />,
            "Battery": <BatteryLow size={18} />,
            "Brain": <Brain size={18} />,
          };

          const renderAreaCard = (area: { id: string; label: string; desc: string; icon: string }) => {
            const isSelected = selectedBodyZones.includes(area.id);
            return (
              <button
                key={area.id}
                onClick={() => toggleBodyZone(area.id)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all duration-150 ${
                  isSelected
                    ? "border-primary bg-primary/8 shadow-sm"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  isSelected ? "bg-primary/15 text-primary" : "bg-muted/50 text-muted-foreground"
                }`}>
                  {AREA_ICONS[area.icon]}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold leading-tight ${isSelected ? "text-foreground" : "text-foreground"}`}>{area.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{area.desc}</p>
                </div>
              </button>
            );
          };

          return (
            <div className="w-full" style={{ marginTop: "12px", maxWidth: "720px", margin: "12px auto 0" }}>
              <p className="text-muted-foreground text-center text-[14px] mb-6 leading-relaxed">
                Select the area you want to assess, or choose a whole-body condition below.
              </p>

              {/* UPPER BODY */}
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2.5">Upper Body</p>
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {BODY_AREAS_UPPER.map(renderAreaCard)}
              </div>

              {/* LOWER BODY */}
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2.5">Lower Body</p>
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {BODY_AREAS_LOWER.map(renderAreaCard)}
              </div>

              {/* Continue button for body zones */}
              {selectedBodyZones.length > 0 && (
                <div className="flex justify-center mb-6">
                  <Button
                    onClick={handleNext}
                    className="px-8 py-2.5 text-[15px] font-semibold rounded-xl"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* WHOLE-BODY & SYSTEMIC CONDITIONS */}
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2.5">Whole-Body & Systemic Conditions</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SYSTEMIC_CONDITIONS.map(cond => (
                  <button
                    key={cond.id}
                    onClick={() => {
                      setSelectedArea(cond.id);
                      setIsSystemicFlow(true);
                      setSystemicConditionKey(cond.conditionKey);
                      setSelected([cond.conditionKey]);
                      setTimeout(() => setStep(3), 200);
                    }}
                    className="flex items-start gap-3 p-3.5 rounded-2xl border border-border bg-card text-left hover:border-primary/30 transition-all duration-150"
                  >
                    <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-muted/50 text-muted-foreground">
                      {SYSTEMIC_ICONS[cond.lucideIcon]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight text-foreground">{cond.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{cond.desc}</p>
                    </div>
                  </button>
                ))}
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

        {/* ═══ STEP 2: Profile Summary ═══ */}
        {step === 2 && diagnosticResult && (() => {
          const areaLabel = (AREA_LABELS[diagnosticResult.area] || diagnosticResult.area).toLowerCase();
          return (
            <div className="w-full flex flex-col items-center text-center" style={{ marginTop: "80px", maxWidth: "600px" }}>
              <div className="w-14 h-14 rounded-full bg-secondary/15 flex items-center justify-center mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--secondary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <h1 className="font-display text-foreground font-bold mb-2" style={{ fontSize: "clamp(26px, 3vw, 32px)" }}>
                Your plan is ready
              </h1>
              <p className="text-accent font-semibold text-base mb-4" style={{ textTransform: "capitalize" }}>
                {areaLabel} discomfort detected
              </p>
              <p className="text-muted-foreground leading-relaxed max-w-[440px]" style={{ fontSize: "clamp(15px, 1.5vw, 17px)" }}>
                Based on your assessment, we've built a personalised practice for your {areaLabel}.
              </p>
            </div>
          );
        })()}

        {/* ═══ STEP 8: Movement assessment (physical area flows only) ═══ */}
        {step === 8 && !isSystemicFlow && (() => {
          const AREA_READABLE: Record<string, string> = {
            NECK: "neck", SHLDR: "shoulder", UBACK: "upper back", LB: "lower back",
            WRIST: "wrist and hand", HIP: "hip", KNEE: "knee", ANKLE: "ankle and foot",
          };
          const areaName = AREA_READABLE[selectedArea || ""] || "body";
          const MOVEMENT_OPTIONS = [
            { value: "no-pain", label: "No pain" },
            { value: "mild-discomfort", label: "Mild discomfort" },
            { value: "pain", label: "Pain" },
            { value: "very-sensitive", label: "Very sensitive" },
          ];
          return (
            <div className="w-full flex flex-col items-center" style={{ marginTop: "60px", maxWidth: "600px" }}>
              <h1 className="font-display text-foreground font-bold text-2xl text-center mb-8">
                How does your {areaName} feel during movement?
              </h1>
              <div className="w-full grid grid-cols-4 gap-0 rounded-xl overflow-hidden border-2 border-border">
                {MOVEMENT_OPTIONS.map((opt, idx) => {
                  const isSelected = movementResponse === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setMovementResponse(opt.value)}
                      className={`py-3.5 px-2 text-center text-sm font-semibold transition-all ${
                        isSelected
                          ? "bg-accent text-accent-foreground"
                          : "bg-card text-foreground hover:bg-accent/10"
                      } ${idx < 3 ? "border-r-2 border-border" : ""}`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ═══ STEP 3: Condition-specific clinical questions (systemic) ═══ */}
        {step === 3 && isSystemicFlow && (
          <div className="w-full text-left" style={{ marginTop: "24px", maxWidth: "560px" }}>

            {/* ── MENOPAUSE ── */}
            {systemicConditionKey === "menopause" && (
              <>
                
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
      {(step !== -1 && step !== 10 && step !== 1 && step !== 0 && step < 6 || step === 7 || step === 8) && (
        <div
          className="fixed bottom-0 inset-x-0 z-40 pointer-events-none bg-background"
          style={{ paddingBottom: "40px", paddingTop: "16px", boxShadow: "0 -2px 8px rgba(0,0,0,0.04)" }}
        >
          <div className="flex justify-between pointer-events-auto px-6 lg:px-[100px]">
            <Button variant="outline" onClick={handleBack} className="text-base h-[35px] rounded-full px-5">
              ← {step === 0 ? "Home" : "Back"}
            </Button>
            {step === 3 && isSystemicFlow ? (
              <Button
                variant="hero"
                onClick={handleNext}
                disabled={!canGoNext()}
                className="text-base h-[35px] rounded-full px-5"
              >
                Continue →
              </Button>
            ) : step === 3 && !isSystemicFlow ? (
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
                {step === 2 ? "Start your plan →" : "Next →"}
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
