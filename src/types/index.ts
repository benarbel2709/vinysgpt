import type { ConditionKey, ExerciseCategory, EnergyLevel, PracticeTime, FlareStatus, HelpedMost } from "@/constants/conditions";

export interface Exercise {
  id: string;
  name_he: string;
  category: ExerciseCategory;
  why_he: string;
  steps_he: string[];
  safety_he: string;
  minutes_default: number;
  lottie_url_normal: string | null;
  lottie_url_easier: string | null;
  lottie_url_flare: string | null;
  equipment: string[];
}

export interface Session {
  id: string;
  dayIndex: number;
  title_he: string;
  mode: "normal" | "easier" | "flare";
  durationMinutes: number;
  exerciseIds: string[];
  status: "planned" | "done";
}

export interface Checkin {
  id: string;
  sessionId: string;
  createdAt: string;
  painBefore: number;
  painAfter: number;
  fatigueBefore: number;
  fatigueAfter: number;
  tooMuch: boolean;
  helpedMost: HelpedMost;
}

export interface FibroAssessmentData {
  pain: number;
  fatigue: number;
  sleep: number;
  flareNow: FlareStatus;
  painAreas: string[];
  triggers: string[];
  gentleMovementEffect: string;
  touchSensitivity: number;
  dayType: string;
  otherActivities: string[];
  equipment: string[];
  restrictions: string;
  redFlags: string[];
}

export interface GenericAssessmentData {
  mainIssue: string;
  pain: number;
  limits: string;
  equipment: string[];
  redFlags: string[];
}

export interface Assessment {
  id: string;
  createdAt: string;
  type: "fibro" | "generic";
  data: FibroAssessmentData | GenericAssessmentData;
}

export interface SystemicProfile {
  /** Overall severity / impact rating, 1 (mild) – 5 (severe). */
  severity: number;
  /** Multi-select trigger tags chosen by the user. */
  triggers: string[];
  /** How the user typically recovers from exertion. */
  recovery_pattern: "fast" | "moderate" | "slow" | "pem";
  /** Self-reported state right now. */
  today_state: "good" | "baseline" | "low" | "flare";
  /** Pre-session red flags (multi-select). Empty array means none. */
  today_red_flags: string[];
  /** Rolling history of intensity tiers chosen by the engine. */
  tier_history: number[];
  /** Post-Exertional Malaise state, when applicable. */
  pem_state: "none" | "mild" | "moderate" | "severe";
}

export interface Profile {
  conditions: ConditionKey[];
  sessionsPerWeek: number;
  minutesPerSession: number;
  /** @deprecated v2.1 — superseded by systemic.today_state === "flare". */
  flareToday: boolean;
  practiceTime: PracticeTime;
  /** @deprecated v2.1 — superseded by systemic.today_state. */
  energyLevel: EnergyLevel;
  closingPreference: "savasana" | "meditation" | "body_rest";
  /** Number of fast-track (Starter) sessions completed since onboarding. */
  fast_track_session_count?: number;
  /** Unified systemic onboarding block (v2.1). */
  systemic?: SystemicProfile;
  /** "quick" = Starter / fast-track, "full" = full systemic onboarding. */
  assessment_type?: "quick" | "full";
  /** Confidence in the captured profile. */
  confidence_level?: "low" | "medium" | "high";
  irritability?: number;
  acuity?: "high" | "medium" | "low" | "unknown";
  mode?: "normal" | "easier" | "flare";
  redFlagsPassed?: boolean;
  restrictions?: string[];
  availableEquipment?: string[];
  movementProfile?: string;
  sensitivity?: string;
  confidence?: string;
  area?: string | null;
  primary_profile?: string | null;
  secondary_profile?: string | null;
  diagnosticResult?: any;
  diagnosticArea?: string;
  diagnosticProfile?: string;
  diagnosticIrritability?: number;
  ageGroup?: string;
}

export interface CurrentPlan {
  id: string;
  assessmentId: string;
  weekStartISO: string;
  sessions: Session[];
}

export interface AppState {
  disclaimerAccepted: boolean;
  onboardingCompleted: boolean;
  profile: Profile;
  assessments: Assessment[];
  exerciseLibrary: Exercise[];
  currentPlan: CurrentPlan | null;
  checkins: Checkin[];
  progress: {
    lastSessionId: string | null;
  };
  /** V2 engine fields */
  userProfile: string[];
  stage: number;
  session_count: number;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  sessionDuration: number;
  justAdvancedStage: boolean;
  hasCompletedOnboarding: boolean;
  /** Quick assessment data (dual-track onboarding) */
  quickAssessment?: {
    assessment_type: "quick";
    confidence_level: "low";
    primary_area: string;
    movement_profile: string;
    irritability: number;
    goal_preference: string;
    safety_flags: string[];
  } | null;
  quickSessionCount?: number;
}

export const DEFAULT_APP_STATE: AppState = {
  disclaimerAccepted: false,
  onboardingCompleted: false,
  profile: {
    conditions: [],
    sessionsPerWeek: 3,
    minutesPerSession: 20,
    flareToday: false,
    practiceTime: "afternoon",
    energyLevel: "medium",
    closingPreference: "savasana",
    fast_track_session_count: 0,
  },
  assessments: [],
  exerciseLibrary: [],
  currentPlan: null,
  checkins: [],
  progress: {
    lastSessionId: null,
  },
  userProfile: [],
  stage: 1,
  session_count: 0,
  experienceLevel: 'intermediate',
  sessionDuration: 20,
  justAdvancedStage: false,
  hasCompletedOnboarding: false,
  quickAssessment: null,
  quickSessionCount: 0,
};

// Re-export from constants for backward compat
export { CONDITIONS_LIST, RED_FLAGS } from "@/constants/conditions";
export type { ConditionKey, ExerciseCategory } from "@/constants/conditions";
