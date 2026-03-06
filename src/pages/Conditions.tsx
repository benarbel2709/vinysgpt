import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import type { ConditionKey, EnergyLevel } from "@/constants/conditions";
import { EQUIPMENT_OPTIONS } from "@/constants/conditions";
import { RED_FLAGS, type GenericAssessmentData, type Assessment } from "@/types";
import { generatePlan } from "@/lib/planGenerator";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import FlowProgress from "@/components/FlowProgress";
import ChipCloudSelector from "@/components/onboarding/ChipCloudSelector";
import EnergyFlareSelector from "@/components/onboarding/EnergyFlareSelector";
import BodyMapSelector from "@/components/onboarding/BodyMapSelector";
import { Check } from "lucide-react";

const SESSIONS_OPTIONS = [1, 2, 3, 4, 5];
const MINUTES_OPTIONS = [10, 15, 20, 30, 45];
const EQUIP_LABELS = EQUIPMENT_OPTIONS.map(e => e.label);

const PAIN_CONDITIONS: ConditionKey[] = [
  "back_pain", "neck_pain", "shoulder_pain", "knee_pain", "hip_pain",
];

const STEP_TITLES = [
  "Your conditions",
  "Where does it hurt?",
  "How are you feeling?",
  "Your practice schedule",
  "Available equipment",
  "Safety check",
];

export default function Conditions() {
  const { state, updateProfile, updateState } = useApp();
  const navigate = useNavigate();
  const profile = state.profile;

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<ConditionKey[]>([]);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>("medium");
  const [flareToday, setFlareToday] = useState(false);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(profile.sessionsPerWeek || 3);
  const [minutesPerSession, setMinutesPerSession] = useState(profile.minutesPerSession || 20);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [redFlags, setRedFlags] = useState<string[]>([]);

  const toggle = (condition: ConditionKey) => {
    setSelected(prev =>
      prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]
    );
  };

  const toggleEquip = (opt: string) => {
    setEquipment(prev => prev.includes(opt) ? prev.filter(s => s !== opt) : [...prev, opt]);
  };

  const handleBuild = () => {
    if (redFlags.length > 0) { navigate("/stop"); return; }

    const updatedProfile = {
      ...profile,
      conditions: selected,
      energyLevel,
      flareToday,
      sessionsPerWeek,
      minutesPerSession,
    };

    updateState({ disclaimerAccepted: true });

    updateProfile({
      conditions: selected,
      energyLevel,
      flareToday,
      sessionsPerWeek,
      minutesPerSession,
    });

    const assessmentId = `assessment_${Date.now()}`;
    const data: GenericAssessmentData = {
      mainIssue: selected.join(", "),
      pain: 5,
      limits: "",
      equipment,
      redFlags,
    };
    const assessment: Assessment = {
      id: assessmentId,
      createdAt: new Date().toISOString(),
      type: "generic",
      data,
    };

    const plan = generatePlan(
      updatedProfile,
      assessmentId,
      undefined,
      state.exerciseLibrary,
      { pain: 5, fatigue: 5, sleep: 5, flareNow: flareToday ? "yes" : "no" },
    );

    updateState({
      assessments: [...state.assessments, assessment],
      currentPlan: plan,
    });

    trackEvent("plan_generated", { condition: selected[0], duration: plan.sessions[0]?.durationMinutes });
    navigate("/plan");
  };

  const hasPainCondition = selected.some(c => PAIN_CONDITIONS.includes(c));

  const canGoNext = () => {
    if (step === 0) return selected.length > 0;
    return true;
  };

  const handleNext = () => {
    let nextStep = step + 1;
    // Skip body map step if no pain conditions selected
    if (step === 0 && !hasPainCondition) nextStep = 2;
    if (nextStep <= 5) {
      setStep(nextStep);
      window.scrollTo({ top: 0, behavior: "instant" });
    } else {
      handleBuild();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      let prevStep = step - 1;
      // Skip body map step going back if no pain conditions
      if (prevStep === 1 && !hasPainCondition) prevStep = 0;
      setStep(prevStep);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  return (
    <Layout hideFooter>
      <div className="mb-4">
        <FlowProgress current={step + 1} total={6} />
      </div>

      <div className="space-y-6 pb-40 max-w-lg mx-auto">
        <div className="text-center">
          <h1 className="text-foreground font-bold">{STEP_TITLES[step]}</h1>
        </div>

        {/* Step 1: Conditions */}
        {step === 0 && (
          <ChipCloudSelector selected={selected} onToggle={toggle} />
        )}

        {/* Step 2: Body Map (only if pain condition selected) */}
        {step === 1 && (
          <BodyMapSelector
            selected={selected}
            onToggle={toggle}
            onClear={() => setSelected(prev => prev.filter(c => !PAIN_CONDITIONS.includes(c)))}
          />
        )}

        {/* Step 3: Energy & Flare */}
        {step === 2 && (
          <EnergyFlareSelector
            energyLevel={energyLevel}
            onEnergyChange={setEnergyLevel}
            flareToday={flareToday}
            onFlareChange={setFlareToday}
          />
        )}

        {/* Step 4: Schedule */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-foreground font-bold text-center text-lg">Sessions per week</h2>
              <div className="flex gap-2">
                {SESSIONS_OPTIONS.map((n) => (
                  <button key={n} onClick={() => setSessionsPerWeek(n)}
                    className={`flex-1 py-3 rounded-[8px] border-2 text-base font-bold transition-all ${
                      sessionsPerWeek === n
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-card text-foreground hover:border-accent/40"
                    }`}>{n}</button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-foreground font-bold text-center text-lg">Minutes per session</h2>
              <div className="flex gap-2">
                {MINUTES_OPTIONS.map((n) => (
                  <button key={n} onClick={() => setMinutesPerSession(n)}
                    className={`flex-1 py-3 rounded-[8px] border-2 text-base font-bold transition-all ${
                      minutesPerSession === n
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-card text-foreground hover:border-accent/40"
                    }`}>{n}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Equipment */}
        {step === 4 && (
          <div className="flex flex-wrap gap-2.5 justify-center">
            {EQUIP_LABELS.map((opt) => (
              <button key={opt} onClick={() => toggleEquip(opt)}
                className={`text-sm px-4 py-2 rounded-[8px] border-2 font-semibold transition-all ${
                  equipment.includes(opt)
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-card text-foreground hover:border-accent/40"
                }`}>{opt}</button>
            ))}
          </div>
        )}

        {/* Step 6: Safety */}
        {step === 5 && (
          <div className="space-y-3">
            {RED_FLAGS.map((flag) => {
              const isChecked = redFlags.includes(flag);
              return (
                <label
                  key={flag}
                  className={`flex items-center gap-3 cursor-pointer p-4 rounded-[12px] border-2 transition-all ${
                    isChecked
                      ? "border-accent bg-accent/10"
                      : "border-border bg-card"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isChecked
                      ? "border-accent bg-accent"
                      : "border-border bg-card"
                  }`}>
                    {isChecked && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => setRedFlags(prev => prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag])}
                    className="sr-only"
                  />
                  <span className="text-[15px] font-medium text-foreground">{flag}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky back/next buttons — stacked on mobile, side-by-side on desktop */}
      <div className="fixed bottom-0 inset-x-0 p-4 pb-6 z-40">
        <div className="max-w-lg mx-auto flex flex-col sm:flex-row-reverse sm:justify-between gap-2">
          <Button
            variant="hero"
            onClick={handleNext}
            disabled={!canGoNext()}
            className="w-full sm:w-auto text-base h-[48px]"
          >
            {step === 5 ? "Let's Start!" : "Next →"}
          </Button>
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 0}
            className="w-full sm:w-auto text-base h-[48px]"
          >
            Back
          </Button>
        </div>
      </div>
    </Layout>
  );
}
