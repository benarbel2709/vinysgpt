import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { selectExercisesForConditions, adaptNextSession } from "@/lib/planGenerator";
import { MASTER_LOOKUP } from "@/data/exerciseAdapter";
import { HELPED_MOST_LABELS } from "@/constants/conditions";
import type { HelpedMost } from "@/constants/conditions";
import type { Checkin as CheckinType } from "@/types";
import { useTTS } from "@/hooks/useTTS";
import BrandLogo from "@/components/BrandLogo";
import { X, Play, Pause, Volume2, VolumeX, Loader2, Info, Settings2, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import universalVideo from "@/assets/exercises/universal-fallback.mp4";

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

export default function Workout() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { state, updateState } = useApp();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const plan = state.currentPlan;
  const session = plan?.sessions.find((s) => s.id === sessionId);

  const [activeIdx, setActiveIdx] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [currentMode, setCurrentMode] = useState(session?.mode || "normal");
  const [currentExerciseIds, setCurrentExerciseIds] = useState(session?.exerciseIds || []);

  const { speak, stop: stopTTS, isPlaying: isTTSPlaying, isLoading: isTTSLoading, isMuted, setMuted } = useTTS();

  // End-of-practice state: null | "choice" | "checkin" | "summary"
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

  const exercises = currentExerciseIds
    .map((id) => state.exerciseLibrary.find((ex) => ex.id === id))
    .filter(Boolean) as typeof state.exerciseLibrary;

  const perExerciseMinutes = exercises.length > 0
    ? Math.round((session?.durationMinutes || 30) / exercises.length) : 3;

  const [remaining, setRemaining] = useState(perExerciseMinutes * 60);

  useEffect(() => { setRemaining(perExerciseMinutes * 60); setTimerDone(false); }, [activeIdx, perExerciseMinutes]);

  useEffect(() => {
    if (!isPlaying || remaining <= 0) return;
    const timer = setInterval(() => {
      setRemaining((r) => { if (r <= 1) { setTimerDone(true); return 0; } return r - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, remaining]);

  // Sync video play state
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying && !isEnded && !showPreview) { v.play().catch(() => {}); } else { v.pause(); }
  }, [isPlaying, activeIdx, isEnded, showPreview]);

  // ── TTS: speak current exercise (single source of truth) ──
  const speakExercise = useCallback((exercise: typeof state.exerciseLibrary[0]) => {
    const m = MASTER_LOOKUP[exercise.id];
    const instructions = m?.instructions || exercise.steps_he;
    const text = `${m?.title || exercise.name_he}. ${instructions.join(". ")}`;
    speak(text);
  }, [speak]);

  useEffect(() => {
    const ex = exercises[activeIdx];
    if (isMuted || !ex || isEnded) {
      stopTTS();
      return;
    }
    speakExercise(ex);
    return () => { stopTTS(); };
  }, [activeIdx, isMuted, isEnded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Safety: stop audio on tab hidden ──
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) stopTTS();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [stopTTS]);

  // ── Safety: stop audio on unmount ──
  useEffect(() => {
    return () => { stopTTS(); };
  }, [stopTTS]);

  const switchMode = useCallback((mode: "easier" | "flare") => {
    stopTTS();
    setCurrentMode(mode);
    const newIds = selectExercisesForConditions(state.exerciseLibrary, state.profile.conditions, mode, session?.durationMinutes || 30);
    setCurrentExerciseIds(newIds);
    setActiveIdx(0);
    setAdjustOpen(false);
    toast({ title: mode === "easier" ? "Switched to easier variation." : "Flare mode — gentler exercises loaded.", duration: 2500 });
  }, [session?.durationMinutes, state.exerciseLibrary, state.profile.conditions, stopTTS]);

  const finishWorkout = async () => {
    if (!plan || !session) return;
    stopTTS();
    const updatedSessions = plan.sessions.map((s) =>
      s.id === session.id ? { ...s, status: "done" as const, mode: currentMode, exerciseIds: currentExerciseIds } : s
    );
    updateState({
      currentPlan: { ...plan, sessions: updatedSessions },
      progress: { lastSessionId: session.id },
    });
    trackEvent("session_completed", { sessionId: session.id, mode: currentMode, exercises: exercises.length });

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
        await supabase.from("weekly_progress").insert({ user_id: user.id, week_start_date: weekStart, completed_count: 1, target_count: state.profile.sessionsPerWeek });
      }
    }

    setIsPlaying(false);
    setEndStep("choice");
  };

  const goNext = () => {
    if (isLastExercise) { finishWorkout(); return; }
    setActiveIdx(prev => prev + 1);
    setIsPlaying(true);
  };

  const goPrev = () => {
    if (activeIdx > 0) {
      setActiveIdx(prev => prev - 1);
      setIsPlaying(true);
    }
  };

  const openInfo = () => { setIsInfoOpen(true); setIsPlaying(false); };
  const closeInfo = () => { setIsInfoOpen(false); };
  const togglePlay = () => setIsPlaying(p => !p);

  const handleCheckinSave = async () => {
    if (!sessionId || !session) return;
    const checkin: CheckinType = {
      id: `checkin_${Date.now()}`, sessionId, createdAt: new Date().toISOString(),
      painBefore, painAfter, fatigueBefore, fatigueAfter, tooMuch, helpedMost,
    };
    let updatedPlan = state.currentPlan;
    if (updatedPlan) {
      updatedPlan = adaptNextSession(updatedPlan, sessionId, tooMuch, painAfter - painBefore, state.profile.flareToday, state.profile.minutesPerSession);
    }
    updateState({ checkins: [...state.checkins, checkin], currentPlan: updatedPlan });

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

    trackEvent("checkin_completed", { sessionId });
    toast({ title: "Saved — we'll adapt your next session.", duration: 2000 });
    setEndStep("summary");
  };

  const exitWorkout = () => { stopTTS(); navigate("/plan"); };

  if (!session) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-white/60 mb-4">Session not found</p>
          <button onClick={() => navigate("/plan")} className="rounded-full px-6 py-3 bg-white/20 text-white font-medium">Back to plan</button>
        </div>
      </div>
    );
  }

  const displayMinutes = Math.floor(remaining / 60);
  const displaySeconds = remaining % 60;
  const activeExercise = exercises[activeIdx];
  const master = activeExercise ? MASTER_LOOKUP[activeExercise.id] : null;
  const isLastExercise = activeIdx === exercises.length - 1;
  const exerciseTitle = master?.title || activeExercise?.name_he || "";
  const exerciseCue = master?.breathing || master?.cue || "";
  const instructions = master?.instructions || activeExercise?.steps_he || [];
  const safetyNote = master?.safety || activeExercise?.safety_he || "";

  return (
    <>
      {/* ===== FULLSCREEN PLAYER ===== */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black z-50">
        {/* Video background */}
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            src={universalVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(26,26,46,0.15) 0%, rgba(22,33,62,0.1) 40%, rgba(15,52,96,0.08) 100%)" }} />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* ===== TOP OVERLAY (hidden when ended) ===== */}
        {!isEnded && (
          <div className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6 flex items-center justify-between">
            <span className="hidden lg:block">
              <BrandLogo size="sm" variant="white" linkToHome={false} />
            </span>
            <img src="/brand/vinys-icon-white.png" alt="Vinys" className="lg:hidden w-7 h-7 object-contain" />
            <div className="flex gap-1.5">
              {exercises.map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeIdx ? "w-8 bg-white" : i < activeIdx ? "w-2.5 bg-white/50" : "w-2.5 bg-white/25"
                }`} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className={`rounded-full px-4 py-2 bg-white/20 backdrop-blur-md ${timerDone ? "animate-pulse ring-2 ring-white/40" : ""}`}>
                <span className="text-white font-mono font-medium text-sm">
                  {String(displayMinutes).padStart(2, "0")}:{String(displaySeconds).padStart(2, "0")}
                </span>
              </div>
              <button onClick={exitWorkout} className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* ===== BOTTOM OVERLAY (hidden when ended) ===== */}
        {!isEnded && (
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 md:p-6">
        {/* Up next hint */}
            {(() => {
              const nextEx = exercises[activeIdx + 1];
              const nextMaster = nextEx ? MASTER_LOOKUP[nextEx.id] : null;
              const nextTitle = nextMaster?.title || nextEx?.name_he || "";
              return (
                <div className="text-center mb-3">
                  <p className="text-white/40 text-xs font-medium">
                    {isLastExercise ? "Final exercise" : `Up next: ${nextTitle}`}
                  </p>
                </div>
              );
            })()}

            {/* Mobile: vertical stack (title above buttons) */}
            <div className="flex flex-col lg:hidden gap-4">
              <div className="text-center min-w-0">
                <p className="text-white font-semibold text-lg truncate">{exerciseTitle}</p>
                {exerciseCue && <p className="text-white/70 text-sm mt-0.5 truncate">{exerciseCue}</p>}
                {instructions.length > 0 && (
                  <p className="text-white/50 text-xs mt-1 truncate">{instructions[0]}{activeExercise?.equipment?.length ? ` · ${activeExercise.equipment.join(", ")}` : " · No equipment needed"}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeIdx > 0 && (
                  <button onClick={goPrev}
                    className="h-14 px-3 rounded-full bg-white/[0.10] backdrop-blur-md text-white/60 hover:text-white hover:bg-white/[0.18] transition-colors text-sm">
                    ←
                  </button>
                )}
                <div className="flex items-center gap-1.5 rounded-full bg-white/[0.18] backdrop-blur-md px-3 h-14">
                  <button onClick={togglePlay} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 text-white transition-colors">
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button onClick={() => setMuted(!isMuted)} disabled={isTTSLoading} title={isMuted ? "Sound muted" : "Sound on"}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 text-white transition-colors">
                    {isTTSLoading ? <Loader2 size={18} className="animate-spin" /> : !isMuted ? <Volume2 size={18} /> : <VolumeX size={18} className="opacity-70" />}
                  </button>
                  <button onClick={() => setAdjustOpen(true)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 text-white transition-colors">
                    <Settings2 size={18} />
                  </button>
                  <button onClick={openInfo} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 text-white transition-colors">
                    <Info size={18} />
                  </button>
                </div>
                <button onClick={goNext}
                  className="flex-1 h-14 rounded-full bg-white/[0.18] backdrop-blur-md text-white font-medium hover:bg-white/[0.25] transition-colors whitespace-nowrap text-sm">
                  {isLastExercise ? "Complete ✓" : "Next →"}
                </button>
              </div>
            </div>
            {/* Desktop: horizontal layout */}
            <div className="hidden lg:flex items-end justify-between gap-4">
              <div className="flex items-center gap-2">
                {activeIdx > 0 && (
                  <button onClick={goPrev}
                    className="rounded-full px-4 py-3 bg-white/[0.10] backdrop-blur-md text-white/60 font-medium hover:text-white hover:bg-white/[0.18] transition-colors text-sm">
                    ← Prev
                  </button>
                )}
                <div className="flex items-center gap-1.5 rounded-full bg-white/[0.18] backdrop-blur-md px-3 py-2">
                  <button onClick={togglePlay} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 text-white transition-colors">
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button onClick={() => setMuted(!isMuted)} disabled={isTTSLoading} title={isMuted ? "Sound muted" : "Sound on"}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 text-white transition-colors">
                    {isTTSLoading ? <Loader2 size={18} className="animate-spin" /> : !isMuted ? <Volume2 size={18} /> : <VolumeX size={18} className="opacity-70" />}
                  </button>
                  <button onClick={() => setAdjustOpen(true)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 text-white transition-colors">
                    <Settings2 size={18} />
                  </button>
                  <button onClick={openInfo} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 text-white transition-colors">
                    <Info size={18} />
                  </button>
                </div>
              </div>
              <div className="flex-1 text-center min-w-0 max-w-md mx-auto">
                <p className="text-white font-semibold text-xl truncate">{exerciseTitle}</p>
                {exerciseCue && <p className="text-white/70 text-sm mt-0.5 truncate">{exerciseCue}</p>}
                {instructions.length > 0 && (
                  <p className="text-white/50 text-xs mt-1 truncate">{instructions[0]}{activeExercise?.equipment?.length ? ` · ${activeExercise.equipment.join(", ")}` : " · No equipment needed"}</p>
                )}
              </div>
              <button onClick={goNext}
                className="rounded-full px-6 py-3 bg-white/[0.18] backdrop-blur-md text-white font-medium hover:bg-white/[0.25] transition-colors whitespace-nowrap text-base">
                {isLastExercise ? "Complete ✓" : "Next exercise →"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== SESSION PREVIEW OVERLAY ===== */}
      {showPreview && !isEnded && (
        <div className="fixed inset-0 z-[55]">
          <div className="absolute inset-0 backdrop-blur-xl bg-black/60" />
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center max-w-md w-full">
              <p className="text-white/50 text-sm font-medium uppercase tracking-wider mb-2">Session Preview</p>
              <h1 className="text-white text-3xl md:text-4xl font-semibold mb-2">
                Practice {session ? String((plan?.sessions.indexOf(session) ?? 0) + 1).padStart(2, "0") : "01"}
              </h1>
              <p className="text-white/60 text-sm mb-6">
                {exercises.length} exercises · {session?.durationMinutes || 20} min
              </p>
              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md p-4 mb-8 max-h-[40vh] overflow-y-auto text-left">
                {exercises.map((ex, i) => {
                  const m = MASTER_LOOKUP[ex.id];
                  return (
                    <div key={ex.id} className={`flex items-center gap-3 py-2.5 ${i < exercises.length - 1 ? "border-b border-white/10" : ""}`}>
                      <span className="text-white/30 text-xs font-mono w-5 text-right shrink-0">{i + 1}</span>
                      <span className="text-white/90 text-sm font-medium">{m?.title || ex.name_he}</span>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => { setShowPreview(false); setIsPlaying(true); }}
                className="w-full max-w-xs rounded-full py-3.5 px-6 bg-white text-black font-medium hover:bg-white/90 transition-colors text-base"
              >
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
              <h1 className="text-white text-4xl md:text-5xl font-semibold leading-tight">
                Practice<br />complete!
              </h1>
              <p className="text-white/70 text-sm mt-4">
                helps us adapt your next practice session.
              </p>
              <div className="mt-8 space-y-3">
                <button
                  onClick={() => setEndStep("checkin")}
                  className="w-full rounded-full py-3.5 px-6 bg-white text-black font-medium hover:bg-white/90 transition-colors text-base"
                >
                  Quick check-in
                </button>
                <button
                  onClick={() => setEndStep("summary")}
                  className="w-full rounded-full py-3.5 px-6 bg-white/20 text-white font-medium border border-white/20 backdrop-blur-md hover:bg-white/25 transition-colors text-base"
                >
                  Finish practice
                </button>
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
                  <button onClick={() => setShowMore(true)}
                    className="mt-4 text-sm text-white/60 hover:text-white/80 underline underline-offset-2 transition-colors">
                    More options
                  </button>
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
                              helpedMost === opt
                                ? "border-white bg-white/20 text-white"
                                : "border-white/20 bg-white/5 text-white/60 hover:border-white/40"
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
                <button onClick={handleCheckinSave}
                  className="w-full rounded-full py-3 bg-white text-black font-medium hover:bg-white/90 transition-colors">
                  Save & continue
                </button>
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
              <h1 className="text-white text-3xl md:text-4xl font-semibold leading-tight">
                Practice complete.
              </h1>
              <p className="text-white/60 text-sm mt-3 max-w-sm mx-auto">
                Consistency builds change. Your next session will continue from here.
              </p>
              <div className="mt-8 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md overflow-hidden">
                <div className="grid grid-cols-3 divide-x divide-white/10">
                  <div className="py-5 px-3">
                    <p className="text-white text-2xl font-bold">
                      {plan ? plan.sessions.filter(s => s.status === "done").length : "–"}
                    </p>
                    <p className="text-white/50 text-xs mt-1">Session</p>
                  </div>
                  <div className="py-5 px-3">
                    <p className="text-white text-2xl font-bold">
                      {session?.durationMinutes || "–"}
                    </p>
                    <p className="text-white/50 text-xs mt-1">Duration (min)</p>
                  </div>
                  <div className="py-5 px-3">
                    <p className="text-white text-2xl font-bold">
                      {state.checkins.length}
                    </p>
                    <p className="text-white/50 text-xs mt-1">Total check-ins</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 space-y-3">
                <button
                  onClick={exitWorkout}
                  className="w-full rounded-full py-3.5 px-6 bg-white text-black font-medium hover:bg-white/90 transition-colors text-base"
                >
                  Return to my plan →
                </button>
                <button
                  onClick={async () => {
                    const shareText = `I just completed a Vinys adaptive yoga session. ${session?.durationMinutes || 20} min · ${state.profile.conditions?.map(c => c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())).join(", ") || "Therapeutic"} program · vinys.app`;
                    const shareData = { title: "I just completed a Vinys session", text: shareText, url: "https://vinys.app" };
                    try {
                      if (navigator.share) { await navigator.share(shareData); }
                      else { await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`); toast({ title: "Copied!", description: "Link copied to clipboard" }); }
                    } catch { /* user cancelled */ }
                  }}
                  className="text-white/40 text-sm hover:text-white/60 transition-colors flex items-center gap-1.5 mx-auto"
                >
                  Share your progress →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== INFO OVERLAY ===== */}
      {isInfoOpen && (
        <div className="fixed inset-0 z-[60] bg-black/55 flex items-start justify-center overflow-auto" onClick={closeInfo}>
          <div className="max-w-2xl w-[min(92vw,720px)] mx-auto mt-[10vh] mb-10 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-6 text-white"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">Instructions</h3>
              <button onClick={closeInfo} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[65vh] overflow-auto space-y-4 pr-1">
              <ol className="space-y-4">
                {instructions.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold">{i + 1}</span>
                    <span className="text-white/90 text-base leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
              {safetyNote && (
                <div className="mt-4 border-l-2 border-white/20 pl-3 py-2">
                  <p className="text-white/50 text-sm">{safetyNote}</p>
                </div>
              )}
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
            <button onClick={() => switchMode("easier")}
              className={`w-full min-h-[48px] rounded-2xl px-5 py-3 text-sm font-medium text-white transition-colors text-left ${currentMode === "easier" ? "bg-white/25" : "bg-white/10 hover:bg-white/15"}`}>
              <span className="block">Switch to easier variation</span>
              <span className="block text-xs text-white/50 mt-0.5">Replaces this exercise with a gentler version targeting the same area</span>
            </button>
            <button onClick={() => switchMode("flare")}
              className={`w-full min-h-[48px] rounded-2xl px-5 py-3 text-sm font-medium text-white transition-colors text-left ${currentMode === "flare" ? "bg-white/25" : "bg-white/10 hover:bg-white/15"}`}>
              <span className="block">Activate Flare mode (gentler)</span>
              <span className="block text-xs text-white/50 mt-0.5">Slows the pace and reduces intensity for the rest of this session</span>
            </button>
            <button onClick={() => { setAdjustOpen(false); finishWorkout(); }}
              className="w-full rounded-2xl px-5 py-3 text-sm text-white/50 hover:text-red-400 transition-colors font-medium text-left">
              <span className="block">Finish practice early</span>
              <span className="block text-xs text-white/30 mt-0.5">End the session now and log your progress</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
