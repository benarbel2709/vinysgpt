/**
 * Vinys v2.1.2 — Build-time validators.
 * Validates exercise catalog and condition profiles for schema compliance.
 * Sections 2, 3, 5, 8 of audit patch.
 */

import type { ExerciseV2, RelevanceKeyV2, EquipmentV2 } from "./types";
import { RELEVANCE_KEYS, normalizeTitleKey } from "./types";
import { CONDITION_PROFILES } from "./conditions";

export interface ValidationError {
  exerciseId?: string;
  field: string;
  message: string;
  severity: "error" | "warning";
}

// ═══════════════════════════════════
// EQUIPMENT KEYWORD VALIDATION (Section 5)
// ═══════════════════════════════════

const EQUIPMENT_KEYWORDS: Record<string, EquipmentV2> = {
  chair: "chair",
  wall: "wall",
  strap: "strap",
  bolster: "bolster",
  block: "block",
  band: "band",
};

function validateEquipmentKeywords(e: ExerciseV2): ValidationError[] {
  const errors: ValidationError[] = [];
  const ctx = { exerciseId: e.id };
  const text = [...e.instructions, e.title, e.safety, e.cue].join(" ").toLowerCase();
  const equipTypes = new Set<string>(e.equipmentDetailed.map(eq => eq.type));
  const equipFlat = new Set<string>(e.equipment);

  for (const [keyword, expectedType] of Object.entries(EQUIPMENT_KEYWORDS)) {
    if (text.includes(keyword)) {
      if (!equipTypes.has(expectedType) && !equipFlat.has(expectedType)) {
        errors.push({
          ...ctx,
          field: "equipment",
          message: `Text mentions "${keyword}" but equipment does not include required "${expectedType}"`,
          severity: "warning",
        });
      }
    }
  }
  return errors;
}

// ═══════════════════════════════════
// LEGACY ARTIFACT DETECTION (Sections 3, 8)
// ═══════════════════════════════════

function validateNoLegacyArtifacts(e: ExerciseV2): ValidationError[] {
  const errors: ValidationError[] = [];
  const ctx = { exerciseId: e.id };
  const raw = e as any;

  const LEGACY_FIELDS = ["durationMin", "intensityTarget", "safetyTags", "contraindications", "contraindicationFlags"];
  for (const field of LEGACY_FIELDS) {
    if (raw[field] !== undefined) {
      errors.push({ ...ctx, field, message: `Legacy field ${field} must be removed`, severity: "error" });
    }
  }

  if (Array.isArray(raw.movementPattern)) {
    errors.push({ ...ctx, field: "movementPattern", message: "movementPattern must be a single enum string, not array", severity: "error" });
  }
  if (e.relevanceScores === null || e.relevanceScores === undefined) {
    errors.push({ ...ctx, field: "relevanceScores", message: "relevanceScores cannot be null", severity: "error" });
  }
  if (e.dose === null || e.dose === undefined) {
    errors.push({ ...ctx, field: "dose", message: "dose cannot be null", severity: "error" });
  }
  if (!e.targets || e.targets.length === 0) {
    errors.push({ ...ctx, field: "targets", message: "targets missing or empty", severity: "error" });
  }

  return errors;
}

/**
 * Validate a single exercise against v2.1.2 schema requirements.
 */
export function validateExercise(e: ExerciseV2): ValidationError[] {
  const errors: ValidationError[] = [];
  const ctx = { exerciseId: e.id };

  // 1) relevanceScores must have ALL required keys
  for (const key of RELEVANCE_KEYS) {
    const val = e.relevanceScores[key as RelevanceKeyV2];
    if (val === undefined || val === null) {
      errors.push({ ...ctx, field: `relevanceScores.${key}`, message: `Missing or null relevanceScores key: ${key}`, severity: "error" });
    } else if (typeof val !== "number" || val < 0 || val > 5) {
      errors.push({ ...ctx, field: `relevanceScores.${key}`, message: `relevanceScores.${key} must be integer 0..5, got ${val}`, severity: "error" });
    }
  }

  // 2) Required fields
  if (!e.movementPattern) {
    errors.push({ ...ctx, field: "movementPattern", message: "Missing movementPattern", severity: "error" });
  }
  if (!e.intensity || typeof e.intensity.levelNumeric !== "number") {
    errors.push({ ...ctx, field: "intensity.levelNumeric", message: "Missing intensity.levelNumeric", severity: "error" });
  } else if (e.intensity.levelNumeric < 1 || e.intensity.levelNumeric > 5) {
    errors.push({ ...ctx, field: "intensity.levelNumeric", message: `intensity.levelNumeric must be 1..5, got ${e.intensity.levelNumeric}`, severity: "error" });
  }
  if (!e.spine || !e.spine.motion) {
    errors.push({ ...ctx, field: "spine.motion", message: "Missing spine.motion", severity: "error" });
  }
  if (!e.spine || !e.spine.load) {
    errors.push({ ...ctx, field: "spine.load", message: "Missing spine.load", severity: "error" });
  }

  // 3) Dose validation
  if (!e.dose || e.dose.baseSeconds < 10) {
    errors.push({ ...ctx, field: "dose.baseSeconds", message: `dose.baseSeconds must be >= 10, got ${e.dose?.baseSeconds}`, severity: "error" });
  }

  // 4) Pregnancy consistency
  if (e.tags.pregnancySafe && e.poseSet === "prone") {
    errors.push({ ...ctx, field: "tags.pregnancySafe", message: "pregnancySafe=true but poseSet=prone is invalid", severity: "error" });
  }

  // Legacy artifacts
  errors.push(...validateNoLegacyArtifacts(e));

  // Equipment keywords
  errors.push(...validateEquipmentKeywords(e));

  return errors;
}

/**
 * Validate condition profiles: each relevanceKey must exist in RELEVANCE_KEYS.
 */
export function validateConditionProfiles(): ValidationError[] {
  const errors: ValidationError[] = [];
  const keySet = new Set<string>(RELEVANCE_KEYS);

  for (const [id, profile] of Object.entries(CONDITION_PROFILES)) {
    if (!keySet.has(profile.relevanceKey)) {
      errors.push({
        field: `condition.${id}.relevanceKey`,
        message: `Condition ${id} has relevanceKey "${profile.relevanceKey}" which is not in RELEVANCE_KEYS`,
        severity: "error",
      });
    }
  }

  return errors;
}

/**
 * Validate entire catalog. Returns all errors. Empty = valid.
 * Sections 2+3: duplicate IDs and duplicate titleKeys.
 */
export function validateCatalog(catalog: ExerciseV2[]): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check for duplicate IDs
  const ids = new Set<string>();
  for (const e of catalog) {
    if (ids.has(e.id)) {
      errors.push({ exerciseId: e.id, field: "id", message: `Duplicate exercise id: ${e.id}`, severity: "error" });
    }
    ids.add(e.id);
  }

  // Check for duplicate titleKeys
  const titleKeys = new Map<string, string>();
  for (const e of catalog) {
    const tk = normalizeTitleKey(e.title);
    if (titleKeys.has(tk)) {
      errors.push({
        exerciseId: e.id,
        field: "title",
        message: `Duplicate titleKey "${tk}" — also used by ${titleKeys.get(tk)}`,
        severity: "error",
      });
    } else {
      titleKeys.set(tk, e.id);
    }
  }

  for (const e of catalog) {
    errors.push(...validateExercise(e));
  }

  errors.push(...validateConditionProfiles());

  return errors;
}

/**
 * Assert that an exercise is a valid v2.1.2 exercise (no legacy fields).
 * Used at runtime to assert single-source-of-truth.
 */
export function assertV2Exercise(e: any): boolean {
  const raw = e as any;
  return (
    e.relevanceScores !== null &&
    e.relevanceScores !== undefined &&
    e.dose !== null &&
    e.dose !== undefined &&
    typeof e.movementPattern === "string" &&
    e.movementPattern !== "" &&
    Array.isArray(e.targets) &&
    e.targets.length > 0 &&
    raw.durationMin === undefined &&
    raw.intensityTarget === undefined &&
    raw.safetyTags === undefined &&
    raw.contraindications === undefined &&
    raw.contraindicationFlags === undefined
  );
}
