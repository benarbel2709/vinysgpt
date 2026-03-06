/**
 * ExerciseAnimationV6 — Organic, feminine silhouette with per-body-part micro-movements.
 * No opacity swaps, no icon placeholders. Pure transform-based fluid motion.
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
  if (name.includes("סריקת גוף") || name.includes("סריקה") || name.includes("הרפיה") || name.includes("הרפייה")) return "relax_scan";
  if (name.includes("הליכה")) return "walk";
  if (name.includes("צוואר") || name.includes("הטיות ראש") || name.includes("סנטר")) return "neck_release";
  if (name.includes("כריעה") || name.includes("ישיבה לעמידה") || name.includes("sit-to-stand")) return "chair_squat";
  if (name.includes("הרמת עקב")) return "calf_raise";
  if (name.includes("רגל על צד") || name.includes("הרמת רגל")) return "side_leg";
  if (name.includes("חיפושית")) return "birddog";
  if (name.includes("צדפה")) return "side_leg";
  if (name.includes("ילד נתמך")) return "relax_scan";
  if (name.includes("רגליים על כיסא")) return "relax_scan";
  if (name.includes("פרפר")) return "relax_scan";
  if (name.includes("כתפיים") && name.includes("שחרור")) return "chestopen";
  if (name.includes("סיבוב")) return "catcow";
  if (name.includes("עיגולי")) return "gentle_flow";
  if (exercise.category === "release") return "relax_scan";
  return "gentle_flow";
}

/* ─── Category background tints ─── */
const CATEGORY_BG: Record<string, string> = {
  breath: "from-blue-50/50 to-blue-100/25",
  mobility: "from-emerald-50/50 to-emerald-100/25",
  stability: "from-amber-50/50 to-amber-100/25",
  release: "from-purple-50/50 to-purple-100/25",
};

/* Organic color palette */
const SKIN = "hsl(25 40% 82%)";
const HAIR = "hsl(20 30% 35%)";
const TOP_COLOR = "hsl(14 37% 52% / 0.55)";
const BOTTOM_COLOR = "hsl(14 37% 42% / 0.4)";
const OUTLINE_COLOR = "hsl(14 37% 52% / 0.2)";

/* ─── V6 CSS keyframes: organic micro-movements ─── */
const V6_STYLES = `
  /* Micro-breathe: ribcage expansion — always on */
  @keyframes v6ribcage { 
    0%,100% { transform: scaleX(1) scaleY(1); } 
    48% { transform: scaleX(1.02) scaleY(1.025); }
    52% { transform: scaleX(1.02) scaleY(1.025); }
  }
  
  /* Head micro-nod */
  @keyframes v6headNod {
    0%,100% { transform: translateY(0) rotate(0deg); }
    35% { transform: translateY(-0.4px) rotate(0.3deg); }
    70% { transform: translateY(0.2px) rotate(-0.2deg); }
  }
  
  /* Shoulder micro-drift */
  @keyframes v6shoulderDriftL {
    0%,100% { transform: translate(0,0) rotate(0deg); }
    40% { transform: translate(-0.5px, -0.8px) rotate(-0.4deg); }
    75% { transform: translate(0.3px, 0.3px) rotate(0.2deg); }
  }
  @keyframes v6shoulderDriftR {
    0%,100% { transform: translate(0,0) rotate(0deg); }
    45% { transform: translate(0.5px, -0.7px) rotate(0.4deg); }
    78% { transform: translate(-0.3px, 0.4px) rotate(-0.2deg); }
  }
  
  /* Pelvis micro-tilt */
  @keyframes v6pelvisMicro {
    0%,100% { transform: rotate(0deg); }
    38% { transform: rotate(0.4deg); }
    72% { transform: rotate(-0.3deg); }
  }
  
  /* Hand micro-flex */
  @keyframes v6handFlex {
    0%,100% { transform: rotate(0deg); }
    50% { transform: rotate(1.5deg); }
  }

  /* ── Exercise-specific ── */
  
  /* Breath: torso expand */
  @keyframes v6breathTorso { 
    0%,100% { transform: scaleY(1) scaleX(1); } 
    45%,55% { transform: scaleY(1.04) scaleX(1.02); } 
  }
  @keyframes v6breathShoulders { 
    0%,100% { transform: translateY(0); } 
    45%,55% { transform: translateY(-1.8px); } 
  }
  
  /* Cat-cow: spine curve */
  @keyframes v6catcowSpine { 
    0%,100% { transform: rotate(0deg); } 
    28% { transform: rotate(3.5deg); } 
    72% { transform: rotate(-3.5deg); } 
  }
  @keyframes v6catcowHead { 
    0%,100% { transform: rotate(0deg) translateY(0); } 
    28% { transform: rotate(4.5deg) translateY(1.2px); } 
    72% { transform: rotate(-3.5deg) translateY(-0.8px); } 
  }
  
  /* Bridge: pelvis lift */
  @keyframes v6bridgePelvis { 
    0%,100% { transform: translateY(0); } 
    38%,62% { transform: translateY(-8px); } 
  }
  @keyframes v6bridgeTorso { 
    0%,100% { transform: rotate(0deg); } 
    38%,62% { transform: rotate(-2.5deg); } 
  }

  /* Bird-dog */
  @keyframes v6birdArm { 
    0%,100% { transform: rotate(0deg); } 
    33%,67% { transform: rotate(-28deg); } 
  }
  @keyframes v6birdLeg { 
    0%,100% { transform: rotate(0deg); } 
    33%,67% { transform: rotate(22deg); } 
  }

  /* Wall slides */
  @keyframes v6wallArms { 
    0%,100% { transform: rotate(0deg); } 
    38%,62% { transform: rotate(-42deg); } 
  }

  /* Pelvic tilt */
  @keyframes v6pelvicRock { 
    0%,100% { transform: rotate(0deg); } 
    38%,62% { transform: rotate(3deg); } 
  }

  /* Chest open */
  @keyframes v6chestArms { 
    0%,100% { transform: rotate(0deg); } 
    38%,62% { transform: rotate(-22deg); } 
  }

  /* Relax scan glow */
  @keyframes v6scanGlow { 
    0% { cy: 28; opacity: 0.08; } 
    50% { opacity: 0.22; } 
    100% { cy: 82; opacity: 0.08; } 
  }

  /* Neck tilt */
  @keyframes v6neckTilt { 
    0%,100% { transform: rotate(0deg); } 
    28% { transform: rotate(9deg); } 
    72% { transform: rotate(-9deg); } 
  }

  /* Walk sway */
  @keyframes v6walkSway { 
    0%,100% { transform: translateX(0) rotate(0deg); } 
    25% { transform: translateX(1.8px) rotate(0.6deg); } 
    75% { transform: translateX(-1.8px) rotate(-0.6deg); } 
  }

  /* Chair squat */
  @keyframes v6squat { 
    0%,100% { transform: translateY(0) scaleY(1); } 
    38%,62% { transform: translateY(5px) scaleY(0.94); } 
  }

  /* Calf raise */
  @keyframes v6calfRaise { 
    0%,100% { transform: translateY(0); } 
    38%,62% { transform: translateY(-5px); } 
  }

  /* Side leg */
  @keyframes v6sideLeg { 
    0%,100% { transform: rotate(0deg); } 
    38%,62% { transform: rotate(-17deg); } 
  }

  /* Gentle flow */
  @keyframes v6gentleSway { 
    0%,100% { transform: translateX(0); } 
    50% { transform: translateX(1.8px); } 
  }

  .v6-frozen * { animation-play-state: paused !important; }
  @media (prefers-reduced-motion: reduce) { .v6-root * { animation: none !important; } }
`;

const EASE = "cubic-bezier(0.45,0.05,0.55,0.95)";

function anim(name: string, dur: string, delay: string = "0s"): React.CSSProperties {
  return { 
    animation: `${name} ${dur} ${EASE} ${delay} infinite`, 
    transformOrigin: "center center",
    willChange: "transform",
  };
}

interface Props {
  exercise: Exercise;
  compact?: boolean;
  large?: boolean;
}

export default function ExerciseAnimationV6({ exercise, compact = false, large = false }: Props) {
  const animationsDisabled = readState<boolean>("yaelYogaDisableAnimations", false);
  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const frozen = animationsDisabled || reducedMotion;
  const animName = getAnimationName(exercise);
  const bgTint = CATEGORY_BG[exercise.category] || CATEGORY_BG.mobility;
  const height = large ? 260 : compact ? 32 : 180;

  if (compact) {
    return (
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 320 100" className="w-6 h-6">
          <FemaleStanding frozen />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative w-full rounded-[20px] bg-gradient-to-br ${bgTint} overflow-hidden`} style={{ height }}>
      {large && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card/60 pointer-events-none" />
      )}
      <svg
        viewBox="0 0 320 105"
        className="w-full h-full v6-root"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={exercise.name_he}
      >
        <defs><style>{V6_STYLES}</style></defs>
        <g className={frozen ? "v6-frozen" : ""}>
          {renderAnimation(animName, frozen)}
        </g>
      </svg>
    </div>
  );
}

function renderAnimation(name: string, frozen: boolean) {
  if (frozen) return <FemaleStanding frozen />;
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

/* ═══════ FEMININE STANDING BASE ═══════ */
function FemaleStanding({ frozen = false }: { frozen?: boolean }) {
  const micro = frozen ? {} : {
    ribcage: anim("v6ribcage", "5.2s", "0.1s"),
    head: { ...anim("v6headNod", "6.1s", "0.3s"), transformOrigin: "160px 18px" },
    shoulderL: { ...anim("v6shoulderDriftL", "5.8s", "0.2s"), transformOrigin: "147px 37px" },
    shoulderR: { ...anim("v6shoulderDriftR", "5.6s", "0.5s"), transformOrigin: "173px 37px" },
    pelvis: { ...anim("v6pelvisMicro", "6.4s", "0.4s"), transformOrigin: "160px 62px" },
    handL: { ...anim("v6handFlex", "5.4s", "0.6s"), transformOrigin: "139px 62px" },
    handR: { ...anim("v6handFlex", "5.7s", "0.8s"), transformOrigin: "181px 62px" },
  };

  return (
    <g>
      {/* Head + hair bun */}
      <g style={micro.head || {}}>
        <ellipse cx="160" cy="22" rx="7.8" ry="9.2" fill={SKIN} />
        {/* Hair */}
        <path d="M152,18 Q152,10 160,9 Q168,10 168,18" fill={HAIR} />
        {/* Bun */}
        <ellipse cx="160" cy="10" rx="4.5" ry="3.8" fill={HAIR} />
        {/* Ear hints */}
        <ellipse cx="152" cy="22" rx="1.2" ry="2" fill={SKIN} opacity="0.7" />
        <ellipse cx="168" cy="22" rx="1.2" ry="2" fill={SKIN} opacity="0.7" />
      </g>
      {/* Neck */}
      <rect x="157" y="30" width="6" height="6" rx="2.5" fill={SKIN} />
      {/* Shoulders */}
      <g style={micro.shoulderL || {}}>
        <ellipse cx="147" cy="37" rx="3.5" ry="2.2" fill={SKIN} />
      </g>
      <g style={micro.shoulderR || {}}>
        <ellipse cx="173" cy="37" rx="3.5" ry="2.2" fill={SKIN} />
      </g>
      {/* Torso */}
      <g style={{ ...(micro.ribcage || {}), transformOrigin: "160px 48px" }}>
        <path d="M147,36 Q149,34 160,34 Q171,34 173,36 L175,54 Q175,59 160,59 Q145,59 145,54 Z" fill={TOP_COLOR} />
      </g>
      {/* Arms — slight asymmetry */}
      <g style={micro.handL || {}}>
        <path d="M147,38 Q141,48 139,62" stroke={SKIN} strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <ellipse cx="139" cy="63" rx="2" ry="1.5" fill={SKIN} opacity="0.8" />
      </g>
      <g style={micro.handR || {}}>
        <path d="M173,38 Q179,49 181,62" stroke={SKIN} strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <ellipse cx="181" cy="63" rx="2" ry="1.5" fill={SKIN} opacity="0.8" />
      </g>
      {/* Hips/pelvis */}
      <g style={micro.pelvis || {}}>
        <path d="M145,54 Q144,59 146,65 Q150,69 160,69 Q170,69 174,65 Q176,59 175,54" fill={TOP_COLOR} opacity="0.65" />
        {/* Legs — slightly asymmetric */}
        <path d="M150,65 Q148,78 147,95" stroke={BOTTOM_COLOR} strokeWidth="5.2" fill="none" strokeLinecap="round" />
        <path d="M170,65 Q172,79 173,95" stroke={BOTTOM_COLOR} strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Feet */}
        <ellipse cx="147" cy="96" rx="4.2" ry="2" fill={SKIN} opacity="0.7" />
        <ellipse cx="173" cy="96" rx="4" ry="2" fill={SKIN} opacity="0.7" />
      </g>
    </g>
  );
}

/* ─── BREATH ─── */
function BreathAnim() {
  return (
    <g>
      {/* Chair hint */}
      <rect x="140" y="64" width="40" height="3" rx="1.5" fill={OUTLINE_COLOR} opacity="0.12" />
      {/* Head */}
      <g style={{ ...anim("v6headNod", "4.2s", "0.1s"), transformOrigin: "160px 22px" }}>
        <ellipse cx="160" cy="22" rx="7.8" ry="9.2" fill={SKIN} />
        <path d="M152,18 Q152,10 160,9 Q168,10 168,18" fill={HAIR} />
        <ellipse cx="160" cy="10" rx="4.5" ry="3.8" fill={HAIR} />
      </g>
      <rect x="157" y="30" width="6" height="6" rx="2.5" fill={SKIN} />
      {/* Shoulders */}
      <g style={anim("v6breathShoulders", "4.4s")}>
        <ellipse cx="149" cy="40" rx="3.5" ry="2" fill={SKIN} />
        <ellipse cx="171" cy="40" rx="3.5" ry="2" fill={SKIN} />
      </g>
      {/* Torso expanding */}
      <g style={{ ...anim("v6breathTorso", "4.4s"), transformOrigin: "160px 50px" }}>
        <path d="M149,38 Q150,36 160,36 Q170,36 171,38 L173,55 Q173,59 160,59 Q147,59 147,55 Z" fill={TOP_COLOR} />
      </g>
      {/* Arms */}
      <g style={{ ...anim("v6handFlex", "5.1s", "0.3s"), transformOrigin: "145px 58px" }}>
        <path d="M149,41 Q143,51 145,58" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      <g style={{ ...anim("v6handFlex", "5.4s", "0.6s"), transformOrigin: "175px 58px" }}>
        <path d="M171,41 Q177,51 175,58" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      {/* Legs */}
      <path d="M150,59 L146,64 L142,82 L140,95" stroke={BOTTOM_COLOR} strokeWidth="4.8" fill="none" strokeLinecap="round" />
      <path d="M170,59 L174,64 L178,82 L180,95" stroke={BOTTOM_COLOR} strokeWidth="4.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ─── CAT-COW ─── */
function CatCowAnim() {
  return (
    <g>
      <g style={{ ...anim("v6catcowHead", "5.4s"), transformOrigin: "110px 52px" }}>
        <ellipse cx="108" cy="52" rx="7" ry="8" fill={SKIN} />
        <path d="M101,47 Q101,40 108,39 Q115,40 115,47" fill={HAIR} />
        <ellipse cx="108" cy="40" rx="3.5" ry="3" fill={HAIR} />
        <path d="M115,54 L122,56" stroke={SKIN} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </g>
      <g style={{ ...anim("v6catcowSpine", "5.4s"), transformOrigin: "160px 57px" }}>
        <path d="M122,52 Q148,48 160,52 Q180,48 198,52 L198,62 Q180,58 160,62 Q148,58 122,62 Z" fill={TOP_COLOR} />
      </g>
      <path d="M126,58 L126,82 L124,95" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M142,58 L142,82 L140,95" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="195" cy="57" rx="8" ry="7" fill={TOP_COLOR} opacity="0.5" />
      <path d="M192,62 L192,82 L190,95" stroke={BOTTOM_COLOR} strokeWidth="4.2" fill="none" strokeLinecap="round" />
      <path d="M204,62 L204,82 L206,95" stroke={BOTTOM_COLOR} strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ─── BRIDGE ─── */
function BridgeAnim() {
  return (
    <g>
      <g style={{ ...anim("v6headNod", "5.8s", "0.2s"), transformOrigin: "82px 72px" }}>
        <ellipse cx="82" cy="72" rx="7.8" ry="7" fill={SKIN} />
        <path d="M75,68 Q75,62 82,61 Q89,62 89,68" fill={HAIR} />
        <ellipse cx="82" cy="62" rx="3.5" ry="3" fill={HAIR} />
      </g>
      <g style={{ ...anim("v6bridgeTorso", "4.8s"), transformOrigin: "90px 73px" }}>
        <path d="M90,68 L90,78 L192,78 L192,68 Q160,64 130,64 Q110,64 90,68 Z" fill={TOP_COLOR} />
      </g>
      <path d="M100,68 L98,58" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M180,68 L182,58" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      <g style={{ ...anim("v6bridgePelvis", "4.8s"), transformOrigin: "200px 92px" }}>
        <path d="M192,74 L210,58 L215,74 L218,90" stroke={BOTTOM_COLOR} strokeWidth="4.2" fill="none" strokeLinecap="round" />
        <path d="M192,78 L206,64 L210,78 L212,90" stroke={BOTTOM_COLOR} strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
      <line x1="60" y1="92" x2="260" y2="92" stroke={OUTLINE_COLOR} strokeWidth="0.5" opacity="0.2" />
    </g>
  );
}

/* ─── BIRD-DOG ─── */
function BirdDogAnim() {
  return (
    <g>
      <g style={{ ...anim("v6headNod", "5.6s", "0.2s"), transformOrigin: "108px 50px" }}>
        <ellipse cx="108" cy="50" rx="7" ry="8" fill={SKIN} />
        <path d="M101,45 Q101,38 108,37 Q115,38 115,45" fill={HAIR} />
        <ellipse cx="108" cy="38" rx="3.5" ry="3" fill={HAIR} />
      </g>
      <path d="M114,52 L122,54" stroke={SKIN} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M122,52 Q160,50 198,52 L198,62 Q160,60 122,62 Z" fill={TOP_COLOR} />
      <g style={{ ...anim("v6birdArm", "5.2s"), transformOrigin: "126px 56px" }}>
        <path d="M126,56 L96,56" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="95" cy="56" rx="2" ry="1.5" fill={SKIN} opacity="0.7" />
      </g>
      <path d="M142,58 L142,82 L140,95" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="195" cy="57" rx="8" ry="7" fill={TOP_COLOR} opacity="0.5" />
      <path d="M192,62 L192,82 L190,95" stroke={BOTTOM_COLOR} strokeWidth="4.2" fill="none" strokeLinecap="round" />
      <g style={{ ...anim("v6birdLeg", "5.2s"), transformOrigin: "204px 58px" }}>
        <path d="M204,58 L234,58" stroke={BOTTOM_COLOR} strokeWidth="4.2" fill="none" strokeLinecap="round" />
        <ellipse cx="235" cy="58" rx="2.5" ry="1.5" fill={SKIN} opacity="0.6" />
      </g>
    </g>
  );
}

/* ─── WALL SLIDES ─── */
function WallSlidesAnim() {
  return (
    <g>
      <rect x="190" y="6" width="3" height="90" rx="1.5" fill={OUTLINE_COLOR} opacity="0.18" />
      <g style={{ ...anim("v6headNod", "6s", "0.3s"), transformOrigin: "165px 20px" }}>
        <ellipse cx="165" cy="22" rx="7.5" ry="9" fill={SKIN} />
        <path d="M158,17 Q158,9 165,8 Q172,9 172,17" fill={HAIR} />
        <ellipse cx="165" cy="9" rx="4" ry="3.5" fill={HAIR} />
      </g>
      <rect x="162" y="30" width="6" height="6" rx="2.5" fill={SKIN} />
      <path d="M154,36 Q155,34 165,34 Q175,34 176,36 L178,54 Q178,58 165,58 Q152,58 152,54 Z" fill={TOP_COLOR} />
      <g style={{ ...anim("v6wallArms", "5.4s"), transformOrigin: "154px 40px" }}>
        <path d="M154,40 Q150,50 152,58 L154,62" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      <g style={{ ...anim("v6wallArms", "5.4s", "0.15s"), transformOrigin: "176px 40px" }}>
        <path d="M176,40 Q182,50 184,58 L186,62" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      <path d="M152,54 Q151,58 153,64 Q156,68 165,68 Q174,68 177,64 Q179,58 178,54" fill={TOP_COLOR} opacity="0.6" />
      <path d="M156,64 Q154,78 153,95" stroke={BOTTOM_COLOR} strokeWidth="5.2" fill="none" strokeLinecap="round" />
      <path d="M174,64 Q176,78 177,95" stroke={BOTTOM_COLOR} strokeWidth="5" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ─── PELVIC TILT ─── */
function PelvicTiltAnim() {
  return (
    <g>
      <g style={{ ...anim("v6headNod", "5.6s", "0.1s"), transformOrigin: "82px 72px" }}>
        <ellipse cx="82" cy="72" rx="7.8" ry="7" fill={SKIN} />
        <path d="M75,68 Q75,62 82,61 Q89,62 89,68" fill={HAIR} />
        <ellipse cx="82" cy="62" rx="3.5" ry="3" fill={HAIR} />
      </g>
      <g style={{ ...anim("v6pelvicRock", "4.6s"), transformOrigin: "190px 78px" }}>
        <path d="M90,68 L90,78 L192,78 L192,68 Q160,64 130,64 Q110,64 90,68 Z" fill={TOP_COLOR} />
      </g>
      <path d="M100,68 L98,58" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M180,68 L182,58" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M192,74 L210,58 L215,74 L218,90" stroke={BOTTOM_COLOR} strokeWidth="4.2" fill="none" strokeLinecap="round" />
      <path d="M192,78 L206,64 L210,78 L212,90" stroke={BOTTOM_COLOR} strokeWidth="4" fill="none" strokeLinecap="round" />
      <line x1="60" y1="92" x2="260" y2="92" stroke={OUTLINE_COLOR} strokeWidth="0.5" opacity="0.2" />
    </g>
  );
}

/* ─── CHEST OPEN ─── */
function ChestOpenAnim() {
  return (
    <g>
      <g style={anim("v6ribcage", "5.2s")}>
        <g style={{ ...anim("v6headNod", "6.2s", "0.2s"), transformOrigin: "160px 18px" }}>
          <ellipse cx="160" cy="22" rx="7.8" ry="9.2" fill={SKIN} />
          <path d="M152,18 Q152,10 160,9 Q168,10 168,18" fill={HAIR} />
          <ellipse cx="160" cy="10" rx="4.5" ry="3.8" fill={HAIR} />
        </g>
        <rect x="157" y="30" width="6" height="6" rx="2.5" fill={SKIN} />
        <path d="M147,36 Q149,34 160,34 Q171,34 173,36 L175,54 Q175,59 160,59 Q145,59 145,54 Z" fill={TOP_COLOR} />
      </g>
      <g style={{ ...anim("v6chestArms", "5.6s"), transformOrigin: "147px 38px" }}>
        <path d="M147,38 Q131,36 117,40" stroke={SKIN} strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <ellipse cx="116" cy="41" rx="2" ry="1.5" fill={SKIN} opacity="0.7" />
      </g>
      <g style={{ ...anim("v6chestArms", "5.6s", "0.12s"), transformOrigin: "173px 38px" }}>
        <path d="M173,38 Q189,36 203,40" stroke={SKIN} strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <ellipse cx="204" cy="41" rx="2" ry="1.5" fill={SKIN} opacity="0.7" />
      </g>
      <path d="M145,54 Q144,59 146,65 Q150,69 160,69 Q170,69 174,65 Q176,59 175,54" fill={TOP_COLOR} opacity="0.6" />
      <path d="M150,65 Q148,78 147,95" stroke={BOTTOM_COLOR} strokeWidth="5.2" fill="none" strokeLinecap="round" />
      <path d="M170,65 Q172,79 173,95" stroke={BOTTOM_COLOR} strokeWidth="5" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ─── RELAX SCAN ─── */
function RelaxScanAnim() {
  return (
    <g>
      <g style={anim("v6ribcage", "5.8s")}>
        <g style={{ ...anim("v6headNod", "6.2s", "0.3s"), transformOrigin: "82px 68px" }}>
          <ellipse cx="82" cy="72" rx="7.8" ry="7" fill={SKIN} />
          <path d="M75,68 Q75,62 82,61 Q89,62 89,68" fill={HAIR} />
          <ellipse cx="82" cy="62" rx="3.5" ry="3" fill={HAIR} />
        </g>
        <path d="M90,68 L90,78 L220,78 L220,68 Q170,64 130,64 Q110,64 90,68 Z" fill={TOP_COLOR} />
        <path d="M100,68 L96,56" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M210,68 L214,56" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M220,74 L246,74" stroke={BOTTOM_COLOR} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M220,78 L246,78" stroke={BOTTOM_COLOR} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      </g>
      <circle cx="160" cy="30" r="14" fill="hsl(14 37% 52% / 0.08)" style={{ animation: `v6scanGlow 6.2s ease-in-out infinite` }} />
      <line x1="60" y1="86" x2="260" y2="86" stroke={OUTLINE_COLOR} strokeWidth="0.5" opacity="0.15" />
    </g>
  );
}

/* ─── WALK ─── */
function WalkAnim() {
  return (
    <g style={{ ...anim("v6walkSway", "4.6s"), transformOrigin: "160px 95px" }}>
      <FemaleStanding />
    </g>
  );
}

/* ─── NECK RELEASE ─── */
function NeckAnim() {
  return (
    <g>
      <path d="M149,50 Q150,48 160,48 Q170,48 171,50 L173,72 Q173,76 160,76 Q147,76 147,72 Z" fill={TOP_COLOR} />
      <g style={{ ...anim("v6shoulderDriftL", "5.6s", "0.1s"), transformOrigin: "147px 51px" }}>
        <ellipse cx="147" cy="51" rx="3.5" ry="2.2" fill={SKIN} />
      </g>
      <g style={{ ...anim("v6shoulderDriftR", "5.8s", "0.3s"), transformOrigin: "173px 51px" }}>
        <ellipse cx="173" cy="51" rx="3.5" ry="2.2" fill={SKIN} />
      </g>
      <rect x="157" y="40" width="6" height="8" rx="2.5" fill={SKIN} />
      <g style={{ ...anim("v6neckTilt", "5.6s"), transformOrigin: "160px 40px" }}>
        <ellipse cx="160" cy="32" rx="8" ry="10" fill={SKIN} />
        <path d="M153,28 Q153,20 160,19 Q167,20 167,28" fill={HAIR} />
        <ellipse cx="160" cy="20" rx="4" ry="3.5" fill={HAIR} />
      </g>
    </g>
  );
}

/* ─── CHAIR SQUAT ─── */
function ChairSquatAnim() {
  return (
    <g>
      <g style={{ ...anim("v6headNod", "5.2s", "0.2s"), transformOrigin: "160px 18px" }}>
        <ellipse cx="160" cy="22" rx="7.8" ry="9.2" fill={SKIN} />
        <path d="M152,18 Q152,10 160,9 Q168,10 168,18" fill={HAIR} />
        <ellipse cx="160" cy="10" rx="4.5" ry="3.8" fill={HAIR} />
      </g>
      <rect x="157" y="30" width="6" height="6" rx="2.5" fill={SKIN} />
      <path d="M147,36 Q149,34 160,34 Q171,34 173,36 L175,54 Q175,59 160,59 Q145,59 145,54 Z" fill={TOP_COLOR} />
      <path d="M147,38 Q141,48 139,62" stroke={SKIN} strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M173,38 Q179,49 181,62" stroke={SKIN} strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M145,54 Q144,59 146,65 Q150,69 160,69 Q170,69 174,65 Q176,59 175,54" fill={TOP_COLOR} opacity="0.6" />
      <g style={{ ...anim("v6squat", "4.8s"), transformOrigin: "160px 69px" }}>
        <path d="M150,65 Q148,78 147,95" stroke={BOTTOM_COLOR} strokeWidth="5.2" fill="none" strokeLinecap="round" />
        <path d="M170,65 Q172,79 173,95" stroke={BOTTOM_COLOR} strokeWidth="5" fill="none" strokeLinecap="round" />
        <ellipse cx="147" cy="96" rx="4.2" ry="2" fill={SKIN} opacity="0.7" />
        <ellipse cx="173" cy="96" rx="4" ry="2" fill={SKIN} opacity="0.7" />
      </g>
    </g>
  );
}

/* ─── CALF RAISE ─── */
function CalfRaiseAnim() {
  return (
    <g style={{ ...anim("v6calfRaise", "4.4s"), transformOrigin: "160px 96px" }}>
      <FemaleStanding />
    </g>
  );
}

/* ─── SIDE LEG ─── */
function SideLegAnim() {
  return (
    <g>
      <g style={{ ...anim("v6headNod", "6s", "0.2s"), transformOrigin: "94px 58px" }}>
        <ellipse cx="94" cy="64" rx="7" ry="8" fill={SKIN} />
        <path d="M87,59 Q87,52 94,51 Q101,52 101,59" fill={HAIR} />
        <ellipse cx="94" cy="52" rx="3.5" ry="3" fill={HAIR} />
      </g>
      <path d="M100,60 Q130,56 180,62 L180,72 Q130,66 100,70 Z" fill={TOP_COLOR} />
      <path d="M120,62 L118,52" stroke={SKIN} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M180,72 L220,72" stroke={BOTTOM_COLOR} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <g style={{ ...anim("v6sideLeg", "4.8s"), transformOrigin: "180px 66px" }}>
        <path d="M180,66 L220,66" stroke={BOTTOM_COLOR} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <ellipse cx="221" cy="66" rx="2.5" ry="1.5" fill={SKIN} opacity="0.6" />
      </g>
      <line x1="60" y1="82" x2="260" y2="82" stroke={OUTLINE_COLOR} strokeWidth="0.5" opacity="0.15" />
    </g>
  );
}

/* ─── GENTLE FLOW (fallback) ─── */
function GentleFlowAnim() {
  return (
    <g style={{ ...anim("v6gentleSway", "5.4s"), transformOrigin: "160px 95px" }}>
      <FemaleStanding />
    </g>
  );
}
