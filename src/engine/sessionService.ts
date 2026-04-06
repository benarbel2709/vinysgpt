// ─────────────────────────────────────────────────────────────────────────────
// src/engine/sessionService.ts
// Standalone Session Service — public API for the workout player.
// Calls E1 → E2 → E3 pipeline and returns a ready-to-play session.
// ─────────────────────────────────────────────────────────────────────────────

import type { UserProfile } from './engine1_suitability';
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
