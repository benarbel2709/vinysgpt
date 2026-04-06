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

export interface Profile {
  conditions: ConditionKey[];
  sessionsPerWeek: number;
  minutesPerSession: number;
  flareToday: boolean;
  practiceTime: PracticeTime;
  energyLevel: EnergyLevel;
  closingPreference: "savasana" | "meditation" | "body_rest";
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
  userProfile?: string[];          // area codes e.g. ['LB', 'HI']
  stage?: number;                  // progression stage (starts at 1)
  session_count?: number;          // total sessions completed
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  sessionDuration?: number;        // minutes per session
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
  },
  assessments: [],
  exerciseLibrary: [],
  currentPlan: null,
  checkins: [],
  progress: {
    lastSessionId: null,
  },
};

// Re-export from constants for backward compat
export { CONDITIONS_LIST, RED_FLAGS } from "@/constants/conditions";
export type { ConditionKey, ExerciseCategory } from "@/constants/conditions";
