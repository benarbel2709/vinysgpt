/**
 * ExerciseAnimationV3 — Premium human-figure animation wrapper.
 * Maps exercises to pose-based CSS keyframe animations using the HumanFigure SVG system.
 * Respects prefers-reduced-motion and the app-level animation toggle.
 */

import { Exercise } from "@/types";
import { readState } from "@/lib/storage";
import {
  StandingFigure,
  StandingArmsUp,
  StandingArmsOpen,
  AllFoursNeutral,
  AllFoursRounded,
  AllFoursArched,
  SupineFlat,
  SupineBridge,
  BirdDogNeutral,
  BirdDogExtended,
  WallStandingArmsLow,
  WallStandingArmsHigh,
  SeatedFigure,
  LyingRelax,
  SideLying,
  SideLyingLegUp,
  NeckCenter,
  NeckTiltRight,
  NeckTiltLeft,
  PelvicNeutral,
  PelvicTilted,
} from "@/components/animations/HumanFigure";

/* ─── Animation name detection (same logic as V2) ─── */
function getAnimationName(exercise: Exercise): string {
  const name = exercise.name_he;
  if (exercise.category === "breath") return "breath";
  if (name.includes("חתול") || name.includes("פרה")) return "catcow";
  if (name.includes("גשר")) return "bridge";
  if (name.includes("Bird") || name.includes("בירד") || name.includes("יד ורגל") || name.includes("כלב")) return "birddog";
  if ((name.includes("קיר") && name.includes("שכמות")) || name.includes("סלייד") || name.includes("Wall")) return "wallslides";
  if (name.includes("אגן") && (name.includes("הטי") || name.includes("נטי"))) return "pelvictilt";
  if (name.includes("פתיחת חזה")) return "chestopen";
  if (name.includes("סריקת גוף") || name.includes("סריקה") || name.includes("הרפיה")) return "relax_scan";
  if (name.includes("הליכה")) return "walk";
  if (name.includes("צוואר") || name.includes("הטיות ראש") || name.includes("סנטר")) return "neck_release";
  if (name.includes("כריעה") || name.includes("ישיבה לעמידה") || name.includes("sit-to-stand")) return "chair_squat";
  if (name.includes("הרמת עקב")) return "calf_raise";
  if (name.includes("רגל על צד") || name.includes("הרמת רגל")) return "side_leg";
  // Category fallbacks
  if (exercise.category === "release") return "relax_scan";
  return "gentle_flow";
}

/* ─── Instructional hints ─── */
const HINTS: Record<string, string> = {
  breath: "נשיפה ארוכה ונוחה.",
  catcow: "טווח קטן. לא דוחפים.",
  bridge: "הרמה עדינה — 2–5 ס״מ בלבד.",
  birddog: "חצי טווח. יציבות לפני עומק.",
  wallslides: "תנועה איטית לאורך הקיר.",
  pelvictilt: "תנועה זעירה. הגב מתקרב לרצפה.",
  chestopen: "חזה נפתח בעדינות, בלי לדחוף.",
  relax_scan: "לסרוק לאט. לשהות בכל אזור.",
  walk: "צעדים קטנים, עמוד שדרה ניטרלי.",
  neck_release: "טווח קטן. בלי סיבוב מלא.",
  chair_squat: "כריעה קלה בלבד — 20–30°.",
  calf_raise: "הרמה איטית, הורדה איטית.",
  side_leg: "טווח קטן. שומרים על יציבות אגן.",
  gentle_flow: "עוצמה 3/10. מחר צריך להיות בסדר.",
};

/* ─── Category background tints ─── */
const CATEGORY_BG: Record<string, string> = {
  breath: "from-blue-50/40 to-blue-100/20",
  mobility: "from-emerald-50/40 to-emerald-100/20",
  stability: "from-amber-50/40 to-amber-100/20",
  release: "from-purple-50/40 to-purple-100/20",
};

/* ─── CSS keyframes for V3 storyboard ─── */
const V3_STYLES = `
  @keyframes v3frameA { 0%,28% { opacity: 1; } 33%,100% { opacity: 0; } }
  @keyframes v3frameB { 0%,28% { opacity: 0; } 33%,61% { opacity: 1; } 66%,100% { opacity: 0; } }
  @keyframes v3frameC { 0%,61% { opacity: 0; } 66%,95% { opacity: 1; } 100% { opacity: 0; } }
  @keyframes v3breathPulse { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(1.03); } }
  @keyframes v3scanGlow { 0% { opacity: 0.1; cy: 30; } 50% { opacity: 0.35; } 100% { opacity: 0.1; cy: 80; } }
  @keyframes v3gentleSway { 0%,100% { transform: translateX(0); } 50% { transform: translateX(2px); } }
  .v3-a { animation: v3frameA 4.5s cubic-bezier(0.4,0,0.2,1) infinite; }
  .v3-b { animation: v3frameB 4.5s cubic-bezier(0.4,0,0.2,1) infinite; }
  .v3-c { animation: v3frameC 4.5s cubic-bezier(0.4,0,0.2,1) infinite; }
  .v3-breath { animation: v3breathPulse 4s cubic-bezier(0.4,0,0.2,1) infinite; transform-origin: center 70%; }
  .v3-sway { animation: v3gentleSway 5s cubic-bezier(0.4,0,0.2,1) infinite; }
  .v3-frozen * { animation-play-state: paused !important; }
  @media (prefers-reduced-motion: reduce) { .v3-a,.v3-b,.v3-c,.v3-breath,.v3-sway { animation: none !important; } }
`;

interface Props {
  exercise: Exercise;
  compact?: boolean;
}

export default function ExerciseAnimationV3({ exercise, compact = false }: Props) {
  const animationsDisabled = readState<boolean>("pranvaDisableAnimations", false) || readState<boolean>("yaelYogaDisableAnimations", false);
  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const frozen = animationsDisabled || reducedMotion;
  const animName = getAnimationName(exercise);
  const hint = HINTS[animName] || HINTS.gentle_flow;
  const bgTint = CATEGORY_BG[exercise.category] || CATEGORY_BG.mobility;

  if (compact) {
    return (
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 320 100" className="w-6 h-6">
          <StandingFigure />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative w-full rounded-2xl bg-gradient-to-br ${bgTint} border border-border/30 overflow-hidden`} style={{ maxHeight: 180 }}>
      <svg
        viewBox="0 0 320 105"
        className="w-full"
        style={{ height: 150 }}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={exercise.name_he}
      >
        <defs><style>{V3_STYLES}</style></defs>
        <g className={frozen ? "v3-frozen" : ""}>
          {renderHumanAnimation(animName, frozen)}
        </g>
      </svg>
      {/* Hint strip */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-card/90 to-transparent px-3 py-2">
        <p className="text-[11px] text-muted-foreground text-right leading-tight">{hint}</p>
      </div>
    </div>
  );
}

/* ─── Render the right pose animation ─── */
function renderHumanAnimation(name: string, frozen: boolean) {
  if (frozen) {
    // Show static mid-pose
    return renderStaticPose(name);
  }

  switch (name) {
    case "breath": return <BreathAnimation />;
    case "catcow": return <CatCowAnimation />;
    case "bridge": return <BridgeAnimation />;
    case "birddog": return <BirdDogAnimation />;
    case "wallslides": return <WallSlidesAnimation />;
    case "pelvictilt": return <PelvicTiltAnimation />;
    case "chestopen": return <ChestOpenAnimation />;
    case "relax_scan": return <RelaxScanAnimation />;
    case "walk": return <WalkAnimation />;
    case "neck_release": return <NeckAnimation />;
    case "chair_squat": return <ChairSquatAnimation />;
    case "calf_raise": return <CalfRaiseAnimation />;
    case "side_leg": return <SideLegAnimation />;
    default: return <GentleFlowAnimation />;
  }
}

function renderStaticPose(name: string) {
  switch (name) {
    case "breath": return <SeatedFigure />;
    case "catcow": return <AllFoursNeutral />;
    case "bridge": return <SupineFlat />;
    case "birddog": return <AllFoursNeutral />;
    case "wallslides": return <WallStandingArmsLow />;
    case "pelvictilt": return <SupineFlat />;
    case "chestopen": return <StandingArmsOpen />;
    case "relax_scan": return <LyingRelax />;
    case "walk": return <StandingFigure />;
    case "neck_release": return <NeckCenter />;
    case "chair_squat": return <StandingFigure />;
    case "calf_raise": return <StandingFigure />;
    case "side_leg": return <SideLying />;
    default: return <StandingFigure />;
  }
}

/* ─── Animated sequences ─── */

function BreathAnimation() {
  return (
    <g className="v3-breath">
      <SeatedFigure />
    </g>
  );
}

function CatCowAnimation() {
  return (
    <>
      <g className="v3-a"><AllFoursNeutral /></g>
      <g className="v3-b"><AllFoursRounded /></g>
      <g className="v3-c"><AllFoursArched /></g>
    </>
  );
}

function BridgeAnimation() {
  return (
    <>
      <g className="v3-a"><SupineFlat /></g>
      <g className="v3-b"><SupineBridge /></g>
      <g className="v3-c"><SupineFlat /></g>
    </>
  );
}

function BirdDogAnimation() {
  return (
    <>
      <g className="v3-a"><BirdDogNeutral /></g>
      <g className="v3-b"><BirdDogExtended /></g>
      <g className="v3-c"><BirdDogNeutral /></g>
    </>
  );
}

function WallSlidesAnimation() {
  return (
    <>
      <g className="v3-a"><WallStandingArmsLow /></g>
      <g className="v3-b"><WallStandingArmsHigh /></g>
      <g className="v3-c"><WallStandingArmsLow /></g>
    </>
  );
}

function PelvicTiltAnimation() {
  return (
    <>
      <g className="v3-a"><PelvicNeutral /></g>
      <g className="v3-b"><PelvicTilted /></g>
      <g className="v3-c"><PelvicNeutral /></g>
    </>
  );
}

function ChestOpenAnimation() {
  return (
    <>
      <g className="v3-a"><StandingFigure /></g>
      <g className="v3-b"><StandingArmsOpen /></g>
      <g className="v3-c"><StandingFigure /></g>
    </>
  );
}

function RelaxScanAnimation() {
  return (
    <>
      <LyingRelax />
      {/* Scanning glow */}
      <circle cx="160" cy="30" r="12" fill="hsl(var(--primary) / 0.15)" style={{ animation: "v3scanGlow 5s ease-in-out infinite" }} />
    </>
  );
}

function WalkAnimation() {
  return (
    <g className="v3-sway">
      <StandingFigure />
    </g>
  );
}

function NeckAnimation() {
  return (
    <>
      <g className="v3-a"><NeckCenter /></g>
      <g className="v3-b"><NeckTiltRight /></g>
      <g className="v3-c"><NeckTiltLeft /></g>
    </>
  );
}

function ChairSquatAnimation() {
  return (
    <>
      <g className="v3-a"><StandingFigure /></g>
      <g className="v3-b"><SeatedFigure /></g>
      <g className="v3-c"><StandingFigure /></g>
    </>
  );
}

function CalfRaiseAnimation() {
  return (
    <>
      <g className="v3-a"><StandingFigure /></g>
      <g className="v3-b"><StandingArmsUp /></g>
      <g className="v3-c"><StandingFigure /></g>
    </>
  );
}

function SideLegAnimation() {
  return (
    <>
      <g className="v3-a"><SideLying /></g>
      <g className="v3-b"><SideLyingLegUp /></g>
      <g className="v3-c"><SideLying /></g>
    </>
  );
}

function GentleFlowAnimation() {
  return (
    <g className="v3-breath">
      <StandingFigure />
    </g>
  );
}
