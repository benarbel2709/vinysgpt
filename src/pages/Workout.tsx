import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import PhaseHeader from "@/components/PhaseHeader";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { createSession, buildSessionInput } from "@/engine/sessionService";
import type { PlayableExercise, PlayableSession } from "@/engine/sessionService";
import { MASTER_EXERCISES } from "@/data/masterExercises";
import { HELPED_MOST_LABELS } from "@/constants/conditions";
import type { HelpedMost } from "@/constants/conditions";
import type { Checkin as CheckinType } from "@/types";
import { useTTS } from "@/hooks/useTTS";
import { X, Play, Pause, Volume2, VolumeX, Loader2, ChevronLeft, ChevronDown, CheckCircle2, Settings2, RotateCcw, Smartphone, Camera } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import universalVideo from "@/assets/exercises/universal-fallback.mp4";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import ExerciseAnimationV8 from "@/components/animations/ExerciseAnimationV8";

/* ─── Slider field ─── */
function SliderField({ label, value, onChange, minLabel, maxLabel }: {
  label: string; value: number; onChange: (v: number) => void; minLabel?: string; maxLabel?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="text-xs font-bold text-white bg-white/15 rounded-full w-7 h-7 flex items-center justify-center">{value}</span>
      </div>
      <input type="range" min={0} max={10} value={value}
        onChange={(e) => onChange(Number(e.target.value))} className="checkin-range"
        aria-label={label} aria-valuemin={0} aria-valuemax={10} aria-valuenow={value} />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-[10px] text-white/50 -mt-0.5">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}

const HELPED_OPTIONS: HelpedMost[] = ["breath", "movement", "release"];

/* ─── Rotate prompt (portrait mobile only, once per session) ─── */
function RotatePrompt({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] bg-background flex items-center justify-center p-6">
      <div className="text-center">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
          <Smartphone size={32} className="text-accent rotate-90" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Rotate your phone</h2>
        <p className="text-sm text-muted-foreground max-w-[260px] mx-auto mt-2 leading-relaxed">
          Turn your phone sideways for the best practice experience — so you can see every movement clearly.
        </p>
        <button
          onClick={onDismiss}
          className="mt-8 w-full max-w-[220px] rounded-full py-3 px-6 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          I'm ready →
        </button>
        <button
          onClick={onDismiss}
          className="mt-3 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Continue in portrait
        </button>
      </div>
    </div>
  );
}

export default function Workout() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { state, updateState } = useApp();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  // ─── Generate V2 session on mount (or load solo exercise) ───
  const playableSession = useMemo<PlayableSession | null>(() => {
    // Check for solo exercise session from Exercise Library
    try {
      const soloRaw = localStorage.getItem("vinys_solo_session");
      if (soloRaw && sessionId?.startsWith("solo_")) {
        const solo = JSON.parse(soloRaw);
        if (solo.isSoloExercise && solo.exerciseIds?.[0]) {
          const master = MASTER_EXERCISES.find((m) => m.id === solo.exerciseIds[0]);
          if (master) {
            const playable: PlayableExercise = {
              id: master.id,
              name: master.title,
              phase: "main_build" as any,
              phaseLabel: "Practice",
              position: 0,
              durationSeconds: master.durationMin * 60,
              clinicalScore: 0,
              cautionFlag: false,
              cautionAreas: [],
              activeModification: "",
              wasSimplified: false,
              poseFamily: master.poseSet || "",
              movementCategory: master.category,
              videoId: null,
              clinicalRationale: master.why || "",
              userBenefit: "",
              exercise: {
                id: master.id,
                name: master.title,
                pose_family: master.poseSet || master.title,
                areas: [],
                movement_category: master.category === "breath" ? "Breath" : "Spinal Mobility",
                movement_direction: "Neutral Stability" as any,
                load_type: "passive",
                stability: "low" as any,
                complexity: 1 as any,
                goal_tag: [],
                var_rank: 1,
                duration: [master.durationMin * 60, master.durationMin * 60],
                simpler_alternative: null,
                profiles: {},
                clinical_rationale: master.why || "",
                user_benefit: "",
                video_id: null,
              },
            };
            localStorage.removeItem("vinys_solo_session");
            return {
              exercises: [playable],
              phases: [{ phase: "main_build" as any, label: "Practice", description: "Solo exercise", exercises: [playable] }],
              totalExercises: 1,
              totalDurationSeconds: master.durationMin * 60,
              durationMinutes: master.durationMin as any,
              peakCount: 0,
              cumulativeLoad: 0,
              loadCeiling: 100,
            };
          }
        }
      }
    } catch (e) {
      console.warn("[Workout] Solo session parse error:", e);
    }

    // Normal V2 session generation
    try {
      const input = buildSessionInput(state.profile as any);
      return createSession(input);
    } catch (err) {
      console.error("[Workout] Failed to generate V2 session:", err);
      return null;
    }
  }, []); // Only generate once on mount

  const isSoloSession = sessionId?.startsWith("solo_") ?? false;
  const exercises = playableSession?.exercises || [];
  const sessionDurationMinutes = playableSession?.durationMinutes || state.profile.minutesPerSession || 20;

  // Restore position from sessionStorage if available
  const savedPos = (() => {
    try {
      const v = sessionStorage.getItem("vinys_workout_position");
      return v ? parseInt(v, 10) : 0;
    } catch { return 0; }
  })();

  const [activeIdx, setActiveIdx] = useState(savedPos < exercises.length ? savedPos : 0);
  const [showPreview, setShowPreview] = useState(savedPos === 0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isPlaying, setIsPlaying] = useState(savedPos > 0);
  const [timerDone, setTimerDone] = useState(false);
  const [showClosing, setShowClosing] = useState(false);
  const [closingRemaining, setClosingRemaining] = useState(180);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [showRotatePrompt, setShowRotatePrompt] = useState(false);

  const { speak, stop: stopTTS, isPlaying: isTTSPlaying, isLoading: isTTSLoading, isMuted, setMuted } = useTTS();

  // End-of-practice state
  const [endStep, setEndStep] = useState<null | "choice" | "checkin" | "summary">(null);
  const isEnded = endStep !== null;

  // Checkin form state
  const [painBefore, setPainBefore] = useState(5);
  const [painAfter, setPainAfter] = useState(3);
  const [fatigueBefore, setFatigueBefore] = useState(5);
  const [fatigueAfter, setFatigueAfter] = useState(4);
  const [tooMuch, setTooMuch] = useState(false);
  const [helpedMost, setHelpedMost] = useState<HelpedMost>("breath");
  const [showMore, setShowMore] = useState(false);

  const [videoReady, setVideoReady] = useState(false);
  const [whyExpanded, setWhyExpanded] = useState(false);

  useEffect(() => { document.title = "Your Session — Vinys"; }, []);

  // Show rotate prompt on portrait mobile (once per session)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth < 768;
    const isPortrait = window.innerHeight > window.innerWidth;
    if (isMobile && isPortrait) {
      setShowRotatePrompt(true);
    }
  }, []);

  const perExerciseSeconds = useMemo(() => {
    if (exercises.length === 0) return 180;
    // Use each exercise's own duration from V2 data
    return null; // Signal to use per-exercise duration
  }, [exercises.length]);

  const activeExercise = exercises[activeIdx] || null;
  const exerciseDuration = activeExercise?.durationSeconds || 60;

  const [remaining, setRemaining] = useState(exerciseDuration);

  useEffect(() => {
    if (activeExercise) {
      setRemaining(activeExercise.durationSeconds);
      setTimerDone(false);
      setInstructionsOpen(false);
      setWhyOpen(false);
    }
  }, [activeIdx, activeExercise?.id]);

  useEffect(() => {
    if (!isPlaying || remaining <= 0) return;
    const timer = setInterval(() => {
      setRemaining((r) => { if (r <= 1) { setTimerDone(true); return 0; } return r - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, remaining]);

  // Closing step timer
  useEffect(() => {
    if (!showClosing || closingRemaining <= 0) return;
    const timer = setInterval(() => {
      setClosingRemaining((r) => { if (r <= 1) { return 0; } return r - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [showClosing, closingRemaining]);

  // Sync video play state
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying && !isEnded && !showPreview) { v.play().catch(() => {}); } else { v.pause(); }
  }, [isPlaying, isEnded, showPreview]);

  // TTS
  const speakExercise = useCallback((exercise: PlayableExercise) => {
    const text = `${exercise.name}. ${exercise.activeModification || ""}`;
    speak(text);
  }, [speak]);

  useEffect(() => {
    const ex = exercises[activeIdx];
    if (isMuted || !ex || isEnded) { stopTTS(); return; }
    speakExercise(ex);
    return () => { stopTTS(); };
  }, [activeIdx, isMuted, isEnded]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleVisibility = () => { if (document.hidden) stopTTS(); };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [stopTTS]);

  useEffect(() => { return () => { stopTTS(); }; }, [stopTTS]);

  const finishWorkout = async () => {
    stopTTS();
    try { sessionStorage.removeItem("vinys_workout_position"); } catch {}

    // V2 progression: increment session_count and check stage transitions
    const prevCount = state.session_count ?? 0;
    const newCount = prevCount + 1;
    const prevStage = state.stage ?? 1;
    let newStage = prevStage;
    let justAdvanced = false;

    if (prevStage === 1 && newCount >= 5) {
      newStage = 2;
      justAdvanced = true;
    } else if (prevStage === 2 && newCount >= 12) {
      newStage = 3;
      justAdvanced = true;
    }

    updateState({
      session_count: newCount,
      stage: newStage,
      ...(justAdvanced ? { justAdvancedStage: true } : {}),
    });

    trackEvent("session_completed", { mode: "v2", exercises: exercises.length, duration: sessionDurationMinutes });

    if (user) {
      const now = new Date();
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1;
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
      const weekStart = monday.toISOString().slice(0, 10);
      const { data } = await supabase
        .from("weekly_progress")
        .select("completed_count")
        .eq("user_id", user.id)
        .eq("week_start_date", weekStart)
        .maybeSingle();
      if (data) {
        await supabase.from("weekly_progress").update({ completed_count: data.completed_count + 1 }).eq("user_id", user.id).eq("week_start_date", weekStart);
      } else {
        await supabase.from("weekly_progress").insert({ user_id: user.id, week_start_date: weekStart, completed_count: 1, target_count: 3 });
      }
    }

    setIsPlaying(false);
    setEndStep("choice");
  };

  const closingPref = state.profile.closingPreference || "savasana";
  const CLOSING_NAMES: Record<string, string> = { savasana: "Savasana", body_rest: "Body Rest & Integration", meditation: "Guided Meditation" };
  const CLOSING_INSTRUCTIONS: Record<string, string> = {
    savasana: "Lie on your back with arms at your sides, palms facing up. Close your eyes. Let your body sink into the ground. Breathe naturally and release all effort.",
    body_rest: "Lie comfortably and bring your attention to each part of your body, starting from your feet. Notice any sensations without trying to change them. Let each area soften.",
    meditation: "Sit or lie in a comfortable position. Close your eyes and bring your attention to your breath. When your mind wanders, gently return to the breath.",
  };

  const isLastExercise = activeIdx === exercises.length - 1;

  const goNext = () => {
    if (isLastExercise) {
      stopTTS();
      setShowClosing(true);
      setClosingRemaining(180);
      if (!isMuted) {
        speak(`${CLOSING_NAMES[closingPref]}. ${CLOSING_INSTRUCTIONS[closingPref]}`);
      }
      return;
    }
    const nextIdx = activeIdx + 1;
    setActiveIdx(nextIdx);
    try { sessionStorage.setItem("vinys_workout_position", String(nextIdx)); } catch {}
    setIsPlaying(true);
  };

  const togglePlay = () => setIsPlaying(p => !p);

  const handleCheckinSave = async () => {
    const checkin: CheckinType = {
      id: `checkin_${Date.now()}`, sessionId: sessionId || `v2_${Date.now()}`, createdAt: new Date().toISOString(),
      painBefore, painAfter, fatigueBefore, fatigueAfter, tooMuch, helpedMost,
    };
    updateState({ checkins: [...state.checkins, checkin] });

    if (user) {
      await supabase.from("user_checkins").insert({
        user_id: user.id, source: "end_of_practice",
        pain_before: painBefore, pain_after: painAfter,
        fatigue_before: fatigueBefore, fatigue_after: fatigueAfter,
      });
    }

    trackEvent("checkin_completed", { sessionId: sessionId || "v2_ondemand" });
    toast({ title: "Saved — we'll adapt your next session.", duration: 2000 });
    setEndStep("summary");
  };

  const exitWorkout = () => {
    if (!showPreview && !isEnded) {
      setShowExitConfirm(true);
      return;
    }
    stopTTS();
    try { sessionStorage.removeItem("vinys_workout_position"); } catch {}
    navigate("/plan");
  };

  const confirmExit = () => {
    stopTTS();
    try { sessionStorage.removeItem("vinys_workout_position"); } catch {}
    setShowExitConfirm(false);
    navigate("/plan");
  };

  // No session generated
  if (!playableSession || exercises.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-white/60 mb-4">Could not generate a session. Please complete the diagnostic first.</p>
          <button onClick={() => navigate("/plan")} className="rounded-full px-6 py-3 bg-white/20 text-white font-medium">Back to plan</button>
        </div>
      </div>
    );
  }

  // Show rotate prompt
  if (showRotatePrompt) {
    return <RotatePrompt onDismiss={() => setShowRotatePrompt(false)} />;
  }

  const displayMinutes = Math.floor(remaining / 60);
  const displaySeconds = remaining % 60;
  const exerciseTitle = activeExercise?.name || "";
  const exerciseCue = activeExercise?.activeModification || "";
  const safetyNote = activeExercise?.cautionFlag
    ? `Caution: ${activeExercise.cautionAreas.join(", ")}. ${activeExercise.activeModification}`
    : "";
  const whyText = activeExercise?.userBenefit || activeExercise?.clinicalRationale || "";
  const equipmentList: string[] = [];
  // Look up instructions from master exercises catalog
  const masterForActive = activeExercise ? MASTER_EXERCISES.find(m => m.id === activeExercise.id) : null;
  const activeInstructions = masterForActive?.instructions || [];
  const activeModificationNote = activeExercise?.activeModification || "";

  const [whyExpanded, setWhyExpanded] = useState(false);

  // Reset why-expanded when exercise changes
  useEffect(() => { setWhyExpanded(false); }, [activeIdx]);

  return (
    <>
      {/* ===== MAIN PLAYER LAYOUT — full-screen video with overlays ===== */}
      <div className="fixed inset-0 bg-black z-50">

        {/* Full-screen video */}
        <video
          ref={videoRef}
          src={universalVideo}
          autoPlay loop muted playsInline
          preload="auto"
          onCanPlay={() => setVideoReady(true)}
          onError={(e) => {
            const t = e.target as HTMLVideoElement;
            if (!t.src.includes('universal-fallback')) {
              t.src = universalVideo;
            }
          }}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* SVG pose fallback + spinner while video loads */}
        {!videoReady && activeExercise && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-[1]">
            <div className="w-[60%] max-w-[280px]">
              <ExerciseAnimationV8
                exercise={{
                  id: activeExercise.id,
                  name_he: activeExercise.name,
                  category: activeExercise.movementCategory?.toLowerCase().includes("breath") ? "breath"
                    : activeExercise.movementCategory?.toLowerCase().includes("release") ? "release"
                    : activeExercise.movementCategory?.toLowerCase().includes("stabil") ? "stability"
                    : "mobility",
                } as any}
                large
              />
            </div>
            <div className="absolute bottom-3 right-3">
              <Loader2 size={20} className="animate-spin text-white/60" />
            </div>
          </div>
        )}

        {/* ── All overlays on top of the video ── */}
        {!isEnded && !showClosing && (
          <>
            {/* Top overlay: back, progress dots, timer, TTS */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2 md:px-5 md:py-3"
              style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)", height: 80 }}>
              <button onClick={exitWorkout} className="flex items-center gap-0.5 text-white text-sm hover:text-white/80 transition-colors" aria-label="Back to plan">
                <ChevronLeft size={18} />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="flex gap-1.5 items-center">
                {exercises.map((_, i) => (
                  <div key={i} className={`h-2 rounded-full transition-all duration-300 ${
                    i === activeIdx ? "w-6 bg-white" : i < activeIdx ? "w-2 bg-white/60" : "w-2 bg-white/25"
                  }`} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className={`rounded-full px-3 py-1 bg-white/20 backdrop-blur-md ${timerDone ? "animate-pulse ring-1 ring-white/40" : ""}`}>
                  <span className="text-white font-mono text-sm">
                    {String(displayMinutes).padStart(2, "0")}:{String(displaySeconds).padStart(2, "0")}
                  </span>
                </div>
                <button onClick={() => setMuted(!isMuted)} disabled={isTTSLoading}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Toggle sound">
                  {isTTSLoading ? <Loader2 size={16} className="animate-spin" /> : isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              </div>
            </div>

            {/* Bottom overlay: exercise name, why-this, pause & next */}
            <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-5"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.35) 60%, transparent 100%)" }}>
              {/* Exercise info */}
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-0.5">{activeExercise?.phaseLabel}</p>
              <p className="text-white font-semibold text-lg leading-tight">{exerciseTitle}</p>
              {exerciseCue && (
                <p className="text-white/70 text-sm mt-1">{exerciseCue}</p>
              )}

              {/* Safety note */}
              {safetyNote && (
                <div className="border-l-2 border-amber-400 bg-amber-950/40 px-3 py-1.5 rounded-r-lg mt-2 max-w-md">
                  <p className="text-xs text-amber-200/90">{safetyNote}</p>
                </div>
              )}

              {/* Why this exercise — expandable inline */}
              {whyText && (
                <div className="mt-2 max-w-md">
                  <button
                    onClick={() => setWhyExpanded(v => !v)}
                    className="text-white/60 text-sm hover:text-white/80 transition-colors flex items-center gap-1"
                  >
                    Why this exercise
                    <ChevronDown size={14} className={`transition-transform duration-200 ${whyExpanded ? "rotate-180" : ""}`} />
                  </button>
                  {whyExpanded && (
                    <p className="text-white/50 text-sm leading-relaxed mt-1 max-w-sm">{whyText}</p>
                  )}
                </div>
              )}

              {/* Solo mode info */}
              {isSoloSession && (
                <div className="rounded-lg bg-white/10 backdrop-blur-md px-3 py-2 mt-3 max-w-md">
                  <p className="text-white/70 text-[11px] leading-relaxed">
                    Solo mode — not filtered against your profile.{" "}
                    <button onClick={() => navigate("/plan")} className="underline text-white/90 hover:text-white">Return to Plan</button>
                  </p>
                </div>
              )}

              {/* Pause + Next buttons */}
              <div className="flex items-center justify-center gap-3 mt-4">
                <button onClick={togglePlay}
                  className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  aria-label={isPlaying ? "Pause" : "Play"}>
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button onClick={goNext}
                  className="absolute right-4 bottom-5 rounded-full px-5 py-2.5 bg-white text-black font-medium hover:bg-white/90 transition-colors text-sm">
                  {isLastExercise ? "Finish →" : "Next →"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ===== CLOSING STEP OVERLAY ===== */}
      {showClosing && !isEnded && (
        <div className="fixed inset-0 z-[55]">
          <div className="absolute inset-0 backdrop-blur-xl bg-black/60" />
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center max-w-md w-full">
              <div className="flex gap-1.5 justify-center mb-8">
                {exercises.map((_, i) => (
                  <div key={i} className="h-2 w-2.5 rounded-full bg-white/50" />
                ))}
                <div className="h-2 w-8 rounded-full bg-white" />
              </div>
              <p className="text-white/50 text-sm font-medium uppercase tracking-wider mb-2">Session Closing</p>
              <h1 className="text-white text-3xl md:text-4xl font-semibold mb-3">{CLOSING_NAMES[closingPref]}</h1>
              <p className="text-white/60 text-sm max-w-sm mx-auto mb-8 leading-relaxed">{CLOSING_INSTRUCTIONS[closingPref]}</p>
              <div className={`inline-flex rounded-full px-6 py-3 bg-white/20 backdrop-blur-md mb-8 ${closingRemaining === 0 ? "animate-pulse ring-2 ring-white/40" : ""}`}>
                <span className="text-white font-mono font-semibold text-2xl">
                  {String(Math.floor(closingRemaining / 60)).padStart(2, "0")}:{String(closingRemaining % 60).padStart(2, "0")}
                </span>
              </div>
              <div className="space-y-3">
                <button onClick={() => { stopTTS(); setShowClosing(false); finishWorkout(); }}
                  className="w-full max-w-xs mx-auto rounded-full py-3.5 px-6 bg-white text-black font-medium hover:bg-white/90 transition-colors text-base block">
                  Complete ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== SESSION PREVIEW OVERLAY ===== */}
      {showPreview && !isEnded && (
        <div className="fixed inset-0 z-[55]">
          <div className="absolute inset-0 backdrop-blur-xl bg-black/60" />
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center max-w-md w-full">
              <p className="text-white/50 text-sm font-medium uppercase tracking-wider mb-2">Session Preview</p>
              <h1 className="text-white text-3xl md:text-4xl font-semibold mb-2">
                Your Practice
              </h1>
              <p className="text-white/60 text-sm mb-6">{exercises.length} exercises · {sessionDurationMinutes} min</p>
              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md p-4 mb-8 max-h-[40vh] overflow-y-auto text-left">
                {(playableSession?.phases || []).map((block) => (
                  <div key={block.phase}>
                    <PhaseHeader
                      phaseName={block.label}
                      description={block.description}
                      poseCount={block.exercises.length}
                    />
                    {block.exercises.map((ex, i) => (
                      <div key={ex.id} className={`relative flex items-start gap-3 py-2.5 px-3 ${i < block.exercises.length - 1 ? "border-b border-white/10" : ""}`}>
                        {!ex.videoId && (
                          <div className="shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center" style={{ backgroundColor: "#0D9488" }}>
                            <Camera size={16} className="text-white" />
                            <span className="text-white text-[7px] font-medium mt-0.5 leading-none">Coming soon</span>
                          </div>
                        )}
                        <span className="text-white/30 text-xs font-mono w-5 text-right shrink-0 mt-1">{ex.position}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-white/90 text-sm font-medium block truncate">{ex.name}</span>
                          {ex.wasSimplified && (
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: "rgba(13,148,136,0.15)", color: "#0D9488" }}>
                              Simplified for you
                            </span>
                          )}
                        </div>
                        {ex.activeModification && (
                          <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold text-white leading-tight max-w-[140px] truncate" style={{ backgroundColor: "#F59E0B" }}>
                            {ex.activeModification}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <button onClick={() => { setShowPreview(false); setIsPlaying(true); }}
                className="w-full max-w-xs rounded-full py-3.5 px-6 bg-white text-black font-medium hover:bg-white/90 transition-colors text-base">
                Begin practice →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== COMPLETION OVERLAY (choice) ===== */}
      {endStep === "choice" && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 backdrop-blur-xl bg-black/25" />
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center max-w-md w-full">
              <h1 className="text-white text-4xl md:text-5xl font-semibold leading-tight">Practice<br />complete!</h1>
              <p className="text-white/70 text-sm mt-4">Tell us how you felt — it helps us adapt your next practice session.</p>
              <div className="mt-8 space-y-3">
                <button onClick={() => setEndStep("checkin")} className="w-full rounded-full py-3.5 px-6 bg-white text-black font-medium hover:bg-white/90 transition-colors text-base">Quick check-in</button>
                <button onClick={() => setEndStep("summary")} className="w-full rounded-full py-3.5 px-6 bg-white/20 text-white font-medium border border-white/20 backdrop-blur-md hover:bg-white/25 transition-colors text-base">Finish practice</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CHECKIN OVERLAY ===== */}
      {endStep === "checkin" && (
        <div className="fixed inset-0 z-[65]">
          <div className="absolute inset-0 backdrop-blur-xl bg-black/35" />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-[min(92vw,680px)] max-h-[78vh] rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl overflow-hidden flex flex-col text-white">
              <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <div>
                  <h3 className="text-xl font-semibold text-white">Quick Check-In</h3>
                  <p className="text-white/60 text-sm mt-1">Helps adapt your next session.</p>
                </div>
                <button onClick={() => setEndStep("choice")} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors text-white flex-shrink-0">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-4">
                <div className="space-y-4">
                  <SliderField label="Pain before" value={painBefore} onChange={setPainBefore} minLabel="None" maxLabel="Severe" />
                  <SliderField label="Pain after" value={painAfter} onChange={setPainAfter} minLabel="None" maxLabel="Severe" />
                  <SliderField label="Fatigue before" value={fatigueBefore} onChange={setFatigueBefore} minLabel="None" maxLabel="Severe" />
                  <SliderField label="Fatigue after" value={fatigueAfter} onChange={setFatigueAfter} minLabel="None" maxLabel="Severe" />
                </div>
                {!showMore && (
                  <button onClick={() => setShowMore(true)} className="mt-4 text-sm text-white/60 hover:text-white/80 underline underline-offset-2 transition-colors">More options</button>
                )}
                {showMore && (
                  <div className="mt-4 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div onClick={() => setTooMuch(!tooMuch)}
                        className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${tooMuch ? "bg-destructive" : "bg-white/20"}`}>
                        <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all ${tooMuch ? "right-0.5" : "right-[calc(100%-1.625rem)]"}`} />
                      </div>
                      <span className="text-sm font-medium text-white">Was it too much?</span>
                    </label>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-white">What helped most?</span>
                      <div className="flex gap-2">
                        {HELPED_OPTIONS.map((opt) => (
                          <button key={opt} onClick={() => setHelpedMost(opt)}
                            className={`flex-1 text-xs py-2 rounded-full border font-medium transition-all ${
                              helpedMost === opt ? "border-white bg-white/20 text-white" : "border-white/20 bg-white/5 text-white/60 hover:border-white/40"
                            }`}>
                            {HELPED_MOST_LABELS[opt]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-white/10">
                <button onClick={handleCheckinSave} className="w-full rounded-full py-3 bg-white text-black font-medium hover:bg-white/90 transition-colors">Save & continue</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== SUMMARY OVERLAY ===== */}
      {endStep === "summary" && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 backdrop-blur-xl bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center max-w-[560px] w-full">
              <div className="mx-auto w-16 h-16 rounded-full border border-white/30 bg-white/5 backdrop-blur-sm flex items-center justify-center mb-8">
                <CheckCircle2 size={28} className="text-white opacity-90" />
              </div>
              <h1 className="text-white text-3xl md:text-4xl font-semibold leading-tight">Practice complete.</h1>
              <p className="text-white/60 text-sm mt-3 max-w-sm mx-auto">Consistency builds change. Your next session will continue from here.</p>
              <div className="mt-8 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md overflow-hidden">
                <div className="grid grid-cols-3 divide-x divide-white/10">
                  <div className="py-5 px-3">
                    <p className="text-white text-2xl font-bold">{exercises.length}</p>
                    <p className="text-white/50 text-xs mt-1">Exercises</p>
                  </div>
                  <div className="py-5 px-3">
                    <p className="text-white text-2xl font-bold">{sessionDurationMinutes}</p>
                    <p className="text-white/50 text-xs mt-1">Duration (min)</p>
                  </div>
                  <div className="py-5 px-3">
                    <p className="text-white text-2xl font-bold">{state.checkins.length}</p>
                    <p className="text-white/50 text-xs mt-1">Total check-ins</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 space-y-3">
                <button onClick={exitWorkout} className="w-full rounded-full py-3.5 px-6 bg-white text-black font-medium hover:bg-white/90 transition-colors text-base">Return to my plan →</button>
                <button onClick={async () => {
                  const shareText = `I just completed a Vinys adaptive yoga session. ${sessionDurationMinutes} min · vinys.app`;
                  const shareData = { title: "I just completed a Vinys session", text: shareText, url: "https://vinys.app" };
                  try {
                    if (navigator.share) { await navigator.share(shareData); }
                    else { await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`); toast({ title: "Copied!", description: "Link copied to clipboard" }); }
                  } catch { /* user cancelled */ }
                }} className="text-white/40 text-sm hover:text-white/60 transition-colors flex items-center gap-1.5 mx-auto">
                  Share your progress →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== ADJUST BOTTOM SHEET ===== */}
      {adjustOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={() => setAdjustOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-lg bg-white/10 backdrop-blur-xl border-t border-white/15 rounded-t-[20px] p-5 space-y-3"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[15px] font-bold text-white">Adjust session</p>
              <button onClick={() => setAdjustOpen(false)} className="p-2 rounded-full hover:bg-white/15">
                <X size={18} className="text-white/70" />
              </button>
            </div>
            <button onClick={() => { setAdjustOpen(false); finishWorkout(); }}
              className="w-full rounded-2xl px-5 py-3 text-sm text-white/50 hover:text-red-400 transition-colors font-medium text-left">
              <span className="block">Finish practice early</span>
              <span className="block text-xs text-white/30 mt-0.5">End the session now and log your progress</span>
            </button>
          </div>
        </div>
      )}
      {/* Exit confirmation dialog */}
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent className="bg-black/95 border-white/10 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">End this session?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Your current session progress won't be saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 border-0">
              Continue session
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit} className="rounded-full bg-white/10 text-white hover:bg-white/20 border-0">
              End session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ─── Below-Video Panel (shared mobile + desktop) ─── */
function BelowVideoPanel({
  goNext, isLastExercise, safetyNote, instructions, whyText, equipmentList,
  modificationNote, repsText, rangeText, instructionsOpen, setInstructionsOpen, whyOpen, setWhyOpen,
}: {
  goNext: () => void; isLastExercise: boolean; safetyNote: string;
  instructions: string[]; whyText: string; equipmentList: string[];
  modificationNote?: string;
  repsText: string; rangeText: string;
  instructionsOpen: boolean; setInstructionsOpen: (v: boolean) => void;
  whyOpen: boolean; setWhyOpen: (v: boolean) => void;
}) {
  return (
    <div className="px-4 pt-4 pb-24 lg:pb-4 space-y-3">
      {/* Next / Finish button */}
      <button onClick={goNext}
        className="w-full rounded-full py-3.5 bg-white text-black font-medium hover:bg-white/90 transition-colors text-base">
        {isLastExercise ? "Finish session →" : "Next exercise →"}
      </button>

      {/* Safety note */}
      {safetyNote && (
        <div className="border-l-2 border-amber-400 bg-amber-950/30 px-3 py-2 rounded-r-lg">
          <p className="text-xs text-amber-200/90">{safetyNote}</p>
        </div>
      )}

      {/* Instructions — shown directly (not collapsed) */}
      {instructions.length > 0 && (
        <div className="pt-2">
          <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2">Instructions</p>
          <ol className="space-y-2.5 pb-2">
            {instructions.map((step, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/60">{i + 1}</span>
                <span className="text-white/70 text-sm leading-relaxed">{step}</span>
              </li>
            ))}
            {(repsText || rangeText) && (
              <li className="flex gap-2 flex-wrap mt-2">
                {repsText && <span className="text-xs bg-white/10 text-white/60 rounded-full px-3 py-1">{repsText}</span>}
                {rangeText && <span className="text-xs bg-white/10 text-white/60 rounded-full px-3 py-1">{rangeText}</span>}
              </li>
            )}
          </ol>
          {modificationNote && (
            <div className="border-l-2 border-teal-400 bg-teal-950/30 px-3 py-2 rounded-r-lg mt-2">
              <p className="text-[10px] text-teal-300/70 font-medium uppercase tracking-wider mb-0.5">Modification for your profile</p>
              <p className="text-xs text-teal-200/90">{modificationNote}</p>
            </div>
          )}
        </div>
      )}

      {/* Why this exercise collapsible */}
      {whyText && (
        <Collapsible open={whyOpen} onOpenChange={setWhyOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-white/80 hover:text-white transition-colors text-sm font-medium border-t border-white/10">
            <span>Why this exercise</span>
            <ChevronDown size={16} className={`transition-transform duration-200 ${whyOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className="text-white/60 text-sm leading-relaxed pb-2">{whyText}</p>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Equipment chips */}
      {equipmentList.length > 0 && (
        <div className="flex gap-2 flex-wrap pt-1">
          {equipmentList.map((item) => (
            <span key={item} className="text-xs bg-white/10 text-white/60 rounded-full px-3 py-1.5">{item}</span>
          ))}
        </div>
      )}
    </div>
  );
}
