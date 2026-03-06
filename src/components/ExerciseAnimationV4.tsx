/**
 * ExerciseAnimationV4 — Fluid transform-based animation system.
 * Replaces V3 storyboard (opacity swaps) with real CSS transform motion on body parts.
 * Each animation moves individual limbs/torso via rotate/translate/scale.
 */

import { Exercise } from "@/types";
import { readState } from "@/lib/storage";

/* ─── Animation name detection ─── */
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
  if (exercise.category === "release") return "relax_scan";
  return "gentle_flow";
}

/* ─── Hints ─── */
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

/* Shared SVG colors */
const SKIN = "hsl(var(--primary) / 0.22)";
const HAIR = "hsl(var(--primary) / 0.45)";
const TOP = "hsl(var(--foreground) / 0.55)";
const BOTTOM = "hsl(var(--foreground) / 0.35)";
const OUTLINE = "hsl(var(--primary) / 0.3)";

/* ─── V4 CSS keyframes: transform-based fluid motion ─── */
const V4_STYLES = `
  /* Breathing micro-motion (always present) */
  @keyframes v4breathe { 0%,100% { transform: scaleY(1) translateY(0); } 50% { transform: scaleY(1.018) translateY(-0.5px); } }
  
  /* Breath exercise: torso expand + shoulders lift */
  @keyframes v4breathTorso { 0%,100% { transform: scaleY(1) scaleX(1); } 50% { transform: scaleY(1.035) scaleX(1.015); } }
  @keyframes v4breathShoulders { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-1.5px); } }
  
  /* Cat-cow: spine rotation */
  @keyframes v4catcowSpine { 0%,100% { transform: rotate(0deg); } 30% { transform: rotate(3deg); } 70% { transform: rotate(-3deg); } }
  @keyframes v4catcowHead { 0%,100% { transform: rotate(0deg) translateY(0); } 30% { transform: rotate(4deg) translateY(1px); } 70% { transform: rotate(-3deg) translateY(-1px); } }
  
  /* Bridge: pelvis lift */
  @keyframes v4bridgePelvis { 0%,100% { transform: translateY(0); } 40%,60% { transform: translateY(-7px); } }
  @keyframes v4bridgeTorso { 0%,100% { transform: rotate(0deg); } 40%,60% { transform: rotate(-2deg); } }

  /* Bird-dog: arm + leg extend */
  @keyframes v4birdArm { 0%,100% { transform: rotate(0deg); } 35%,65% { transform: rotate(-25deg); } }
  @keyframes v4birdLeg { 0%,100% { transform: rotate(0deg); } 35%,65% { transform: rotate(20deg); } }

  /* Wall slides: arms up/down */
  @keyframes v4wallArms { 0%,100% { transform: rotate(0deg); } 40%,60% { transform: rotate(-40deg); } }

  /* Pelvic tilt: small rock */
  @keyframes v4pelvicRock { 0%,100% { transform: rotate(0deg); } 40%,60% { transform: rotate(2.5deg); } }

  /* Chest open: arms spread */
  @keyframes v4chestArms { 0%,100% { transform: rotate(0deg); } 40%,60% { transform: rotate(-20deg); } }

  /* Relax scan: glow sweep */
  @keyframes v4scanGlow { 0% { cy: 30; opacity: 0.1; } 50% { opacity: 0.3; } 100% { cy: 80; opacity: 0.1; } }

  /* Neck release: head tilt */
  @keyframes v4neckTilt { 0%,100% { transform: rotate(0deg); } 30% { transform: rotate(8deg); } 70% { transform: rotate(-8deg); } }

  /* Walk: gentle sway */
  @keyframes v4walkSway { 0%,100% { transform: translateX(0) rotate(0deg); } 25% { transform: translateX(1.5px) rotate(0.5deg); } 75% { transform: translateX(-1.5px) rotate(-0.5deg); } }

  /* Chair squat: legs bend */
  @keyframes v4squat { 0%,100% { transform: translateY(0) scaleY(1); } 40%,60% { transform: translateY(4px) scaleY(0.95); } }

  /* Calf raise */
  @keyframes v4calfRaise { 0%,100% { transform: translateY(0); } 40%,60% { transform: translateY(-4px); } }

  /* Side leg raise */
  @keyframes v4sideLeg { 0%,100% { transform: rotate(0deg); } 40%,60% { transform: rotate(-15deg); } }

  /* Gentle flow fallback */
  @keyframes v4gentleSway { 0%,100% { transform: translateX(0); } 50% { transform: translateX(1.5px); } }

  .v4-ease { transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); }
  .v4-frozen * { animation-play-state: paused !important; }
  @media (prefers-reduced-motion: reduce) { .v4-frozen * { animation: none !important; } }
`;

function anim(name: string, dur: string = "4.5s"): React.CSSProperties {
  return { animation: `${name} ${dur} cubic-bezier(0.4,0,0.2,1) infinite`, transformOrigin: "center center" };
}

interface Props {
  exercise: Exercise;
  compact?: boolean;
  large?: boolean;
}

export default function ExerciseAnimationV4({ exercise, compact = false, large = false }: Props) {
  const animationsDisabled = readState<boolean>("yaelYogaDisableAnimations", false);
  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const frozen = animationsDisabled || reducedMotion;
  const animName = getAnimationName(exercise);
  const hint = HINTS[animName] || HINTS.gentle_flow;
  const bgTint = CATEGORY_BG[exercise.category] || CATEGORY_BG.mobility;
  const height = large ? 220 : compact ? 32 : 170;

  if (compact) {
    return (
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 320 100" className="w-6 h-6">
          <StandingBase frozen />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative w-full rounded-[20px] bg-gradient-to-br ${bgTint} overflow-hidden`} style={{ height }}>
      <svg
        viewBox="0 0 320 105"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={exercise.name_he}
      >
        <defs><style>{V4_STYLES}</style></defs>
        <g className={frozen ? "v4-frozen" : ""}>
          {renderAnimation(animName, frozen)}
        </g>
      </svg>
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-card/80 to-transparent px-3 py-2">
        <p className="text-[11px] text-muted-foreground text-right leading-tight">{hint}</p>
      </div>
    </div>
  );
}

/* ─── Render the right animation ─── */
function renderAnimation(name: string, frozen: boolean) {
  if (frozen) return <StandingBase frozen />;
  switch (name) {
    case "breath": return <BreathAnim />;
    case "catcow": return <CatCowAnim />;
    case "bridge": return <BridgeAnim />;
    case "birddog": return <BirdDogAnim />;
    case "wallslides": return <WallSlidesAnim />;
    case "pelvictilt": return <PelvicTiltAnim />;
    case "chestopen": return <ChestOpenAnim />;
    case "relax_scan": return <RelaxScanAnim />;
    case "walk": return <WalkAnim />;
    case "neck_release": return <NeckAnim />;
    case "chair_squat": return <ChairSquatAnim />;
    case "calf_raise": return <CalfRaiseAnim />;
    case "side_leg": return <SideLegAnim />;
    default: return <GentleFlowAnim />;
  }
}

/* ═══════ BODY PART COMPONENTS ═══════ */

function StandingBase({ frozen = false }: { frozen?: boolean }) {
  const breathStyle = frozen ? {} : { animation: "v4breathe 4s cubic-bezier(0.4,0,0.2,1) infinite", transformOrigin: "160px 60px" };
  return (
    <g style={breathStyle}>
      <ellipse cx="160" cy="14" rx="4" ry="3.5" fill={HAIR} />
      <ellipse cx="160" cy="22" rx="7.5" ry="9" fill={SKIN} />
      <path d="M164,16 Q170,20 168,28" stroke={HAIR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="157" y="30" width="6" height="6" rx="2" fill={SKIN} />
      <path d="M148,36 Q149,34 160,34 Q171,34 172,36 L174,54 Q174,58 160,58 Q146,58 146,54 Z" fill={TOP} />
      <ellipse cx="148" cy="37" rx="3" ry="2" fill={SKIN} />
      <ellipse cx="172" cy="37" rx="3" ry="2" fill={SKIN} />
      <path d="M148,38 Q142,48 140,62" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M172,38 Q178,48 180,62" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M146,54 Q145,58 147,64 Q150,68 160,68 Q170,68 173,64 Q175,58 174,54" fill={TOP} opacity="0.7" />
      <path d="M150,64 Q148,78 147,95" stroke={BOTTOM} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M170,64 Q172,78 173,95" stroke={BOTTOM} strokeWidth="5" fill="none" strokeLinecap="round" />
      <ellipse cx="147" cy="96" rx="4" ry="2" fill={SKIN} />
      <ellipse cx="173" cy="96" rx="4" ry="2" fill={SKIN} />
    </g>
  );
}

/* ─── BREATH: torso expand + shoulder lift ─── */
function BreathAnim() {
  return (
    <g>
      {/* Chair hint */}
      <rect x="140" y="64" width="40" height="3" rx="1.5" fill={OUTLINE} opacity="0.15" />
      {/* Head */}
      <ellipse cx="160" cy="18" rx="4" ry="3.5" fill={HAIR} />
      <ellipse cx="160" cy="26" rx="7" ry="8.5" fill={SKIN} />
      <path d="M164,20 Q169,24 168,32" stroke={HAIR} strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="157" y="34" width="6" height="5" rx="2" fill={SKIN} />
      {/* Shoulders — lift subtly */}
      <g style={anim("v4breathShoulders", "4s")}>
        <ellipse cx="150" cy="42" rx="3" ry="2" fill={SKIN} />
        <ellipse cx="170" cy="42" rx="3" ry="2" fill={SKIN} />
      </g>
      {/* Torso — expand */}
      <g style={{ ...anim("v4breathTorso", "4s"), transformOrigin: "160px 56px" }}>
        <path d="M150,39 Q151,37 160,37 Q169,37 170,39 L172,56 Q172,60 160,60 Q148,60 148,56 Z" fill={TOP} />
      </g>
      {/* Arms */}
      <path d="M150,42 Q144,52 146,58" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M170,42 Q176,52 174,58" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Legs */}
      <path d="M150,60 L146,64 L142,82 L140,95" stroke={BOTTOM} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M170,60 L174,64 L178,82 L180,95" stroke={BOTTOM} strokeWidth="4.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ─── CAT-COW: spine rotation + head follow ─── */
function CatCowAnim() {
  return (
    <g>
      {/* Head — follows spine with delay */}
      <g style={{ ...anim("v4catcowHead", "5s"), transformOrigin: "110px 52px" }}>
        <ellipse cx="108" cy="52" rx="6.5" ry="7.5" fill={SKIN} />
        <ellipse cx="106" cy="46" rx="3" ry="2.5" fill={HAIR} />
        <path d="M114,54 L122,56" stroke={SKIN} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </g>
      {/* Torso — spine curves */}
      <g style={{ ...anim("v4catcowSpine", "5s"), transformOrigin: "160px 57px" }}>
        <path d="M122,52 Q148,48 160,52 Q180,48 198,52 L198,62 Q180,58 160,62 Q148,58 122,62 Z" fill={TOP} />
      </g>
      {/* Arms on ground */}
      <path d="M126,58 L126,82 L124,95" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M142,58 L142,82 L140,95" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Hips */}
      <ellipse cx="195" cy="57" rx="8" ry="7" fill={TOP} opacity="0.6" />
      {/* Legs */}
      <path d="M192,62 L192,82 L190,95" stroke={BOTTOM} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M204,62 L204,82 L206,95" stroke={BOTTOM} strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ─── BRIDGE: pelvis lift smooth ─── */
function BridgeAnim() {
  return (
    <g>
      {/* Head */}
      <ellipse cx="82" cy="72" rx="7.5" ry="6.5" fill={SKIN} />
      <ellipse cx="78" cy="68" rx="3.5" ry="3" fill={HAIR} />
      {/* Torso — slight tilt */}
      <g style={{ ...anim("v4bridgeTorso", "4.5s"), transformOrigin: "90px 73px" }}>
        <path d="M90,68 L90,78 L192,78 L192,68 Q160,64 130,64 Q110,64 90,68 Z" fill={TOP} />
      </g>
      {/* Arms */}
      <path d="M100,68 L98,58" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M180,68 L182,58" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Pelvis + legs — smooth lift */}
      <g style={{ ...anim("v4bridgePelvis", "4.5s"), transformOrigin: "200px 92px" }}>
        <path d="M192,74 L210,58 L215,74 L218,90" stroke={BOTTOM} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M192,78 L206,64 L210,78 L212,90" stroke={BOTTOM} strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
      <line x1="60" y1="92" x2="260" y2="92" stroke={OUTLINE} strokeWidth="0.5" opacity="0.3" />
    </g>
  );
}

/* ─── BIRD-DOG: arm + opposite leg extend via rotate ─── */
function BirdDogAnim() {
  return (
    <g>
      {/* Head */}
      <ellipse cx="108" cy="50" rx="6.5" ry="7.5" fill={SKIN} />
      <ellipse cx="106" cy="44" rx="3" ry="2.5" fill={HAIR} />
      <path d="M114,52 L122,54" stroke={SKIN} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* Torso */}
      <path d="M122,52 Q160,50 198,52 L198,62 Q160,60 122,62 Z" fill={TOP} />
      {/* Left arm — extends forward */}
      <g style={{ ...anim("v4birdArm", "5s"), transformOrigin: "126px 56px" }}>
        <path d="M126,56 L96,56" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      {/* Right arm on ground */}
      <path d="M142,58 L142,82 L140,95" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="195" cy="57" rx="8" ry="7" fill={TOP} opacity="0.6" />
      {/* Left leg on ground */}
      <path d="M192,62 L192,82 L190,95" stroke={BOTTOM} strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Right leg — extends back */}
      <g style={{ ...anim("v4birdLeg", "5s"), transformOrigin: "204px 58px" }}>
        <path d="M204,58 L234,58" stroke={BOTTOM} strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

/* ─── WALL SLIDES: arms rotate up/down ─── */
function WallSlidesAnim() {
  return (
    <g>
      <rect x="190" y="6" width="3" height="90" rx="1.5" fill={OUTLINE} opacity="0.25" />
      <ellipse cx="165" cy="16" rx="4" ry="3.5" fill={HAIR} />
      <ellipse cx="165" cy="24" rx="7" ry="8.5" fill={SKIN} />
      <rect x="162" y="32" width="6" height="5" rx="2" fill={SKIN} />
      <path d="M154,37 Q155,35 165,35 Q175,35 176,37 L178,54 Q178,58 165,58 Q152,58 152,54 Z" fill={TOP} />
      {/* Arms — rotate up smoothly */}
      <g style={{ ...anim("v4wallArms", "5s"), transformOrigin: "154px 40px" }}>
        <path d="M154,40 Q150,50 152,58 L154,62" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      <g style={{ ...anim("v4wallArms", "5s"), transformOrigin: "176px 40px" }}>
        <path d="M176,40 Q182,50 184,58 L186,62" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      <path d="M152,54 Q151,58 153,64 Q156,68 165,68 Q174,68 177,64 Q179,58 178,54" fill={TOP} opacity="0.7" />
      <path d="M156,64 Q154,78 153,95" stroke={BOTTOM} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M174,64 Q176,78 177,95" stroke={BOTTOM} strokeWidth="5" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ─── PELVIC TILT: small pelvic rock ─── */
function PelvicTiltAnim() {
  return (
    <g>
      <ellipse cx="82" cy="72" rx="7.5" ry="6.5" fill={SKIN} />
      <ellipse cx="78" cy="68" rx="3.5" ry="3" fill={HAIR} />
      {/* Torso with pelvic rock */}
      <g style={{ ...anim("v4pelvicRock", "4s"), transformOrigin: "190px 78px" }}>
        <path d="M90,68 L90,78 L192,78 L192,68 Q160,64 130,64 Q110,64 90,68 Z" fill={TOP} />
      </g>
      <path d="M100,68 L98,58" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M180,68 L182,58" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M192,74 L210,58 L215,74 L218,90" stroke={BOTTOM} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M192,78 L206,64 L210,78 L212,90" stroke={BOTTOM} strokeWidth="4" fill="none" strokeLinecap="round" />
      <line x1="60" y1="92" x2="260" y2="92" stroke={OUTLINE} strokeWidth="0.5" opacity="0.3" />
    </g>
  );
}

/* ─── CHEST OPEN: arms spread via rotate ─── */
function ChestOpenAnim() {
  return (
    <g>
      <g style={anim("v4breathe", "4s")}>
        <ellipse cx="160" cy="14" rx="4" ry="3.5" fill={HAIR} />
        <ellipse cx="160" cy="22" rx="7.5" ry="9" fill={SKIN} />
        <rect x="157" y="30" width="6" height="6" rx="2" fill={SKIN} />
        <path d="M148,36 Q149,34 160,34 Q171,34 172,36 L174,54 Q174,58 160,58 Q146,58 146,54 Z" fill={TOP} />
      </g>
      {/* Left arm */}
      <g style={{ ...anim("v4chestArms", "5s"), transformOrigin: "148px 38px" }}>
        <path d="M148,38 Q132,36 118,40" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      {/* Right arm */}
      <g style={{ ...anim("v4chestArms", "5s"), transformOrigin: "172px 38px" }}>
        <path d="M172,38 Q188,36 202,40" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      <path d="M146,54 Q145,58 147,64 Q150,68 160,68 Q170,68 173,64 Q175,58 174,54" fill={TOP} opacity="0.7" />
      <path d="M150,64 Q148,78 147,95" stroke={BOTTOM} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M170,64 Q172,78 173,95" stroke={BOTTOM} strokeWidth="5" fill="none" strokeLinecap="round" />
      <ellipse cx="147" cy="96" rx="4" ry="2" fill={SKIN} />
      <ellipse cx="173" cy="96" rx="4" ry="2" fill={SKIN} />
    </g>
  );
}

/* ─── RELAX SCAN ─── */
function RelaxScanAnim() {
  return (
    <g>
      <g style={anim("v4breathe", "5s")}>
        <ellipse cx="82" cy="72" rx="7.5" ry="6.5" fill={SKIN} />
        <ellipse cx="78" cy="68" rx="3.5" ry="3" fill={HAIR} />
        <path d="M90,68 L90,78 L220,78 L220,68 Q170,64 130,64 Q110,64 90,68 Z" fill={TOP} />
        <path d="M100,68 L96,56" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M210,68 L214,56" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M220,74 L246,74" stroke={BOTTOM} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M220,78 L246,78" stroke={BOTTOM} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      </g>
      <circle cx="160" cy="30" r="12" fill="hsl(var(--primary) / 0.12)" style={{ animation: "v4scanGlow 5s ease-in-out infinite" }} />
      <line x1="60" y1="86" x2="260" y2="86" stroke={OUTLINE} strokeWidth="0.5" opacity="0.2" />
    </g>
  );
}

/* ─── WALK: gentle body sway ─── */
function WalkAnim() {
  return (
    <g style={{ ...anim("v4walkSway", "4s"), transformOrigin: "160px 95px" }}>
      <StandingBase />
    </g>
  );
}

/* ─── NECK: head rotation ─── */
function NeckAnim() {
  return (
    <g>
      <path d="M150,50 Q151,48 160,48 Q169,48 170,50 L172,72 Q172,76 160,76 Q148,76 148,72 Z" fill={TOP} />
      <ellipse cx="148" cy="51" rx="3" ry="2" fill={SKIN} />
      <ellipse cx="172" cy="51" rx="3" ry="2" fill={SKIN} />
      <rect x="157" y="40" width="6" height="8" rx="2" fill={SKIN} />
      {/* Head tilts smoothly */}
      <g style={{ ...anim("v4neckTilt", "5s"), transformOrigin: "160px 40px" }}>
        <ellipse cx="160" cy="32" rx="8" ry="10" fill={SKIN} />
        <ellipse cx="160" cy="24" rx="4.5" ry="3.5" fill={HAIR} />
        <path d="M165,26 Q170,30 169,38" stroke={HAIR} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

/* ─── CHAIR SQUAT ─── */
function ChairSquatAnim() {
  return (
    <g>
      <ellipse cx="160" cy="14" rx="4" ry="3.5" fill={HAIR} />
      <ellipse cx="160" cy="22" rx="7.5" ry="9" fill={SKIN} />
      <rect x="157" y="30" width="6" height="6" rx="2" fill={SKIN} />
      <path d="M148,36 Q149,34 160,34 Q171,34 172,36 L174,54 Q174,58 160,58 Q146,58 146,54 Z" fill={TOP} />
      <path d="M148,38 Q142,48 140,62" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M172,38 Q178,48 180,62" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M146,54 Q145,58 147,64 Q150,68 160,68 Q170,68 173,64 Q175,58 174,54" fill={TOP} opacity="0.7" />
      {/* Legs — squat motion */}
      <g style={{ ...anim("v4squat", "4.5s"), transformOrigin: "160px 68px" }}>
        <path d="M150,64 Q148,78 147,95" stroke={BOTTOM} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M170,64 Q172,78 173,95" stroke={BOTTOM} strokeWidth="5" fill="none" strokeLinecap="round" />
        <ellipse cx="147" cy="96" rx="4" ry="2" fill={SKIN} />
        <ellipse cx="173" cy="96" rx="4" ry="2" fill={SKIN} />
      </g>
    </g>
  );
}

/* ─── CALF RAISE ─── */
function CalfRaiseAnim() {
  return (
    <g style={{ ...anim("v4calfRaise", "4s"), transformOrigin: "160px 96px" }}>
      <StandingBase />
    </g>
  );
}

/* ─── SIDE LEG ─── */
function SideLegAnim() {
  return (
    <g>
      <ellipse cx="94" cy="64" rx="6.5" ry="7.5" fill={SKIN} />
      <ellipse cx="90" cy="58" rx="3" ry="2.5" fill={HAIR} />
      <path d="M100,60 Q130,56 180,62 L180,72 Q130,66 100,70 Z" fill={TOP} />
      <path d="M120,62 L118,52" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Bottom leg */}
      <path d="M180,72 L220,72" stroke={BOTTOM} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      {/* Top leg — smooth raise */}
      <g style={{ ...anim("v4sideLeg", "4.5s"), transformOrigin: "180px 66px" }}>
        <path d="M180,66 L220,66" stroke={BOTTOM} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      </g>
      <line x1="60" y1="82" x2="260" y2="82" stroke={OUTLINE} strokeWidth="0.5" opacity="0.2" />
    </g>
  );
}

/* ─── GENTLE FLOW (fallback) ─── */
function GentleFlowAnim() {
  return (
    <g style={{ ...anim("v4gentleSway", "5s"), transformOrigin: "160px 95px" }}>
      <StandingBase />
    </g>
  );
}
