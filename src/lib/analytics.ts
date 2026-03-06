import { supabase } from "@/integrations/supabase/client";

type EventName =
  | "onboarding_started"
  | "onboarding_step_completed"
  | "onboarding_completed"
  | "session_started"
  | "session_completed"
  | "checkin_completed"
  | "plan_generated"
  | "flare_mode_toggled"
  | "mode_switched"
  | "page_view";

export async function trackEvent(eventName: EventName, data: Record<string, unknown> = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await (supabase.from("analytics_events") as any).insert({
      user_id: user.id,
      event_name: eventName,
      event_data: data,
    });
  } catch {
    // Silently fail — analytics should never break the app
  }
}
