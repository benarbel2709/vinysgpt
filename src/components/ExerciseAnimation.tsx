import { Exercise } from "@/types";
import { Wind, Move, Shield, Heart } from "lucide-react";
import { readState } from "@/lib/storage";

const CATEGORY_ICONS = {
  breath: Wind,
  mobility: Move,
  stability: Shield,
  release: Heart,
};

// Animation name detection from exercise content
function getAnimationName(exercise: Exercise): string {
  const name = exercise.name_he.toLowerCase();
  if (exercise.category === "breath") return "breath";
  if (name.includes("חתול") && name.includes("פרה")) return "catcow";
  if (name.includes("גשר")) return "bridge";
  if (name.includes("bird") || name.includes("בירד")) return "birddog";
  if (name.includes("wall slide") || name.includes("שכמות לקיר")) return "wallslides";
  if (name.includes("הטיות אגן") || name.includes("הטיית אגן")) return "pelvictilt";
  if (name.includes("פתיחת חזה")) return "chestopen_wall";
  if (name.includes("סריקת גוף") || name.includes("הרפיה")) return "relax_scan";
  if (name.includes("הליכה")) return "walk_in_place";
  if (name.includes("צוואר") || name.includes("הטיות ראש") || name.includes("סנטר")) return "neck_release";
  if (name.includes("כריעה") || name.includes("sit-to-stand") || name.includes("ישיבה לעמידה")) return "chair_squat";
  if (name.includes("הרמת עקב")) return "calf_raise";
  if (name.includes("רגל על צד") || name.includes("הרמת רגל")) return "side_leg";
  return "generic";
}

// Instructional hints per animation
const ANIM_HINTS: Record<string, string> = {
  breath: "נשיפה ארוכה יותר מהשאיפה.",
  catcow: "טווח קטן. לא דוחפים.",
  bridge: "הרמה עדינה — 2–5 ס״מ בלבד.",
  birddog: "חצי טווח. שומרים על יציבות.",
  wallslides: "תנועה איטית לאורך הקיר.",
  pelvictilt: "תנועה זעירה. הגב מתקרב לרצפה.",
  chestopen_wall: "חזה נפתח בעדינות, בלי לדחוף.",
  relax_scan: "לסרוק לאט. לשהות בכל אזור.",
  walk_in_place: "צעדים קטנים, עמוד שדרה ניטרלי.",
  neck_release: "טווח קטן. בלי סיבוב מלא.",
  chair_squat: "כריעה קלה בלבד — 20–30°.",
  calf_raise: "הרמה איטית, הורדה איטית.",
  side_leg: "טווח קטן. שומרים על יציבות אגן.",
  generic: "עוצמה 3/10. מחר צריך להיות בסדר.",
};

interface Props {
  exercise: Exercise;
  compact?: boolean;
}

export default function ExerciseAnimation({ exercise, compact = false }: Props) {
  const animationsDisabled = readState<boolean>("yaelYogaDisableAnimations", false);
  const Icon = CATEGORY_ICONS[exercise.category];
  const animName = getAnimationName(exercise);
  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const frozen = animationsDisabled || reducedMotion;
  const hint = ANIM_HINTS[animName] || ANIM_HINTS.generic;

  if (compact) {
    return (
      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon size={12} className="text-primary" />
      </div>
    );
  }

  if (animationsDisabled && !compact) {
    // Static fallback
    return (
      <div className="relative w-full rounded-2xl bg-gradient-to-br from-primary/[0.05] to-transparent border border-border/30 overflow-hidden flex items-center justify-center" style={{ height: 100 }}>
        <Icon size={24} className="text-primary/40" />
        <p className="absolute bottom-2 right-3 left-3 text-[10px] text-muted-foreground/50 text-right">{hint}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-br from-primary/[0.05] to-primary/[0.02] border border-border/30 overflow-hidden" style={{ height: 130 }}>
      <svg
        viewBox="0 0 320 120"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={exercise.name_he}
      >
        <defs>
          <style>{svgStyles}</style>
        </defs>
        <g className={frozen ? "frozen" : ""}>
          {renderAnimation(animName, exercise.category)}
        </g>
      </svg>
      {/* Instructional hint */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-card/80 to-transparent px-3 py-2">
        <p className="text-[11px] text-muted-foreground text-right leading-tight">{hint}</p>
      </div>
    </div>
  );
}

function renderAnimation(name: string, category: string) {
  switch (name) {
    case "breath": return <BreathAnim />;
    case "catcow": return <CatCowStoryboard />;
    case "bridge": return <BridgeStoryboard />;
    case "birddog": return <BirdDogStoryboard />;
    case "wallslides": return <WallSlidesStoryboard />;
    case "pelvictilt": return <PelvicTiltStoryboard />;
    case "chestopen_wall": return <ChestOpenStoryboard />;
    case "relax_scan": return <RelaxScanAnim />;
    case "walk_in_place": return <WalkAnim />;
    case "neck_release": return <NeckReleaseStoryboard />;
    case "chair_squat": return <ChairSquatStoryboard />;
    case "calf_raise": return <CalfRaiseStoryboard />;
    case "side_leg": return <SideLegStoryboard />;
    default: return <GenericAnim category={category} />;
  }
}

/* ── CSS keyframes for all animations ── */
const svgStyles = `
  @keyframes breathCircle { 0%,100% { r: 16; opacity: 0.4; } 50% { r: 26; opacity: 0.7; } }
  @keyframes gentleFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
  @keyframes softPulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.6; } }
  @keyframes calmSway { 0%,100% { transform: translateX(0); } 50% { transform: translateX(3px); } }
  @keyframes scanDot { 0% { cy: 18; } 100% { cy: 95; } }
  @keyframes walkStep { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  
  /* 3-frame storyboard: A (0-33%) -> B (33-66%) -> C (66-100%) with smooth transitions */
  @keyframes storyA { 0%,30% { opacity: 1; } 35%,100% { opacity: 0; } }
  @keyframes storyB { 0%,30% { opacity: 0; } 35%,63% { opacity: 1; } 68%,100% { opacity: 0; } }
  @keyframes storyC { 0%,63% { opacity: 0; } 68%,95% { opacity: 1; } 100% { opacity: 0; } }
  
  .frame-a { animation: storyA 4.5s ease-in-out infinite; }
  .frame-b { animation: storyB 4.5s ease-in-out infinite; }
  .frame-c { animation: storyC 4.5s ease-in-out infinite; }
  .frozen * { animation-play-state: paused !important; }
`;

/* ── BREATH (continuous loop) ── */
function BreathAnim() {
  return (
    <>
      <circle cx="160" cy="52" r="16" fill="hsl(var(--primary) / 0.12)" style={{ animation: "breathCircle 4s ease-in-out infinite" }} />
      <circle cx="160" cy="52" r="10" fill="hsl(var(--primary) / 0.2)" style={{ animation: "breathCircle 4s ease-in-out infinite 0.3s" }} />
      <path d="M60,78 Q110,68 160,78 Q210,88 260,78" fill="none" stroke="hsl(var(--primary) / 0.25)" strokeWidth="1.5" style={{ animation: "gentleFloat 4s ease-in-out infinite" }} />
      <path d="M70,86 Q120,76 160,86 Q200,96 250,86" fill="none" stroke="hsl(var(--primary) / 0.12)" strokeWidth="1" style={{ animation: "gentleFloat 4s ease-in-out infinite 1s" }} />
      <text x="95" y="38" fill="hsl(var(--primary) / 0.35)" fontSize="8" textAnchor="middle" fontFamily="Heebo">שאיפה</text>
      <text x="225" y="38" fill="hsl(var(--primary) / 0.35)" fontSize="8" textAnchor="middle" fontFamily="Heebo">נשיפה</text>
    </>
  );
}

/* ── STORYBOARD ANIMATIONS (3-frame) ── */

function CatCowStoryboard() {
  const floor = <line x1="90" y1="95" x2="230" y2="95" stroke="hsl(var(--primary) / 0.1)" strokeWidth="1" />;
  const hands = <><circle cx="115" cy="95" r="2.5" fill="hsl(var(--primary) / 0.25)" /><circle cx="205" cy="95" r="2.5" fill="hsl(var(--primary) / 0.25)" /></>;
  return (
    <>
      {floor}{hands}
      {/* Frame A: Neutral */}
      <g className="frame-a">
        <path d="M115,78 Q160,72 205,78" fill="none" stroke="hsl(var(--primary) / 0.45)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="110" cy="72" r="5" fill="hsl(var(--primary) / 0.18)" />
      </g>
      {/* Frame B: Cat (rounded up) */}
      <g className="frame-b">
        <path d="M115,78 Q160,60 205,78" fill="none" stroke="hsl(var(--primary) / 0.45)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="112" cy="76" r="5" fill="hsl(var(--primary) / 0.18)" />
      </g>
      {/* Frame C: Cow (arched down) */}
      <g className="frame-c">
        <path d="M115,78 Q160,86 205,78" fill="none" stroke="hsl(var(--primary) / 0.45)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="108" cy="70" r="5" fill="hsl(var(--primary) / 0.18)" />
      </g>
    </>
  );
}

function BridgeStoryboard() {
  const floor = <line x1="80" y1="95" x2="240" y2="95" stroke="hsl(var(--primary) / 0.1)" strokeWidth="1" />;
  const head = <circle cx="100" cy="83" r="5" fill="hsl(var(--primary) / 0.18)" />;
  const legs = <path d="M175,85 L195,70 L205,95" fill="none" stroke="hsl(var(--primary) / 0.25)" strokeWidth="2" />;
  return (
    <>
      {floor}{head}{legs}
      {/* Frame A: Flat */}
      <g className="frame-a">
        <line x1="105" y1="85" x2="175" y2="85" stroke="hsl(var(--primary) / 0.35)" strokeWidth="2.5" />
        <rect x="140" y="78" width="28" height="10" rx="4" fill="hsl(var(--primary) / 0.2)" />
      </g>
      {/* Frame B: Rising */}
      <g className="frame-b">
        <line x1="105" y1="85" x2="175" y2="82" stroke="hsl(var(--primary) / 0.35)" strokeWidth="2.5" />
        <rect x="140" y="74" width="28" height="10" rx="4" fill="hsl(var(--primary) / 0.25)" />
      </g>
      {/* Frame C: Up */}
      <g className="frame-c">
        <line x1="105" y1="85" x2="175" y2="78" stroke="hsl(var(--primary) / 0.35)" strokeWidth="2.5" />
        <rect x="140" y="70" width="28" height="10" rx="4" fill="hsl(var(--primary) / 0.3)" />
      </g>
    </>
  );
}

function BirdDogStoryboard() {
  const floor = <line x1="80" y1="95" x2="240" y2="95" stroke="hsl(var(--primary) / 0.1)" strokeWidth="1" />;
  const body = <rect x="130" y="60" width="55" height="9" rx="4" fill="hsl(var(--primary) / 0.15)" />;
  const supports = <>
    <line x1="145" y1="69" x2="145" y2="95" stroke="hsl(var(--primary) / 0.18)" strokeWidth="2" />
    <line x1="170" y1="69" x2="170" y2="95" stroke="hsl(var(--primary) / 0.18)" strokeWidth="2" />
  </>;
  return (
    <>
      {floor}{body}{supports}
      {/* Frame A: All down */}
      <g className="frame-a">
        <line x1="130" y1="64" x2="118" y2="64" stroke="hsl(var(--primary) / 0.3)" strokeWidth="2" strokeLinecap="round" />
        <line x1="185" y1="64" x2="197" y2="64" stroke="hsl(var(--primary) / 0.3)" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Frame B: Extending */}
      <g className="frame-b">
        <line x1="130" y1="64" x2="105" y2="52" stroke="hsl(var(--primary) / 0.4)" strokeWidth="2" strokeLinecap="round" />
        <line x1="185" y1="64" x2="210" y2="52" stroke="hsl(var(--primary) / 0.4)" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Frame C: Full extend */}
      <g className="frame-c">
        <line x1="130" y1="64" x2="95" y2="48" stroke="hsl(var(--primary) / 0.45)" strokeWidth="2" strokeLinecap="round" />
        <line x1="185" y1="64" x2="220" y2="48" stroke="hsl(var(--primary) / 0.45)" strokeWidth="2" strokeLinecap="round" />
      </g>
    </>
  );
}

function WallSlidesStoryboard() {
  const wall = <rect x="218" y="15" width="4" height="88" rx="2" fill="hsl(var(--primary) / 0.12)" />;
  const body = <rect x="180" y="32" width="18" height="48" rx="5" fill="hsl(var(--primary) / 0.1)" />;
  const head = <circle cx="189" cy="26" r="5.5" fill="hsl(var(--primary) / 0.17)" />;
  return (
    <>
      {wall}{body}{head}
      {/* Frame A: Arms low */}
      <g className="frame-a">
        <line x1="198" y1="55" x2="216" y2="55" stroke="hsl(var(--primary) / 0.4)" strokeWidth="2" strokeLinecap="round" />
        <line x1="198" y1="48" x2="216" y2="48" stroke="hsl(var(--primary) / 0.4)" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Frame B: Arms mid */}
      <g className="frame-b">
        <line x1="198" y1="45" x2="216" y2="42" stroke="hsl(var(--primary) / 0.4)" strokeWidth="2" strokeLinecap="round" />
        <line x1="198" y1="38" x2="216" y2="35" stroke="hsl(var(--primary) / 0.4)" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Frame C: Arms high */}
      <g className="frame-c">
        <line x1="198" y1="36" x2="216" y2="30" stroke="hsl(var(--primary) / 0.45)" strokeWidth="2" strokeLinecap="round" />
        <line x1="198" y1="28" x2="216" y2="22" stroke="hsl(var(--primary) / 0.45)" strokeWidth="2" strokeLinecap="round" />
      </g>
    </>
  );
}

function PelvicTiltStoryboard() {
  const floor = <line x1="80" y1="95" x2="240" y2="95" stroke="hsl(var(--primary) / 0.1)" strokeWidth="1" />;
  const head = <circle cx="100" cy="82" r="4.5" fill="hsl(var(--primary) / 0.17)" />;
  const torso = <line x1="105" y1="84" x2="155" y2="84" stroke="hsl(var(--primary) / 0.25)" strokeWidth="2" />;
  const legs = <path d="M165,84 L185,68 L195,95" fill="none" stroke="hsl(var(--primary) / 0.25)" strokeWidth="2" />;
  return (
    <>
      {floor}{head}{torso}{legs}
      {/* Frame A: Neutral */}
      <g className="frame-a">
        <ellipse cx="158" cy="82" rx="12" ry="6" fill="hsl(var(--primary) / 0.15)" />
      </g>
      {/* Frame B: Tilted forward */}
      <g className="frame-b">
        <ellipse cx="158" cy="80" rx="12" ry="6" fill="hsl(var(--primary) / 0.2)" transform="rotate(-4 158 80)" />
      </g>
      {/* Frame C: Tilted back */}
      <g className="frame-c">
        <ellipse cx="158" cy="84" rx="12" ry="6" fill="hsl(var(--primary) / 0.2)" transform="rotate(4 158 84)" />
      </g>
    </>
  );
}

function ChestOpenStoryboard() {
  const wall = <rect x="100" y="15" width="4" height="88" rx="2" fill="hsl(var(--primary) / 0.12)" />;
  const body = <rect x="110" y="36" width="16" height="42" rx="5" fill="hsl(var(--primary) / 0.1)" />;
  const head = <circle cx="118" cy="30" r="5.5" fill="hsl(var(--primary) / 0.17)" />;
  return (
    <>
      {wall}{body}{head}
      {/* Frame A: Closed */}
      <g className="frame-a">
        <line x1="126" y1="46" x2="140" y2="44" stroke="hsl(var(--primary) / 0.35)" strokeWidth="2" strokeLinecap="round" />
        <line x1="126" y1="56" x2="140" y2="58" stroke="hsl(var(--primary) / 0.35)" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Frame B: Mid */}
      <g className="frame-b">
        <line x1="126" y1="44" x2="155" y2="38" stroke="hsl(var(--primary) / 0.4)" strokeWidth="2" strokeLinecap="round" />
        <line x1="126" y1="58" x2="155" y2="62" stroke="hsl(var(--primary) / 0.4)" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Frame C: Open */}
      <g className="frame-c">
        <line x1="126" y1="42" x2="168" y2="34" stroke="hsl(var(--primary) / 0.45)" strokeWidth="2" strokeLinecap="round" />
        <line x1="126" y1="60" x2="168" y2="66" stroke="hsl(var(--primary) / 0.45)" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="120" cy="50" rx="10" ry="7" fill="hsl(var(--primary) / 0.08)" />
      </g>
    </>
  );
}

function NeckReleaseStoryboard() {
  const body = <rect x="148" y="52" width="22" height="38" rx="6" fill="hsl(var(--primary) / 0.09)" />;
  const neck = <rect x="154" y="42" width="10" height="12" rx="3" fill="hsl(var(--primary) / 0.1)" />;
  const shoulders = <line x1="140" y1="56" x2="178" y2="56" stroke="hsl(var(--primary) / 0.12)" strokeWidth="2" strokeLinecap="round" />;
  return (
    <>
      {body}{neck}{shoulders}
      {/* Frame A: Center */}
      <g className="frame-a">
        <circle cx="159" cy="34" r="8" fill="hsl(var(--primary) / 0.17)" />
      </g>
      {/* Frame B: Tilt right */}
      <g className="frame-b">
        <circle cx="163" cy="35" r="8" fill="hsl(var(--primary) / 0.17)" />
      </g>
      {/* Frame C: Tilt left */}
      <g className="frame-c">
        <circle cx="155" cy="35" r="8" fill="hsl(var(--primary) / 0.17)" />
      </g>
    </>
  );
}

function ChairSquatStoryboard() {
  const chair = <><rect x="195" y="55" width="25" height="4" rx="2" fill="hsl(var(--primary) / 0.15)" /><rect x="215" y="55" width="4" height="40" rx="2" fill="hsl(var(--primary) / 0.12)" /></>;
  return (
    <>
      {chair}
      <line x1="80" y1="95" x2="240" y2="95" stroke="hsl(var(--primary) / 0.1)" strokeWidth="1" />
      {/* Frame A: Standing */}
      <g className="frame-a">
        <rect x="148" y="30" width="18" height="35" rx="5" fill="hsl(var(--primary) / 0.12)" />
        <circle cx="157" cy="24" r="6" fill="hsl(var(--primary) / 0.17)" />
        <line x1="152" y1="65" x2="148" y2="95" stroke="hsl(var(--primary) / 0.2)" strokeWidth="2.5" />
        <line x1="162" y1="65" x2="166" y2="95" stroke="hsl(var(--primary) / 0.2)" strokeWidth="2.5" />
      </g>
      {/* Frame B: Mid squat */}
      <g className="frame-b">
        <rect x="150" y="38" width="18" height="30" rx="5" fill="hsl(var(--primary) / 0.12)" />
        <circle cx="159" cy="32" r="6" fill="hsl(var(--primary) / 0.17)" />
        <path d="M155,68 L148,82 L148,95" fill="none" stroke="hsl(var(--primary) / 0.2)" strokeWidth="2.5" />
        <path d="M163,68 L170,82 L170,95" fill="none" stroke="hsl(var(--primary) / 0.2)" strokeWidth="2.5" />
      </g>
      {/* Frame C: Seated */}
      <g className="frame-c">
        <rect x="155" y="45" width="18" height="25" rx="5" fill="hsl(var(--primary) / 0.12)" />
        <circle cx="164" cy="39" r="6" fill="hsl(var(--primary) / 0.17)" />
        <path d="M160,70 L148,78 L148,95" fill="none" stroke="hsl(var(--primary) / 0.2)" strokeWidth="2.5" />
        <path d="M168,70 L180,78 L180,95" fill="none" stroke="hsl(var(--primary) / 0.2)" strokeWidth="2.5" />
      </g>
    </>
  );
}

function CalfRaiseStoryboard() {
  const floor = <line x1="80" y1="95" x2="240" y2="95" stroke="hsl(var(--primary) / 0.1)" strokeWidth="1" />;
  const body = <rect x="150" y="25" width="16" height="38" rx="5" fill="hsl(var(--primary) / 0.1)" />;
  const head = <circle cx="158" cy="19" r="5.5" fill="hsl(var(--primary) / 0.17)" />;
  return (
    <>
      {floor}{body}{head}
      {/* Frame A: Flat feet */}
      <g className="frame-a">
        <line x1="152" y1="63" x2="148" y2="95" stroke="hsl(var(--primary) / 0.25)" strokeWidth="2.5" />
        <line x1="164" y1="63" x2="168" y2="95" stroke="hsl(var(--primary) / 0.25)" strokeWidth="2.5" />
      </g>
      {/* Frame B: Rising */}
      <g className="frame-b">
        <line x1="152" y1="63" x2="148" y2="90" stroke="hsl(var(--primary) / 0.25)" strokeWidth="2.5" />
        <line x1="164" y1="63" x2="168" y2="90" stroke="hsl(var(--primary) / 0.25)" strokeWidth="2.5" />
        <circle cx="148" cy="90" r="2" fill="hsl(var(--primary) / 0.2)" />
        <circle cx="168" cy="90" r="2" fill="hsl(var(--primary) / 0.2)" />
      </g>
      {/* Frame C: Up on toes */}
      <g className="frame-c">
        <line x1="152" y1="63" x2="150" y2="86" stroke="hsl(var(--primary) / 0.3)" strokeWidth="2.5" />
        <line x1="164" y1="63" x2="166" y2="86" stroke="hsl(var(--primary) / 0.3)" strokeWidth="2.5" />
        <circle cx="150" cy="86" r="2.5" fill="hsl(var(--primary) / 0.25)" />
        <circle cx="166" cy="86" r="2.5" fill="hsl(var(--primary) / 0.25)" />
      </g>
    </>
  );
}

function SideLegStoryboard() {
  const floor = <line x1="80" y1="95" x2="240" y2="95" stroke="hsl(var(--primary) / 0.1)" strokeWidth="1" />;
  // Lying on side
  const body = <ellipse cx="160" cy="85" rx="35" ry="6" fill="hsl(var(--primary) / 0.1)" />;
  const head = <circle cx="120" cy="82" r="5" fill="hsl(var(--primary) / 0.17)" />;
  return (
    <>
      {floor}{body}{head}
      {/* Frame A: Legs together */}
      <g className="frame-a">
        <line x1="170" y1="88" x2="210" y2="88" stroke="hsl(var(--primary) / 0.3)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="170" y1="82" x2="210" y2="82" stroke="hsl(var(--primary) / 0.25)" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      {/* Frame B: Lifting */}
      <g className="frame-b">
        <line x1="170" y1="88" x2="210" y2="88" stroke="hsl(var(--primary) / 0.3)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="170" y1="76" x2="210" y2="72" stroke="hsl(var(--primary) / 0.35)" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      {/* Frame C: Up */}
      <g className="frame-c">
        <line x1="170" y1="88" x2="210" y2="88" stroke="hsl(var(--primary) / 0.3)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="170" y1="70" x2="210" y2="64" stroke="hsl(var(--primary) / 0.4)" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </>
  );
}

/* ── Continuous loops ── */

function RelaxScanAnim() {
  return (
    <>
      <ellipse cx="160" cy="30" rx="7" ry="9" fill="hsl(var(--primary) / 0.1)" />
      <rect x="153" y="38" width="14" height="28" rx="5" fill="hsl(var(--primary) / 0.08)" />
      <line x1="156" y1="66" x2="149" y2="95" stroke="hsl(var(--primary) / 0.08)" strokeWidth="3" strokeLinecap="round" />
      <line x1="164" y1="66" x2="171" y2="95" stroke="hsl(var(--primary) / 0.08)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="160" cy="18" r="4" fill="hsl(var(--primary) / 0.4)" style={{ animation: "scanDot 5s ease-in-out infinite" }} />
      <circle cx="160" cy="18" r="8" fill="hsl(var(--primary) / 0.12)" style={{ animation: "scanDot 5s ease-in-out infinite" }} />
    </>
  );
}

function WalkAnim() {
  return (
    <>
      <line x1="80" y1="98" x2="240" y2="98" stroke="hsl(var(--primary) / 0.08)" strokeWidth="1" />
      <rect x="152" y="32" width="14" height="32" rx="5" fill="hsl(var(--primary) / 0.12)" />
      <circle cx="159" cy="26" r="6" fill="hsl(var(--primary) / 0.17)" />
      <line x1="155" y1="64" x2="148" y2="98" stroke="hsl(var(--primary) / 0.25)" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "walkStep 1.2s ease-in-out infinite" }} />
      <line x1="163" y1="64" x2="170" y2="98" stroke="hsl(var(--primary) / 0.25)" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "walkStep 1.2s ease-in-out infinite 0.6s" }} />
    </>
  );
}

function GenericAnim({ category }: { category: string }) {
  if (category === "breath") return <BreathAnim />;
  if (category === "mobility") {
    return (
      <>
        <path d="M50,58 Q110,42 160,58 Q210,74 270,58" fill="none" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1.5" style={{ animation: "gentleFloat 4s ease-in-out infinite" }} />
        <path d="M50,68 Q110,52 160,68 Q210,84 270,68" fill="none" stroke="hsl(var(--primary) / 0.1)" strokeWidth="1" style={{ animation: "gentleFloat 4s ease-in-out infinite 1s" }} />
        <circle cx="160" cy="58" r="5" fill="hsl(var(--primary) / 0.25)" style={{ animation: "gentleFloat 3s ease-in-out infinite" }} />
      </>
    );
  }
  if (category === "stability") {
    return (
      <>
        <rect x="125" y="78" width="70" height="5" rx="2.5" fill="hsl(var(--primary) / 0.12)" />
        <circle cx="160" cy="52" r="14" fill="hsl(var(--primary) / 0.08)" style={{ animation: "softPulse 3s ease-in-out infinite" }} />
        <circle cx="160" cy="52" r="7" fill="hsl(var(--primary) / 0.16)" style={{ animation: "softPulse 3s ease-in-out infinite 0.5s" }} />
      </>
    );
  }
  // release / mindfulness
  return (
    <>
      <ellipse cx="160" cy="52" rx="18" ry="22" fill="hsl(var(--primary) / 0.06)" style={{ animation: "calmSway 5s ease-in-out infinite" }} />
      <ellipse cx="160" cy="52" rx="10" ry="14" fill="hsl(var(--primary) / 0.1)" style={{ animation: "calmSway 5s ease-in-out infinite 1s" }} />
      <circle cx="160" cy="48" r="3.5" fill="hsl(var(--primary) / 0.2)" style={{ animation: "softPulse 4s ease-in-out infinite" }} />
    </>
  );
}
