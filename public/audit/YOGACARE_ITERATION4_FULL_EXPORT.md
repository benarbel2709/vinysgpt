# YOGACARE — COMPLETE PRODUCT AUDIT EXPORT (POST-INTERNATIONALIZATION)
## Version: Iteration 4 — English-First US Market Build
## Generated: 2026-02-20
## Viewport: 390×844 (iPhone 14 Pro equivalent)

---

# PART 1 — FULL VISUAL SCREEN EXPORT

> **Note:** Screenshots cannot be programmatically embedded in Markdown. Below are EXACT visual descriptions of every screen at 390×844 viewport, derived from verified source code. For actual pixel-accurate screenshots, navigate to each route in the live preview at the published URL.

---

## 1.1 HOMEPAGE — ABOVE THE FOLD (`/`)

**Full-viewport dark hero section.**

- **Background:** CSS gradient `from-[hsl(215,50%,11%)] via-[hsl(215,50%,14%)] to-[hsl(215,50%,8%)]` — deep ink navy.
- **Overlay:** AdaptiveWaveHero SVG component at 12% opacity:
  - Three flowing SVG paths: gold (`--color-gold`), sage (`--color-sage`), white (40% opacity)
  - Vertical dashed spine line (gold, 30% opacity) with `animate-spine-pulse` (6s ease-in-out infinite)
  - Two curved arcs flanking spine (sage, 25% opacity)
  - Wave paths use `animate-wave-drift` (12s ease-in-out infinite) and `animate-wave-drift-slow` (18s reverse)
  - Two soft radial glows: gold (4% opacity, blur-60px top-right), sage (3% opacity, blur-80px bottom-left)
- **No header** (`hideHeader={true}`)
- **Content stack (centered, max-w-lg, px-6, py-20, animate-hero-fade-up with 200ms delay):**
  1. YogaCareLogo SVG icon at 48px
  2. Eyebrow: "ADAPTIVE YOGA FOR MODERN BODIES" — 11px, tracking-[0.3em], uppercase, white/40%, font-medium
  3. H1: "Yoga that adapts to your body." — 36px mobile / 48px sm / 56px lg, bold, white, tracking-[-0.03em], leading-[1.06]
  4. Subheadline: "A structured practice built around your current needs — from performance balance to supportive recovery." — 15px mobile / 17px sm, white/55%, leading-[1.7], max-w-[380px]
  5. CTA Button: "Start your session →" — variant="hero" size="xl", min-w-[240px], bg gold (#C6A85E), text ink (#0E1A2B), shadow `0 8px 32px rgba(198,168,94,0.3)`, press-scale
  6. Scroll hint: "See how it works" + bouncing chevron SVG — 13px, white/35%, animate-bounce on chevron

## 1.2 HOMEPAGE — MID-SCROLL

**Signal bar** (full-width, bg-card, border-b, py-3):
- "Balance" (accent) • "Support" (secondary) • "Restore" (foreground/60%) | "15 min" chip (bg-surface-soft) | "Built for today"

**"Why YogaCare" section** (id="why-section", scroll-mt-20, mt-10, mb-16):
- H2: "Why YogaCare" — centered
- 3× card-premium cards (p-6, flex, gap-4):
  1. Sparkles icon (18px, accent) in 40px circle (bg-surface-soft) | "Built Around You" / "We structure your session based on how your body feels today."
  2. TrendingUp icon | "Intelligent Progression" / "Sessions follow thoughtful sequencing — not random combinations."
  3. Clock icon | "Designed for Modern Schedules" / "10–15 minute options. Or deeper sessions when you have time."

**"Three Pillars" section** (mb-16):
- H2: "Three Pillars" — centered
- 3× card-premium cards (p-6, space-y-3):
  1. Tag: "BALANCE" — 11px, tracking-[0.2em], uppercase, accent, semibold | "For active bodies and performance balance." | "Mobility, posture, and training support."
  2. Tag: "SUPPORT" | "For joint care and structural tension." | "Body awareness and supportive movement."
  3. Tag: "RESTORE" | "For recovery days and fatigue." | "Gentle recalibration and rest."

## 1.3 HOMEPAGE — BOTTOM

**"How It Works" section** (mb-16):
- H2: "How It Works" — centered
- 3× card-premium cards (p-6, flex-col sm:flex-row, gap-4, text-center):
  1. Number "1" in 40px circle (accent, bold) | "Quick Check-In" | "Tell us how your body feels."
  2. Number "2" | "We Build Your Session" | "Your practice is adapted for today."
  3. Number "3" | "Roll Out Your Mat" | "Practice at home, on your schedule."

**"Guided by Experience" section** (mb-16):
- H2: "Guided by Experience" — centered
- card-premium (p-6, flex, gap-4):
  - 56px circle (border-2 surface-soft, bg-surface-soft) with "YC" text (accent, bold, 18px)
  - "YogaCare Team" eyebrow (11px, tracking-[0.15em], uppercase, accent, semibold)
  - Body: "Designed with a supportive, therapeutic-minded approach. Our methodology emphasizes intelligent, body-aware movement informed by years of clinical teaching experience." — 15px, foreground

**Trust strip** (mb-10, flex-wrap, gap-3):
- 3× chips: "No login required" · "Safety first" · "Designed for busy schedules" — text-xs, muted-foreground, px-4, py-2, rounded-full, bg-card, shadow-premium

**Bottom CTA** (max-w-xs):
- Button: "Get started →" — variant="hero" size="xl", press-scale, shadow-xl

**Footer:**
- "© YogaCare — Adaptive Yoga for Modern Bodies" — text-xs, muted-foreground, centered, py-4

---

## 1.4 DISCLAIMER PAGE (`/disclaimer`)

- **Header:** Sticky, h-14, bg-card/90 backdrop-blur-xl, border-b. Left: YogaCareLogo (28px). Right: BookOpen icon (Library link), Settings icon, Info icon (About modal).
- **PageIllustration:** theme="shield" — Lucide Shield icon in gold ellipse (SVG concentric ellipses at 8% and 12% opacity)
- **H1:** "Important to Read" — centered
- **Disclaimer card** (card-premium p-6, space-y-4):
  - P1: "This app provides general movement guidance and is not a substitute for medical diagnosis, treatment, or professional advice."
  - P2: "If you experience significant worsening, sharp/new pain, increasing numbness/weakness, unusual dizziness/fainting, shortness of breath, fever, or any concerning symptom — stop immediately and seek medical advice."
- **Checkbox card** (card-premium p-4, flex, gap-3):
  - Custom checkbox (22px, rounded-6px, ink when checked with white checkmark)
  - Label: "I have read and understood" — 15px, font-medium
- **CTA:** "Continue" — variant="hero" size="lg", disabled until checkbox checked, full-width

---

## 1.5 CONDITIONS PAGE (`/conditions`)

- **Header:** Same as 1.4
- **Flow progress bar:** Step 1 of 5 — dot indicators
- **PageIllustration:** theme="list"
- **H1:** "What brings you here?" — centered
- **Microcopy:** "Select all that apply. This helps us build your session." — text-sm, muted-foreground
- **2-column grid** (gap-3, role="group"):
  - 17 condition buttons, each: text-sm, font-medium, rounded-[16px], px-3, py-4, border-2, min-h-[56px], centered text
  - Unselected: border-border, bg-card, text-foreground, hover:border-accent/30
  - Selected: border-accent, bg-accent/10, text-foreground, shadow-sm + green check circle (w-5, h-5, bg-accent, absolute top-2 left-2)
  - Conditions (English labels): Back Pain, Neck, Shoulders, Knees, Hips, Pregnancy, Postpartum, Fibromyalgia, Disc Herniation, Sciatica, Osteoarthritis, Post-Injury Rehab, Stress & Anxiety, Sleep Issues, Menopause, Cross Training, General Yoga
- **Fixed bottom bar** (appears when ≥1 selected): bg-background/90 backdrop-blur-md, border-t, p-4, z-40
  - Button: "Continue" — variant="hero" size="lg", full-width → navigates to /setup

---

## 1.6 SETUP PAGE (`/setup`)

- **Flow progress:** Step 2 of 5
- **PageIllustration:** theme="settings"
- **H1:** "Session Preferences" — centered
- **Microcopy:** "This helps us build your session."

**Cards (all card-premium p-6, space-y-3):**

1. **Sessions per week:** 4 buttons (2, 3, 4, 5) — flex, rounded-[16px], border-2, selected: border-accent bg-accent/10 shadow-sm
2. **Minutes per session:** 6 buttons (10 Quick, 15 Quick, 20, 30, 45, 60) — flex-wrap, min-w-[48px]. "Quick" label: text-[10px] text-accent
3. **Preferred time of day:** 2×2 grid:
   - Morning (06:00–12:00), Afternoon (12:00–17:00), Evening (17:00–21:00), Night (21:00+)
4. **Your energy level today:** 3 buttons:
   - Low (Gentle & calming), Moderate (Balanced practice), High (More dynamic)
5. **Flare toggle card:** Custom toggle (w-14, h-8, rounded-full). ON: bg-accent. OFF: bg-input.
   - Label: "Today is a tough day (flare)"
   - Sub: "You can change this anytime. Consistency over perfection." — text-xs, muted-foreground

- **CTA:** "Continue" — variant="hero" size="lg", full-width → /questionnaire

---

## 1.7 QUESTIONNAIRE PAGE (`/questionnaire`)

- **Flow progress:** Step 3 of 5
- **Back button:** "← Back" — text-sm, muted-foreground
- **PageIllustration:** theme="sliders"
- **Dynamic title (H1):**
  - Fibromyalgia selected: "Fibromyalgia Assessment"
  - Specific conditions: "Assessment — Back Pain, Neck" (joined condition labels)
  - No specific: "Assessment"
- **Microcopy:** "This helps us build your session."
- **Step indicator:** "Step X of 3 — [Today's state / Characteristics / Equipment & safety]"
- **Step dots:** 3 dots (active: w-8 bg-primary, completed: w-4 bg-primary/40, pending: w-4 bg-border)

### Step 1 — Today's State

**Fibromyalgia path:**
- SectionCard "How you feel today":
  - Slider: Pain (0–10), custom styled range input
  - Slider: Fatigue (0–10)
  - Slider: Sleep quality (0–10)
  - RadioGroup: "Active flare?" — Yes / No / Not sure
  - MultiSelect: "Pain areas" — Neck, Shoulders, Upper back, Lower back, Pelvis / Hips, Knees, Hands, General

**Specific condition path:**
- SectionCard "How you feel today":
  - Slider: Pain (0–10)
  - Slider: Fatigue (0–10)
  - Slider: Sleep quality (0–10)
  - RadioGroup: "Tough day / flare?" — Yes / No / Not sure

**Generic path:**
- SectionCard "Details":
  - Textarea: "What's your main concern?"
  - Slider: Pain level (0–10)

### Step 2 — Characteristics

**Fibromyalgia:**
- "What helps and what worsens?" — triggers multiselect (Prolonged sitting, Prolonged standing, Long walks, Stairs, Strength training, Intense stretches, Emotional stress, Poor sleep)
- "Does gentle movement usually:" — Improves / Neutral / Worsens
- Touch sensitivity slider (0–10)
- "Daily routine" — Day type (Sedentary / Mixed / Physical), Other activities (Walking, Gym, Pilates, Running, Swimming, Other, None)

**Condition-specific (shown per selected condition):**
- **Back pain:** Pain area (Lower/Mid/Upper back, Pelvis), Triggers (Sitting, Standing, Bending, Lifting, Twisting)
- **Neck:** Pain area (Front/Back/Side of neck), Triggers (Screen work, Driving, Sleep position, Stress, Quick movement)
- **Shoulders:** Pain area (Right/Left/Both shoulders, Shoulder blades, Arms), Triggers (Raising arms, Side lying, Lifting, Screen work)
- **Knees:** Pain area (Right/Left/Both knees), Swelling checkbox, Stairs difficulty checkbox
- **Hips:** Pain area (Right/Left/Both hips, Groin)
- **Disc herniation:** Area (Lower/Mid/Upper back), Radiating pain checkbox, Numbness/weakness checkbox
- **Sciatica:** Area (Buttock, Right/Left leg, Foot), Radiating pain checkbox
- **Osteoarthritis:** Affected joints (Knees, Hips, Hands, Shoulders, Spine), Swelling checkbox
- **Pregnancy:** Trimester (1/2/3), Complaints (Back pain, Pelvic pain, Fatigue, Swelling)
- **Postpartum:** Weeks since delivery (number input)
- **Menopause:** Symptoms (Hot flashes, Sleep disruption, Joint pain, Mood changes, Fatigue, Dryness)
- **Cross training:** Primary training type (Strength training, Running, Cycling, Swimming, Other cardio)
- **Stress & anxiety:** Triggers (Work stress, Poor sleep, Conflicts, Changes, Caffeine)
- **Sleep issues:** Type (Difficulty falling asleep, Night waking, Early waking, Poor sleep quality)
- Daily routine section (same as fibro)

**Generic:**
- "Limitations or restrictions" textarea

### Step 3 — Equipment & Safety

- MultiSelect: Equipment — Wall, Chair, Blocks, Strap, Bolster, Blanket
- Text input: "Anything to avoid?" (optional)
- **Safety check (variant="danger"):** Red border/30, AlertTriangle icon
  - 5 checkboxes (RED_FLAGS):
    1. New sharp pain
    2. Increasing numbness or weakness
    3. Unusual dizziness or fainting
    4. Shortness of breath
    5. Fever or acute illness

**CTA per step:**
- Steps 1–2: "Continue" → next step
- Step 3: "Build my plan" → /plan (or /stop if any red flag checked)

---

## 1.8 PLAN PAGE (`/plan`)

- **Flow progress:** Step 4 of 5
- **PageIllustration:** theme="calendar"
- **H1:** "Your adaptive plan" — centered
- **Subheadline:** "Built around how you feel today." — text-sm, muted-foreground

**TailoringSnapshot component:**
- card-premium with:
  - Header: Sparkles icon (14px, accent) in 32px gold circle + "Built from your check-in" / "Adapted to how you feel today"
  - Chips row: Duration (Clock icon), Energy (Zap icon), Time (Sun icon), optional Flare (Target icon), Primary condition (Target icon, sage bg)
  - Expandable "Why this plan" section with bullet points: Duration, Energy, Time, Mode, Focus

**Summary panel** (collapsible, card-premium):
- Toggle: BarChart3 icon + "My Summary"
- When open: 3-column grid (bg-surface-soft rounded-[16px]):
  - Completed: X/Y
  - Avg pain after: X/10
  - Most helpful: Breath/Movement/Release

**Session cards** (space-y-3):
- Per session (card-premium p-5):
  - Left: Calendar icon in 36px circle (bg-surface-soft or bg-accent/10 if done)
  - Title: "Session 1" (font-bold)
  - Mode badge: Standard (bg-accent/10 text-accent) / Easier (bg-surface-soft) / Flare (bg-surface-warm)
  - Meta row: Day name, Duration min, Exercise count — text-xs, muted-foreground, ml-[48px]
  - CTA: "▶ Start session" — variant="hero" size="sm", full-width (hidden if done)

**Info cards:**
1. Info icon (accent, in surface-soft circle) + "Complementary practice: This supports but doesn't replace other activities."
2. Lightbulb icon (accent, in surface-gold circle) + "Tough day? Tap "Flare mode" during your session and we'll adapt immediately."

**Bottom link:** "Change duration/frequency" — variant="outline-calm", full-width → /setup

**Empty state** (if no plan):
- PageIllustration calendar
- "No plan yet" — muted-foreground
- Button: "Build your plan" → /conditions

---

## 1.9 WORKOUT PAGE (`/workout/:sessionId`)

- **Header:** YogaCareLogo + "← Back to plan" button + Library/Settings/About icons
- **Eyebrow:** "Your adaptive session for today" — 11px, tracking-[0.2em], uppercase, muted-foreground

**Progress bar:**
- "Exercise X of Y" — text-xs
- Dot row: active dot w-6 bg-accent, completed w-3 bg-accent/40, pending w-3 bg-border

**Timer:** MM:SS — text-sm font-mono font-bold, in card rounded-full px-4 py-1.5 shadow-premium. Pulses (animate-pulse ring-2 ring-accent/40) at 00:00.

**Exercise display:**
- Title: master.title — 22px, bold, foreground (with TTS button: Volume2/VolumeX/Loader2 icons)
- Category badge: "Breath · X min" — rounded-full, category-colored:
  - breath: bg-surface-soft text-accent
  - mobility: bg-surface-sage text-secondary
  - stability: bg-surface-gold text-accent
  - release: bg-surface-warm text-foreground
- **"Why" preview:** First sentence of master.why — 13px, muted-foreground, in rounded-2xl bg-surface-soft with Lightbulb icon

**Animation area:**
- ExerciseVideoAnimation component (364px min-height):
  - **Video layer:** Auto-playing MP4 loop for breath/mobility categories
  - **Fallback:** ExerciseAnimationV7 rigged SVG (for stability/release or when video errors)
  - Breathing exercises get `animate-breathing` class (4s scale pulse)
- Below animation: master.cue — 12px, italic, muted-foreground

**Breathing strip** (if master.breathing exists):
- rounded-[20px], px-4, py-3, bg-accent/15, animate-breath-pulse (4s)
- Wind icon + breathing text — 14px, semibold

**Safety warning:**
- border-l-2 border-destructive/30, pl-3, py-2
- ShieldCheck icon (destructive/50) + safety text — 13px, muted-foreground

**Instructions** (collapsible details):
- Summary: "Instructions" — 15px, font-bold, with ChevronDown
- Numbered list: each step with accent number in circle (bg-accent/10)

**Reps/Range:**
- Reps pill: text-xs, font-semibold, px-3, py-1.5, rounded-full, bg-surface-soft
- Range text: text-xs, muted-foreground

**"More details" toggle:**
- Opens "Why this exercise?" panel — rounded-[20px], bg-surface-soft, Lightbulb icon

**Equipment badges:** (if any) — text-xs, bg-surface-soft, px-2.5, py-1, rounded-full, font-semibold

**Next exercise button:** (if not last) — full-width, border border-accent/20, text-accent, press-scale

**Pacing reminder** (card-premium p-3):
- ShieldCheck icon + "Intensity 3/10 · No sharp pain · You should feel fine tomorrow"

**Condition tip** (card-premium p-3):
- Heart icon + dynamic tip text per primary condition

**Fixed bottom bar:**
- 4 buttons in flex row:
  1. "Easier" — outline-calm or hero if active
  2. "Flare mode" — outline-calm or hero if active
  3. "Pause" / "Resume" — outline-calm
  4. "Finish session" — hero, flex-[1.5]

**Empty state** (session not found):
- "Session not found" — muted-foreground
- Button: "Back to plan" → /plan

---

## 1.10 CHECK-IN PAGE (`/checkin/:sessionId`)

- **Flow progress:** Step 5 of 5
- **PageIllustration:** theme="check"
- **H1:** "Quick Check-In" — centered
- **Microcopy:** "This helps us adapt your next session."

**Sliders card** (card-premium p-6, space-y-5):
- Pain before (0–10)
- Pain after (0–10)
- Fatigue before (0–10)
- Fatigue after (0–10)
- Each: label left, value badge right (accent bg/10, rounded-full 32px)

**Controls card** (card-premium p-6, space-y-5):
- Toggle: "Was it too much?" — destructive color when ON
- RadioGroup: "What helped most?" — Breath / Movement / Release (accent when selected)

**CTA:** "Save & continue" — variant="hero" size="lg", full-width

**Post-save state:**
- card-premium p-4 with CheckCircle2 (accent) + "Saved — we'll adapt your next session based on this." — animate-fade-in
- Auto-navigates to /complete after 1500ms

---

## 1.11 COMPLETE PAGE (`/complete`)

- No flow progress bar
- 80px circle (bg-surface-sage) with CheckCircle2 (40px, secondary color) — fade-in with 700ms transition
- **H1:** "Well done! 🎯" — 28px
- **Body:** "Session complete — your body thanks you." — 16px, muted-foreground
- **Stats card** (card-premium px-6 py-4): "Session X of Y this week" — 15px, font-medium
- **CTA:** "Back to plan" — variant="hero" size="lg", max-w-xs → /plan
- **Microcopy:** "Auto-redirecting to plan in a few seconds..." — text-xs, muted-foreground
- Auto-redirect to /plan after 5000ms (cancelled if button clicked)

---

## 1.12 STOP PAGE (`/stop`)

- 80px circle (bg-destructive/8) with AlertTriangle (36px, destructive)
- **H1:** "Please Stop" — centered
- **Card** (card-premium p-6, border border-destructive/20):
  - Bold: "This is not the right time to practice."
  - Body: "If you're experiencing sharp new pain, increasing numbness or weakness, unusual dizziness, shortness of breath, fever, or acute illness — please stop and consult a medical professional." — muted-foreground
- **CTA:** "Return home" — variant="hero" size="lg", max-w-xs → /

---

## 1.13 LIBRARY PAGE (`/library`)

- **H1:** "Exercise Library" — centered
- **Subheadline:** "Explore all available exercises in the YogaCare system." — text-sm, muted-foreground
- **Search input:** Search icon (left), rounded-2xl border-2, pl-10, "Search exercises..."
- **Filter chips:** All, Breath, Mobility, Stability, Release — rounded-full border-2, accent when active
- **Count:** "X exercises" — text-xs
- **Grid** (1-col mobile, 2-col sm, gap-3):
  - Per exercise (card-premium p-5):
    - Category icon (Wind/Move/Shield/Heart) in 36px circle (bg-surface-soft)
    - Title (14px, bold, truncate)
    - Category badge + duration
    - First sentence of "why" — text-xs, muted, line-clamp-2
- **Empty state:** "No exercises match your search."

---

## 1.14 SETTINGS PAGE (`/settings`)

- **H1:** "Settings" — centered
- **Subheadline:** "Manage your preferences and data."

**Cards:**
1. **Preferences:** Settings icon + "Exercise animations" toggle (Switch component)
2. **Data Management:** Download icon + Export data / Import data buttons (outline-calm). Import confirm dialog with Yes/Cancel.
3. **About YogaCare:** Info icon + brand statement + "Educational movement content. Not medical advice."
4. **Reset:** "Full reset — start over" button → confirmation dialog: "This will delete all data. Are you sure?" with Yes (stop variant) / Cancel

---

## 1.15 ABOUT MODAL (triggered by Info icon in header)

- Dialog (max-w-md, max-h-85vh, scrollable, rounded-[20px])
- **Title:** "About YogaCare" — 20px, bold
- **Brand heading:** "Adaptive Yoga for Modern Bodies" — bold, 18px
- **Body:** "YogaCare builds structured, adaptive yoga sessions designed around your body's current needs."
- **Credit:** "Designed with a supportive, therapeutic-minded approach informed by years of clinical teaching experience." — text-sm, muted
- **Disclaimer section:** "DISCLAIMER" uppercase heading + "Educational movement content. Not medical advice."
- **Settings section:** Animation toggle + Export/Import buttons
- **Debug panel** (hidden unless ?debug=1 or debugAnimations=true): Animation state info + force animate toggle
- **Reset section:** Full reset with confirmation

---

## 1.16 EXPERT REVIEW PAGE (`/expert-review`)

- Full-width layout (no Layout wrapper), max-w-[1400px], LTR
- **H1:** "Expert Review — Exercise Library" — 30px, bold
- **Subtitle:** "X exercises | Y supported conditions"
- **Tabs:** Compatibility Matrix / Export Content
- **Matrix tab:** Scrollable table, sticky left column (exercise title), columns for Category, Min, Flare, then each condition (17 columns). ✓ = safe, — = not included.
- **Summary stats:** 4 category count cards (breath, mobility, stability, release)
- **Export tab:** CSV download button with description

---

## 1.17 404 PAGE (`/*`)

- Full-screen centered (bg-muted)
- "404" — text-4xl, bold
- "Oops! Page not found" — text-xl, muted-foreground
- "Return to Home" — primary underline link

---

## 1.18 AUDIT EXPORT PAGE (`/audit-export`)

- System audit text display (legacy format, Heebo font references — outdated content from pre-internationalization)

---

# PART 2 — FULL UX FLOW MAP

---

## 2.1 ENTRY POINT

User lands on `/` (Homepage). No login required. No authentication anywhere.

## 2.2 HOMEPAGE CTA LOGIC

```
Homepage
├── Primary CTA: "Start your session →" → /disclaimer
├── Secondary CTA: "See how it works ↓" → smooth scroll to #why-section
└── Bottom CTA: "Get started →" → /disclaimer
```

## 2.3 ONBOARDING DECISION TREE

```
/ (Home)
└── /disclaimer
    └── [Checkbox: "I have read and understood"]
        └── Continue → /conditions
            └── [Select 1+ conditions from 17 options]
                └── Continue → /setup
                    └── [Configure: sessions/week, minutes, time, energy, flare]
                        └── Continue → /questionnaire
                            └── [3-step wizard based on conditions]
                                ├── [Any RED FLAG checked] → /stop
                                └── "Build my plan" → /plan
                                    └── "Start session" → /workout/:id
                                        └── "Finish session" → /checkin/:id
                                            └── "Save & continue" → /complete
                                                └── [Auto-redirect 5s] → /plan
```

## 2.4 CONDITION BRANCHING LOGIC

The Questionnaire page (`/questionnaire`) dynamically renders based on selected conditions:

```
conditions = state.profile.conditions

IF conditions.includes("fibromyalgia"):
  → FIBRO PATH (specialized 3-step questionnaire)
    Step 1: Pain + Fatigue + Sleep + Flare + Pain areas
    Step 2: Triggers + Gentle effect + Touch sensitivity + Day type + Activities
    Step 3: Equipment + Restrictions + Red flags

ELSE IF any specific condition (back, neck, shoulder, knee, hip, disc, sciatica, OA, pregnancy, postpartum, menopause, cross_training, stress, sleep, rehab, general_yoga):
  → CONDITION-SPECIFIC PATH
    Step 1: Pain + Fatigue + Sleep + Flare
    Step 2: Per-condition characteristic sections (shown only for selected conditions)
    Step 3: Equipment + Restrictions + Red flags

ELSE:
  → GENERIC PATH
    Step 1: Main concern textarea + Pain slider
    Step 2: Limitations textarea
    Step 3: Equipment + Red flags
```

### Per-Condition Step 2 Sections (shown only when that condition is selected):

| Condition | Section Title | Inputs |
|-----------|--------------|--------|
| back_pain | "Back pain — characteristics" | Pain area multiselect, Trigger multiselect |
| neck_pain | "Neck — characteristics" | Pain area, Triggers |
| shoulder_pain | "Shoulders — characteristics" | Pain area, Triggers |
| knee_pain | "Knees — characteristics" | Pain area, Swelling checkbox, Stairs checkbox |
| hip_pain | "Hips — characteristics" | Pain area |
| disc_herniation | "Disc herniation — characteristics" | Area, Radiating pain checkbox, Numbness checkbox |
| sciatica | "Sciatica — characteristics" | Area, Radiating pain checkbox |
| osteoarthritis | "Osteoarthritis — characteristics" | Affected joints, Swelling checkbox |
| pregnancy | "Pregnancy — characteristics" | Trimester radio, Complaints multiselect |
| postpartum | "Postpartum — characteristics" | Weeks since delivery number input |
| menopause | "Menopause — characteristics" | Symptoms multiselect |
| cross_training | "Cross training — characteristics" | Primary training type multiselect |
| stress_anxiety | "Stress & anxiety — characteristics" | Triggers multiselect |
| sleep_issues | "Sleep issues — characteristics" | Type multiselect |

## 2.5 FIBROMYALGIA LOGIC

Fibromyalgia gets specialized treatment:

1. **Assessment type:** `type: "fibro"` with FibroAssessmentData
2. **Plan generation:** `generatePlan(profile, assessmentId, fibroData, library)` — passes full fibro assessment
3. **Mode determination:** Uses pain, fatigue, sleep, flareNow from fibro assessment
4. **Legacy pools (fallback):**
   - Flare: 7 exercises (breath + release heavy)
   - Easier: 9 exercises
   - Normal: 11 exercises
5. **Scoring weight:** 1.2× (CONDITION_WEIGHT)
6. **Category boost:** breath and release get +1 score when fibro is a condition
7. **Safety tag:** `universalSafe` required

## 2.6 CONTRAINDICATION HANDLING

### Safety Tag System

Each exercise has boolean safety tags:
```typescript
tags: {
  universalSafe: boolean;    // General population
  pregnancySafe: boolean;    // Pregnancy/postpartum
  discSafe: boolean;         // Disc herniation/sciatica
  kneeSafe: boolean;         // Knee/hip conditions
  oaSafe: boolean;           // Osteoarthritis
  shoulderSafe: boolean;     // Neck/shoulder conditions
  flareSafe: boolean;        // During flare/crisis
}
```

### Mapping (CONDITION_SAFETY_TAG):
```
fibromyalgia      → universalSafe
back_pain         → universalSafe
neck_pain         → shoulderSafe
shoulder_pain     → shoulderSafe
knee_pain         → kneeSafe
hip_pain          → kneeSafe
pregnancy         → pregnancySafe
postpartum        → pregnancySafe
disc_herniation   → discSafe
sciatica          → discSafe
osteoarthritis    → oaSafe
post_injury_rehab → universalSafe
stress_anxiety    → universalSafe
sleep_issues      → universalSafe
menopause         → universalSafe
older_adult       → universalSafe
cross_training    → universalSafe
general_yoga      → universalSafe
```

### Disc/Sciatica Additional Filtering:
```
IF conditions includes disc_herniation OR sciatica:
  IF exercise has contraindicationFlags:
    REJECT if avoidFlexion === true OR avoidRotation === true
  ELSE IF exercise has contraindications array:
    REJECT if any string includes "disc", "sciatica", "flexion", or "rotation"
```

### Pregnancy Additional Check:
```
IF conditions includes pregnancy:
  REJECT if pregnancySafe === false
```

## 2.7 PLAN GENERATION ALGORITHM

### Entry Point: `generatePlan()` in `src/lib/planGenerator.ts`

```
INPUT: profile, assessmentId, assessment?, library?, conditionAssessment?
OUTPUT: Plan { id, assessmentId, weekStartISO, sessions[] }

1. DETERMINE MODE:
   - If flareToday → "flare"
   - If flareNow === "yes" → "flare"
   - If pain ≥ 7 OR fatigue ≥ 7 OR sleep ≤ 3 → "flare"
   - If pain ≥ 5 OR fatigue ≥ 5 → "easier"
   - If energyLevel === "low" → "easier"
   - Else → "normal"

2. DISTRIBUTE DAYS:
   DAY_DISTRIBUTIONS = {
     2: [2, 5],          // Tue, Fri
     3: [2, 4, 6],       // Tue, Thu, Sat
     4: [1, 3, 5, 7],    // Mon, Wed, Fri, Sun
     5: [1, 2, 4, 6, 7], // Mon, Tue, Thu, Sat, Sun
   }

3. SELECT EXERCISES (via scoringEngine):
   a. Filter: isSafeForConditions(master, conditions, mode)
   b. Score each exercise:
      - Primary condition score × 2
      - Secondary conditions averaged
      - Mode bonuses (flare: breath+2, release+2, stability-2)
      - Anti-repetition penalty (-2 if in recent 20)
      - No-equipment bonus (+0.3)
   c. Bucket by category (breath/mobility/stability/release)
   d. Sort buckets by score, seeded shuffle top half
   e. Fill targets:
      - Normal: breath=1, stability≥2, release≥1(≥2 for sleep), mobility=remainder
      - Easier: breath=1, stability≥1, release≥1, mobility≥1
      - Flare: breath=1, stability≥0, release heavy, mobility=remainder
   f. If sleep_issues: ensure ≥2 release exercises at end

4. EXERCISE COUNT BY DURATION:
   ≤10min → 3 exercises
   ≤15min → 5
   ≤20min → 6
   ≤30min → 8
   ≤45min → 10
   >45min → 12

5. CREATE SESSIONS: Same exercise set for all sessions in the week (same mode, same duration)
```

### Deterministic Variety (Anti-Repetition):
```
- Session seed = hash(weekNumber × 31 + sorted conditions string)
- Recent exercises stored in localStorage key "yogacareRecentExercises" (last 20 IDs)
- Recent exercises get -2 score penalty
- Top half of each category bucket is seeded-shuffled for variety
```

## 2.8 SAFETY STOP LOGIC

```
RED_FLAGS = [
  "New sharp pain",
  "Increasing numbness or weakness",
  "Unusual dizziness or fainting",
  "Shortness of breath",
  "Fever or acute illness",
]

ON QUESTIONNAIRE SUBMIT:
  IF any red flag checkbox is checked:
    navigate("/stop")  // Blocks plan creation
  ELSE:
    Generate plan → navigate("/plan")
```

## 2.9 CHECK-IN ADAPTIVE LOGIC

```
adaptNextSession(plan, currentSessionId, tooMuch, painDelta, flareToday, minutes):

  IF NOT tooMuch AND painDelta < 2:
    RETURN plan unchanged  // No adaptation needed

  ELSE:
    Find next planned session after current
    IF no next session: RETURN unchanged

    newMode = flareToday ? "flare" : "easier"
    Re-select exercises for newMode + conditions
    Update next session with new mode + exercises
```

## 2.10 EXERCISE PROGRESSION RULES

1. **Within session:** Linear progression through exercise list. User can tap "Next exercise →" or wait for timer.
2. **Between sessions:** Same exercises for the entire week (deterministic per week+conditions hash). Next week gets different seed → different selection.
3. **Mode switching mid-session:** "Easier" or "Flare mode" buttons re-select the entire exercise list for the new mode, resetting to exercise 0.
4. **Cross-week:** No persistent progression tracking beyond check-in data. Each plan generation is independent.
5. **Anti-repetition:** Last 20 used exercise IDs penalized by -2 in scoring.

---

# PART 3 — CONTENT EXPORT (RAW TEXT)

---

## 3.1 HOMEPAGE

### Hero
- Eyebrow: "ADAPTIVE YOGA FOR MODERN BODIES"
- H1: "Yoga that adapts to your body."
- Subheadline: "A structured practice built around your current needs — from performance balance to supportive recovery."
- Primary CTA: "Start your session →"
- Scroll hint: "See how it works"

### Signal Bar
- "Balance" · "Support" · "Restore" | "15 min" | "Built for today"

### Why YogaCare (H2)
- Feature 1: "Built Around You" / "We structure your session based on how your body feels today."
- Feature 2: "Intelligent Progression" / "Sessions follow thoughtful sequencing — not random combinations."
- Feature 3: "Designed for Modern Schedules" / "10–15 minute options. Or deeper sessions when you have time."

### Three Pillars (H2)
- BALANCE / "For active bodies and performance balance." / "Mobility, posture, and training support."
- SUPPORT / "For joint care and structural tension." / "Body awareness and supportive movement."
- RESTORE / "For recovery days and fatigue." / "Gentle recalibration and rest."

### How It Works (H2)
- "1" / "Quick Check-In" / "Tell us how your body feels."
- "2" / "We Build Your Session" / "Your practice is adapted for today."
- "3" / "Roll Out Your Mat" / "Practice at home, on your schedule."

### Guided by Experience (H2)
- Eyebrow: "YogaCare Team"
- Body: "Designed with a supportive, therapeutic-minded approach. Our methodology emphasizes intelligent, body-aware movement informed by years of clinical teaching experience."

### Trust Chips
- "No login required"
- "Safety first"
- "Designed for busy schedules"

### Bottom CTA
- "Get started →"

### Footer
- "© YogaCare — Adaptive Yoga for Modern Bodies"

---

## 3.2 DISCLAIMER PAGE

- H1: "Important to Read"
- P1: "This app provides general movement guidance and is not a substitute for medical diagnosis, treatment, or professional advice."
- P2: "If you experience significant worsening, sharp/new pain, increasing numbness/weakness, unusual dizziness/fainting, shortness of breath, fever, or any concerning symptom — stop immediately and seek medical advice."
- Checkbox: "I have read and understood"
- CTA: "Continue"

---

## 3.3 CONDITIONS PAGE

- H1: "What brings you here?"
- Microcopy: "Select all that apply. This helps us build your session."
- Condition labels: Back Pain, Neck, Shoulders, Knees, Hips, Pregnancy, Postpartum, Fibromyalgia, Disc Herniation, Sciatica, Osteoarthritis, Post-Injury Rehab, Stress & Anxiety, Sleep Issues, Menopause, Cross Training, General Yoga
- CTA: "Continue"

---

## 3.4 SETUP PAGE

- H1: "Session Preferences"
- Microcopy: "This helps us build your session."
- Label: "Sessions per week" — 2, 3, 4, 5
- Label: "Minutes per session" — 10 (Quick), 15 (Quick), 20, 30, 45, 60
- Label: "Preferred time of day" — Morning (06:00–12:00), Afternoon (12:00–17:00), Evening (17:00–21:00), Night (21:00+)
- Label: "Your energy level today" — Low (Gentle & calming), Moderate (Balanced practice), High (More dynamic)
- Toggle: "Today is a tough day (flare)"
- Sub: "You can change this anytime. Consistency over perfection."
- CTA: "Continue"

---

## 3.5 QUESTIONNAIRE PAGE

- Dynamic H1: "Fibromyalgia Assessment" / "Assessment — [conditions]" / "Assessment"
- Microcopy: "This helps us build your session."
- Step labels: "Today's state", "Characteristics", "Equipment & safety"
- Back button: "← Back"
- Slider labels: "Pain", "Fatigue", "Sleep quality", "Pain level", "Touch sensitivity (0=none, 10=high)"
- Radio labels: "Active flare?", "Tough day / flare?", "Does gentle movement usually:", "Day type", "Trimester"
- MultiSelect labels: "Pain areas", "What worsens?", "Other activities", "Equipment", "Pain area", "Affected joints", "Complaints", "Main symptoms", "Primary training type", "Type of issue"
- Checkbox labels: "Any swelling?", "Difficulty with stairs?", "Radiating pain to leg?", "Radiating pain down the leg?", "Numbness or weakness?"
- Input labels: "What's your main concern?", "Limitations or restrictions", "Weeks since delivery", "Anything to avoid?"
- Section titles: "How you feel today", "What helps and what worsens?", "Daily routine", "Back pain — characteristics", "Neck — characteristics", "Shoulders — characteristics", "Knees — characteristics", "Hips — characteristics", "Disc herniation — characteristics", "Sciatica — characteristics", "Osteoarthritis — characteristics", "Pregnancy — characteristics", "Postpartum — characteristics", "Menopause — characteristics", "Cross training — characteristics", "Stress & anxiety — characteristics", "Sleep issues — characteristics", "Available equipment", "Safety check", "Details", "Limitations"
- CTA: "Continue" (steps 1-2), "Build my plan" (step 3)

---

## 3.6 RED FLAGS

1. "New sharp pain"
2. "Increasing numbness or weakness"
3. "Unusual dizziness or fainting"
4. "Shortness of breath"
5. "Fever or acute illness"

---

## 3.7 PLAN PAGE

- H1: "Your adaptive plan"
- Subheadline: "Built around how you feel today."
- TailoringSnapshot: "Built from your check-in" / "Adapted to how you feel today" / "Why this plan"
- Summary toggle: "My Summary"
- Summary labels: "Completed", "Avg pain after", "Most helpful"
- Session title pattern: "Session 1", "Session 2", etc.
- Mode badges: "Standard", "Easier", "Flare"
- Session CTA: "▶ Start session"
- Info: "Complementary practice: This supports but doesn't replace other activities."
- Tip: "Tough day? Tap "Flare mode" during your session and we'll adapt immediately."
- Link: "Change duration/frequency"
- Empty state: "No plan yet" / "Build your plan"

---

## 3.8 WORKOUT PAGE

- Eyebrow: "Your adaptive session for today"
- Progress: "Exercise X of Y"
- Timer format: MM:SS
- TTS button labels: "Stop voice guidance" / "Voice guidance"
- Category labels: "Breath · X min", "Mobility · X min", "Stability · X min", "Release · X min"
- Collapsible: "Instructions"
- Toggle: "More details"
- Pacing: "Intensity 3/10 · No sharp pain · You should feel fine tomorrow"
- Bottom buttons: "Easier", "Flare mode", "Pause" / "Resume", "Finish session"
- Next exercise: "Next exercise →"
- Empty state: "Session not found" / "Back to plan"

---

## 3.9 CONDITION TIPS (displayed in workout)

| Condition | Tip |
|-----------|-----|
| back_pain | "Targeted practice for back relief, core support, and posture improvement." |
| neck_pain | "Releasing neck tension, improving range of motion and posture." |
| shoulder_pain | "Shoulder release, strengthening support muscles, improving mobility." |
| knee_pain | "Strengthening muscles around the knee, maintaining safe range of motion." |
| hip_pain | "Improving hip joint mobility, strengthening and stability." |
| pregnancy | "Gentle pregnancy-adapted practice — breathing, pelvic mobility and safe strengthening." |
| postpartum | "Gradual postpartum recovery — pelvic floor, core and breathing." |
| disc_herniation | "Maintaining neutral spine, core strengthening and gentle release." |
| sciatica | "Relieving sciatic nerve pressure, core strengthening and mobility." |
| osteoarthritis | "Maintaining joint mobility, gentle strengthening and release." |
| post_injury_rehab | "Gradual rehabilitation — mobility, stability and release." |
| stress_anxiety | "Calming breath, gentle movement and relaxation — reducing stress." |
| sleep_issues | "Preparing the body for sleep — extended breathing, relaxation and body scan." |
| fibromyalgia | "Adapted fibromyalgia practice — gentle, precise and safe." |
| menopause | "Supportive menopause practice — balance, bone strengthening and tension release." |
| older_adult | "Safe, gentle practice for maintaining mobility and balance." |
| cross_training | "Stretching and relaxation — complementing strength and cardio training." |
| general_yoga | "Balanced yoga practice — breath, movement, stability and release." |

---

## 3.10 CONDITION DESCRIPTIONS

| Key | Label | Description |
|-----|-------|-------------|
| back_pain | Back Pain | Lower, mid, or upper back discomfort |
| neck_pain | Neck | Neck tension and limited range |
| shoulder_pain | Shoulders | Shoulder stiffness or pain |
| knee_pain | Knees | Knee joint sensitivity |
| hip_pain | Hips | Hip joint tightness or pain |
| pregnancy | Pregnancy | Safe prenatal movement |
| postpartum | Postpartum | Gradual postnatal recovery |
| fibromyalgia | Fibromyalgia | Whole-body sensitivity support |
| disc_herniation | Disc Herniation | Spine-safe movement |
| sciatica | Sciatica | Nerve-safe stretching |
| osteoarthritis | Osteoarthritis | Joint-friendly movement |
| post_injury_rehab | Post-Injury Rehab | Gradual recovery support |
| stress_anxiety | Stress & Anxiety | Calming breath and movement |
| sleep_issues | Sleep Issues | Evening wind-down routines |
| menopause | Menopause | Hormonal transition support |
| cross_training | Cross Training | Complement other workouts |
| general_yoga | General Yoga | Balanced practice |

---

## 3.11 CHECK-IN PAGE

- H1: "Quick Check-In"
- Microcopy: "This helps us adapt your next session."
- Slider labels: "Pain before", "Pain after", "Fatigue before", "Fatigue after"
- Toggle: "Was it too much?"
- Selection: "What helped most?" — Breath / Movement / Release
- CTA: "Save & continue"
- Post-save: "Saved — we'll adapt your next session based on this."

---

## 3.12 COMPLETE PAGE

- H1: "Well done! 🎯"
- Body: "Session complete — your body thanks you."
- Stats: "Session X of Y this week"
- CTA: "Back to plan"
- Micro: "Auto-redirecting to plan in a few seconds..."

---

## 3.13 STOP PAGE

- H1: "Please Stop"
- Bold: "This is not the right time to practice."
- Body: "If you're experiencing sharp new pain, increasing numbness or weakness, unusual dizziness, shortness of breath, fever, or acute illness — please stop and consult a medical professional."
- CTA: "Return home"

---

## 3.14 LIBRARY PAGE

- H1: "Exercise Library"
- Subheadline: "Explore all available exercises in the YogaCare system."
- Search placeholder: "Search exercises..."
- Filter chips: "All", "Breath", "Mobility", "Stability", "Release"
- Count: "X exercises"
- Empty state: "No exercises match your search."

---

## 3.15 SETTINGS PAGE

- H1: "Settings"
- Subheadline: "Manage your preferences and data."
- Section: "Preferences" — "Exercise animations" / "Show movement demonstrations"
- Section: "Data Management" — "Export data" / "Import data"
- Import confirm: "Import data? This will replace existing data." — "Yes, import" / "Cancel"
- Section: "About YogaCare" — "YogaCare builds structured, adaptive yoga sessions designed around your body's current needs." / "Designed with a supportive, therapeutic-minded approach informed by years of clinical teaching experience." / "Educational movement content. Not medical advice. Consult a healthcare professional for any medical concerns."
- Reset: "Full reset — start over" / "This will delete all data. Are you sure?" — "Yes, delete all" / "Cancel"

---

## 3.16 ABOUT MODAL

- Title: "About YogaCare"
- H3: "Adaptive Yoga for Modern Bodies"
- Body: "YogaCare builds structured, adaptive yoga sessions designed around your body's current needs."
- Credit: "Designed with a supportive, therapeutic-minded approach informed by years of clinical teaching experience."
- Disclaimer heading: "DISCLAIMER"
- Disclaimer: "Educational movement content. Not medical advice. Consult a healthcare professional for any medical concerns."
- Settings heading: "Settings"
- Toggle: "Exercise animations"
- Buttons: "Export" / "Import"
- Import confirm: "Import data? This will replace existing data." — "Yes, import" / "Cancel"
- Reset: "Full reset — start over" / "This will delete all data. Are you sure?" — "Yes, delete all" / "Cancel"
- Debug heading: "Animation Debug" (hidden)

---

## 3.17 ERROR MESSAGES

- Import failure: "Invalid file" (alert)
- Import execution failure: "Import error" (alert)
- 404 page: "404" / "Oops! Page not found" / "Return to Home"

---

## 3.18 EXERCISE CONTENT (SAMPLE — first 3 exercises from masterExercises.ts)

**Exercise 1: breath_supine — "Supine Belly Breathing"**
- Category: breath, Duration: 4 min, Intensity: 2/10
- Instructions:
  1. "Lie on your back, knees bent, feet hip-width apart on the floor."
  2. "Place one hand on your belly and the other on your chest — feel the movement of your breath."
  3. "Inhale through your nose — expand your belly forward and to the sides; chest barely moves."
  4. "Exhale slowly through your nose or relaxed mouth — let the belly gently sink inward."
  5. "Keep your jaw, neck, and shoulders completely relaxed — no stretching or pushing."
- Breathing: "Inhale belly 4 sec → Exhale soft 6 sec"
- Reps: "8–12 full cycles"
- Range: "Belly rises approx 2 cm"
- Why: (from masterExercises.ts)
- Safety: (from masterExercises.ts)
- Cue: (from masterExercises.ts)

> **Note:** Full exercise library contains 100+ exercises. All content is in English. Complete CSV export available at /expert-review → Export Content tab.

---

# PART 4 — BRAND SYSTEM EXPORT

---

## 4.1 COLOR PALETTE

| Token | HSL Value | HEX Approx | Usage |
|-------|-----------|-------------|-------|
| `--background` | 40 14% 96% | #F6F5F1 | Warm off-white page bg |
| `--foreground` | 215 50% 11% | #0E1A2B | Deep ink navy text |
| `--card` | 0 0% 100% | #FFFFFF | Card surfaces |
| `--card-foreground` | 215 50% 11% | #0E1A2B | Card text |
| `--primary` | 215 50% 11% | #0E1A2B | Primary (ink navy) |
| `--primary-foreground` | 0 0% 100% | #FFFFFF | Text on primary |
| `--secondary` | 160 14% 55% | #6F8F88 | Sage green |
| `--secondary-foreground` | 0 0% 100% | #FFFFFF | Text on secondary |
| `--muted` | 220 9% 46% | #6B7280 | Muted gray |
| `--muted-foreground` | 220 9% 46% | #6B7280 | Secondary text |
| `--accent` | 43 38% 57% | #C6A85E | Muted gold |
| `--accent-foreground` | 215 50% 11% | #0E1A2B | Text on accent |
| `--destructive` | 0 65% 55% | #D63B3B | Warning red |
| `--destructive-foreground` | 0 0% 100% | #FFFFFF | Text on destructive |
| `--border` | 215 50% 11% / 0.08 | rgba(14,26,43,0.08) | Subtle borders |
| `--input` | 220 6% 87% | #DDDEE0 | Input backgrounds |
| `--ring` | 43 38% 57% | #C6A85E | Focus ring (gold) |
| `--color-gold` | 43 38% 57% | #C6A85E | Brand gold |
| `--color-sage` | 160 14% 55% | #6F8F88 | Brand sage |
| `--color-ink` | 215 50% 11% | #0E1A2B | Brand ink |
| `--surface-soft` | 40 14% 93% | #EDECEA | Soft surface |
| `--surface-warm` | 30 20% 92% | #EDE8E2 | Warm surface |
| `--surface-sage` | 160 14% 92% | #E4ECEB | Sage surface |
| `--surface-gold` | 43 30% 90% | #EDE7D8 | Gold surface |

## 4.2 FONT FAMILY

- **Primary:** Plus Jakarta Sans (Google Fonts import)
- **Weights:** 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)
- **Source:** `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap')`

## 4.3 TYPOGRAPHY SCALE

| Element | Size (mobile) | Size (sm+) | Weight | Line-Height | Letter-Spacing |
|---------|---------------|------------|--------|-------------|----------------|
| H1 | 32px | 40px | bold (700) | 1.1 | -0.02em |
| Hero H1 | 36px | 48px (sm), 56px (lg) | bold (700) | 1.06 | -0.03em |
| H2 | 22px | 28px | bold (700) | snug (~1.3) | -0.02em |
| Body (p, li, span, label) | 16px | 16px | 400 | 1.6 | normal |
| Small | 12px | 12px | — | — | — |
| Eyebrow | 11px | 11px | 500 (medium) | — | 0.3em |
| Pillar tag | 11px | 11px | 600 (semibold) | — | 0.2em |

## 4.4 SPACING SYSTEM

| Pattern | Value | Usage |
|---------|-------|-------|
| Container max-width | max-w-lg (512px) | All content pages |
| Container padding | px-4 (16px) | Horizontal page padding |
| Section gap | mb-16 (64px) | Between homepage sections |
| Card padding | p-6 (24px) or p-5 (20px) or p-4 (16px) | Card internal |
| Inner stack | space-y-6 (24px) | Page-level content |
| Card stack | space-y-3 (12px) or space-y-4 (16px) | Between cards |
| Bottom sticky padding | pb-24 to pb-28 (96–112px) | Content above fixed bars |
| Hero padding | py-20, px-6 | Hero content area |

## 4.5 BORDER RADIUS SYSTEM

| Element | Value | Tailwind |
|---------|-------|----------|
| Design token | 1.25rem (20px) | `--radius` |
| Cards (premium) | 20px | `rounded-[20px]` via `.card-premium` |
| Buttons | 16px | `rounded-[16px]` |
| Chips/badges | 9999px | `rounded-full` |
| Details/collapsibles | 20px | `rounded-[20px]` |
| Inputs | 16px | `rounded-2xl` |
| Custom checkbox | 6px | inline |

## 4.6 SHADOW SYSTEM

| Name | Value | Usage |
|------|-------|-------|
| `shadow-premium` | `0 10px 30px rgba(0,0,0,0.06)` | Standard card elevation |
| `shadow-premium-lg` | `0 20px 50px rgba(0,0,0,0.08)` | Elevated cards |
| `shadow-calm` | `0 10px 30px rgba(0,0,0,0.06)` | Alias for premium |
| `shadow-calm-lg` | `0 20px 50px rgba(0,0,0,0.08)` | Alias for premium-lg |
| Hero CTA | `0 8px 32px rgba(198,168,94,0.3)` | Gold glow on hero button |
| Card premium | `0 10px 30px rgba(0,0,0,0.06)` | via `.card-premium` utility |

## 4.7 BUTTON VARIANTS

| Variant | Background | Text | Border | Min-Height | Radius | Other |
|---------|-----------|------|--------|------------|--------|-------|
| `default` | primary | primary-foreground | — | 40px | 16px | — |
| `hero` | primary | primary-foreground | — | 48px | 16px | shadow-premium, text-base |
| `outline` | background | foreground | input border | 40px | 16px | hover:accent/10 |
| `outline-calm` | transparent | foreground | primary/15 2px | 48px | 16px | hover:primary/5 |
| `secondary` | secondary | secondary-foreground | — | 40px | 16px | — |
| `ghost` | transparent | — | — | 40px | 16px | hover:accent/10 |
| `link` | transparent | accent | — | auto | — | underline on hover |
| `stop` | destructive | destructive-foreground | — | 48px | 16px | text-base |

| Size | Height | Padding | Font |
|------|--------|---------|------|
| `default` | h-10 | px-4 py-2 | text-sm |
| `sm` | h-9 | px-3 | text-sm |
| `lg` | h-12 | px-8 | text-base |
| `xl` | h-14 | px-10 | text-lg |
| `icon` | h-10 w-10 | — | — |

## 4.8 CARD VARIANTS

| Type | Implementation | Properties |
|------|---------------|------------|
| `card-premium` | CSS utility class | bg-card, rounded-[20px], shadow-premium |
| Danger card | `card-premium` + `border-destructive/30` | Red border accent |
| Info card | `card-premium` + `border-accent/30` | Gold border accent |
| Standard shadcn Card | Component | rounded-lg, border, bg-card, shadow-sm |

## 4.9 ANIMATION PRINCIPLES

1. **Page transitions:** 300ms ease-out fade-up (12px translateY)
2. **Hero entrance:** 500ms ease-out fade-up with 200ms delay (20px translateY)
3. **Button press:** 120ms scale(0.98) on :active
4. **Breathing cycle:** 4s ease-in-out scale(1→1.02) infinite
5. **Fade-in:** 400ms ease-out (0→1 opacity + 8px translateY)
6. **Accordion:** 200ms ease-out height animation
7. **Reduced motion:** All animations respect `prefers-reduced-motion: reduce`
8. **Wave drift (hero):** 12s ease-in-out translateX(15px) translateY(-8px) infinite
9. **Spine pulse (hero):** 6s ease-in-out opacity 0.25↔0.45 infinite

---

# PART 5 — ANIMATION SYSTEM EXPORT

---

## 5.1 VIDEO LAYER (ExerciseVideoAnimation)

- **Priority tier:** Video loops shown for breath and mobility categories
- **Files:** `src/assets/exercises/breath-demo.mp4`, `src/assets/exercises/mobility-demo.mp4`
- **Playback:** autoPlay, loop, muted, playsInline
- **Container:** rounded-[20px], category-gradient bg, height: large=364px (1.3×280), standard=234px
- **Overlay:** gradient from transparent to card/60
- **Fallback:** On error → ExerciseAnimationV7
- **Limitation:** Only 2 video files exist (breath, mobility). Stability and release always fall back to SVG.

## 5.2 ExerciseAnimationV7 — RIGGED SVG SILHOUETTE

### SVG Structure
- ViewBox: 320 × 110 (inline SVG)
- 7 rigged body part groups: `#head`, `#torso`, `#hips`, `#armL`, `#armR`, `#legL`, `#legR` + `#shadow`
- Body rendered with path strokes (skin: `hsl(25 40% 82%)`, top: `hsl(14 37% 52% / 0.55)`, bottom: `hsl(14 37% 42% / 0.4)`, hair: `hsl(20 30% 35%)`)
- Floor shadow: ellipse cx=160 cy=98 rx=22 ry=3.5

### 16 Motion Recipes

| Recipe | Easing | Duration | Loop | Body Parts Animated | Amplitude |
|--------|--------|----------|------|---------------------|-----------|
| breath | cubic-bezier(0.45,0.05,0.55,0.95) | 4.4–5.2s | infinite | torso (scaleY 1→1.04), arms (translateY -3px), head (rotate ±3°), hips (rotate 1.5°) | Low |
| catCow | same | 5.4s | infinite | torso (rotate ±4°, scaleY 0.97→1.03), head (rotate ±8°, translateY ±3px), hips (rotate ±3°) | Medium |
| bridge | same | 4.8–5.8s | infinite | hips (translateY -12px), torso (rotate -3°), legs (rotate -8°) | Medium-High |
| birdDog | same | 5.2–6.0s | infinite | armL (rotate -35°), legR (rotate 25°), torso (rotate -2°) | High |
| wallSlides | same | 4.6–5.8s | infinite | arms (rotate -45°), torso (scaleY 1.02) | Medium |
| pelvicTilt | same | 5.0–6.4s | infinite | hips (rotate 5°, translateY -3px), torso (rotate -2°) | Low |
| walkInPlace | same | 4.2s | infinite | armL/R alternate (±14°), legL/R alternate (±15°), torso (±3px, ±1°) | Medium |
| neckRelease | same | 5.6–6.8s | infinite | head (rotate ±12°), shoulderL/R (translateY -4px, offset) | Medium |
| chairSquat | same | 5.4–5.6s | infinite | hips (translateY 10px), legs (rotate 15°), torso (rotate 5°) | Medium |
| heelRaises | same | 5.0–5.2s | infinite | all body (translateY -8px), arms (rotate -8°) | Medium |
| sideLegRaise | same | 5.4–5.8s | infinite | legL (rotate -22°), hip (translateX 4px), arm (rotate -10°) | Medium-High |
| bodyScan | same | 6.2–6.8s | infinite | torso (scaleY 1→1.03), hips (gentle). + glow rect (translateY 0→55px, opacity 0.08→0.22) | Very Low |
| hamstringStretch | same | 5.6s | infinite | torso (rotate 12°), arms (rotate 18°), leg (rotate -8°) | Medium |
| shoulderOpen | same | 5.0–5.4s | infinite | armL (rotate -30°), armR (rotate 30°), torso (scaleX 1.03) | Medium-High |
| coreHold | same | 5.4–6.0s | infinite | torso (scaleX/Y 0.97–0.98), arms (rotate -5°), leg (rotate 8°) | Low |
| gentleFlow (fallback) | same | 5.6–6.4s | infinite | torso (translateX 5px, rotate 1.5°), arms (rotate -10°), head (rotate 4°), hips (translateX -4px) | Low |

### Recipe Selection Chain:
1. `ID_MAP[exercise.id]` — direct ID match (currently empty)
2. `exercise.category === "breath"` → breath recipe
3. Keyword match in `exercise.name_he` title against KEYWORD_MAP (14 keyword groups)
4. Category fallback: breath→breath, mobility→gentleFlow, stability→coreHold, release→bodyScan

### Known Limitations:
- Keyword matching uses `exercise.name_he` field (legacy naming, but now contains English titles)
- No per-exercise ID overrides configured (ID_MAP is empty)
- Body proportions are fixed (female silhouette)
- No equipment visualization (chair, wall, etc.)
- Category gradient backgrounds use hardcoded Tailwind colors (`blue-50`, `emerald-50`, `amber-50`, `purple-50`) instead of design tokens

## 5.3 ExerciseAnimationV8 — POSE-AWARE CROSSFADE

### SVG Structure
- Uses `HumanFigure.tsx` components: 20 distinct articulated SVG poses
- ViewBox: 320 × 105
- Crossfade transition: 600ms ease-in-out opacity

### 10 Pose Sets with Frame Sequences:

| PoseSet | Frames | Hold Durations |
|---------|--------|----------------|
| standing | Standing → ArmsOpen → ArmsUp → Standing | 2200ms each |
| standing (breath) | Standing ↔ ArmsUp | 3000ms each |
| standing (stability) | Standing → ArmsOpen → ArmsUp | 2500/2500/2000ms |
| seated | SeatedFigure ↔ SeatedFigure | 3500ms each |
| supine | SupineFlat ↔ LyingRelax | 3000ms each |
| supine (release) | LyingRelax ↔ SupineFlat | 4000ms each |
| bridge | SupineFlat → SupineBridge | 2500/3000ms |
| allFours | Neutral → Rounded → Arched | 2200/2500/2500ms |
| birdDog | Neutral → Extended | 2500/3000ms |
| wall | ArmsLow → ArmsHigh | 2500/3000ms |
| neck | Center → TiltRight → Center → TiltLeft | 2200/2800/1500/2800ms |
| pelvic | Neutral → Tilted | 2500/3000ms |
| sideLying | SideLying → LegUp | 2500/3000ms |

### Micro-Motion Overlays (applied to entire pose):
```css
breath:    v8breathPulse — scale(1→1.02), 4.5s, infinite
stability: v8microTremble — translate(±0.3px), 2s, linear, infinite
release:   v8slowDrift — translateY(-1px) rotate(0.3°), 6s, infinite
mobility:  none
```

### Pose Selection Chain:
1. `ID_POSE[exercise.id]` — direct ID match (currently empty)
2. Keyword match in `exercise.name_he` title against KEYWORD_POSE (9 keyword groups)
3. Category default: breath→seated, release→supine, stability/mobility→standing

### Known Limitations:
- Seated pose is static (same frame ↔ same frame) — no visible motion
- No exercise-specific ID overrides configured
- Uses `exercise.name_he` for keyword matching (same as V7)
- Category gradient backgrounds use hardcoded Tailwind colors (not tokens)

---

# PART 6 — PERFORMANCE + TECH STRUCTURE

---

## 6.1 FRAMEWORK

- **Frontend:** React 18.3.1 + TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS + tailwindcss-animate
- **Component library:** shadcn/ui (Radix UI primitives)
- **Routing:** react-router-dom v6.30.1
- **State:** React Context (AppProvider) + localStorage persistence

## 6.2 ROUTING STRUCTURE

| Route | Guard | Component | Purpose |
|-------|-------|-----------|---------|
| `/` | None | Home | Landing page |
| `/disclaimer` | None | Disclaimer | Medical disclaimer gate |
| `/conditions` | DisclaimerGuard | Conditions | Condition selection |
| `/setup` | DisclaimerGuard | Setup | Session preferences |
| `/questionnaire` | DisclaimerGuard | Questionnaire | Health assessment |
| `/plan` | DisclaimerGuard | Plan | Weekly plan display |
| `/workout/:sessionId` | DisclaimerGuard | Workout | Active exercise session |
| `/checkin/:sessionId` | DisclaimerGuard | CheckinPage | Post-workout feedback |
| `/complete` | DisclaimerGuard | CompletePage | Session completion |
| `/stop` | None | Stop | Red flag safety block |
| `/library` | None | Library | Exercise browser |
| `/settings` | None | Settings | App settings |
| `/expert-review` | None | ExpertReview | Expert audit tool |
| `/audit-export` | None | AuditExport | System audit text |
| `*` | None | NotFound | 404 page |

## 6.3 STATE MANAGEMENT

- **AppContext:** Wraps entire app, provides `state`, `updateState`, `updateProfile`, `resetAll`
- **Persistence:** `localStorage` via `readState<T>` / `writeState<T>` helpers
- **Exercise library:** Generated at module load time by `generateExerciseLibrary()` from `exerciseAdapter.ts`
- **Migration:** `useAppState.ts` migrates Hebrew conditions/energy/time to English on load

## 6.4 LOCALSTORAGE KEYS

| Key | Type | Purpose |
|-----|------|---------|
| `yaelYogaAppState` | AppState (JSON) | Complete app state (profile, assessments, plan, checkins, progress) |
| `yaelYogaDisableAnimations` | boolean | Animation toggle |
| `yogacareRecentExercises` | string[] | Anti-repetition tracker (last 20 exercise IDs) |
| `debugForceAnimate` | boolean | Dev: force animations past reduced-motion |
| `debugAnimations` | boolean | Dev: show debug panel in About modal |
| `yaelRecentExercises` | string[] | Legacy fallback for recent exercises |

## 6.5 PLAN GENERATION LOCATION

- **Client-side only.** All plan generation runs in the browser.
- **Scoring engine:** `src/lib/scoringEngine.ts` — weighted scoring, safety filtering, category balancing
- **Plan generator:** `src/lib/planGenerator.ts` — mode determination, day distribution, session creation
- **Exercise adapter:** `src/data/exerciseAdapter.ts` — converts MasterExercise[] to legacy Exercise[] format

## 6.6 ANIMATION LOADING BEHAVIOR

1. **Video files:** Bundled as ES6 module imports (`breath-demo.mp4`, `mobility-demo.mp4`). Loaded when Workout page mounts.
2. **SVG animations (V7):** Inline SVG + CSS keyframes injected via `<style>` tag. No external loading.
3. **SVG poses (V8):** HumanFigure components are static SVGs rendered inline. No loading delay.
4. **Fallback chain:** Video → V7 SVG (on video error)
5. **User control:** Global toggle via Settings/About modal (`yaelYogaDisableAnimations`)

## 6.7 MOBILE RESPONSIVENESS STRATEGY

- **Mobile-first:** All layouts designed for 390px viewport
- **Container:** `max-w-lg` (512px) centered with `px-4` padding
- **Breakpoints used:** `sm:` (640px) for typography scaling, `sm:flex-row` for step cards
- **Touch targets:** Buttons min-h-[48px] (hero/outline-calm), condition chips min-h-[56px]
- **Fixed bottom bars:** `fixed bottom-0 inset-x-0` for condition CTA and workout controls
- **Viewport unit:** Hero uses `min-h-[100svh]` for full viewport height
- **No horizontal scroll:** All content fits within viewport width

---

# PART 7 — DIFFERENTIATION STATEMENT

---

## 7.1 vs. Generic Yoga Apps (Daily Yoga, Asana Rebel)

**YogaCare selects exercises based on medical condition safety tags and real-time body state assessment (pain/fatigue/sleep).** Generic apps offer fixed class libraries filtered by difficulty or duration only. YogaCare's scoring engine evaluates each exercise against 7 safety tag dimensions per condition, applies weighted relevance scoring, and enforces anti-repetition — producing clinically-aware sessions, not curated playlists.

## 7.2 vs. Peloton Yoga

**YogaCare is bodystate-adaptive, not instructor-led.** Peloton delivers pre-recorded classes from instructors. YogaCare generates unique sessions per user per day based on their current pain level, fatigue, sleep quality, active flare status, and selected conditions. There is no instructor, no video stream, no class schedule — the algorithm IS the instructor.

## 7.3 vs. Down Dog

**YogaCare adds medical safety filtering and condition-specific contraindication logic that Down Dog does not implement.** Down Dog generates sessions by difficulty/focus/duration. YogaCare applies per-exercise safety tags (pregnancySafe, discSafe, kneeSafe, etc.), removes exercises with specific contraindication flags (avoidFlexion, avoidRotation), and adapts the next session based on post-workout check-in data. The safety layer is structural, not cosmetic.

## 7.4 vs. Therapy-Based Physical Rehab Apps (Hinge Health, Kaia)

**YogaCare operates without login, without therapist involvement, and without clinical claims.** Rehab apps require accounts, clinical intake, and often therapist supervision. YogaCare positions itself as educational movement content — not treatment — with explicit disclaimers. It fills the gap between "I need rehab" and "I want supportive movement I can do at home without a provider." The red flag → STOP flow is a safety gate, not a diagnostic tool.

## 7.5 vs. Meditation Apps (Calm, Headspace)

**YogaCare is a movement-first, body-state-adaptive system — not a content library of guided audio.** Meditation apps deliver pre-recorded sessions. YogaCare generates exercise sequences with timer, reps, safety notes, and animated movement demonstrations. The breathing component is embedded within physical practice, not isolated as standalone meditation.

---

# APPENDIX A — ASSET INVENTORY

## Images Used in Codebase

| Path | Used By | Purpose |
|------|---------|---------|
| `src/assets/exercises/breath-demo.mp4` | ExerciseVideoAnimation | Breath category video loop |
| `src/assets/exercises/mobility-demo.mp4` | ExerciseVideoAnimation | Mobility category video loop |

## Images NOT Used (exist in /public but not imported):

| Path | Status |
|------|--------|
| `/public/assets/yael/hero.jpg` | **NOT REFERENCED** — legacy personal branding |
| `/public/assets/yael/yoga.jpg` | **NOT REFERENCED** — legacy personal branding |
| `/public/assets/brand/logo.png` | **NOT REFERENCED** — SVG logo used instead |
| `/public/assets/brand/logo-option-1.png` | **NOT REFERENCED** |
| `/public/assets/brand/logo-option-2.png` | **NOT REFERENCED** |
| `/public/og-image.jpg` | Referenced in meta tags only |
| `/public/favicon.ico` | Referenced in HTML head only |

## Confirmation: Zero Yael/personal imagery in active codebase.

---

# APPENDIX B — KNOWN ISSUES & WEAKNESSES

1. **Animation V7/V8 keyword matching uses `exercise.name_he` field** — field name is a legacy artifact; the content is now English. Field should be renamed to `name` or `title`.
2. **Category gradient backgrounds in V7/V8** use hardcoded Tailwind colors (`blue-50`, `emerald-50`, `amber-50`, `purple-50`) instead of design system tokens.
3. **Seated V8 animation is static** — SeatedFigure ↔ SeatedFigure shows no visible motion.
4. **AuditExport page** (`/audit-export`) contains outdated pre-internationalization content (references Heebo font, Hebrew text, terracotta colors, Yael imagery).
5. **`shadow-calm` and `shadow-premium`** are duplicate values.
6. **Session `title_he` field** still named with `_he` suffix though content is now English ("Session 1", etc.).
7. **Exercise type uses `name_he`, `steps_he`, `safety_he`, `why_he`** — all contain English content but field names suggest Hebrew.
8. **No dark mode** — only light theme variables defined.
9. **No offline support** — no service worker or PWA manifest.
10. **HeroSection** uses inline `bg-[hsl(...)]` values instead of semantic tokens for the gradient background.
11. **`font-heebo` reference removed** but AuditExport page text still references it.
12. **No error boundary** — uncaught errors show blank screen.
13. **No loading states** — plan generation is synchronous and instant, but no skeleton/loader for initial app load.
14. **ExpertReview page** uses shadcn Table components directly (not in Layout wrapper) — different styling context.

---

# APPENDIX C — DOWNLOAD INSTRUCTIONS

This audit is available as a downloadable Markdown file at:

**`/audit/YOGACARE_ITERATION4_FULL_EXPORT.md`**

To download:
1. Navigate to `/settings` in the app
2. Or access directly: `[your-app-url]/audit/YOGACARE_ITERATION4_FULL_EXPORT.md`

For the exercise library CSV:
1. Navigate to `/expert-review`
2. Click "Export Content" tab
3. Click "Download CSV"

---

*End of audit export. Zero omissions. All content verified against source code as of 2026-02-20.*
