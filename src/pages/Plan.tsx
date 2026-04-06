import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLatestCheckin } from "@/hooks/useLatestCheckin";
import { useWeeklyProgress } from "@/hooks/useWeeklyProgress";
import { useApp } from "@/context/AppContext";
import { useAuthContext } from "@/context/AuthContext";
import { generatePlan } from "@/lib/planGenerator";
import { HELPED_MOST_LABELS, CONDITIONS, CONDITION_LABELS, EQUIPMENT_OPTIONS } from "@/constants/conditions";
import type { HelpedMost, ConditionKey, EnergyLevel } from "@/constants/conditions";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import BrandLogo from "@/components/BrandLogo";
import { Progress } from "@/components/ui/progress";
import { MinusCircle, Search, Plus, X, Settings, Pencil, Play, RefreshCw, Clock, Activity, CalendarDays, UserCircle, Loader2, Check, Wind, Move, Shield, Heart, LayoutGrid, ArrowDown, ArrowUp, Sparkles } from "lucide-react";
import { MASTER_LOOKUP } from "@/data/exerciseAdapter";
import { CATEGORY_LABELS, EQUIPMENT_LABELS } from "@/constants/conditions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import LibraryModal from "@/components/LibraryModal";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";

export default function Plan() {
  const { state, updateState, updateProfile, resetAll } = useApp();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const plan = state.currentPlan;
  const checkins = state.checkins;
  const weekly = useWeeklyProgress(state.profile.sessionsPerWeek);

  useEffect(() => { document.title = "Your Plan — Vinys"; }, []);

  // Modal states
  const [showRestart, setShowRestart] = useState(false);
  const [showAddCondition, setShowAddCondition] = useState(false);
  const [editingCondition, setEditingCondition] = useState<ConditionKey | null>(null);
  const [editingSetup, setEditingSetup] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryInitialId, setLibraryInitialId] = useState<string | null>(null);
  const [showAccount, setShowAccount] = useState(false);
  const [conditionSearch, setConditionSearch] = useState("");
  const [pendingConditions, setPendingConditions] = useState<ConditionKey[]>([]);
  const [showWeeklyDone, setShowWeeklyDone] = useState(false);
  const [milestoneDismissed, setMilestoneDismissed] = useState(() => localStorage.getItem("vinys_milestone_first_done") === "1");

  // Setup edit temp state
  const [tempMinutes, setTempMinutes] = useState(state.profile.minutesPerSession);
  const [tempLevel, setTempLevel] = useState<EnergyLevel>(state.profile.energyLevel);
  const [tempSessions, setTempSessions] = useState(state.profile.sessionsPerWeek);

  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }, []);

  const localCompleted = plan?.sessions.filter((s) => s.status === "done").length || 0;
  const completedCount = user ? weekly.completed : localCompleted;
  const totalSessions = plan?.sessions.length || 0;
  const progressPct = totalSessions > 0 ? (completedCount / totalSessions) * 100 : 0;

  const avgPainAfter = checkins.length > 0
    ? (checkins.reduce((sum, c) => sum + c.painAfter, 0) / checkins.length).toFixed(1) : "0.0";

  const helpedMostCounts: Record<string, number> = {};
  checkins.forEach((c) => { helpedMostCounts[c.helpedMost] = (helpedMostCounts[c.helpedMost] || 0) + 1; });
  const helpedMostKey = Object.entries(helpedMostCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const helpedMost = helpedMostKey ? (HELPED_MOST_LABELS[helpedMostKey as HelpedMost] || helpedMostKey) : "Breath";

  const conditions = state.profile.conditions || [];
  const conditionLabel = (c: string) => CONDITION_LABELS[c as ConditionKey] || c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  // First name from profiles
  const [firstName, setFirstName] = useState<string>("");
  useEffect(() => {
    if (!user?.id) return;
    supabase.from("profiles").select("first_name").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data?.first_name) setFirstName(data.first_name);
    });
  }, [user?.id]);

  // ── Handlers ──

  const handleStartNextPractice = () => {
    const effectiveCompleted = user ? weekly.completed : completedCount;
    if (effectiveCompleted >= weekly.target) {
      setShowWeeklyDone(true);
      return;
    }
    // V2: on-demand session — navigate to workout without a session ID
    navigate("/workout");
  };

  const handleRepeat = (_sessionId: string) => {
    // V2: generate a fresh on-demand session
    navigate("/workout");
  };

  const handleStartSession = (sessionId: string) => {
    navigate(`/workout/${sessionId}`);
  };

  const handleRestartConfirm = async () => {
    resetAll();
    await weekly.resetCompleted();
    setShowRestart(false);
    navigate("/onboarding");
  };

  const handleAddConditions = () => {
    if (pendingConditions.length === 0) return;
    const merged = Array.from(new Set([...conditions, ...pendingConditions]));
    updateProfile({ conditions: merged as ConditionKey[] });
    const newPlan = generatePlan(
      { ...state.profile, conditions: merged as ConditionKey[] },
      `assessment_${Date.now()}`,
      undefined,
      state.exerciseLibrary,
      { pain: 5, fatigue: 5, sleep: 5, flareNow: state.profile.flareToday ? "yes" : "no" },
    );
    updateState({ currentPlan: newPlan });
    setPendingConditions([]);
    setConditionSearch("");
    setShowAddCondition(false);
  };

  const handleRemoveCondition = (c: ConditionKey) => {
    const updated = conditions.filter((x) => x !== c);
    updateProfile({ conditions: updated });
    setEditingCondition(null);
  };

  const handleSaveSetup = () => {
    updateProfile({
      minutesPerSession: tempMinutes,
      energyLevel: tempLevel,
      sessionsPerWeek: tempSessions,
    });
    const newPlan = generatePlan(
      { ...state.profile, minutesPerSession: tempMinutes, energyLevel: tempLevel, sessionsPerWeek: tempSessions },
      `assessment_${Date.now()}`,
      undefined,
      state.exerciseLibrary,
      { pain: 5, fatigue: 5, sleep: 5, flareNow: state.profile.flareToday ? "yes" : "no" },
    );
    updateState({ currentPlan: newPlan });
    setEditingSetup(false);
  };

  const availableToAdd = CONDITIONS.filter(
    (c) => !conditions.includes(c.key) && c.label.toLowerCase().includes(conditionSearch.toLowerCase()),
  );

  // ── Greeting ──
  const hour = new Date().getHours();
  const practiceTime = state.profile.practiceTime;
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const greetingSuffix = practiceTime === "morning"
    ? "your morning practice is ready."
    : practiceTime === "afternoon"
    ? "time for today's practice."
    : practiceTime === "evening"
    ? "your evening practice is waiting."
    : null;
  const greeting = firstName
    ? `${timeGreeting}, ${firstName}`
    : timeGreeting;
  const greetingDisplay = greeting;

  // No plan state
  // V2: no pre-generated plan needed. If onboarding not completed, show setup prompt.
  if (!state.onboardingCompleted) {
    return (
      <Layout hideHeader hideFooter>
        <NavBar onStart={handleStartNextPractice} onAccountClick={() => setShowAccount(true)} onLibraryClick={() => { setLibraryInitialId(null); setShowLibrary(true); }} />
        <div className="px-6 py-10 max-w-5xl mx-auto space-y-6">
          <GreetingBlock greeting={greetingDisplay} greetingSuffix={greetingSuffix} user={user} showAccount={showAccount} setShowAccount={setShowAccount} firstName={firstName} setFirstName={setFirstName} />
          <p className="text-muted-foreground">Complete the diagnostic to start your practice.</p>
          <Button variant="hero" size="lg" onClick={() => navigate("/onboarding")} className="w-full">
            Start diagnostic
          </Button>
        </div>
        <RestartModal open={showRestart} onClose={() => setShowRestart(false)} onConfirm={handleRestartConfirm} />
      </Layout>
    );
  }

  // Completed sessions for history (from legacy plan data if it exists)
  const completedSessions = plan?.sessions?.filter(s => s.status === "done").map((s, idx) => {
    const matchingCheckin = checkins.find(c => c.sessionId === s.id);
    return { ...s, checkin: matchingCheckin, sessionNumber: (plan?.sessions.indexOf(s) ?? 0) + 1 };
  }) || [];

  return (
    <Layout hideHeader hideFooter>
      {/* 1) NAV BAR */}
      <NavBar onStart={handleStartNextPractice} onAccountClick={() => setShowAccount(true)} onLibraryClick={() => { setLibraryInitialId(null); setShowLibrary(true); }} />

      <div className="px-6 py-8 max-w-5xl mx-auto space-y-8">
        {/* 2) GREETING */}
        <GreetingBlock greeting={greetingDisplay} greetingSuffix={greetingSuffix} user={user} showAccount={showAccount} setShowAccount={setShowAccount} firstName={firstName} setFirstName={setFirstName} />

        {/* First-session welcome banner (before any sessions done) */}
        {completedCount === 0 && (
          <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, hsl(var(--surface-warm)), hsl(var(--surface-soft)))", border: "1px solid hsl(var(--border))" }}>
            <div className="flex items-start gap-3">
              <Sparkles size={20} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-foreground font-semibold text-[15px]">Your practice is ready — it only takes {state.profile.minutesPerSession} minutes.</p>
                <Button variant="hero" size="sm" className="mt-3 rounded-full px-5" onClick={() => navigate("/workout")}>
                  Start Practice →
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* First-session milestone banner (after first ever session) */}
        {completedCount === 1 && !milestoneDismissed && (
          <div className="rounded-2xl p-5 flex items-center gap-3" style={{ background: "hsl(var(--surface-warm))", border: "1px solid hsl(var(--border))" }}>
            <Check size={20} className="text-secondary shrink-0" />
            <p className="text-foreground font-medium text-sm flex-1">Your plan is ready. Start your first practice when you're ready.</p>
            <button onClick={() => { setMilestoneDismissed(true); localStorage.setItem("vinys_milestone_first_done", "1"); }} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
              <X size={16} />
            </button>
          </div>
        )}

        {/* 3) TOP STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <WeeklyTargetCard completedCount={completedCount} target={weekly.target} />
          <div className="rounded-2xl text-white p-6 flex flex-col justify-between min-h-[120px]" style={{ background: "#028090" }}>
            <span className="text-sm font-medium opacity-90">Time practicing</span>
            <span className="text-[40px] sm:text-[44px] font-bold leading-[1.05] tracking-[-0.01em]">
              {(() => {
                const totalMin = plan?.sessions.filter(s => s.status === "done").reduce((sum, s) => sum + s.durationMinutes, 0) || 0;
                const h = Math.floor(totalMin / 60);
                const m = totalMin % 60;
                return h > 0 ? `${h}h ${m}m` : `${m}m`;
              })()}
            </span>
          </div>
          <div className="rounded-2xl bg-foreground text-background p-6 flex flex-col justify-between min-h-[120px]">
            <span className="text-sm font-medium opacity-90">Practices done</span>
            <span className="text-[40px] sm:text-[44px] font-bold leading-[1.05] tracking-[-0.01em]">{completedCount}</span>
          </div>
        </div>

        {/* 5) DATA GRID (2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* My conditions */}
          <div className="rounded-2xl bg-surface-warm p-6 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between shrink-0 mb-4">
              <h3 className="text-lg font-bold text-foreground">My conditions</h3>
              <button
                onClick={() => { setPendingConditions([]); setConditionSearch(""); setShowAddCondition(true); }}
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-2 space-y-4" style={{ scrollbarWidth: "thin" }}>
              {conditions.length > 0 ? conditions.map((c) => (
                <div key={c} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary font-semibold">{conditionLabel(c)}</span>
                    <button
                      onClick={() => setEditingCondition(c)}
                      className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                    >
                      <MinusCircle size={18} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(state.profile as any).painAreas?.map((a: string) => (
                      <span key={a} className="px-3 py-1.5 rounded-full border border-foreground/20 text-sm text-foreground">{a}</span>
                    ))}
                  </div>
                  <hr className="border-border" />
                </div>
              )) : (
                <p className="text-muted-foreground text-sm">No conditions selected</p>
              )}
              {/* Last session summary */}
              {completedSessions.length > 0 && (() => {
                const last = completedSessions[completedSessions.length - 1];
                const dateStr = last.checkin ? "Today" : "Recently";
                return (
                  <div className="pt-2 mt-auto">
                    <p className="text-xs text-muted-foreground">Last practice: {dateStr} · {last.durationMinutes} min</p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* My next sessions */}
          <div className="rounded-2xl bg-surface-warm p-5 flex flex-col overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 shrink-0 mb-4">
              <h3 className="text-lg font-bold text-foreground">My next practice</h3>
            </div>
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-6 space-y-4">
              <p className="text-sm text-muted-foreground text-center max-w-[260px]">
                Each session is freshly generated based on your diagnostic profile and progress.
              </p>
              <Button variant="hero" size="lg" className="rounded-full px-8" onClick={() => navigate("/workout")}>
                <Play size={18} /> Start Practice
              </Button>
            </div>
          </div>

          {/* My practice Set up */}
          <div className="rounded-2xl bg-surface-warm p-6 flex flex-col overflow-hidden">
            <h3 className="text-lg font-bold text-foreground shrink-0 mb-4">My practice set up</h3>
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-2 space-y-4" style={{ scrollbarWidth: "thin" }}>
              <SetupRow
                icon={<Clock size={20} className="text-foreground/50" />}
                label="Practice time"
                value={`${state.profile.minutesPerSession} minutes`}
                onEdit={() => { setTempMinutes(state.profile.minutesPerSession); setTempLevel(state.profile.energyLevel); setTempSessions(state.profile.sessionsPerWeek); setEditingSetup(true); }}
              />
              <hr className="border-border" />
              <div className="flex items-center justify-between group relative">
                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5"><Activity size={20} className="text-foreground/50" /></span>
                  <div>
                    <p className="text-sm text-muted-foreground">Practice level</p>
                    <p className="text-lg font-bold text-secondary">{state.profile.energyLevel === "high" ? "Vigorous" : state.profile.energyLevel === "medium" ? "Moderate" : "Gentle"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="relative">
                    <button className="text-muted-foreground/40 hover:text-muted-foreground transition-colors peer" aria-label="What is practice level?">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                    </button>
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 rounded-xl bg-foreground text-background text-xs leading-relaxed shadow-lg opacity-0 pointer-events-none peer-hover:opacity-100 peer-focus:opacity-100 peer-hover:pointer-events-auto transition-opacity z-50">
                      Your practice level is set based on your movement assessment and sensitivity score. It adjusts automatically over time.
                    </div>
                  </div>
                  <button onClick={() => { setTempMinutes(state.profile.minutesPerSession); setTempLevel(state.profile.energyLevel); setTempSessions(state.profile.sessionsPerWeek); setEditingSetup(true); }} className="text-muted-foreground/60 hover:text-foreground transition-colors">
                    <Pencil size={18} />
                  </button>
                </div>
              </div>
              <hr className="border-border" />
              <SetupRow
                icon={<CalendarDays size={20} className="text-foreground/50" />}
                label="Sessions per week"
                value={`${state.profile.sessionsPerWeek}`}
                onEdit={() => { setTempMinutes(state.profile.minutesPerSession); setTempLevel(state.profile.energyLevel); setTempSessions(state.profile.sessionsPerWeek); setEditingSetup(true); }}
              />
            </div>
          </div>

          {/* Quick Check-In */}
          <QuickCheckinCard hasCompletedSessions={completedCount > 0} />
        </div>

        {/* My Progress — session history */}
        <div className="rounded-2xl bg-surface-warm p-6">
          <h3 className="text-lg font-bold text-foreground mb-1">My progress</h3>
          <p className="text-sm text-muted-foreground mb-4">This week: {weekly.completed} of {weekly.target} sessions completed</p>
          {completedSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Your completed sessions will appear here. Start Practice 01 to begin your journey.</p>
          ) : (
            <SessionHistoryList completedSessions={completedSessions} exerciseLibrary={state.exerciseLibrary} />
          )}
        </div>

        {/* Restart program — outside grid */}
        <div className="pt-8 mt-12 mb-16 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <Button
            variant="outline"
            className="w-full rounded-full border-foreground/30 text-foreground text-sm h-14"
            onClick={() => setShowRestart(true)}
          >
            Restart program
          </Button>
        </div>
      </div>

      {/* ── MODALS ── */}
      <RestartModal open={showRestart} onClose={() => setShowRestart(false)} onConfirm={handleRestartConfirm} />

      <LibraryModal open={showLibrary} onOpenChange={setShowLibrary} initialExerciseId={libraryInitialId} />

      {/* Weekly target completed modal */}
      <Dialog open={showWeeklyDone} onOpenChange={setShowWeeklyDone}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>You've completed all your practices this week!</DialogTitle>
            <DialogDescription>
              Maybe you need more. Update your settings and set a weekly practice count that matches your needs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => setShowWeeklyDone(false)}>Cancel</Button>
            <Button variant="hero" className="rounded-full" onClick={() => { setShowWeeklyDone(false); setEditingSetup(true); }}>Edit my set up</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add condition modal */}
      <Dialog open={showAddCondition} onOpenChange={setShowAddCondition}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add a condition</DialogTitle>
            <DialogDescription>Select conditions to add to your plan.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search conditions..."
              value={conditionSearch}
              onChange={(e) => setConditionSearch(e.target.value)}
              className="w-full rounded-full border border-border px-4 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground outline-none"
            />
            <div className="max-h-60 overflow-y-auto space-y-1">
              {availableToAdd.map((c) => {
                const selected = pendingConditions.includes(c.key);
                return (
                  <button
                    key={c.key}
                    onClick={() => setPendingConditions((prev) => selected ? prev.filter((x) => x !== c.key) : [...prev, c.key])}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${selected ? "bg-secondary/15 text-secondary font-semibold" : "hover:bg-muted/30 text-foreground"}`}
                  >
                    {c.label}
                    <span className="block text-xs text-muted-foreground">{c.description}</span>
                  </button>
                );
              })}
              {availableToAdd.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">No more conditions to add</p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-full">Cancel</Button>
            </DialogClose>
            <Button variant="hero" className="rounded-full" onClick={handleAddConditions} disabled={pendingConditions.length === 0}>
              Add ({pendingConditions.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove condition modal */}
      <Dialog open={!!editingCondition} onOpenChange={(open) => { if (!open) setEditingCondition(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove condition?</DialogTitle>
            <DialogDescription>This condition will be removed from your plan.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-full">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" className="rounded-full" onClick={() => editingCondition && handleRemoveCondition(editingCondition)}>
              Remove condition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit setup modal */}
      <Dialog open={editingSetup} onOpenChange={setEditingSetup}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit practice set up</DialogTitle>
            <DialogDescription>Adjust your practice preferences.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div>
              <label className="text-sm text-muted-foreground">Minutes per session</label>
              <div className="flex gap-2 mt-1.5">
                {[10, 15, 20, 30, 45].map((m) => (
                  <button
                    key={m}
                    onClick={() => setTempMinutes(m)}
                    className={`px-4 py-2 rounded-full text-sm border transition-colors ${tempMinutes === m ? "bg-accent/15 text-accent font-semibold border-accent" : "border-border text-foreground hover:border-foreground/40"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Practice level</label>
              <div className="flex gap-2 mt-1.5">
                {([["low", "Gentle"], ["medium", "Moderate"], ["high", "Vigorous"]] as const).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setTempLevel(val)}
                    className={`px-4 py-2 rounded-full text-sm border transition-colors ${tempLevel === val ? "bg-accent/15 text-accent font-semibold border-accent" : "border-border text-foreground hover:border-foreground/40"}`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Sessions per week</label>
              <div className="flex gap-2 mt-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setTempSessions(s)}
                    className={`px-4 py-2 rounded-full text-sm border transition-colors ${tempSessions === s ? "bg-accent/15 text-accent font-semibold border-accent" : "border-border text-foreground hover:border-foreground/40"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-full">Cancel</Button>
            </DialogClose>
            <Button variant="hero" className="rounded-full" onClick={handleSaveSetup}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

/* ── Sub-components ── */

function NavBar({ onStart, onAccountClick, onLibraryClick }: { onStart: () => void; onAccountClick: () => void; onLibraryClick: () => void }) {
  const nav = useNavigate();
  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-black/5"
      style={{
        backgroundColor: "rgba(245,242,235,0.65)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-center justify-between h-[72px] px-6 max-w-5xl mx-auto">
        <BrandLogo size="md" />
        <div className="flex items-center gap-4">
          <button
            onClick={onLibraryClick}
            aria-label="Open library"
            title="Open library"
            className="hidden lg:flex w-10 h-10 rounded-full items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
            style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => nav("/settings")}
            aria-label="Settings"
            className="w-10 h-10 rounded-full flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
            style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <Settings size={20} />
          </button>
          <button
            onClick={onAccountClick}
            aria-label="Account"
            className="w-10 h-10 rounded-full flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
            style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <UserCircle size={20} />
          </button>
          <Button variant="hero" size="sm" onClick={onStart} className="text-sm px-5">
            <span className="lg:hidden">Start</span>
            <span className="hidden lg:inline">Start next practice</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

function GreetingBlock({ greeting, greetingSuffix, user, showAccount, setShowAccount, firstName, setFirstName }: { greeting: string; greetingSuffix: string | null; user: any; showAccount: boolean; setShowAccount: (v: boolean) => void; firstName: string; setFirstName: (v: string) => void }) {
  const [showUsernameEdit, setShowUsernameEdit] = useState(false);
  const [showFirstNameEdit, setShowFirstNameEdit] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [firstNameSaving, setFirstNameSaving] = useState(false);
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "";
  const [localDisplayName, setLocalDisplayName] = useState(displayName);
  const { signOut, resetPassword } = useAuthContext();
  const navigate = useNavigate();
  const email = user?.email || "";
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => { setLocalDisplayName(displayName); }, [displayName]);

  const USERNAME_RE = /^[a-zA-Z0-9][a-zA-Z0-9_.]{1,18}[a-zA-Z0-9]$/;

  const validateUsername = useCallback((val: string) => {
    const trimmed = val.trim();
    if (trimmed.length < 3) return "At least 3 characters";
    if (trimmed.length > 20) return "Max 20 characters";
    if (!USERNAME_RE.test(trimmed)) return "Letters, numbers, _ and . only. Must start/end with letter or number.";
    if (/[_.]{2}/.test(trimmed)) return "No consecutive dots or underscores";
    return "";
  }, []);

  const handleUsernameChange = (val: string) => {
    setNewUsername(val);
    setUsernameError(validateUsername(val));
  };

  const handleSaveUsername = async () => {
    const trimmed = newUsername.trim();
    const err = validateUsername(trimmed);
    if (err) { setUsernameError(err); return; }
    if (!user?.id) return;

    setUsernameSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: trimmed })
        .eq("user_id", user.id);
      if (error) throw error;
      await supabase.auth.updateUser({ data: { display_name: trimmed } });
      setLocalDisplayName(trimmed);
      setShowUsernameEdit(false);
      setNewUsername("");
      toast({ title: "Username updated" });
    } catch (e: any) {
      setUsernameError(e.message || "Failed to update username");
    } finally {
      setUsernameSaving(false);
    }
  };

  const handleSaveFirstName = async () => {
    const trimmed = newFirstName.trim();
    if (!trimmed || !user?.id) return;
    setFirstNameSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ first_name: trimmed } as any)
        .eq("user_id", user.id);
      if (error) throw error;
      setFirstName(trimmed);
      setShowFirstNameEdit(false);
      setNewFirstName("");
      toast({ title: "First name updated" });
    } catch (e: any) {
      toast({ title: "Failed to update", description: e.message });
    } finally {
      setFirstNameSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!email) return;
    await resetPassword(email);
    setResetSent(true);
  };

  const handleLogout = async () => {
    setShowAccount(false);
    await signOut();
    navigate("/");
  };

  return (
    <>
      <div className="space-y-1">
        <h1 className="font-display text-foreground font-semibold" style={{ fontSize: "clamp(26px, 4vw, 34px)", lineHeight: 1.2, letterSpacing: "-0.5px" }}>
          {greeting}
        </h1>
        <p className="text-muted-foreground text-base">{greetingSuffix || "Here's your plan"}</p>
      </div>

      <Dialog open={showAccount} onOpenChange={(v) => { setShowAccount(v); if (!v) { setShowUsernameEdit(false); setShowFirstNameEdit(false); } }}>
        <DialogContent className="max-w-[520px] rounded-[20px] p-6 [&>button.absolute]:hidden" style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">Account</DialogTitle>
              <button onClick={() => setShowAccount(false)} className="text-foreground/60 hover:text-foreground transition-colors p-1">
                <X size={20} />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            {/* First Name */}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">First name</p>
              <p className="text-sm font-medium text-foreground">{firstName || "—"}</p>
              {showFirstNameEdit ? (
                <div className="mt-3 space-y-2">
                  <input
                    type="text"
                    value={newFirstName}
                    onChange={e => setNewFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-accent/50 focus:outline-none transition-colors"
                    maxLength={30}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => { setShowFirstNameEdit(false); setNewFirstName(""); }}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-full text-xs"
                      disabled={newFirstName.trim().length < 1 || firstNameSaving}
                      onClick={handleSaveFirstName}
                    >
                      {firstNameSaving ? <Loader2 size={14} className="animate-spin" /> : "Save"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="rounded-full mt-2 text-xs" onClick={() => { setShowFirstNameEdit(true); setNewFirstName(firstName); }}>
                  {firstName ? "Change first name" : "Add first name"}
                </Button>
              )}
            </div>

            {/* Username */}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Username</p>
              <p className="text-sm font-medium text-foreground">{localDisplayName || "—"}</p>
              {showUsernameEdit ? (
                <div className="mt-3 space-y-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={e => handleUsernameChange(e.target.value)}
                    placeholder="Enter a new username"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-accent/50 focus:outline-none transition-colors"
                    maxLength={20}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">Current: {localDisplayName}</p>
                  {usernameError && <p className="text-xs text-destructive">{usernameError}</p>}
                  {!usernameError && newUsername.trim().length >= 3 && (
                    <p className="text-xs text-accent flex items-center gap-1"><Check size={12} /> Looks good</p>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => { setShowUsernameEdit(false); setNewUsername(""); setUsernameError(""); }}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-full text-xs"
                      disabled={!!usernameError || newUsername.trim().length < 3 || usernameSaving}
                      onClick={handleSaveUsername}
                    >
                      {usernameSaving ? <Loader2 size={14} className="animate-spin" /> : "Save"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="rounded-full mt-2 text-xs" onClick={() => { setShowUsernameEdit(true); setNewUsername(localDisplayName); }}>
                  Change username
                </Button>
              )}
            </div>

            {/* Email */}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Email</p>
              <p className="text-sm font-medium text-foreground">{email || "—"}</p>
            </div>

            {/* Password */}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Password</p>
              <p className="text-sm font-medium text-foreground tracking-widest">••••••••</p>
              <p className="text-xs text-muted-foreground mt-1">For security reasons, passwords are never displayed.</p>
              {resetSent ? (
                <p className="text-xs text-accent mt-2">Password reset email sent ✓</p>
              ) : (
                <Button variant="outline" size="sm" className="rounded-full mt-2 text-xs" onClick={handleChangePassword}>
                  Change password
                </Button>
              )}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-border">
            <Button variant="outline" className="w-full rounded-full" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SetupRow({ icon, label, value, onEdit }: { icon?: React.ReactNode; label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-start gap-3.5">
        {icon && <span className="mt-0.5">{icon}</span>}
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-lg font-bold text-secondary">{value}</p>
        </div>
      </div>
      <button onClick={onEdit} className="text-muted-foreground/60 hover:text-foreground transition-colors">
        <Pencil size={18} />
      </button>
    </div>
  );
}

const PREVIEW_CATEGORY_ICONS: Record<string, typeof Wind> = {
  breath: Wind, mobility: Move, stability: Shield, release: Heart,
};

function LibraryPreviewGrid({ exercises, onCardClick }: { exercises: any[]; onCardClick: (id: string) => void }) {
  const dedupedExercises = useMemo(() => {
    const seen = new Set<string>();
    return exercises.filter(ex => {
      const master = MASTER_LOOKUP[ex.id];
      const masterId = master?.id || ex.id;
      if (seen.has(masterId)) return false;
      seen.add(masterId);
      return true;
    });
  }, [exercises]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {dedupedExercises.map(ex => {
        const master = MASTER_LOOKUP[ex.id];
        const title = master?.title || ex.name_he;

        return (
          <div
            key={ex.id}
            className="rounded-xl bg-background/60 p-4 flex items-center justify-center cursor-pointer hover:bg-background/80 transition-colors min-h-[56px]"
            onClick={() => onCardClick(ex.id)}
          >
            <h4 className="font-semibold text-foreground text-[13px] leading-snug truncate text-center w-full">{title}</h4>
          </div>
        );
      })}
    </div>
  );
}

function RestartModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Restart your program?</DialogTitle>
          <DialogDescription>
            This will clear your current plan and profile. Are you sure?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" className="rounded-full">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" className="rounded-full" onClick={onConfirm}>
            Yes, restart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SessionHistoryList({ completedSessions, exerciseLibrary }: { completedSessions: any[]; exerciseLibrary: any[] }) {
  const [detailSession, setDetailSession] = useState<any>(null);

  return (
    <>
      <div className="space-y-3">
        {completedSessions.map((s) => (
          <button
            key={s.id}
            onClick={() => setDetailSession(s)}
            className="w-full flex items-center justify-between rounded-xl bg-background/60 p-4 hover:bg-background/80 transition-colors text-left"
          >
            <div>
              <h4 className="font-semibold text-foreground text-sm">Practice {String(s.sessionNumber).padStart(2, "0")}</h4>
              <p className="text-xs text-muted-foreground">{s.durationMinutes} min · {s.exerciseIds.length} exercises</p>
            </div>
            {s.checkin && (
              <span className="text-xs text-secondary font-medium">
                {s.checkin.helpedMost === "breath" ? "Breath" : s.checkin.helpedMost === "movement" ? "Movement" : "Release"} helped most
              </span>
            )}
          </button>
        ))}
      </div>

      <Dialog open={!!detailSession} onOpenChange={(v) => { if (!v) setDetailSession(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Practice {detailSession ? String(detailSession.sessionNumber).padStart(2, "0") : ""}</DialogTitle>
            <DialogDescription>Session summary</DialogDescription>
          </DialogHeader>
          {detailSession && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium text-foreground">{detailSession.durationMinutes} min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exercises</span>
                <span className="font-medium text-foreground">{detailSession.exerciseIds.length}</span>
              </div>
              {detailSession.checkin && (
                <>
                  <hr className="border-border" />
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Check-in data</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-sm"><span className="text-muted-foreground">Pain before:</span> <span className="font-bold text-foreground">{detailSession.checkin.painBefore}/10</span></div>
                      <div className="text-sm"><span className="text-muted-foreground">Pain after:</span> <span className="font-bold text-secondary">{detailSession.checkin.painAfter}/10</span></div>
                      <div className="text-sm"><span className="text-muted-foreground">Fatigue before:</span> <span className="font-bold text-foreground">{detailSession.checkin.fatigueBefore}/10</span></div>
                      <div className="text-sm"><span className="text-muted-foreground">Fatigue after:</span> <span className="font-bold text-secondary">{detailSession.checkin.fatigueAfter}/10</span></div>
                    </div>
                    {detailSession.checkin.tooMuch && (
                      <p className="text-xs text-destructive font-medium">⚠ Felt too much</p>
                    )}
                  </div>
                </>
              )}
              <hr className="border-border" />
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Exercises performed</p>
                {detailSession.exerciseIds.map((id: string, i: number) => {
                  const m = MASTER_LOOKUP[id];
                  const ex = exerciseLibrary.find((e: any) => e.id === id);
                  return (
                    <div key={id} className="flex items-center gap-2 py-1">
                      <span className="text-xs text-muted-foreground w-4 text-right">{i + 1}</span>
                      <span className="text-sm text-foreground">{m?.title || ex?.name_he || id}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="rounded-full w-full">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatCard({ bg, label, main, secondary, isText }: { bg: string; label: string; main: string; secondary?: string; isText?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 sm:p-6 md:p-8 ${bg}`}>
      <p className="text-[13px] sm:text-[14px] md:text-[16px] font-medium leading-tight opacity-85">{label}</p>
      <div className="flex items-baseline gap-2.5 mt-3">
        {isText ? (
          <span className="text-[28px] sm:text-[32px] md:text-[36px] font-bold leading-[1.1] tracking-tight line-clamp-2">{main}</span>
        ) : (
          <>
            <span className="text-[28px] sm:text-[36px] md:text-[44px] font-bold leading-[1.05] tracking-[-0.01em]">{main}</span>
            {secondary && <span className="text-[16px] sm:text-[18px] md:text-[22px] font-semibold leading-none opacity-95">{secondary}</span>}
          </>
        )}
      </div>
    </div>
  );
}

function WeeklyTargetCard({ completedCount, target }: { completedCount: number; target: number }) {
  const done = Math.min(completedCount, target);
  const isComplete = done >= target;
  const pct = target > 0 ? Math.min((done / target) * 100, 100) : 0;

  return (
    <div className="rounded-2xl text-white p-6 flex flex-col justify-between min-h-[120px]" style={{ background: "#4A7B6F" }}>
      <span className="text-sm font-medium opacity-90">Weekly target</span>
      {isComplete ? (
        <div className="mt-auto">
          <span className="text-[28px] sm:text-[32px] font-bold leading-[1.1]">Completed!</span>
          <p className="text-xs opacity-80 mt-1">You completed all your weekly practices. Well done!</p>
        </div>
      ) : (
        <div className="mt-auto">
          <span className="text-[40px] sm:text-[44px] font-bold leading-[1.05] tracking-[-0.01em]">
            {done} <span className="text-[24px] sm:text-[28px] font-semibold opacity-80">/ {target}</span>
          </span>
          <div className="w-full h-1.5 rounded-full bg-white/20 mt-2 overflow-hidden">
            <div className="h-full rounded-full bg-white/80 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

function CheckinSlider({ label, value, onChange, minLabel, maxLabel }: {
  label: string; value: number; onChange: (v: number) => void; minLabel?: string; maxLabel?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs font-bold text-accent bg-accent/10 rounded-full w-7 h-7 flex items-center justify-center">{value}</span>
      </div>
      <input type="range" min={0} max={10} value={value}
        onChange={(e) => onChange(Number(e.target.value))} className="w-full checkin-modal-range"
        aria-label={label} />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{minLabel}</span><span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}

function MetricRow({ label, value, isAfter, improved, worse }: {
  label: string; value: number; isAfter: boolean; improved?: boolean; worse?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-sm text-muted-foreground w-[110px] shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-foreground/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isAfter ? "bg-secondary" : "bg-primary"}`}
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
      <div className="flex items-center gap-1 min-w-[48px] justify-end">
        <span className={`text-sm font-bold ${isAfter ? "text-secondary" : "text-primary"}`}>{value}</span>
        <span className="text-sm text-muted-foreground">/10</span>
        {improved && <ArrowDown size={11} className="text-secondary" />}
        {worse && <ArrowUp size={11} className="text-destructive" />}
      </div>
    </div>
  );
}

function QuickCheckinCard({ hasCompletedSessions }: { hasCompletedSessions: boolean }) {
  const { user } = useAuthContext();
  const { checkin, loading, refresh } = useLatestCheckin();
  const [open, setOpen] = useState(false);

  const [painBefore, setPainBefore] = useState(3);
  const [painAfter, setPainAfter] = useState(3);
  const [fatigueBefore, setFatigueBefore] = useState(3);
  const [fatigueAfter, setFatigueAfter] = useState(3);
  const [saving, setSaving] = useState(false);

  const openModal = () => {
    if (checkin) {
      setPainBefore(checkin.pain_before);
      setPainAfter(checkin.pain_after);
      setFatigueBefore(checkin.fatigue_before);
      setFatigueAfter(checkin.fatigue_after);
    } else {
      setPainBefore(3); setPainAfter(3); setFatigueBefore(3); setFatigueAfter(3);
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("user_checkins").insert({
      user_id: user.id,
      source: "manual",
      pain_before: painBefore,
      pain_after: painAfter,
      fatigue_before: fatigueBefore,
      fatigue_after: fatigueAfter,
    });
    await refresh();
    setSaving(false);
    setOpen(false);
    toast({ title: "Check-in saved", duration: 2000 });
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-surface-warm p-6 flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const ago = checkin ? (() => {
    const diff = Date.now() - new Date(checkin.created_at).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  })() : null;

  return (
    <>
      <div className="rounded-2xl bg-surface-warm p-6 flex flex-col overflow-hidden">
        {!hasCompletedSessions ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-foreground mb-2">Quick Check-In</h3>
            <p className="text-sm text-muted-foreground mb-5 text-center max-w-[280px] leading-relaxed">
              After your first session, you'll see how your pain and energy levels respond over time. This is how Vinys learns to adapt.
            </p>
            <button
              onClick={() => {
                const el = document.querySelector('[data-session-card="first"]');
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className="text-sm text-primary font-semibold hover:text-primary/80 transition-colors"
            >
              Start Practice 01 →
            </button>
          </div>
        ) : !checkin ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-foreground mb-1">Quick Check-In</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-[220px]">
              How did your last session feel? Log your check-in to shape the next one.
            </p>
            <Button variant="hero" size="sm" className="rounded-full px-6" onClick={openModal}>
              Set check-in
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between shrink-0 mb-3">
              <h3 className="text-lg font-bold text-foreground">Quick Check-In</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={openModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors"
                  aria-label="Edit check-in"
                >
                  <Pencil size={14} />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 flex flex-col justify-start gap-0.5">
              <MetricRow label="Pain before" value={checkin.pain_before} isAfter={false} />
              <MetricRow
                label="Pain after" value={checkin.pain_after} isAfter={true}
                improved={checkin.pain_after < checkin.pain_before}
                worse={checkin.pain_after > checkin.pain_before}
              />
              <hr className="my-3 border-foreground/[0.06]" />
              <MetricRow label="Fatigue before" value={checkin.fatigue_before} isAfter={false} />
              <MetricRow
                label="Fatigue after" value={checkin.fatigue_after} isAfter={true}
                improved={checkin.fatigue_after < checkin.fatigue_before}
                worse={checkin.fatigue_after > checkin.fatigue_before}
              />
            </div>
          </>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Check-In</DialogTitle>
            <DialogDescription>Rate how you felt before and after your last session.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <CheckinSlider label="Pain before" value={painBefore} onChange={setPainBefore} minLabel="0 — None" maxLabel="10 — Severe" />
            <CheckinSlider label="Pain after" value={painAfter} onChange={setPainAfter} minLabel="0 — None" maxLabel="10 — Severe" />
            <CheckinSlider label="Fatigue before" value={fatigueBefore} onChange={setFatigueBefore} minLabel="0 — None" maxLabel="10 — Severe" />
            <CheckinSlider label="Fatigue after" value={fatigueAfter} onChange={setFatigueAfter} minLabel="0 — None" maxLabel="10 — Severe" />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-full">Cancel</Button>
            </DialogClose>
            <Button variant="hero" className="rounded-full" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : "Save & continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}