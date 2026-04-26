// src/engine/engine2_session_builder.ts — Engine 2: Session Builder
import type { Exercise, MovementCategory } from '../data/exercises_v2';
import { EXERCISES_V2, findExercise } from '../data/exercises_v2';
import type { SuitedPose, UserProfile } from './engine1_suitability';
import { runEngine1, filterByVarRankCeiling } from './engine1_suitability';
import { CONDITION_PROFILES, LEGACY_CONDITION_MAP } from './conditions';
import type { ConditionIdV2, ConditionProfileV2 } from './types';
import type { SystemicProfile, Tier } from '@/types';
import { deriveTier, TIER_TO_MODEL, MODEL_PARAMS, applyTriggerRefinements, type RefinedModelParams } from './tier';

export type ProgressionStage = 1 | 2 | 3;
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type SessionDuration = 10 | 20 | 30 | 45;

export interface QuickModifiers {
  max_var_rank_reduction: number;
  max_peak: number;
  caution_penalty: number;
  diversity_weight: number;
  /** When true, boost REST/MOBILITY categories for low-info profiles */
  low_info_fallback?: boolean;
}

export interface SessionRequest {
  user_profile: UserProfile;
  stage: ProgressionStage;
  experience_level: ExperienceLevel;
  duration_minutes: SessionDuration;
  target_size_override?: number;
  /** Irritability score 0–5 from onboarding diagnostic */
  irritability?: number;
  /** Age group from onboarding */
  ageGroup?: string;
  /** Condition keys — drives scoring for systemic flows (empty user_profile) */
  conditions?: string[];
  /** Quick-profile modifiers — conservative session tuning */
  quick_modifiers?: QuickModifiers;
  /** Safety flags from quick assessment (PREG, INJURY, RADICULAR, POST_SURGERY) */
  safety_flags?: string[];
  /** Systemic onboarding block (v2.1). When present + user_profile empty → tier-driven build. */
  systemic?: SystemicProfile | null;
}

/** Result side-channel: tier derived for this systemic build (consumed by caller for tier_history). */
export interface SystemicBuildInfo {
  tier: Tier;
  model: 'restore' | 'gentle' | 'build';
  refined: RefinedModelParams;
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
  /** Present only for tier-driven systemic builds (v2.1). */
  systemic_build?: SystemicBuildInfo;
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
/** Goal preference must not dominate more than 30% of session composition */
const GOAL_PREFERENCE_WEIGHT_CAP = 0.3;

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

// ── Systemic condition scoring (for flows without body-area diagnostic) ──────

interface SystemicModifiers {
  loadCeilingMultiplier: number;
  maxComplexity: number;
  preferredCategories: Set<MovementCategory>;
  penalizedCategories: Set<MovementCategory>;
  preferLowVarRank: boolean;
}

/**
 * Maps condition keys to engine-level modifiers using V2 exercise properties.
 * Merges multiple conditions — takes the most conservative value for each modifier.
 */
function resolveSystemicModifiers(conditions: string[]): SystemicModifiers {
  const PRESETS: Record<string, Partial<SystemicModifiers>> = {
    menopause:              { loadCeilingMultiplier: 0.85, maxComplexity: 3, preferLowVarRank: true },
    perimenopause:          { loadCeilingMultiplier: 0.85, maxComplexity: 3, preferLowVarRank: true },
    pcos:                   { loadCeilingMultiplier: 0.85, maxComplexity: 3, preferLowVarRank: true },
    hormonal_fatigue:       { loadCeilingMultiplier: 0.85, maxComplexity: 3, preferLowVarRank: true },
    endometriosis:          { loadCeilingMultiplier: 0.85, maxComplexity: 3, preferLowVarRank: true },
    long_covid:             { loadCeilingMultiplier: 0.70, maxComplexity: 2, preferLowVarRank: true },
    post_illness:           { loadCeilingMultiplier: 0.75, maxComplexity: 2, preferLowVarRank: true },
    fibromyalgia:           { loadCeilingMultiplier: 0.75, maxComplexity: 3, preferLowVarRank: true },
    chronic_fatigue_syndrome: { loadCeilingMultiplier: 0.70, maxComplexity: 2, preferLowVarRank: true },
    stress_anxiety:         { loadCeilingMultiplier: 0.90, maxComplexity: 3, preferLowVarRank: false },
    burnout:                { loadCeilingMultiplier: 0.85, maxComplexity: 3, preferLowVarRank: true },
  };

  const preferred: Set<MovementCategory> = new Set(['Restorative', 'Breath']);
  let loadMul = 1;
  let maxComp = 4;
  let preferLow = false;

  for (const cond of conditions) {
    const preset = PRESETS[cond];
    if (!preset) continue;
    if (preset.loadCeilingMultiplier != null) loadMul = Math.min(loadMul, preset.loadCeilingMultiplier);
    if (preset.maxComplexity != null) maxComp = Math.min(maxComp, preset.maxComplexity);
    if (preset.preferLowVarRank) preferLow = true;
  }

  return {
    loadCeilingMultiplier: loadMul,
    maxComplexity: maxComp as 1 | 2 | 3 | 4,
    preferredCategories: preferred,
    penalizedCategories: new Set(['Upper Limb Weight Bearing']),
    preferLowVarRank: preferLow,
  };
}

/**
 * Re-scores the E1 pool for systemic conditions:
 * - Filters out exercises exceeding complexity cap
 * - Boosts preferred categories (Restorative, Breath) by +2
 * - Penalizes high-demand categories by -1
 * - Sorts by adjusted score, then var_rank ascending
 */
function applySystemicScoring(pool: SuitedPose[], mods: SystemicModifiers): SuitedPose[] {
  const rescored = pool
    .filter(p => p.exercise.complexity <= mods.maxComplexity)
    .map(p => {
      let bonus = 0;
      if (mods.preferredCategories.has(p.exercise.movement_category)) bonus += 2;
      if (mods.penalizedCategories.has(p.exercise.movement_category)) bonus -= 1;
      return { ...p, clinical_score: p.clinical_score + bonus };
    });

  rescored.sort((a, b) => {
    if (b.clinical_score !== a.clinical_score) return b.clinical_score - a.clinical_score;
    if (mods.preferLowVarRank) return ((a.exercise.var_rank ?? 0) - (b.exercise.var_rank ?? 0));
    return (a.var_rank ?? 99) - (b.var_rank ?? 99);
  });

  return rescored;
}

function resolveConditionProfiles(conditions: string[]): ConditionProfileV2[] {
  return conditions
    .map((condition) => {
      const mapped = (LEGACY_CONDITION_MAP as Record<string, ConditionIdV2 | undefined>)[condition] ?? (condition as ConditionIdV2);
      return CONDITION_PROFILES[mapped];
    })
    .filter((profile): profile is ConditionProfileV2 => Boolean(profile));
}

function isSpinalFlexionPose(exercise: Exercise): boolean {
  // Per spec: filter strictly on the canonical movement_direction enum.
  // The osteoporotic spine must avoid ANY pose tagged as Flexion-direction
  // (forward folds, knees-to-chest, child's pose, lateral folds, seated folds).
  return exercise.movement_direction === 'Flexion';
}

function isHighImpactPose(exercise: Exercise): boolean {
  const text = `${exercise.name} ${exercise.pose_family} ${exercise.load_type} ${exercise.clinical_rationale} ${exercise.user_benefit}`.toLowerCase();
  return ['highimpact', 'high impact', 'jump', 'jumping', 'hop', 'hopping', 'plyometric', 'plyometrics'].some((term) => text.includes(term));
}

function applyConditionSafetyFilters(pool: SuitedPose[], conditions: string[]): SuitedPose[] {
  const profiles = resolveConditionProfiles(conditions);
  if (profiles.length === 0) return pool;

  return pool.filter(({ exercise }) => {
    for (const profile of profiles) {
      const contra = profile.contraRules;
      if (contra.avoidSpinalFlexion && isSpinalFlexionPose(exercise)) return false;
      if (contra.avoidHighImpact && isHighImpactPose(exercise)) return false;
      if (contra.excludedPoseSets?.includes('highImpact') && isHighImpactPose(exercise)) return false;
    }
    return true;
  });
}

export function buildSession(request: SessionRequest): E2Result {
  const { user_profile, stage, experience_level, duration_minutes, target_size_override, irritability = 0, ageGroup, conditions = [], quick_modifiers, safety_flags = [], systemic = null } = request;
  let target       = targetSize(duration_minutes, target_size_override);
  let vr_ceiling   = VAR_RANK_CEILING[stage][experience_level];
  let load_ceil    = target * LOAD_CEILING_MULTIPLIER[experience_level];
  let effectiveMaxPeak = quick_modifiers?.max_peak ?? Infinity;

  // ── Quick-profile var_rank reduction ──────────────
  if (quick_modifiers) {
    vr_ceiling = Math.max(1, vr_ceiling - quick_modifiers.max_var_rank_reduction);
  }

  // ── Safety flags adjustments ──────────────
  if (safety_flags.includes('RADICULAR')) {
    effectiveMaxPeak = Math.max(0, effectiveMaxPeak - 1);
    vr_ceiling = Math.max(1, Math.floor(vr_ceiling * 0.9));
  }
  if (safety_flags.includes('PREG')) {
    vr_ceiling = Math.max(1, Math.floor(vr_ceiling * 0.9));
  }
  if (safety_flags.includes('POST_SURGERY')) {
    effectiveMaxPeak = Math.max(0, effectiveMaxPeak - 1);
    vr_ceiling = Math.max(1, Math.floor(vr_ceiling * 0.9));
  }
  if (safety_flags.includes('INJURY')) {
    vr_ceiling = Math.max(1, Math.floor(vr_ceiling * 0.9));
  }

  // ── Low-info fallback: boost REST/MOBILITY ──────────────
  const isLowInfoFallback = quick_modifiers?.low_info_fallback === true;

  // ── Irritability adjustments (applied as final layer) ──────────────
  const useIrritabilityBias = irritability >= 3;
  if (useIrritabilityBias) {
    load_ceil = Math.floor(load_ceil * 0.75);
  }
  if (irritability >= 4) {
    target = Math.max(3, target - 1);
  }

  // ── Secondary profile conservatism ──────────────
  const hasSecondaryProfile = user_profile.some(ap => ap.secondary != null);
  if (hasSecondaryProfile) {
    load_ceil = Math.floor(load_ceil * 0.85);
  }

  // ── Age group adjustments (stack with other modifiers) ──────────────
  const isOlderAdult = ageGroup === '60_69' || ageGroup === '70_plus';
  if (ageGroup === '70_plus') {
    load_ceil = Math.floor(load_ceil * 0.80);
  } else if (ageGroup === '60_69') {
    load_ceil = Math.floor(load_ceil * 0.90);
  }

  // ── Systemic condition modifiers (only when no body-area profile) ──
  const isSystemicFlow = user_profile.length === 0 && conditions.length > 0;
  const systemicMods = isSystemicFlow ? resolveSystemicModifiers(conditions) : null;
  if (systemicMods) {
    load_ceil = Math.floor(load_ceil * systemicMods.loadCeilingMultiplier);
  }

  // ── v2.1 Tier derivation (systemic flow with full systemic profile) ──
  let systemicBuild: SystemicBuildInfo | undefined;
  if (isSystemicFlow && systemic) {
    const tier = deriveTier(systemic);
    const model = TIER_TO_MODEL[tier];
    const baseModel = MODEL_PARAMS[model];
    const refined = applyTriggerRefinements(baseModel, systemic.triggers);
    systemicBuild = { tier, model, refined };
    // Apply tier load ceiling as a multiplicative cap on existing load_ceil.
    load_ceil = Math.max(1, Math.floor(load_ceil * refined.loadCeiling));
    // Apply density max as a soft cap on target size relative to duration.
    target = Math.max(3, Math.min(target, Math.ceil(target * refined.densityMax + 1)));
  }

  const pool_size  = target * 3;

  const e1 = runEngine1(user_profile);

  // For systemic flows, re-score the pool using condition-aware heuristics
  let candidate_pool = filterByVarRankCeiling(e1.eligible_pool, vr_ceiling);
  if (isSystemicFlow && systemicMods) {
    candidate_pool = applySystemicScoring(candidate_pool, systemicMods);
    candidate_pool = applyConditionSafetyFilters(candidate_pool, conditions);
  }

  const guaranteedPool = isSystemicFlow ? candidate_pool : e1.eligible_pool;

  // ── PREG: exclude prone exercises ──────────────
  if (safety_flags.includes('PREG')) {
    candidate_pool = candidate_pool.filter(p => {
      const name = p.exercise.name.toLowerCase();
      const family = p.exercise.pose_family.toLowerCase();
      return !name.includes('prone') && !family.includes('prone');
    });
  }

  // ── RADICULAR: boost stabilisation/control poses ──────────────
  if (safety_flags.includes('RADICULAR')) {
    candidate_pool = candidate_pool.map(p => {
      const hasControl = p.exercise.goal_tag.some(t => t.toLowerCase().includes('control') || t.toLowerCase().includes('stability'));
      const cat = p.exercise.movement_category;
      const isStabilisation = cat === 'Stability / Core' || cat === 'Balance';
      if (hasControl || isStabilisation) {
        return { ...p, clinical_score: Math.round(p.clinical_score * 1.5 * 100) / 100 };
      }
      return p;
    });
    // Re-sort after boost
    candidate_pool.sort((a, b) => b.clinical_score !== a.clinical_score ? b.clinical_score - a.clinical_score : (a.var_rank ?? 99) - (b.var_rank ?? 99));
  }

  // ── Low-info fallback: boost Restorative + Hip Mobility (mobility proxy) ──
  if (isLowInfoFallback) {
    candidate_pool = candidate_pool.map(p => {
      const cat = p.exercise.movement_category;
      if (cat === 'Restorative' || cat === 'Hip Mobility' || cat === 'Breath') {
        return { ...p, clinical_score: p.clinical_score + 2 };
      }
      return p;
    });
    candidate_pool.sort((a, b) => b.clinical_score !== a.clinical_score ? b.clinical_score - a.clinical_score : (a.var_rank ?? 99) - (b.var_rank ?? 99));
  }

  // ── Goal preference cap: limit goal-preference-aligned poses to 30% of session ──
  const goalPreferenceMaxCount = Math.max(1, Math.floor(target * GOAL_PREFERENCE_WEIGHT_CAP));

  candidate_pool = candidate_pool.slice(0, pool_size);

  // When irritability >= 3 OR older adult, bias toward simpler exercises
  if (useIrritabilityBias || isOlderAdult) {
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
    const rp = findGuaranteedPose('Restorative', guaranteedPool, selected_ids);
    if (rp) {
      const sp: SelectedPose = { exercise: rp.exercise, clinical_score: rp.clinical_score, caution_flag: rp.caution_flag, caution_areas: rp.caution_areas, active_modification: '', was_simplified: false };
      selected.push(sp); selected_ids.add(rp.exercise.id); incrementDiversity(diversity, sp);
    }
  }
  if (diversity.brth_count === 0) {
    const bp = findGuaranteedPose('Breath', guaranteedPool, selected_ids);
    if (bp) {
      const sp: SelectedPose = { exercise: bp.exercise, clinical_score: bp.clinical_score, caution_flag: bp.caution_flag, caution_areas: bp.caution_areas, active_modification: '', was_simplified: false };
      selected.push(sp); selected_ids.add(bp.exercise.id); incrementDiversity(diversity, sp);
    }
  }

  // ── Peak cap (quick_modifiers + safety_flags combined) ──────────────
  if (effectiveMaxPeak < Infinity) {
    const peakPoses = selected.filter(sp => (sp.exercise.var_rank ?? 0) >= 3);
    if (peakPoses.length > effectiveMaxPeak) {
      peakPoses.sort((a, b) => a.clinical_score - b.clinical_score);
      const toRemove = peakPoses.slice(0, peakPoses.length - Math.max(0, effectiveMaxPeak));
      const removeIds = new Set(toRemove.map(sp => sp.exercise.id));
      const filtered = selected.filter(sp => !removeIds.has(sp.exercise.id));
      selected.length = 0;
      selected.push(...filtered);
    }
  }

  return {
    selected_poses: selected, session_size: selected.length, cumulative_load: diversity.cumulative_load,
    load_ceiling: load_ceil, var_rank_ceiling: vr_ceiling,
    diversity_stats: { area_counts: diversity.area_counts, pose_family_counts: diversity.pose_family_counts, movement_dir_counts: diversity.movement_dir_counts, rest_count: diversity.rest_count, brth_count: diversity.brth_count },
  };
}
