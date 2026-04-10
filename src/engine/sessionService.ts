// ─────────────────────────────────────────────────────────────────────────────
// src/engine/sessionService.ts
// Standalone Session Service — public API for the workout player.
// Calls E1 → E2 → E3 pipeline and returns a ready-to-play session.
// ─────────────────────────────────────────────────────────────────────────────

import type { UserProfile, ActiveAreaProfile } from './engine1_suitability';
import type { BodyArea, Exercise } from '../data/exercises_v2';
import { findExercise, EXERCISES_V2 } from '../data/exercises_v2';
import type {
  SessionRequest,
  ProgressionStage,
  ExperienceLevel,
  SessionDuration,
  SelectedPose,
} from './engine2_session_builder';
import type {
  SequencedPose,
  SessionPhase,
  FullSessionResult,
} from './engine3_sequencer';
import { generateSession } from './engine3_sequencer';
import { PHASE_LABELS, PHASE_DESCRIPTIONS } from './engine3_sequencer';

// ─── Public types ────────────────────────────────────────────────────────────

/** Minimal input the UI needs to provide */
export interface SessionServiceInput {
  /** Active area profiles from diagnostic (E1 input) */
  userProfile: UserProfile;
  /** Progression stage: 1 = foundation, 2 = building, 3 = progressed */
  stage: ProgressionStage;
  /** User experience level */
  experienceLevel: ExperienceLevel;
  /** Desired session length in minutes */
  durationMinutes: SessionDuration;
  /** Override target pose count (optional) */
  targetSizeOverride?: number;
  /** Irritability score 0–5 from onboarding diagnostic */
  irritability?: number;
  /** Age group from onboarding */
  ageGroup?: string;
  /** Condition keys from profile — used for systemic flow scoring */
  conditions?: string[];
}

/** A single exercise ready for the workout player */
export interface PlayableExercise {
  id: string;
  name: string;
  phase: SessionPhase;
  phaseLabel: string;
  position: number;
  durationSeconds: number;
  clinicalScore: number;
  cautionFlag: boolean;
  cautionAreas: string[];
  activeModification: string;
  wasSimplified: boolean;
  poseFamily: string;
  movementCategory: string;
  videoId: string | null;
  clinicalRationale: string;
  userBenefit: string;
  /** Full V2 exercise reference for advanced display needs */
  exercise: Exercise;
}

/** Phase summary for UI section headers */
export interface PhaseBlock {
  phase: SessionPhase;
  label: string;
  description: string;
  exercises: PlayableExercise[];
}

/** Complete session output from the service */
export interface PlayableSession {
  exercises: PlayableExercise[];
  phases: PhaseBlock[];
  totalExercises: number;
  totalDurationSeconds: number;
  durationMinutes: SessionDuration;
  peakCount: number;
  cumulativeLoad: number;
  loadCeiling: number;
}

// ─── Area code mapping ───────────────────────────────────────────────────────

/** Maps diagnostic area codes to V2 BodyArea codes */
const DIAGNOSTIC_TO_V2_AREA: Record<string, BodyArea> = {
  LB: 'LB',
  HIP: 'HI',
  KNEE: 'KN',
  ANKLE: 'AN',
  NECK: 'NK',
  UBACK: 'UB',
  WRIST: 'WR',
  SHLDR: 'SH',
};

// ─── Profile mapping ─────────────────────────────────────────────────────────

/**
 * Maps the diagnostic result from VinysDiagnostic to the V2 UserProfile format.
 *
 * @param diagnosticResult - The result object from the diagnostic flow
 *   Expected shape: { area: "LB"|"HIP"|..., primary: "FL"|"EX"|..., secondary?: string, irritability?: number }
 * @returns UserProfile (ActiveAreaProfile[]) for Engine 1
 */
export function mapDiagnosticToUserProfile(diagnosticResult: {
  area: string;
  primary: string;
  secondary?: string | null;
  secondaryProfile?: string | null;
  originalArea?: string | null;
  crossoverTriggered?: boolean;
}): UserProfile {
  const profiles: ActiveAreaProfile[] = [];

  // Use user-confirmed secondaryProfile if available, else fall back to score-based secondary
  const effectiveSecondary = diagnosticResult.secondaryProfile !== undefined
    ? diagnosticResult.secondaryProfile
    : (diagnosticResult.secondary || null);

  // Primary area
  const v2Area = DIAGNOSTIC_TO_V2_AREA[diagnosticResult.area];
  if (v2Area) {
    profiles.push({
      area: v2Area,
      primary: diagnosticResult.primary,
      secondary: effectiveSecondary,
    });
  }

  // If crossover was triggered, add the original area as secondary
  if (diagnosticResult.crossoverTriggered && diagnosticResult.originalArea) {
    const origV2Area = DIAGNOSTIC_TO_V2_AREA[diagnosticResult.originalArea];
    if (origV2Area && origV2Area !== v2Area) {
      profiles.push({
        area: origV2Area,
        primary: diagnosticResult.primary,
        secondary: null,
      });
    }
  }

  return profiles;
}

/**
 * Derives progression stage from irritability level.
 * High irritability → stage 1 (foundation/gentle)
 * Low irritability → stage 3 (progressed)
 */
export function mapIrritabilityToStage(irritability: number): ProgressionStage {
  if (irritability >= 3) return 1;
  if (irritability >= 2) return 2;
  return 3;
}

/**
 * Maps the app's energy level to V2 experience level.
 */
export function mapEnergyToExperience(energyLevel: string): ExperienceLevel {
  if (energyLevel === 'low') return 'beginner';
  if (energyLevel === 'high') return 'advanced';
  return 'intermediate';
}

/**
 * Maps minutes to the nearest valid V2 SessionDuration.
 */
export function mapMinutesToDuration(minutes: number): SessionDuration {
  if (minutes <= 10) return 10;
  if (minutes <= 20) return 20;
  if (minutes <= 30) return 30;
  return 45;
}

/**
 * Convenience: build SessionServiceInput from the app profile + diagnostic result.
 */
export function buildSessionInput(profile: {
  diagnosticResult?: any;
  diagnosticArea?: string;
  diagnosticProfile?: string;
  diagnosticIrritability?: number;
  irritability?: number;
  energyLevel?: string;
  minutesPerSession?: number;
  ageGroup?: string;
  conditions?: string[];
}): SessionServiceInput {
  const diagnostic = profile.diagnosticResult || {
    area: profile.diagnosticArea || 'LB',
    primary: profile.diagnosticProfile || 'ST',
    secondary: null,
  };

  const irritability = profile.diagnosticIrritability ?? profile.irritability ?? 0;

  return {
    userProfile: mapDiagnosticToUserProfile(diagnostic),
    stage: mapIrritabilityToStage(irritability),
    experienceLevel: mapEnergyToExperience(profile.energyLevel || 'medium'),
    durationMinutes: mapMinutesToDuration(profile.minutesPerSession || 20),
    irritability,
    ageGroup: profile.ageGroup,
    conditions: profile.conditions,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapSequencedPose(sp: SequencedPose): PlayableExercise {
  const ex = sp.exercise;
  const [minDur, maxDur] = ex.duration;
  const durationSeconds = Math.round((minDur + maxDur) / 2);

  return {
    id: ex.id,
    name: ex.name,
    phase: sp.phase,
    phaseLabel: sp.phase_label,
    position: sp.position,
    durationSeconds,
    clinicalScore: sp.clinical_score,
    cautionFlag: sp.caution_flag,
    cautionAreas: sp.caution_areas,
    activeModification: sp.active_modification,
    wasSimplified: sp.was_simplified,
    poseFamily: ex.pose_family,
    movementCategory: ex.movement_category,
    videoId: ex.video_id,
    clinicalRationale: ex.clinical_rationale,
    userBenefit: ex.user_benefit || "",
    exercise: ex,
  };
}

const ALL_PHASES: SessionPhase[] = ['arrival', 'preparation', 'main_build', 'peak', 'closure'];

// ─── Service ─────────────────────────────────────────────────────────────────

/**
 * Generate a fully sequenced, playable session.
 * This is the single entry point the workout player should call.
 */
export function createSession(input: SessionServiceInput): PlayableSession {
  const request: SessionRequest = {
    user_profile: input.userProfile,
    stage: input.stage,
    experience_level: input.experienceLevel,
    duration_minutes: input.durationMinutes,
    target_size_override: input.targetSizeOverride,
    irritability: input.irritability,
    ageGroup: input.ageGroup,
    conditions: input.conditions,
  };

  const result: FullSessionResult = generateSession(request);
  const { e2, e3 } = result;

  const exercises = e3.sequence.map(mapSequencedPose);

  const phases: PhaseBlock[] = ALL_PHASES
    .map((phase) => ({
      phase,
      label: PHASE_LABELS[phase],
      description: PHASE_DESCRIPTIONS[phase],
      exercises: exercises.filter((ex) => ex.phase === phase),
    }))
    .filter((block) => block.exercises.length > 0);

  const totalDurationSeconds = exercises.reduce((sum, ex) => sum + ex.durationSeconds, 0);

  return {
    exercises,
    phases,
    totalExercises: exercises.length,
    totalDurationSeconds,
    durationMinutes: input.durationMinutes,
    peakCount: e3.peak_count,
    cumulativeLoad: e2.cumulative_load,
    loadCeiling: e2.load_ceiling,
  };
}

/**
 * Re-export phase metadata for UI consumption.
 */
export { PHASE_LABELS, PHASE_DESCRIPTIONS };
