import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/context/AuthContext";

/** Monday 00:00 of the current week (local time), formatted as YYYY-MM-DD */
function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = day === 0 ? 6 : day - 1; // offset to Monday
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
  return monday.toISOString().slice(0, 10);
}

interface WeeklyProgress {
  completed: number;
  /** Target is ALWAYS sessionsPerWeek — single source of truth */
  target: number;
  loading: boolean;
  incrementCompleted: () => Promise<void>;
  resetCompleted: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Weekly progress hook.
 * `target` is always derived from the `sessionsPerWeek` parameter (profile).
 * The DB `target_count` column is kept in sync but never overrides the profile value.
 */
export function useWeeklyProgress(sessionsPerWeek: number): WeeklyProgress {
  const { user } = useAuthContext();
  const [completed, setCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  const weekStart = getCurrentWeekStart();

  // target is ALWAYS sessionsPerWeek — single source of truth
  const target = sessionsPerWeek;

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);

    const { data, error } = await supabase
      .from("weekly_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start_date", weekStart)
      .maybeSingle();

    if (error) { console.error("weekly_progress load", error); setLoading(false); return; }

    if (data) {
      setCompleted(data.completed_count);
      // Sync target_count in DB if it differs from profile
      if (data.target_count !== sessionsPerWeek) {
        await supabase
          .from("weekly_progress")
          .update({ target_count: sessionsPerWeek })
          .eq("user_id", user.id)
          .eq("week_start_date", weekStart);
      }
    } else {
      // No row for this week — create one
      const { error: insertErr } = await supabase
        .from("weekly_progress")
        .insert({ user_id: user.id, week_start_date: weekStart, completed_count: 0, target_count: sessionsPerWeek });
      if (insertErr) console.error("weekly_progress insert", insertErr);
      setCompleted(0);
    }
    setLoading(false);
  }, [user, weekStart, sessionsPerWeek]);

  useEffect(() => { load(); }, [load]);

  // When sessionsPerWeek changes, sync to DB
  useEffect(() => {
    if (!user) return;
    supabase
      .from("weekly_progress")
      .update({ target_count: sessionsPerWeek })
      .eq("user_id", user.id)
      .eq("week_start_date", weekStart)
      .then(({ error }) => { if (error) console.error("sync target", error); });
  }, [user, sessionsPerWeek, weekStart]);

  const incrementCompleted = useCallback(async () => {
    if (!user) return;
    const newVal = completed + 1;
    setCompleted(newVal);

    await supabase
      .from("weekly_progress")
      .update({ completed_count: newVal })
      .eq("user_id", user.id)
      .eq("week_start_date", weekStart);
  }, [user, completed, weekStart]);

  const resetCompleted = useCallback(async () => {
    if (!user) return;
    setCompleted(0);

    await supabase
      .from("weekly_progress")
      .update({ completed_count: 0 })
      .eq("user_id", user.id)
      .eq("week_start_date", weekStart);
  }, [user, weekStart]);

  return { completed, target, loading, incrementCompleted, resetCompleted, refresh: load };
}
