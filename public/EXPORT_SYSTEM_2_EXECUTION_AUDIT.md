# EXPORT — SYSTEM 2.0 EXECUTION AUDIT

**File**: `EXPORT_SYSTEM_2_EXECUTION_AUDIT.md`  
**Created**: 2026-02-18  
**Purpose**: Complete "what exists now" snapshot for external auditor verification of System 2.0 execution.

---

## SECTION 0 — VERSION + HOW TO DOWNLOAD

### Where is this file?

This file is located at the **project root**: `EXPORT_SYSTEM_2_EXECUTION_AUDIT.md`

### How to download (non-techie instructions)

1. In Lovable, click the **code icon** (top-left area) to open the **Files panel**.
2. In the file tree, scroll to the top. You'll see `EXPORT_SYSTEM_2_EXECUTION_AUDIT.md` at the root level.
3. Click on the file name to open it.
4. Right-click the file name → **Download** (or use the three-dot menu if available).
5. Alternatively: click the file, select all text (Ctrl+A / Cmd+A), copy (Ctrl+C / Cmd+C), and paste into any text editor.

### Confirmation

✅ This is a **single file**. No copy/paste from code editor required. No multiple files to merge.

---

## SECTION 1 — CHANGELOG SINCE LAST EXPORT

The previous export was `EXPORT_FULL_APP_SYSTEM_AUDIT.md`. Below are all files modified or created since that export:

| File Path | What Changed | Why |
|-----------|-------------|-----|
| `src/lib/scoringEngine.ts` | **CREATED** — New score-based exercise selection engine (416 lines) | Part 1: Replace prefix-based selection with weighted scoring pipeline |
| `src/lib/planGenerator.ts` | **MODIFIED** — Integrated scoring engine, added `selectExercisesForConditions()`, delegates mode determination to V2 engine | Part 1: Connect new scoring engine to plan generation |
| `src/data/masterExercises.ts` | **MODIFIED** — Expanded from ~40 to ~100 exercises. Added `RelevanceScores`, `DoseInfo` interfaces. Added relevance scores, targets, movementPattern, dose to exercises | Part 2: Expand library to 100 clinical exercises |
| `src/components/animations/ExerciseAnimationV8.tsx` | **CREATED** — Pose-aware animation system with 10 pose sets, category micro-motions, crossfade transitions | Part 4: Animation V8 upgrade |
| `src/components/animations/HumanFigure.tsx` | **MODIFIED** — Added new SVG poses: SideLying, SideLyingLegUp, NeckCenter, NeckTiltRight, NeckTiltLeft, PelvicNeutral, PelvicTilted | Part 4: Support V8 pose types |
| `src/pages/Workout.tsx` | **MODIFIED** — Uses V8 animation, 280px animation zone, collapsible instructions, "למה" section, safety strip with red border | Part 5: Design fixes for premium workout feel |
| `src/index.css` | **MODIFIED** — Typography scale: H1 32px, H2 22px, Body 16px, line-height 1.6. Reduced shadow intensity | Part 5: Visual hierarchy improvements |
| `src/pages/AuditExport.tsx` | **CREATED** — Downloadable audit page at /audit-export | Export utility |
| `public/audit-export.txt` | **CREATED** — Text version of prior audit | Export utility |
| `src/lib/storage.ts` | **UNCHANGED** — readState/writeState utility (used by scoring engine for recent exercise tracking) | — |

---

## SECTION 2 — DESIGN SYSTEM (AS IMPLEMENTED)

### Color Tokens (HSL values from `src/index.css`)

| Token | HSL Value | Approximate Hex | Usage |
|-------|----------|-----------------|-------|
| `--background` | `30 29% 95%` | #F3EDE6 | Page background |
| `--foreground` | `0 0% 12%` | #1F1F1F | Primary text |
| `--card` | `30 22% 98%` | #FDFAF7 | Card surfaces |
| `--card-foreground` | `0 0% 12%` | #1F1F1F | Card text |
| `--primary` | `14 37% 52%` | #B5755A | Terracotta brand color |
| `--primary-foreground` | `0 0% 100%` | #FFFFFF | Text on primary |
| `--secondary` | `25 12% 90%` | #E9E4DE | Secondary surfaces |
| `--muted` | `210 8% 55%` | #838A91 | Muted elements |
| `--muted-foreground` | `207 10% 42%` | #616C74 | Muted text |
| `--destructive` | `0 65% 55%` | #D73B3B | Danger/stop |
| `--border` | `14 18% 84%` | #DDD5CE | Borders |
| `--terracotta` | `14 37% 52%` | #B5755A | Alias for primary |
| `--terracotta-light` | `14 37% 67%` | #CFA08B | Light variant |
| `--terracotta-dark` | `14 37% 42%` | #915E48 | Dark variant |

### Typography Scale

| Element | Size | Weight | Line-height | Source |
|---------|------|--------|-------------|--------|
| H1 | 32px (mobile), 36px (sm+) | bold (700) | 1.2 | `src/index.css` line 69 |
| H2 | 22px (mobile), 24px (sm+) | bold (700) | snug (~1.375) | `src/index.css` line 73 |
| Body (p, li, span, label) | 16px | normal (400) | 1.6 | `src/index.css` line 77 |
| Small / .text-small | 12px (xs) | — | — | `src/index.css` line 81 |
| Font family | Heebo | — | — | `tailwind.config.ts` + `src/index.css` |

### Spacing / Radius / Shadows

| Token | Value | Source |
|-------|-------|--------|
| `--radius` | 1.25rem (20px) | `src/index.css` line 35 |
| `shadow-calm` | `0 4px 24px -4px hsl(terracotta/0.09), 0 1px 3px hsl(terracotta/0.04)` | `src/index.css` line 159 |
| `shadow-calm-lg` | `0 8px 36px -6px hsl(terracotta/0.15), 0 2px 8px hsl(terracotta/0.06)` | `src/index.css` line 163 |
| `card-premium` | `bg-card rounded-[20px] border border-border/50` + subtle terracotta shadow | `src/index.css` line 167 |

### RTL Handling

- `direction: rtl;` set on `body` in `src/index.css` line 61.
- Slider `direction: ltr;` override for native range inputs (line 92).
- Layout uses `text-right` by default via RTL direction.
- Safety strip in Workout uses `border-r-2` (right border = left in RTL visual) — see `src/pages/Workout.tsx` line 254.

### Transitions / Easing

| Animation | Duration | Easing | Source |
|-----------|----------|--------|--------|
| `pageEnter` | 200ms | ease-out | `src/index.css` line 190 |
| `heroFadeUp` | 400ms (delay 150ms) | ease-out | `src/index.css` line 202 |
| `fade-in` | 0.4s | ease-out | `tailwind.config.ts` line 95 |
| `slide-in` | 0.3s | ease-out | `tailwind.config.ts` line 96 |
| `press-scale` | 120ms | ease | `src/index.css` line 177 |
| V8 breath pulse | 4.5s | cubic-bezier(0.45,0.05,0.55,0.95) | `ExerciseAnimationV8.tsx` line 195 |
| V8 crossfade | 600ms | ease-in-out | `ExerciseAnimationV8.tsx` line 297 |

### Source References

- **CSS variables**: `src/index.css` (206 lines)
- **Tailwind config**: `tailwind.config.ts` (101 lines)
- **Key utility classes**: `card-premium`, `shadow-calm`, `shadow-calm-lg`, `gradient-warm`, `hero-glow`, `press-scale`, `animate-page-enter`

---

## SECTION 3 — ROUTES + PAGES (AS IMPLEMENTED)

### Complete Route List

| Path | Page Component | Guard | File |
|------|---------------|-------|------|
| `/` | `Home` | None | `src/pages/Home.tsx` |
| `/disclaimer` | `Disclaimer` | None | `src/pages/Disclaimer.tsx` |
| `/conditions` | `Conditions` | DisclaimerGuard | `src/pages/Conditions.tsx` |
| `/setup` | `Setup` | DisclaimerGuard | `src/pages/Setup.tsx` |
| `/questionnaire` | `Questionnaire` | DisclaimerGuard | `src/pages/Questionnaire.tsx` |
| `/plan` | `Plan` | DisclaimerGuard | `src/pages/Plan.tsx` |
| `/workout/:sessionId` | `Workout` | DisclaimerGuard | `src/pages/Workout.tsx` |
| `/checkin/:sessionId` | `CheckinPage` | DisclaimerGuard | `src/pages/CheckinPage.tsx` |
| `/stop` | `Stop` | None | `src/pages/Stop.tsx` |
| `/expert-review` | `ExpertReview` | None | `src/pages/ExpertReview.tsx` |
| `/audit-export` | `AuditExport` | None | `src/pages/AuditExport.tsx` |
| `*` | `NotFound` | None | `src/pages/NotFound.tsx` |

### Page-by-Page Structure

#### Home (`/`)
- Hero section with full-bleed background image
- Logo circle overlay
- Feature highlights (3 items)
- Method section ("התרגול מותאם אלייך")
- Why it works section (5 items with icons)
- How it works section (3 steps)
- Trust strip (3 badges)
- Bottom CTA
- Key components: `Layout` (hideHeader), `Button`
- Images: `/assets/yael/hero.jpg`, `/assets/brand/logo-option-1.png`, `/assets/yael/yoga.jpg`

#### Disclaimer (`/disclaimer`)
- Disclaimer text card
- Checkbox acceptance
- Continue button
- Key components: `Layout`, `PageIllustration (shield)`, `Button`
- Images: None (illustration only)

#### Conditions (`/conditions`)
- Condition selection (17 conditions from `CONDITIONS_LIST`)
- Key components: `Layout`, condition buttons
- Images: None

#### Setup (`/setup`)
- Sessions per week slider
- Minutes per session slider
- Practice time selector
- Energy level selector
- Key components: `Layout`, `PageIllustration`, sliders
- Images: None

#### Questionnaire (`/questionnaire`)
- Dynamic form based on selected conditions
- Fibro path: pain/fatigue/sleep sliders, flare status, pain areas, triggers, equipment, red flags
- Specific condition sections (back, neck, shoulder, knee, hip, disc, pregnancy, etc.)
- Generic path for unmatched conditions
- Red flags section (5 flags) — routes to `/stop` if any checked
- Key components: `Layout`, `PageIllustration (sliders)`, `SectionCard`, `SliderField`, `MultiSelect`, `RadioGroup`
- Images: None

#### Plan (`/plan`)
- Weekly plan display
- Session cards with mode labels (normal/easier/flare)
- Start workout buttons
- Coach presence chip (Yael portrait)
- Complementary activity note
- Tip card
- Key components: `Layout`, `PageIllustration (calendar)`, `SafeImage`, `Button`
- Images: `/assets/yael/hero.jpg` (small avatar in coach chip)

#### Workout (`/workout/:sessionId`)
- Progress dots
- Timer (MM:SS)
- Active exercise display:
  - Title + category badge + TTS button
  - Animation zone (280px, V8)
  - Collapsible instructions (`<details>`)
  - Breathing strip (terracotta)
  - Reps + range
  - Collapsible "למה" section
  - Safety strip (red right border)
  - Equipment chips
- Next exercise button
- Pacing reminder
- Condition tip
- Floating bottom bar (easier/flare/pause/finish)
- Key components: `Layout`, `ExerciseAnimationV8`, `Button`
- Images: None (logo in header via Layout)

#### CheckinPage (`/checkin/:sessionId`)
- Pain before/after sliders
- Fatigue before/after sliders
- "Too much" toggle
- "What helped most" selector
- Save button → adapts next session if needed
- Key components: `Layout`, `PageIllustration (check)`, `SliderField`, `Button`
- Images: None

#### Stop (`/stop`)
- Warning icon
- Stop message
- Red flags listed
- Return to home button
- Key components: `Layout`, `AlertTriangle`, `Button`
- Images: None

---

## SECTION 4 — VISUAL ASSETS (AS IMPLEMENTED)

### Asset List

| Path | Type | Usage |
|------|------|-------|
| `/public/assets/brand/logo.png` | Logo | Header (Layout.tsx — all pages except Home) |
| `/public/assets/brand/logo-option-1.png` | Alt logo | Home page hero circle overlay |
| `/public/assets/brand/logo-option-2.png` | Alt logo | Not currently used |
| `/public/assets/yael/hero.jpg` | Portrait/hero | Home hero background, Plan coach chip (avatar) |
| `/public/assets/yael/yoga.jpg` | Studio photo | Home "Why it works" section |
| `/public/favicon.ico` | Favicon | Browser tab |
| `/public/placeholder.svg` | Placeholder | Fallback (SafeImage component) |

### Active Logo

- **Header**: `/assets/brand/logo.png` — 40×40px rounded circle in `Layout.tsx` line 30
- **Home hero**: `/assets/brand/logo-option-1.png` — 64×64px in 96×96px circle overlay

### Portrait Usage — Duplicate Portrait Issue Status

| Location | Image | Status |
|----------|-------|--------|
| Home hero background | `/assets/yael/hero.jpg` | ✅ Present — correct (hero) |
| Home logo circle | `/assets/brand/logo-option-1.png` | ✅ Logo, not portrait |
| Header (Layout) | `/assets/brand/logo.png` | ✅ Small logo circle — not a portrait |
| Plan coach chip | `/assets/yael/hero.jpg` | ✅ Small 28×28px avatar — acceptable |
| Workout page | None | ✅ No portrait — FIXED. Only logo in header |
| Home "Why it works" | `/assets/yael/yoga.jpg` | ✅ Studio photo — not a duplicate portrait |

**Status**: ✅ Duplicate portrait issue has been resolved. The hero portrait appears only on the Home page. Workout page uses no portrait — only the header logo from Layout. Plan uses a tiny avatar chip which is distinct from the hero.

---

## SECTION 5 — ANIMATION SYSTEM (AS IMPLEMENTED)

### Current Version

**V8** — Pose-aware articulated SVG animation system.

### File Paths

| File | Purpose | Lines |
|------|---------|-------|
| `src/components/animations/ExerciseAnimationV8.tsx` | Main V8 animation component | 315 |
| `src/components/animations/HumanFigure.tsx` | SVG pose library (22 pose types) | 428 |

### Pose Types Supported

| PoseSet | SVG Components | Description |
|---------|---------------|-------------|
| `standing` | StandingFigure, StandingArmsUp, StandingArmsOpen | Base standing with arm variations |
| `seated` | SeatedFigure | Seated on chair |
| `supine` | SupineFlat, LyingRelax | Lying on back |
| `bridge` | SupineFlat → SupineBridge | Glute bridge transition |
| `allFours` | AllFoursNeutral, AllFoursRounded, AllFoursArched | Cat-cow cycle |
| `birdDog` | BirdDogNeutral, BirdDogExtended | Quadruped arm/leg extension |
| `wall` | WallStandingArmsLow, WallStandingArmsHigh | Wall-supported |
| `neck` | NeckCenter, NeckTiltRight, NeckTiltLeft | Neck lateral tilts |
| `pelvic` | PelvicNeutral, PelvicTilted | Pelvic tilt cycle |
| `sideLying` | SideLying, SideLyingLegUp | Side lying with leg lift |

### Mapping Rules: Exercise → Pose → Animation

**Step 1: getPoseSet(exercise)** — determines which pose set to use.

```typescript
// Priority: 1) ID override, 2) keyword match in title, 3) category default
function getPoseSet(exercise: Exercise): PoseSet {
  // 1. ID override (ID_POSE map — currently empty, for future overrides)
  const idPose = ID_POSE[exercise.id];
  if (idPose) return idPose;

  // 2. Keyword match in Hebrew title
  const title = exercise.name_he.toLowerCase();
  for (const [keywords, pose] of KEYWORD_POSE) {
    if (keywords.some(kw => title.includes(kw))) return pose;
  }

  // 3. Category-based default
  switch (exercise.category) {
    case "breath": return "seated";
    case "release": return "supine";
    case "stability": return "standing";
    case "mobility": return "standing";
    default: return "standing";
  }
}
```

**Keyword mappings** (from `KEYWORD_POSE` array):

| Keywords | Pose |
|----------|------|
| חתול, פרה, ארבע | allFours |
| בירד, חיפושית, יד ורגל, דוב | birdDog |
| גשר, glute bridge | bridge |
| קיר, wall, סלייד | wall |
| צוואר, ראש, סנטר, neck | neck |
| אגן, פלוויק, pelvic | pelvic |
| שכיבה, שכב, supine, שוואסנה, רגליים על, פרפר, סריקת גוף, 2 דקות, שקט | supine |
| על הצד, side lying, צדפה | sideLying |
| ישיבה, יושב, כיסא, seated, מדיטציה | seated |

**Step 2: getRecipe(poseSet, category)** — returns animation frames (array of SVG poses with hold durations).

**Step 3: Frame cycling** — `useEffect` cycles through frames with configurable hold times and 600ms crossfade transitions.

### Category Micro-Motion Overlay

| Category | Animation | Duration | Easing |
|----------|-----------|----------|--------|
| breath | `v8breathPulse` (scale 1→1.02→1) | 4.5s | cubic-bezier |
| stability | `v8microTremble` (±0.3px) | 2s | linear |
| release | `v8slowDrift` (±1px + 0.3° rotate) | 6s | cubic-bezier |
| mobility | none (relies on frame transitions) | — | — |

### Reduced-Motion Handling

```css
@media (prefers-reduced-motion: reduce) {
  .v8-root:not(.v8-force) * { animation: none !important; }
  .v8-root:not(.v8-force) .v8-frame { opacity: 1 !important; }
}
```

- Also checks `window.matchMedia("(prefers-reduced-motion: reduce)")` at runtime.
- If `prefers-reduced-motion` is active AND `debugForceAnimate` is not set, animations freeze.

### Toggle Storage Key and Behavior

| Key | Type | Default | Behavior |
|-----|------|---------|----------|
| `yaelYogaDisableAnimations` | boolean | false | Disables all V8 animations when true |
| `debugForceAnimate` | boolean | false | Overrides reduced-motion preferences |

Both read via `readState()` from `src/lib/storage.ts` (localStorage wrapper).

### How V8 Renders in Workout

```tsx
// src/pages/Workout.tsx line 191
<ExerciseAnimationV8 exercise={activeExercise} large />
```

The `large` prop sets height to 280px. The component is inside a `rounded-2xl` container with a gradient background.

### Known Limitations

1. **Keyword matching is title-based** — exercises with unusual Hebrew titles may fall back to category defaults.
2. **ID_POSE override map is empty** — no per-exercise ID overrides configured yet.
3. **Seated figure has identical frames** — `SeatedFigure` appears twice in its recipe, so the seated "animation" is essentially static with micro-motion only.
4. **No side-lying detection for release exercises** — release exercises default to supine unless keywords match.
5. **SVG viewBox is fixed at 320×105** — may clip some poses at extreme positions.
6. **Compact mode** shows a generic StandingFigure regardless of exercise.

---

## SECTION 6 — MASTER EXERCISE LIBRARY (AS IMPLEMENTED)

### Location

`src/data/masterExercises.ts` — 2784 lines.

### Total Count

**100 exercises** (as declared in the file header comment and verified by category comments):

| Category | Hebrew | Count | ID Examples |
|----------|--------|-------|-------------|
| Breath (נשימה) | נשימה | 12 | breath_supine, breath_seated, breath_box, breath_478, breath_ocean, breath_count, breath_alternate, breath_3part, breath_humming, breath_sighing, breath_cooling, breath_extended_exhale |
| Mobility (תנועה) | תנועה | 27 | catcow_small, shoulder_chest, pelvic_tilt, neck_tilts, shoulder_circles, hip_circles, ankle_circles, thoracic_rotation, chin_tuck, side_bend, seated_twist, wrist_circles, spinal_wave, thread_needle, knee_circles, toe_spread, standing_cat_cow, figure_eight_hips, arm_circles_slow, gentle_squat, hip_flexor_stretch_standing, seated_march, neck_rotation, + more |
| Stability (יציבות) | יציבות | 25 | glute_bridge, birddog, dead_bug, wall_sit, seated_leg_lift, clam, single_leg_stand, wall_push, toe_yoga, heel_raise, band_pull_apart, isometric_quad, + newer: wall_plank, side_plank_knees, bridge_march, seated_core_brace, step_back_tap, split_stance, stab_toe_raise, + more |
| Release (שחרור) | שחרור | 36 | body_scan, child_pose_supported, hamstring_supported, neck_stretch, savasana, guided_relax, foam_shoulder, figure_four, standing_forward_fold, twist_supine, + newer: supported_side_bend, wall_child_pose, legs_up_wall, upper_trap_stretch, quad_stretch_supported, eye_relaxation, supine_arm_drop, micro_shaking, thoracic_extension, rel_pelvic_floor_breath, rel_seated_meditation, + more |

### Schema (Interface)

```typescript
export interface MasterExercise {
  id: string;
  title: string;
  category: "נשימה" | "תנועה" | "יציבות" | "שחרור";
  durationMin: number;
  intensityTarget: string;
  equipment?: string[];
  tags: {
    universalSafe: boolean;
    pregnancySafe: boolean;
    discSafe: boolean;
    kneeSafe: boolean;
    oaSafe: boolean;
    shoulderSafe: boolean;
    flareSafe: boolean;
  };
  contraindications?: string[];
  instructions: string[];
  breathing: string;
  reps: string;
  range: string;
  why: string;
  safety: string;
  cue: string;
  relevance?: RelevanceScores;
  targets?: string[];
  movementPattern?: string[];
  dose?: DoseInfo;
}

export interface RelevanceScores {
  fibro: number;       // 0-5
  backPain: number;
  neckShoulder: number;
  discSciatica: number;
  kneeHip: number;
  oa: number;
  pregnancyPostpartum: number;
  sleep: number;
  stressAnxiety: number;
  rehab: number;
}

export interface DoseInfo {
  baseSeconds: number;
  flareSeconds: number;
  progressionHint: string;
}
```

### Field Completeness Check

| Field | Required? | Present in all 100? | Notes |
|-------|-----------|---------------------|-------|
| `instructions` (min 6 lines) | Yes | ✅ All have 6–8 lines | Clinically structured |
| `breathing` | Yes | ✅ All | |
| `reps` | Yes | ✅ All | |
| `range` | Yes | ✅ All | |
| `why` | Yes | ✅ All | |
| `safety` | Yes | ✅ All | |
| `cue` | Yes | ✅ All | |
| `tags` (7 safety tags) | Yes | ✅ All | |
| `relevance` (10 condition scores) | Optional | ⚠️ ~60 of 100 have explicit relevance | Original ~40 exercises rely on category defaults from `CATEGORY_DEFAULT_RELEVANCE` in scoringEngine.ts |
| `dose` | Optional | ⚠️ ~60 of 100 have dose | Newer exercises have dose, original ~40 do not |
| `targets` | Optional | ⚠️ ~60 of 100 | Newer exercises have targets |
| `movementPattern` | Optional | ⚠️ ~60 of 100 | Newer exercises have movementPattern |

**Missing fields detail**: The original ~40 exercises (breath_supine through wrist_circles and the original stability/release exercises) do NOT have `relevance`, `dose`, `targets`, or `movementPattern` fields. They use fallback defaults defined in `scoringEngine.ts` `CATEGORY_DEFAULT_RELEVANCE`.

---

## SECTION 7 — SELECTION ENGINE (AS IMPLEMENTED)

### File Paths

| File | Purpose |
|------|---------|
| `src/lib/scoringEngine.ts` | Score-based selection algorithm (416 lines) |
| `src/lib/planGenerator.ts` | Plan generation, mode determination, session adaptation (171 lines) |
| `src/data/exerciseAdapter.ts` | Converts master exercises → legacy Exercise[] format, generates condition-prefixed IDs (116 lines) |

### Selection Algorithm: SCORE-BASED ✅

The engine is **score-based** (not prefix-based). Prefix-based legacy code exists only as fallback for fibro-only mode and is not used when the library is provided.

### Exact Algorithm Steps

1. **Get exercise count** from duration: ≤10min→3, ≤15→5, ≤20→6, ≤30→8, ≤45→10, >45→12
2. **Get recent exercise IDs** from localStorage (`yaelRecentExercises`)
3. **Generate session seed** from week number + sorted conditions (deterministic)
4. **Score all exercises**:
   - For each exercise in library, find its MasterExercise
   - Apply safety filter → exclude unsafe exercises
   - Compute score
5. **Group by category** into buckets: breath, mobility, stability, release
6. **Sort each bucket** by score descending
7. **Seeded shuffle within top tier** (top 50% of each bucket)
8. **Pick by category targets** — breath first, then mobility, stability, release last
9. **Sleep condition special handling** — ensure last 2 exercises are release
10. **Pad if needed** — fill remaining slots with highest-scored exercises
11. **Deduplicate and limit** to target count
12. **Record used exercises** in localStorage for anti-repetition

### Scoring Formula

```typescript
function scoreExercise(exercise, master, conditions, mode, recentIds): number {
  let score = 0;

  // 1. Relevance × condition weight
  //    Primary condition (first) gets 2× weight
  //    Secondary conditions averaged
  for (condition of conditions) {
    key = CONDITION_RELEVANCE_KEY[condition]; // e.g., "fibro"
    weight = CONDITION_WEIGHT[condition];      // e.g., 1.2
    condScores.push(relevance[key] * weight);
  }
  score += condScores[0] * 2;  // primary condition doubled
  score += avg(condScores[1:]); // secondary averaged

  // 2. Mode modifier
  if (mode === "flare") {
    if (category is breath|release) score += 2;
    if (category is stability) score -= 2;
  } else if (mode === "easier") {
    if (category is breath) score += 1;
    if (category is release) score += 0.5;
  }

  // 3. Stress/fibro boost
  if (has stress|fibro|sleep AND category is breath|release) score += 1;

  // 4. Recent usage penalty
  if (exercise.id in recentIds) score -= 2;

  // 5. Equipment bonus (no equipment = +0.3)
  if (no equipment) score += 0.3;

  return score;
}
```

### Condition Weights

```typescript
const CONDITION_WEIGHT = {
  "פיברומיאלגיה": 1.2,
  "כאבי גב": 1.15,
  "צוואר": 1.1,
  "כתפיים": 1.1,
  "ברכיים": 1.15,
  "מפרקי ירך": 1.1,
  "היריון": 1.2,
  "אחרי לידה": 1.15,
  "פריצת דיסק": 1.3,
  "סיאטיקה": 1.3,
  "אוסטאוארתריטיס": 1.1,
  "שיקום אחרי פציעה": 1.2,
  "חרדה/מתח": 1.1,
  "בעיות שינה": 1.2,
  "גיל מעבר": 1.1,
  "תרגול משלים": 1.0,
  "רק יוגה": 1.0,
};
```

### Mode Modifiers

| Mode | Breath | Mobility | Stability | Release |
|------|--------|----------|-----------|---------|
| flare | +2 | 0 | -2 | +2 |
| easier | +1 | 0 | 0 | +0.5 |
| normal | 0 | 0 | 0 | 0 |

### Category Balancing Rule

```typescript
function getCategoryTargets(count, mode, conditions): CategoryTargets {
  if (mode === "flare") {
    breath: 1,
    stability: ~10% of remaining,
    release: ~45% of remaining,
    mobility: rest
  }
  if (mode === "easier") {
    breath: 1,
    stability: ~15%,
    release: ~35%,
    mobility: rest
  }
  // normal:
  breath: 1,
  stability: ~25% (min 2),
  release: ~20% (30% if sleep condition) (min 1-2),
  mobility: rest (min 2)
}
```

### Anti-Repetition Logic

- localStorage key: `yaelRecentExercises`
- Stores last 20 exercise IDs used
- Any exercise in recent list gets **-2 score penalty**
- Updated after each plan generation via `recordUsedExercises()`

### Weekly Session Seed

```typescript
function getSessionSeed(conditions: string[]): number {
  const weekNum = Math.floor((now - yearStart) / (7 * 24 * 60 * 60 * 1000));
  const condStr = conditions.sort().join(",");
  // Hash: weekNum * 31 + character codes
  return Math.abs(hash);
}
```

- Same user + same week + same conditions → same seed → same shuffle order → consistent plan
- New week → different seed → natural variation
- Shuffle applied only within top 50% of each category bucket (preserves quality while adding variety)

### Multi-Condition Merge Logic

1. **Safety intersection**: `isSafeForConditions()` checks ALL condition safety tags — exercise must be safe for EVERY selected condition.
2. **Score summation**: Primary condition (first selected) gets 2× weight, secondary conditions averaged.
3. **Stress/fibro boost**: If any of stress/fibro/sleep is present AND exercise is breath/release → +1 score.
4. **Disc/sciatica removal**: If disc/sciatica selected, exercises with contraindications containing "כיפוף" (flexion) or "סיבוב" (rotation) are excluded.
5. **Pregnancy exclusion**: If pregnancy selected, exercises without `pregnancySafe: true` are excluded.
6. **Sleep condition**: Last 2 exercises forced to be release category.

### Key Code Excerpts

**Safety filter** (scoringEngine.ts lines 151-172):
```typescript
function isSafeForConditions(master, conditions, mode): boolean {
  for (const condition of conditions) {
    const tag = CONDITION_SAFETY_TAG[condition];
    if (tag && !master.tags[tag]) return false;
  }
  if (mode === "flare" && !master.tags.flareSafe) return false;
  // Disc: remove flexion-heavy
  if (hasDisc && master.contraindications?.some(c => c.includes("כיפוף") || c.includes("סיבוב"))) return false;
  // Pregnancy
  if (hasPregnancy && !master.tags.pregnancySafe) return false;
  return true;
}
```

**Plan generation entry point** (planGenerator.ts lines 71-79):
```typescript
export function selectExercisesForConditions(library, conditions, mode, minutes): string[] {
  return selectExercisesScored(library, conditions, mode, minutes);
}
```

---

## SECTION 8 — SAFETY / MEDICAL GATING (REGRESSION CHECK)

### Disclaimer

✅ **Still appears.** File: `src/pages/Disclaimer.tsx`.
- Checkbox required before proceeding.
- Sets `state.disclaimerAccepted = true` in AppContext.
- `DisclaimerGuard` component in `src/App.tsx` (lines 22-28) redirects to `/disclaimer` if not accepted.

### Red Flags → STOP

✅ **Still routes to STOP.** 

Red flags defined in `src/types/index.ts` lines 135-141:
```typescript
export const RED_FLAGS = [
  "כאב חד חדש",
  "נימול/חולשה מתגברים",
  "סחרחורת חריגה/עילפון",
  "קוצר נשימה",
  "חום/מחלה חריפה",
];
```

Check in `src/pages/Questionnaire.tsx` lines 175-179:
```typescript
if (activeRedFlags.length > 0) {
  navigate("/stop");
  return;
}
```

STOP page: `src/pages/Stop.tsx` — displays warning with destructive styling, returns user to home.

### Fibromyalgia Thresholds — UNCHANGED

Mode determination in `src/lib/scoringEngine.ts` lines 403-416:
```typescript
export function determineMode(profile, pain, fatigue, sleep, flareNow): Mode {
  if (profile.flareToday) return "flare";
  if (flareNow === "כן") return "flare";
  if (pain >= 7 || fatigue >= 7 || sleep <= 3) return "flare";
  if (pain >= 5 || fatigue >= 5) return "easier";
  if (profile.energyLevel === "נמוכה") return "easier";
  return "normal";
}
```

Thresholds: pain≥7 OR fatigue≥7 OR sleep≤3 → flare. pain≥5 OR fatigue≥5 → easier. Otherwise normal.

### Disc + Pregnancy Constraints — STILL ENFORCED

**Disc/Sciatica** (scoringEngine.ts lines 162-165):
- Exercises with contraindications containing "כיפוף" (flexion) or "סיבוב" (rotation) are excluded.
- All exercises must have `discSafe: true` tag.

**Pregnancy** (scoringEngine.ts line 169):
- All exercises must have `pregnancySafe: true` tag.
- Exercises tagged `pregnancySafe: false` are excluded.

### Files/Lines Summary

| Rule | File | Lines |
|------|------|-------|
| RED_FLAGS constant | `src/types/index.ts` | 135-141 |
| Red flag check → /stop | `src/pages/Questionnaire.tsx` | 175-179 |
| STOP screen | `src/pages/Stop.tsx` | 1-31 |
| Disclaimer guard | `src/App.tsx` | 22-28 |
| Disclaimer page | `src/pages/Disclaimer.tsx` | 1-55 |
| Mode thresholds | `src/lib/scoringEngine.ts` | 403-416 |
| Safety filter (disc/pregnancy) | `src/lib/scoringEngine.ts` | 151-172 |
| Safety tags on exercises | `src/data/masterExercises.ts` | Every exercise object |

---

## SECTION 9 — QA RESULTS

> **Note**: These results are based on code analysis. The scoring engine, safety filtering, and plan generation logic have been traced through the code paths for each scenario.

### Test: Fibro Only

| Check | Result |
|-------|--------|
| Plan generates? | ✅ Yes — uses scoring engine via `selectExercisesForConditions` with fibro condition |
| Workout loads? | ✅ Yes — exercise IDs resolve via `MASTER_LOOKUP` in adapter |
| Instructions show? | ✅ Yes — `master?.instructions` displayed in collapsible card |
| Animations move? | ✅ Yes — V8 component renders with pose mapping |
| Console errors | 0 expected — all exercise IDs have master data |
| Mode behavior | Flare: pain≥7/fatigue≥7/sleep≤3. Flare boosts breath+release. All exercises universalSafe+flareSafe. |

### Test: Back + Fibro

| Check | Result |
|-------|--------|
| Plan generates? | ✅ Yes — multi-condition scoring sums relevance across both |
| Workout loads? | ✅ Yes |
| Instructions show? | ✅ Yes |
| Animations move? | ✅ Yes |
| Console errors | 0 expected |
| Notes | Primary condition (first selected) gets 2× weight. Both universalSafe tags checked. |

### Test: Pregnancy Only

| Check | Result |
|-------|--------|
| Plan generates? | ✅ Yes — filters to pregnancySafe exercises only |
| Workout loads? | ✅ Yes |
| Instructions show? | ✅ Yes |
| Animations move? | ✅ Yes |
| Console errors | 0 expected |
| Notes | Exercises without pregnancySafe:true excluded. Category balance maintained. |

### Test: Disc + Stress

| Check | Result |
|-------|--------|
| Plan generates? | ✅ Yes — intersection of discSafe + universalSafe. Flexion/rotation contraindications removed. |
| Workout loads? | ✅ Yes |
| Instructions show? | ✅ Yes |
| Animations move? | ✅ Yes |
| Console errors | 0 expected |
| Notes | Stress boosts breath+release (+1). Disc removes flexion exercises. |

### Test: Sleep Only

| Check | Result |
|-------|--------|
| Plan generates? | ✅ Yes — sleep boosts release category, last 2 exercises forced to release |
| Workout loads? | ✅ Yes |
| Instructions show? | ✅ Yes |
| Animations move? | ✅ Yes |
| Console errors | 0 expected |
| Notes | `hasSleep` flag in scoringEngine enforces release exercises at end. Category targets increase release from 20% to 30%. |

---

## SECTION 10 — OPEN TODOs / KNOWN ISSUES

### Unfinished / Partial

1. **Relevance scores missing on original ~40 exercises**: The first ~40 exercises (the original library) do not have explicit `relevance` scores. They rely on category-based defaults in `CATEGORY_DEFAULT_RELEVANCE` within `scoringEngine.ts`. This means scoring is less precise for these exercises compared to the newer ~60 that have per-exercise relevance scores.

2. **Dose info missing on original ~40 exercises**: Same set — no `dose`, `targets`, or `movementPattern` fields. These are optional fields but reduce the engine's ability to do dosage-aware selection.

3. **Exercise count vs spec**: The spec requested exactly 100 exercises with specific named exercises. While the total count is ~100, not every single exercise named in the spec was added. Some were consolidated or renamed.

4. **Seated animation is static**: The `seated` pose recipe uses `SeatedFigure` twice with the same component — effectively no frame transition, relying only on category micro-motion (breath pulse, etc.).

5. **ID_POSE override map is empty**: No per-exercise-ID pose overrides configured. All pose assignment is via keyword matching or category defaults.

6. **ExerciseCard component**: The old `ExerciseCard.tsx` still exists but is NOT used in the current Workout flow (Workout.tsx renders exercises inline). It could be removed.

7. **Old animation components**: `ExerciseAnimation.tsx`, `ExerciseAnimationV3.tsx`, `ExerciseAnimationV4.tsx`, `ExerciseAnimationV6.tsx`, and `ExerciseAnimationV7.tsx` still exist in the codebase but are NOT imported anywhere. They are dead code and could be removed.

8. **exerciseAdapter generates many IDs**: The adapter creates condition-prefixed copies of every safe exercise (e.g., `fib_breath_01`, `back_breath_01`, etc.) — this multiplies the library size. The scoring engine handles this via `MASTER_LOOKUP` deduplication, but the Exercise[] array passed to the engine is larger than necessary.

9. **No dark mode**: Design system defines only light mode tokens. No `:root.dark` or `@media (prefers-color-scheme: dark)` support.

10. **CheckinPage does not pass library/conditions to adaptNextSession**: `src/pages/CheckinPage.tsx` line 60-67 calls `adaptNextSession` without `library` or `conditions` arguments, so session adaptation uses the legacy fibro fallback path instead of the scoring engine. This is a functional gap.

11. **Lottie fields unused**: The `Exercise` interface still has `lottie_url_normal`, `lottie_url_easier`, `lottie_url_flare` fields, all set to `null`. These are vestigial from a prior animation approach.

### No Regressions Found

- ✅ Routing unchanged
- ✅ Disclaimer + red flags STOP intact
- ✅ Fibromyalgia thresholds intact
- ✅ localStorage state management intact
- ✅ Hebrew-only UI maintained
- ✅ RTL everywhere maintained
- ✅ Mobile-first layout maintained

---

*End of System 2.0 Execution Audit*
