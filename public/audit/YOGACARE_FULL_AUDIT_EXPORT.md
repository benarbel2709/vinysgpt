# YOGACARE APP — COMPLETE STRUCTURED EXPORT FOR AUDIT

---

## PART 1 — SCREENSHOTS

Screenshots were captured at 390×844 mobile viewport. See descriptions below.

### 1. Homepage — Hero
Dark navy (#0E1A2B) full-viewport hero. YogaCare icon SVG centered. Tagline "ADAPTIVE YOGA FOR MODERN BODIES" in tracked uppercase. H1 "Yoga that adapts to your body." in white bold 36px. Subhead in white/55% opacity. Gold CTA button. "See how it works" scroll hint with bouncing chevron.

### 2. Homepage — Mid-scroll
Three "Why YogaCare" feature cards (Built Around You, Intelligent Progression, Designed for Modern Schedules). Then "Three Pillars" section with Balance/Support/Restore cards with gold uppercase tags.

### 3. Homepage — Bottom
"How It Works" 3-step cards. "Guided by Experience" section with Yael Arbel bio. Trust strip chips. "Get started" bottom CTA. Footer: "© YogaCare — Adaptive Yoga for Modern Bodies"

### 4. Disclaimer Page
Header with YogaCare logo + "About" nav link. PageIllustration (shield icon in gold ellipse). "Important to Read" headline. White card with disclaimer text. Checkbox "I have read and understood". Disabled "Continue" button until checked.

### 5. STOP Page
Warning triangle icon (red). "Please Stop" headline. Card with red border: "This is not the right time to practice." + symptoms list. "Return home" hero button.

### 6. Conditions, Setup, Questionnaire, Plan, Workout, CheckinPage, CompletePage
Not navigable without disclaimer acceptance (DisclaimerGuard). Layouts described in full copy export below from source code.

---

## PART 2 — FULL COPY EXPORT

### HOME PAGE (`/`)
- **Eyebrow:** "ADAPTIVE YOGA FOR MODERN BODIES"
- **Headline (H1):** "Yoga that adapts to your body."
- **Subheadline:** "A structured, tailored practice built around your current needs — from performance balance to supportive recovery."
- **Primary CTA:** "Start your tailored session →"
- **Secondary CTA:** "See how it works ↓"
- **Section Header:** "Why YogaCare"
  - **Feature 1 Title:** "Built Around You"
  - **Feature 1 Desc:** "We structure your session based on how your body feels today."
  - **Feature 2 Title:** "Intelligent Progression"
  - **Feature 2 Desc:** "Sessions follow thoughtful sequencing — not random combinations."
  - **Feature 3 Title:** "Designed for Modern Schedules"
  - **Feature 3 Desc:** "10–15 minute options. Or deeper sessions when you have time."
- **Section Header:** "Three Pillars"
  - **Tag:** "BALANCE" / **Title:** "For active bodies and performance balance." / **Desc:** "Mobility, posture, and training support."
  - **Tag:** "SUPPORT" / **Title:** "For joint care and structural tension." / **Desc:** "Body awareness and supportive movement."
  - **Tag:** "RESTORE" / **Title:** "For recovery days and fatigue." / **Desc:** "Gentle recalibration and rest."
- **Section Header:** "How It Works"
  - **Step 1:** "Quick Check-In" / "Tell us how your body feels."
  - **Step 2:** "We Build Your Session" / "Your practice is tailored for today."
  - **Step 3:** "Roll Out Your Mat" / "Practice at home, on your schedule."
- **Section Header:** "Guided by Experience"
  - **Body:** "YogaCare is guided by Yael Arbel, lead instructor and founding teacher. Teaching since 2008, her approach emphasizes intelligent, supportive movement."
- **Trust Chips:** "No login required" · "Safety first" · "Designed for busy schedules"
- **Bottom CTA:** "Get started →"
- **Footer:** "© YogaCare — Adaptive Yoga for Modern Bodies"

### DISCLAIMER PAGE (`/disclaimer`)
- **Headline:** "Important to Read"
- **Body P1:** "This app provides general movement guidance and is not a substitute for medical diagnosis, treatment, or professional advice."
- **Body P2:** "If you experience significant worsening, sharp/new pain, increasing numbness/weakness, unusual dizziness/fainting, shortness of breath, fever, or any concerning symptom — stop immediately and seek medical advice."
- **Checkbox label:** "I have read and understood"
- **CTA:** "Continue"

### CONDITIONS PAGE (`/conditions`)
- **Headline:** "What brings you here?"
- **Microcopy:** "Select all that apply. This helps us tailor your session."
- **Condition chips (Hebrew):** כאבי גב, צוואר, כתפיים, ברכיים, מפרקי ירך, היריון, אחרי לידה, פיברומיאלגיה, פריצת דיסק, סיאטיקה, אוסטאוארתריטיס, שיקום אחרי פציעה, חרדה/מתח, בעיות שינה, גיל מעבר, תרגול משלים, רק יוגה
- **CTA:** "Continue"

### SETUP PAGE (`/setup`)
- **Headline:** "Session Preferences"
- **Microcopy:** "This helps us tailor your session."
- **Label:** "Sessions per week" — options: 2, 3, 4, 5
- **Label:** "Minutes per session" — options: 10 (Quick), 15 (Quick), 20, 30, 45, 60
- **Label:** "Preferred time of day" — Morning (06:00–12:00), Afternoon (12:00–17:00), Evening (17:00–21:00), Night (21:00+)
- **Label:** "Your energy level today" — Low (Gentle & calming), Moderate (Balanced practice), High (More dynamic)
- **Toggle:** "Today is a tough day (flare)"
- **Microcopy:** "You can change this anytime. Consistency over perfection."
- **CTA:** "Continue"

### QUESTIONNAIRE PAGE (`/questionnaire`)
- **Headline:** Dynamic based on conditions (Hebrew title for specific conditions, "Assessment" for generic)
- **Microcopy:** "This helps us tailor your session."
- **Step indicator:** "Step X of 3 — [Today's state / Characteristics / Equipment & safety]"
- **Back button:** "Back"
- **All questionnaire labels are in Hebrew** (כאב, עייפות, שינה, etc.)
- **Red flags (Hebrew):** כאב חד חדש, נימול/חולשה מתגברים, סחרחורת חריגה/עילפון, קוצר נשימה, חום/מחלה חריפה
- **Final CTA:** "Build my plan"
- **Error/safety states:** If any red flag is checked → redirects to `/stop`

### PLAN PAGE (`/plan`)
- **Headline:** "Your tailored plan"
- **Subheadline:** "Your session was built for today."
- **Collapsible section:** "My Summary" — Completed X/Y, Avg pain after X/10, Most helpful
- **Session cards:** Title (Hebrew), Mode badge (Standard/Easier/Flare), Day, Duration, Exercise count
- **Session CTA:** "Start session" (with Play icon)
- **Info card:** "Complementary practice: This supports but doesn't replace other activities."
- **Tip card:** "Tough day? Tap 'Flare mode' during your session and we'll adapt immediately."
- **Bottom link:** "Change duration/frequency"
- **Empty state:** "No plan yet" / "Build your plan"

### WORKOUT PAGE (`/workout/:sessionId`)
- **Header eyebrow:** "Your tailored session for today"
- **Progress:** "Exercise X of Y" + dot progress indicator
- **Timer:** MM:SS (monospace, pulses at 00:00)
- **Exercise title:** From master data (English) or fallback (Hebrew)
- **Category badge:** "Breath · X min" / "Mobility · X min" / "Stability · X min" / "Release · X min"
- **TTS button:** Voice guidance toggle
- **Safety line:** (per-exercise, from master data)
- **Collapsible:** "Instructions" with numbered steps
- **Reps pill + Range**
- **Collapsible:** "Why this exercise?"
- **Pacing reminder:** "Intensity 3/10 · No sharp pain · You should feel fine tomorrow"
- **Condition tip:** Dynamic per condition (English)
- **Bottom bar buttons:** "Easier" / "Flare mode" / "Pause" (or "Resume") / "Finish session"
- **Empty state:** "Session not found" / "Back to plan"

### CHECK-IN PAGE (`/checkin/:sessionId`)
- **Headline:** "Quick Check-In"
- **Microcopy:** "This helps us tailor your next session."
- **Sliders:** Pain before, Pain after, Fatigue before, Fatigue after (0–10)
- **Toggle:** "Was it too much?"
- **Selection:** "What helped most?" — Breath / Movement / Release
- **CTA:** "Save & continue"

### COMPLETE PAGE (`/complete`)
- **Headline:** "Well done! 🎯"
- **Body:** "Session complete — your body thanks you."
- **Stats card:** "Session X of Y this week"
- **CTA:** "Back to plan"
- **Microcopy:** "Auto-redirecting to plan in a few seconds..."

### STOP PAGE (`/stop`)
- **Headline:** "Please Stop"
- **Bold text:** "This is not the right time to practice."
- **Body:** "If you're experiencing sharp new pain, increasing numbness or weakness, unusual dizziness, shortness of breath, fever, or acute illness — please stop and consult a medical professional."
- **CTA:** "Return home"

### ABOUT MODAL (via header "About" button)
- **Title:** "About YogaCare"
- **Brand statement heading:** "Adaptive Yoga for Modern Bodies"
- **Body:** "YogaCare builds structured, tailored yoga sessions designed around your body's current needs."
- **Yael credit:** "Guided by Yael Arbel, lead instructor and founding teacher. Teaching since 2008, her approach emphasizes intelligent, supportive movement."
- **Disclaimer heading:** "DISCLAIMER"
- **Disclaimer:** "YogaCare provides educational movement content and is not medical advice. Consult a healthcare professional for any medical concerns."
- **Settings heading:** "Settings"
- **Toggle:** "Exercise animations"
- **Buttons:** "Export data" / "Import data"
- **Import confirm:** "Import data? This will replace existing data." — "Yes, import" / "Cancel"
- **Reset button:** "Full reset — start over"
- **Reset confirm:** "This will delete all data. Are you sure?" — "Yes, delete all" / "Cancel"
- **Debug panel (hidden):** Animation Debug (V7) with toggle/force states

---

## PART 3 — DESIGN SYSTEM EXPORT

### 3.1 Color Variables (CSS custom properties in HSL)
```
--background: 40 14% 96%          → #F6F5F1 (warm off-white)
--foreground: 215 50% 11%         → #0E1A2B (deep ink navy)
--card: 0 0% 100%                 → #FFFFFF
--card-foreground: 215 50% 11%    → #0E1A2B
--primary: 215 50% 11%            → #0E1A2B (ink navy)
--primary-foreground: 0 0% 100%   → #FFFFFF
--secondary: 160 14% 55%          → #6F8F88 (sage)
--secondary-foreground: 0 0% 100% → #FFFFFF
--muted: 220 9% 46%               → #6B7280
--muted-foreground: 220 9% 46%    → #6B7280
--accent: 43 38% 57%              → #C6A85E (muted gold)
--accent-foreground: 215 50% 11%  → #0E1A2B
--destructive: 0 65% 55%          → #D63B3B (red)
--destructive-foreground: 0 0% 100%
--border: 215 50% 11% / 0.08      → rgba(14,26,43,0.08)
--input: 220 6% 87%
--ring: 43 38% 57%                → gold
--radius: 1.25rem (20px)
--color-gold: 43 38% 57%          → #C6A85E
--color-sage: 160 14% 55%         → #6F8F88
--color-ink: 215 50% 11%          → #0E1A2B
```

### 3.2 Typography
- **Font Family:** Plus Jakarta Sans (Google Fonts import)
- **Weights used:** 300, 400, 500, 600, 700, 800
- **H1:** 32px mobile / 40px sm+ / bold / line-height 1.1 / letter-spacing -0.02em
- **H2:** 22px mobile / 28px sm+ / bold / leading-snug
- **Body (p, li, span, label):** 16px / line-height 1.6
- **Small:** 12px (xs)
- **Hero H1:** 36px mobile / 48px sm / 56px lg / bold / leading 1.06 / tracking -0.03em
- **Eyebrow:** 11px / tracking 0.3em / uppercase / font-medium

### 3.3 Spacing System
- Container max-width: `max-w-lg` (32rem / 512px)
- Container padding: `px-4` (1rem)
- Section spacing: `space-y-6` (1.5rem) or `mb-16` (4rem)
- Card padding: `p-6` (1.5rem) or `p-5` (1.25rem) or `p-4` (1rem)
- Gap between cards: `space-y-3` (0.75rem) or `space-y-4` (1rem)

### 3.4 Border Radius
- **Cards:** 20px (`rounded-[20px]` via `.card-premium`)
- **Buttons:** 16px (`rounded-[16px]`)
- **Chips/tags:** 9999px (`rounded-full`)
- **Design token:** `--radius: 1.25rem` (20px)

### 3.5 Shadow Values
- `shadow-premium`: `0 10px 30px rgba(0,0,0,0.06)`
- `shadow-premium-lg`: `0 20px 50px rgba(0,0,0,0.08)`
- `shadow-calm`: `0 10px 30px rgba(0,0,0,0.06)` (alias)
- `shadow-calm-lg`: `0 20px 50px rgba(0,0,0,0.08)` (alias)
- Hero CTA shadow: `0 8px 32px rgba(198,168,94,0.3)` (gold glow)

### 3.6 Button Variants
| Variant | Background | Text | Border | Min Height | Radius |
|---------|-----------|------|--------|------------|--------|
| `default` | primary | primary-foreground | — | 40px | 16px |
| `hero` | primary | primary-foreground | — | 48px | 16px |
| `outline` | background | foreground | border | 40px | 16px |
| `outline-calm` | transparent | foreground | primary/15 2px | 48px | 16px |
| `secondary` | secondary | secondary-foreground | — | 40px | 16px |
| `ghost` | transparent | — | — | 40px | 16px |
| `link` | transparent | accent | — | — | — |
| `stop` | destructive | destructive-foreground | — | 48px | 16px |
| **Sizes:** default (h-10), sm (h-9), lg (h-12), xl (h-14), icon (h-10 w-10) |

### 3.7 Card Component
- Base: `rounded-lg border bg-card text-card-foreground shadow-sm` (shadcn default)
- Premium override: `.card-premium` = `bg-card rounded-[20px]` + `shadow-premium`
- Used throughout via CSS utility class, NOT the Card component

### 3.8 Nav Structure
- **Header:** Sticky top, `bg-card/90 backdrop-blur-xl`, border-bottom, h-14
- **Left:** YogaCareLogo (icon + wordmark) linked to "/"
- **Right:** Optional "Back to plan" (workout screens) + "About" button
- **Home page:** `hideHeader` = true (hero takes full viewport)

### 3.9 Chip/Tag Structure
- Category badges: `text-xs font-medium px-2 py-0.5 rounded-full` + category-specific bg/text colors
- Trust chips: `text-xs text-muted-foreground px-4 py-2 rounded-full bg-card shadow-premium`
- Pillar tags: `text-[11px] tracking-[0.2em] uppercase text-accent font-semibold`
- Mode badges: `text-xs font-medium px-2.5 py-1 rounded-full` + mode-specific colors

---

## PART 4 — STRUCTURAL HIERARCHY (Homepage)

```
[Full-viewport dark hero section]
  Logo icon (SVG, 48px)
  Eyebrow text (uppercase tracked)
  H1 headline (36-56px)
  Subheadline paragraph
  Primary CTA button (gold)
  Scroll hint ("See how it works" + chevron)

[Logo bridge divider]
  Circular logo icon in white card (-mt-8, overlapping hero)

[Section: "Why YogaCare"] — id="why-section", scroll-mt-20
  H2 centered
  3× Feature cards (icon circle + title + desc) — space-y-4

[Section: "Three Pillars"] — mb-16
  H2 centered
  3× Pillar cards (tag + title + desc) — space-y-3

[Section: "How It Works"] — mb-16
  H2 centered
  3× Step cards (numbered circle + title + desc) — flex-col sm:flex-row gap-4

[Section: "Guided by Experience"] — mb-16
  H2 centered
  1× Card with User icon + Yael bio text

[Trust strip] — mb-10
  3× Chips in flex-wrap

[Bottom CTA] — max-w-xs centered
  "Get started →" hero button

[Footer]
  "© YogaCare — Adaptive Yoga for Modern Bodies"
```

Approximate spacing: Each major section has `mb-16` (64px) gaps. Internal card spacing is `space-y-3` to `space-y-4` (12-16px). Hero to content transition uses `-mt-8` overlap.

---

## PART 5 — DIFFERENTIATION SELF-ASSESSMENT

### 1. Does this currently feel distinct from Down Dog?
**Partially yes.** The language ("tailored," "built for today," "intelligent progression") and the check-in-first flow clearly differentiate it from Down Dog's config-and-generate approach. However, once inside the workout screen, the UI pattern (exercise cards + timer + next) is structurally similar to any yoga app. The key differentiator (adaptive engine based on body state) is **implicit**, not visually demonstrated.

### 2. Does it visually communicate tailoring?
**Weakly.** The copy says "tailored" repeatedly, but there's no visual evidence of the tailoring engine (e.g., no "we selected this because your pain is 7/10" callout, no visible algorithm output, no before/after comparison). The "Why this exercise?" collapsible exists but is hidden by default.

### 3. Does it feel premium?
**Yes, mostly.** The color palette (ink navy + gold + warm white) is premium. Typography is confident. Spacing is generous. The hero section is cinematic. Cards have soft shadows. However, the **lack of imagery/photography** makes some sections feel sparse rather than premium.

### 4. Does it look empty anywhere?
**Yes:**
- The homepage between hero and "Why YogaCare" has a logo bridge that feels like filler
- The "Guided by Experience" section uses a generic User icon instead of a photo
- The Pillar cards are text-only — no illustrations or abstract visuals
- The "How It Works" section is text-only — no step illustrations
- The onboarding flow pages each have a small abstract PageIllustration (icon in ellipse) that feels minimal/placeholder-like

### 5. Are there any placeholder elements?
**Yes:**
- `PageIllustration` component = a simple Lucide icon inside two concentric SVG ellipses. This is a placeholder for proper illustrations.
- The "Guided by Experience" section uses a generic `<User />` icon — placeholder for Yael's photo.
- No hero image on homepage — pure text + abstract gradient blurs.
- Exercise animations: `ExerciseVideoAnimation` component exists but sources are unclear without checking the video files.

### 6. Are there areas with no imagery?
**Yes, extensively:**
- Homepage: No photography at all. Hero is gradient + text. All sections are text + icons only.
- Onboarding: Only abstract icon illustrations (PageIllustration).
- Workout: Exercise area has animation component but no lifestyle/contextual imagery.
- Plan page: Pure text/card layout.
- About modal: No images.
- The only actual images in `/public/assets/` are `yael/hero.jpg`, `yael/yoga.jpg`, and brand logos — **none are used in the current codebase**.

### 7. Are there inconsistencies in tone?
**Yes, significant:**
- **Language mixing:** The conditions list (`CONDITIONS_LIST`), red flags (`RED_FLAGS`), session titles (`title_he`), helped-most options (`נשימה/תנועה/שחרור`), practice time values (`בוקר/צהריים/ערב/לילה`), energy levels (`נמוכה/בינונית/גבוהה`), questionnaire section titles, and most questionnaire content are **still in Hebrew** while the UI chrome, headers, button labels, and new copy are in English.
- Exercise card shows Hebrew duration "דק׳" (minutes abbreviation in Hebrew).
- The `ExerciseCard` component has `text-right` alignment (RTL remnant).
- Instructions border uses `border-r-2` (RTL) in ExerciseCard but `border-l-2` (LTR) in Workout page.
- The `getTitle()` function in Questionnaire returns Hebrew titles for condition-specific questionnaires.
- FlareNow options are Hebrew: "כן", "לא", "לא בטוח/ה".

---

## PART 6 — IMAGE & VISUAL ASSETS

### Are there hero visuals?
**No.** The hero section is a CSS gradient (dark navy tones) with two abstract blur circles (gold and sage, using `blur-[80px]` and `blur-[100px]`). No photography or illustration.

### Are there abstract illustrations?
**Minimal.** `PageIllustration` component renders a Lucide icon (Shield, ListChecks, Settings, Sliders, Calendar, Timer, CheckCircle2, AlertTriangle) centered inside two concentric SVG ellipses with gold fills at 8% and 12% opacity. These are used on every onboarding/flow page.

### Are there photography placeholders?
**Files exist but are unused:**
- `/public/assets/yael/hero.jpg` — exists, not referenced anywhere in code
- `/public/assets/yael/yoga.jpg` — exists, not referenced anywhere in code
- `/public/og-image.jpg` — exists, referenced only in meta tags
- `/public/assets/brand/logo.png`, `logo-option-1.png`, `logo-option-2.png` — exist, not used (SVG logo used instead)

### Is the homepage currently text-only?
**Yes.** The homepage contains zero images or photographs. Visual elements are limited to:
1. SVG logo icon
2. CSS gradient background on hero
3. CSS blur circles (decorative)
4. Lucide icons (Sparkles, TrendingUp, Clock, User, ArrowRight)
5. Text content

### Why text-only?
The rebrand focused on copy, color system, and structural layout. The original app's images (Yael-centric) were intentionally removed as part of the repositioning away from a personal brand. New premium imagery (abstract, lifestyle, or brand photography) was not generated or sourced during this phase.

---

## ADDITIONAL NOTES

### Routes
| Route | Guard | Page |
|-------|-------|------|
| `/` | None | Home |
| `/disclaimer` | None | Disclaimer |
| `/conditions` | DisclaimerGuard | Conditions |
| `/setup` | DisclaimerGuard | Setup |
| `/questionnaire` | DisclaimerGuard | Questionnaire |
| `/plan` | DisclaimerGuard | Plan |
| `/workout/:sessionId` | DisclaimerGuard | Workout |
| `/checkin/:sessionId` | DisclaimerGuard | CheckinPage |
| `/complete` | DisclaimerGuard | CompletePage |
| `/stop` | None | Stop |
| `/expert-review` | None | ExpertReview |
| `/audit-export` | None | AuditExport |
| `*` | None | NotFound |

### No Library Screen exists
There is no dedicated Library page/route in the current codebase despite the brief mentioning one.

### No Settings Page exists
Settings are embedded in the About Modal only.

### Known Technical Issues
1. **Hebrew/English mixing throughout** — the largest consistency issue
2. **No `direction: rtl`** — body is set to `direction: ltr` but Hebrew content remains
3. **ExerciseCard** has `text-right` class (RTL artifact)
4. **Category colors in ExerciseCard** use hardcoded Tailwind colors (`bg-blue-50`, `bg-emerald-50`, etc.) — not design system tokens
5. **Breathing strip** in ExerciseCard uses inline `style={{ backgroundColor: "#E8C2B6" }}` — hardcoded hex
6. **"Why" card** in ExerciseCard uses inline `style={{ backgroundColor: "#F4EDE6" }}` — hardcoded hex
7. **`shadow-calm` and `shadow-premium`** are duplicates with identical values
8. **`font-heebo`** Tailwind class maps to Plus Jakarta Sans (naming artifact from Hebrew version)
