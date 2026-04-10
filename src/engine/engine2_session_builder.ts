// src/engine/engine2_session_builder.ts — Engine 2: Session Builder
import type { Exercise, MovementCategory } from '../data/exercises_v2';
import { EXERCISES_V2, findExercise } from '../data/exercises_v2';
import type { SuitedPose, UserProfile } from './engine1_suitability';
import { runEngine1, filterByVarRankCeiling } from './engine1_suitability';

export type ProgressionStage = 1 | 2 | 3;
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type SessionDuration = 10 | 20 | 30 | 45;

export interface SessionRequest {
  user_profile: UserProfile;
  stage: ProgressionStage;
  experience_level: ExperienceLevel;
  duration_minutes: SessionDuration;
  target_size_override?: number;
  /** Irritability score 0–5 from onboarding diagnostic */
  irritability?: number;
}

export interface SelectedPose {
  exercise: Exercise;
  clinical_score: number;
  caution_flag: boolean;
  caution_areas: string[];
  active_modification: string;
  was_simplified: boolean;
  simplification_trigger?: 1 | 2 | 3 | 4;
}

export interface E2Result {
  selected_poses: SelectedPose[];
  session_size: number;
  cumulative_load: number;
  load_ceiling: number;
  var_rank_ceiling: number;
  diversity_stats: DiversityStats;
}

interface DiversityStats {
  area_counts: Record<string, number>;
  pose_family_counts: Record<string, number>;
  movement_dir_counts: Record<string, number>;
  rest_count: number;
  brth_count: number;
}

const SESSION_SIZES: Record<SessionDuration, [number, number]> = {
  10: [4, 5], 20: [6, 8], 30: [8, 10], 45: [10, 12],
};

function targetSize(duration: SessionDuration, override?: number): number {
  if (override) return override;
  const [lo, hi] = SESSION_SIZES[duration];
  return Math.floor((lo + hi) / 2);
}

const VAR_RANK_CEILING: Record<ProgressionStage, Record<ExperienceLevel, number>> = {
  1: { beginner: 3, intermediate: 3, advanced: 3 },
  2: { beginner: 4, intermediate: 4, advanced: 4 },
  3: { beginner: 5, intermediate: 6, advanced: 6 },
};

const LOAD_CEILING_MULTIPLIER: Record<ExperienceLevel, number> = {
  beginner: 2.5, intermediate: 3.5, advanced: 4.5,
};

const MAX_SAME_POSE_FAMILY  = 2;
const MAX_SAME_MOVEMENT_DIR = 2;
const AREA_DOMINANCE_LIMIT  = 0.40;
const CLINICAL_OVERRIDE_SCORE = 3;

interface DiversityState {
  area_counts: Record<string, number>;
  pose_family_counts: Record<string, number>;
  movement_dir_counts: Record<string, number>;
  rest_count: number;
  brth_count: number;
  cumulative_load: number;
}

function emptyDiversity(): DiversityState {
  return { area_counts: {}, pose_family_counts: {}, movement_dir_counts: {}, rest_count: 0, brth_count: 0, cumulative_load: 0 };
}

function incrementDiversity(state: DiversityState, pose: SelectedPose): void {
  const ex = pose.exercise;
  for (const area of ex.areas) state.area_counts[area] = (state.area_counts[area] || 0) + 1;
  state.pose_family_counts[ex.pose_family] = (state.pose_family_counts[ex.pose_family] || 0) + 1;
  state.movement_dir_counts[ex.movement_direction] = (state.movement_dir_counts[ex.movement_direction] || 0) + 1;
  if (ex.movement_category === 'Restorative') state.rest_count++;
  if (ex.movement_category === 'Breath')      state.brth_count++;
  if (ex.var_rank !== null) state.cumulative_load += ex.var_rank;
}

function checkDiversity(
  candidate: SuitedPose, state: DiversityState, target_size: number,
  clinical_score: number, active_user_areas: Set<string>
): { allowed: boolean; clinical_override: boolean } {
  const ex = candidate.exercise;
  const high_clinical = clinical_score >= CLINICAL_OVERRIDE_SCORE;
  if (active_user_areas.size >= 2) {
    for (const area of ex.areas) {
      if (!active_user_areas.has(area)) continue;
      if ((( state.area_counts[area] || 0) + 1) / target_size > AREA_DOMINANCE_LIMIT)
        return { allowed: false, clinical_override: false };
    }
  }
  if (high_clinical) return { allowed: true, clinical_override: true };
  if ((state.pose_family_counts[ex.pose_family] || 0) >= MAX_SAME_POSE_FAMILY)
    return { allowed: false, clinical_override: false };
  if ((state.movement_dir_counts[ex.movement_direction] || 0) >= MAX_SAME_MOVEMENT_DIR)
    return { allowed: false, clinical_override: false };
  return { allowed: true, clinical_override: false };
}

function findSimplerAlternative(candidate: SuitedPose, pool: SuitedPose[]): SuitedPose | null {
  const alt = candidate.exercise.simpler_alternative;
  if (!alt) return null;
  return pool.find(p => p.exercise.name.toLowerCase() === alt.toLowerCase() ||
    p.exercise.name.toLowerCase().includes(alt.toLowerCase())) || null;
}

function applySimplerAlternative(
  candidate: SuitedPose, pool: SuitedPose[], vr_ceiling: number, load_ceiling: number, current_load: number
): { use: SuitedPose | null; was_simplified: boolean; trigger?: 1 | 2 | 3 | 4 } {
  const ex = candidate.exercise;
  if (candidate.caution_flag && candidate.has_modification_gap) {
    const alt = findSimplerAlternative(candidate, pool);
    return alt ? { use: alt, was_simplified: true, trigger: 3 } : { use: null, was_simplified: false, trigger: 3 };
  }
  if (ex.var_rank !== null && ex.var_rank > vr_ceiling) {
    const alt = findSimplerAlternative(candidate, pool);
    return alt ? { use: alt, was_simplified: true, trigger: 1 } : { use: null, was_simplified: false, trigger: 1 };
  }
  if (ex.var_rank !== null && (current_load + ex.var_rank) > load_ceiling) {
    const alt = findSimplerAlternative(candidate, pool);
    return alt ? { use: alt, was_simplified: true, trigger: 4 } : { use: null, was_simplified: false, trigger: 4 };
  }
  if (candidate.caution_flag) {
    const alt = findSimplerAlternative(candidate, pool);
    if (alt) return { use: alt, was_simplified: true, trigger: 2 };
  }
  return { use: candidate, was_simplified: false };
}

function findGuaranteedPose(category: MovementCategory, pool: SuitedPose[], selected_ids: Set<string>): SuitedPose | null {
  return pool.find(p => p.exercise.movement_category === category && !selected_ids.has(p.exercise.id) && !p.has_modification_gap) || null;
}

export function buildSession(request: SessionRequest): E2Result {
  const { user_profile, stage, experience_level, duration_minutes, target_size_override, irritability = 0 } = request;
  let target       = targetSize(duration_minutes, target_size_override);
  const vr_ceiling = VAR_RANK_CEILING[stage][experience_level];
  let load_ceil    = target * LOAD_CEILING_MULTIPLIER[experience_level];

  // ── Irritability adjustments (applied as final layer) ──────────────
  if (irritability >= 3) {
    load_ceil = Math.floor(load_ceil * 0.75); // reduce load ceiling by 25%
  }
  if (irritability >= 4) {
    target = Math.max(3, target - 1); // remove one exercise from session
  }

  // ── Secondary profile conservatism ──────────────
  const hasSecondaryProfile = user_profile.some(ap => ap.secondary != null);
  if (hasSecondaryProfile) {
    load_ceil = Math.floor(load_ceil * 0.85); // 15% more conservative load ceiling
  }

  const pool_size  = target * 3;

  const e1 = runEngine1(user_profile);
  // When irritability >= 3, bias toward simpler exercises by preferring lower var_rank
  let candidate_pool = filterByVarRankCeiling(e1.eligible_pool, vr_ceiling).slice(0, pool_size);
  if (irritability >= 3) {
    candidate_pool.sort((a, b) => ((a.exercise.var_rank ?? 0) - (b.exercise.var_rank ?? 0)) || (b.clinical_score - a.clinical_score));
  }

  const selected: SelectedPose[] = [];
  const selected_ids = new Set<string>();
  const diversity = emptyDiversity();
  const active_user_areas = new Set(user_profile.map(ap => ap.area));

  for (const candidate of candidate_pool) {
    if (selected.length >= target) break;
    const ex = candidate.exercise;
    if (selected_ids.has(ex.id)) continue;
    const { use, was_simplified, trigger } = applySimplerAlternative(candidate, candidate_pool, vr_ceiling, load_ceil, diversity.cumulative_load);
    if (!use) continue;
    if (selected_ids.has(use.exercise.id)) continue;
    const div_check = checkDiversity(use, diversity, target, use.clinical_score, active_user_areas);
    if (!div_check.allowed) continue;
    const active_modification = use.caution_flag ? Object.values(use.modifications_available).join(' | ') : '';
    const sp: SelectedPose = {
      exercise: use.exercise, clinical_score: use.clinical_score, caution_flag: use.caution_flag,
      caution_areas: use.caution_areas, active_modification, was_simplified, simplification_trigger: trigger,
    };
    selected.push(sp);
    selected_ids.add(use.exercise.id);
    incrementDiversity(diversity, sp);
  }

  if (diversity.rest_count === 0) {
    const rp = findGuaranteedPose('Restorative', e1.eligible_pool, selected_ids);
    if (rp) {
      const sp: SelectedPose = { exercise: rp.exercise, clinical_score: rp.clinical_score, caution_flag: rp.caution_flag, caution_areas: rp.caution_areas, active_modification: '', was_simplified: false };
      selected.push(sp); selected_ids.add(rp.exercise.id); incrementDiversity(diversity, sp);
    }
  }
  if (diversity.brth_count === 0) {
    const bp = findGuaranteedPose('Breath', e1.eligible_pool, selected_ids);
    if (bp) {
      const sp: SelectedPose = { exercise: bp.exercise, clinical_score: bp.clinical_score, caution_flag: bp.caution_flag, caution_areas: bp.caution_areas, active_modification: '', was_simplified: false };
      selected.push(sp); selected_ids.add(bp.exercise.id); incrementDiversity(diversity, sp);
    }
  }

  return {
    selected_poses: selected, session_size: selected.length, cumulative_load: diversity.cumulative_load,
    load_ceiling: load_ceil, var_rank_ceiling: vr_ceiling,
    diversity_stats: { area_counts: diversity.area_counts, pose_family_counts: diversity.pose_family_counts, movement_dir_counts: diversity.movement_dir_counts, rest_count: diversity.rest_count, brth_count: diversity.brth_count },
  };
}
