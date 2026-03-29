import { useState, useEffect, useCallback, useRef } from "react";
import { useTTS } from "@/hooks/useTTS";
import BrandLogo from "@/components/BrandLogo";
import { Volume2, VolumeX, Play, ChevronRight, Check, RotateCcw, ArrowLeft } from "lucide-react";
import universalVideo from "@/assets/exercises/universal-fallback.mp4";

const fadeInStyle = { animation: "fadeIn 0.3s ease" };

// --- AREAS --------------------------------------------------------------------
const AREA_CONFIG = {
  LB: { label: "Lower Back", icon: "◎", crossoverTo: null },
  HIP: { label: "Hip", icon: "⟳", crossoverTo: "LB" },
  KNEE: { label: "Knee", icon: "↓", crossoverTo: "HIP" },
  ANKLE: { label: "Ankle", icon: "⌇", crossoverTo: "KNEE" },
};

const AREA_DESC = {
  LB: "Pain, stiffness, sciatica or disc symptoms",
  HIP: "Hip joint, groin, outer hip or mobility",
  KNEE: "Kneecap, instability, inner or outer knee",
  ANKLE: "Achilles, plantar fascia or ankle instability",
};

// --- PROFILE DEFINITIONS (plain English names + descriptions) -----------------
const PROFILE_DISPLAY = {
  FL: { name: "Flexion-Sensitive", description: "Your back responds best to extension movements and tends to feel worse with prolonged sitting or forward bending. Your sessions will prioritise gentle backbends, prone positions, and hip extension — the movements that give your spine the most relief." },
  EX: { name: "Extension-Sensitive", description: "Your back prefers neutral or gently rounded positions and tends to feel worse with arching or standing for long periods. Your sessions will focus on decompression, supported flexion, and spinal lengthening — the positions that settle your symptoms fastest." },
  NE: { name: "Neural", description: "There's some nerve involvement in your pattern — you may notice sensations that travel toward your buttock or leg. Your sessions are designed to reduce nerve irritation with gentle neural glides and positions that give the nerve space to settle." },
  LI: { name: "Load-Sensitive", description: "Your body responds quickly to load and benefits from a gentle, progressive approach. Your sessions start easy and build gradually — short, regular practice beats occasional intense sessions. Consistency is your best tool." },
  ST: { name: "Stiffness-Dominant", description: "Stiffness rather than acute pain is your primary finding — movement is genuinely the medicine here. Your sessions focus on restoring range of motion through regular, gentle mobility work. You'll likely feel better after moving." },
  AN: { name: "Anterior Overload", description: "Pain at the front of the joint suggests the structures there are being overloaded. Your sessions avoid deep flexion under load and focus on decompression and strengthening the supporting muscles." },
  LA: { name: "Lateral Overload", description: "Pain on the outer side of the joint is typically a tendon or band involvement. Your sessions focus on strengthening and graded lateral loading — the treatment is progressive strength, not rest." },
  PO: { name: "Posterior", description: "Pain in the buttock or back of the thigh suggests hamstring or deep rotator involvement. Your sessions address hip rotation and posterior chain flexibility with targeted release work." },
  PA: { name: "Patellofemoral", description: "Pain around the kneecap is very common and very addressable. Your sessions focus on quad control and step-down exercises — the therapeutic foundation for kneecap recovery." },
  ME: { name: "Medial Stress", description: "Inner joint pain suggests medial ligament or meniscus involvement. Your sessions focus on alignment, hip strength, and reducing the medial load through better movement patterns." },
  AC: { name: "Achilles / Posterior", description: "Back-of-ankle pain is an Achilles tendinopathy pattern. Your sessions use graded loading and eccentric work — the gold standard approach for Achilles recovery." },
  PF: { name: "Plantar Fascia", description: "Heel or sole-of-foot pain is a plantar fasciitis pattern — very common and very manageable. Your sessions include calf release, intrinsic foot strength, and graded loading." },
  MO: { name: "Mobility-First", description: "Restricted range without sharp pain means mobility work is safe and beneficial. Your sessions focus on restoring movement through progressive, never forced, range of motion work." },
};

// --- PROFILE DATA (for scoring/insights) --------------------------------------
const PROFILE_DATA = {
  LB: {
    FL: {
      name: "Flexion Sensitive",
      sub: "Your back prefers neutral or slightly extended positions",
      tag: "Most common pattern",
      insights: [
        "Forward bending tends to aggravate your back — the most common lower back pattern.",
        "Your practice prioritises neutral spine postures and gradual, supported extension.",
        "Deep forward folds are introduced later, once your back has settled and strengthened.",
      ],
    },
    EX: {
      name: "Extension Sensitive",
      sub: "Your back prefers neutral or gently rounded positions",
      tag: "Facet / stenosis pattern",
      insights: [
        "Arching your back tends to aggravate your symptoms — a facet joint or stenosis pattern.",
        "Your practice avoids strong backbends and builds on decompression and neutral spine.",
        "Supported forward bending and spinal lengthening form your foundation.",
      ],
    },
    NE: {
      name: "Neural Component",
      sub: "There may be some nerve involvement in your pattern",
      tag: "Nerve involvement",
      insights: [
        "We noticed sensations suggesting your sciatic nerve or nerve roots may be involved.",
        "Your practice is designed to reduce nerve irritation — no strong flexion or compression early on.",
        "If leg sensations persist outside practice, mention this to a healthcare provider.",
      ],
    },
    LI: {
      name: "Load Intolerant",
      sub: "Your back responds best to gentle, progressive loading",
      tag: "Very addressable pattern",
      insights: [
        "Your back muscles fatigue or respond quickly to load — a very common and addressable pattern.",
        "Your practice starts gently and builds load progressively as your tolerance grows.",
        "Short, regular sessions beat occasional intense ones — consistency is your best tool here.",
      ],
    },
    ST: {
      name: "Stiff & Hypomobile",
      sub: "Your back needs movement and circulation more than rest",
      tag: "Movement is the medicine",
      insights: [
        "Your back is stiff rather than acutely painful — movement is genuinely the medicine here.",
        "Your practice focuses on restoring range of motion through regular, gentle mobility work.",
        "You'll likely feel better after moving — the key is keeping that cycle going daily.",
      ],
    },
  },
  HIP: {
    AN: { name: "Anterior Hip Overload", sub: "Front-of-hip or groin pain under load", tag: "Hip joint / flexor pattern", insights: ["Pain at the front of your hip suggests the joint, hip flexor, or labrum are being overloaded.", "Your practice avoids deep hip flexion under load and focuses on decompression and glute strength.", "Strengthening the glutes reduces the demand placed on the anterior hip structures."] },
    LA: { name: "Lateral Hip / Gluteal Overload", sub: "Outer-hip pain — gluteal or IT band", tag: "Gluteal pattern", insights: ["Pain on the outside of the hip is typically gluteal tendinopathy or IT band involvement.", "Avoid hip adduction (crossing legs) — this compresses the gluteal tendons.", "Gluteal strengthening is the priority. Graded lateral loading is the treatment, not rest."] },
    PO: { name: "Posterior Hip", sub: "Buttock or back-of-thigh pain", tag: "Hamstring / piriformis", insights: ["Pain in the buttock or back of the thigh suggests proximal hamstring or piriformis involvement.", "Avoid sustained sitting on hard surfaces and heavy stretching of the hamstring insertion.", "Hip external rotation work and piriformis release form the foundation of your practice."] },
    NE: { name: "Neural Component", sub: "Symptoms spreading toward the leg", tag: "Neural involvement", insights: ["Sensations spreading toward the leg suggest neural tension from the hip or lower back.", "Your practice avoids slump positions and sustained hip flexion with knee extension.", "Neural glides in hip-friendly positions are a core part of your program."] },
    ST: { name: "Hip Needs Strength", sub: "Instability and weakness under load", tag: "Stability first", insights: ["Instability and weakness are the primary finding — the hip needs progressive loading.", "Single-leg stability work is essential. You'll progress from bilateral to unilateral.", "Balance training supports all hip work and prevents re-injury."] },
    MO: { name: "Hip Needs Mobility", sub: "Restricted range without sharp pain", tag: "Mobility first", insights: ["Restricted range without sharp pain means mobility work is safe and beneficial.", "Internal and external rotation need equal attention — stiffness is often asymmetrical.", "Hip mobility directly supports lower back health and overall movement quality."] },
  },
  KNEE: {
    PA: { name: "Patellofemoral Overload", sub: "Anterior knee pain — kneecap area", tag: "Kneecap pattern", insights: ["Pain around the kneecap is a patellofemoral pattern — very common and very addressable.", "Avoid deep knee flexion under load while the kneecap settles. VMO activation is key.", "Step-down exercises and quad control are the therapeutic foundation of your program."] },
    ME: { name: "Medial Knee Stress", sub: "Inner knee pain", tag: "MCL / meniscus pattern", insights: ["Inner knee pain suggests MCL, medial meniscus, or pes anserinus involvement.", "Avoid valgus knee positions — hip abductor and glute strength reduces medial load.", "Foot position and alignment strongly influence medial knee stress."] },
    LA: { name: "Lateral Knee Stress", sub: "Outer knee pain", tag: "IT band / LCL pattern", insights: ["Outer knee pain suggests IT band syndrome, LCL, or lateral meniscus involvement.", "Hip abductor flexibility and lateral glute strength are the key levers.", "IT band mobility work before loading is the approach — not foam rolling alone."] },
    PO: { name: "Posterior Knee / Hamstring", sub: "Back-of-knee pain", tag: "Hamstring / Baker's cyst", insights: ["Back-of-knee pain suggests Baker's cyst, hamstring insertion, or posterior capsule.", "Avoid hyperextension. Hamstring loading at longer lengths is therapeutic.", "Terminal knee extension exercises are a key part of your recovery."] },
    ST: { name: "Knee Needs Strength", sub: "Instability and weakness under load", tag: "Stability first", insights: ["Instability and weakness under load are the primary finding. Strengthening is the treatment.", "Single-leg work is the focus — progress slowly through range of motion.", "Proprioception training is essential and often the missing piece in knee recovery."] },
    MO: { name: "Knee Needs Mobility", sub: "Stiffness without sharp pain", tag: "Mobility first", insights: ["Restricted range and stiffness without sharp pain — mobility work is safe and beneficial.", "Posterior chain flexibility is a major contributor to knee mobility.", "Gradual, progressive flexion is the approach — never forced."] },
  },
  ANKLE: {
    AN: { name: "Anterior Ankle Impingement", sub: "Front-of-ankle pinching in dorsiflexion", tag: "Impingement pattern", insights: ["Front-of-ankle pinching in dorsiflexion suggests a bone spur or capsule restriction.", "Avoid deep dorsiflexion under load while the joint settles.", "Ankle joint mobilisation and posterior chain flexibility reduce the anterior demand."] },
    AC: { name: "Achilles / Posterior Overload", sub: "Back-of-ankle or Achilles pain", tag: "Achilles pattern", insights: ["Back-of-ankle pain is an Achilles tendinopathy pattern — graded loading is the treatment.", "Avoid prolonged passive stretching of the Achilles, especially when irritated.", "Eccentric heel lowering is the gold standard exercise for Achilles recovery."] },
    PF: { name: "Plantar Fascia Involvement", sub: "Heel or sole-of-foot pain", tag: "Plantar fascia pattern", insights: ["Heel or sole-of-foot pain is a plantar fasciitis pattern — very common and very manageable.", "Morning first steps are often the worst — this is characteristic of plantar fascia loading.", "Calf release, intrinsic foot strength, and graded loading are the therapeutic tools."] },
    LA: { name: "Lateral Ankle Instability", sub: "Outer ankle giving way or unstable", tag: "Instability pattern", insights: ["Outer ankle instability suggests chronic lateral ankle sprains or peroneal weakness.", "Single-leg balance training is the priority — proprioception is the key deficit.", "Peroneal strengthening and progressive loading prevent re-injury."] },
    ST: { name: "Ankle Needs Strength", sub: "Weakness and poor single-leg stability", tag: "Strength first", insights: ["Weakness and instability on single-leg tasks are the primary findings.", "Heel raise progressions from bilateral to single-leg are the foundation.", "Ankle strength affects knee and hip mechanics — improving it benefits the whole chain."] },
    MO: { name: "Ankle Needs Mobility", sub: "Restricted range — stiffness without sharp pain", tag: "Mobility first", insights: ["Restricted dorsiflexion or plantarflexion stiffness — mobility work is safe and beneficial.", "Calf stretching and ankle circles address the most common restrictions.", "Ankle mobility directly affects knee and hip movement quality."] },
  },
};

// --- LB POSTURES --------------------------------------------------------------
const LB_POSTURES = [
  {
    id: "knee-hug", name: "Supine Knee Hug", subtitle: "Apanasana",
    grad: ["#A8CCCA", "#6AA8A4"], time: "~45 sec", conditional: false, double_score: false, videoId: null,
    how: "Lie on your back, knees bent. Gently draw both knees toward your chest, hands resting on your shins. Hold for 5 slow breaths.",
    qs: [
      { id: "lb_p1q1", text: "With your knees drawn toward your chest, how does your lower back feel?", opts: [{ t: "The position relieved the pain", sig: { EX: 1 } }, { t: "Neutral — no change", sig: {} }, { t: "Mild discomfort", sig: { FL: 1 } }, { t: "Pain or pressure", sig: { FL: 1 } }] },
      { id: "lb_p1q2", text: "Does the sensation stay in your back, or do you feel anything toward the buttock or leg?", opts: [{ t: "Stays in the back only", sig: {} }, { t: "Also feel it in the buttock", sig: { NE: 1 } }, { t: "Also feel it in the leg", sig: { NE: 1 } }, { t: "No sensation at all", sig: {} }] },
    ],
  },
  {
    id: "pelvic-tilt", name: "Pelvic Tilts", subtitle: "",
    grad: ["#B4D0B0", "#80B07C"], time: "~60 sec", conditional: false, double_score: false, videoId: null,
    how: "Lie on your back, knees bent. Gently flatten your lower back (posterior tilt), then allow a small arch (anterior tilt). 8 easy cycles.",
    qs: [
      { id: "lb_p2q1", text: "Which direction felt better for your back?", opts: [{ t: "Back flat / rounded (posterior tilt)", sig: { EX: 1 } }, { t: "Back arched / curved (anterior tilt)", sig: { FL: 1 } }, { t: "Neutral — both felt similar", sig: {} }, { t: "Both caused discomfort", sig: { LI: 1 } }] },
      { id: "lb_p2q2", text: "How free was the movement?", opts: [{ t: "Fully free — no limitation", sig: {} }, { t: "Slightly limited — didn't reach full range", sig: { ST: 1 } }, { t: "Very limited — felt real stiffness", sig: { ST: 1 } }, { t: "Movement was painful", sig: { LI: 1 } }] },
    ],
  },
  {
    id: "cat-cow", name: "Cat–Cow", subtitle: "Marjaryasana / Bitilasana",
    grad: ["#C4B8D4", "#9880B4"], time: "~60 sec", conditional: false, double_score: false, videoId: null,
    how: "On hands and knees. Inhale — belly drops, head lifts (Cow). Exhale — round spine, tuck chin (Cat). 6 slow cycles.",
    qs: [
      { id: "lb_p3q1", text: "What did you feel during the transitions?", opts: [{ t: "One direction felt better than the other", sig: {} }, { t: "Both directions fine — movement was free", sig: {} }, { t: "Both directions limited — difficult to move", sig: { ST: 1 } }, { t: "The transition itself was painful", sig: { LI: 1 } }] },
      { id: "lb_p3q2", text: "Did the discomfort change as you continued moving?", opts: [{ t: "Improved with movement", sig: { ST: 1 } }, { t: "Stayed the same", sig: {} }, { t: "Worsened with movement", sig: { LI: 1 } }, { t: "No discomfort", sig: {} }] },
    ],
  },
  {
    id: "sphinx", name: "Sphinx", subtitle: "Salamba Bhujangasana",
    grad: ["#D0BCA8", "#B09880"], time: "~45 sec", conditional: true, double_score: true, videoId: null,
    how: "Lie face-down. Forearms on floor, elbows under shoulders. Press forearms to lift chest — pelvis stays on floor. 5 slow breaths.",
    qs: [
      { id: "lb_p4q1", text: "How did your back respond to resting on your forearms?", opts: [{ t: "Felt relief — back relaxed", sig: { FL: 1 } }, { t: "No change", sig: {} }, { t: "Felt pressure or pain in the back", sig: { EX: 1, LI: 1 } }, { t: "Felt a sensation traveling into the leg or buttock", sig: { NE: 1 } }] },
    ],
  },
  {
    id: "bird-dog", name: "Bird-Dog", subtitle: "Parsva Balasana",
    grad: ["#B8CCDC", "#84A4C0"], time: "~60 sec", conditional: false, double_score: false, videoId: null,
    how: "On hands and knees. Slowly extend right arm and left leg simultaneously — hips level. 3 breaths. Switch sides.",
    qs: [
      { id: "lb_p5q1", text: "What did you feel during the movement?", opts: [{ t: "Stable on both sides", sig: {} }, { t: "Muscle effort only, no pain", sig: {} }, { t: "One side was noticeably harder", sig: { LI: 1 } }, { t: "Back pain or difficulty holding", sig: { LI: 1 } }, { t: "Quick muscle fatigue", sig: { LI: 1 } }] },
    ],
  },
  {
    id: "bridge", name: "Bridge", subtitle: "Setu Bandhasana",
    grad: ["#DCC8B0", "#C0A484"], time: "~75 sec", conditional: false, double_score: false, videoId: null,
    how: "Lie on back, knees bent. Press feet into floor and lift hips. Squeeze glutes at top. Hold 3 breaths. Lower slowly. Repeat 3×.",
    qs: [
      { id: "lb_p6q1", text: "How did your back feel while lifting your pelvis?", opts: [{ t: "Stable — smooth lift", sig: {} }, { t: "Muscle effort only, no pain", sig: {} }, { t: "Pain or pressure in the back", sig: { EX: 1, LI: 1 } }, { t: "Difficult to stabilize or lift", sig: { LI: 1 } }] },
    ],
  },
  {
    id: "trikonasana", name: "Triangle Pose", subtitle: "Trikonasana",
    grad: ["#B4D4C4", "#7CB898"], time: "~60 sec", conditional: true, double_score: false, videoId: null,
    how: "Stand feet wide. Right foot out 90°. Reach right hand toward shin, left arm up. 4 breaths each side.",
    qs: [
      { id: "lb_p7q1", text: "Was there a difference between the right and left sides?", opts: [{ t: "Both sides similar — free movement", sig: {} }, { t: "Both sides similar — limited range", sig: { ST: 1 } }, { t: "One side was clearly more free", sig: { ST: 1 } }, { t: "One side caused pain or a leg sensation", sig: { NE: 1 } }] },
    ],
  },
  {
    id: "hip-hinge", name: "Hip Hinge → Forward Fold", subtitle: "Uttanasana",
    grad: ["#C8B8DC", "#A090C0"], time: "~60 sec", conditional: false, double_score: true, videoId: null,
    how: "Stand feet hip-width, knees soft. Slowly hinge forward from hips — arms and upper body hang. 4 breaths. Roll back up slowly.",
    qs: [
      { id: "lb_p8q1", text: "When you folded forward, what did you feel?", opts: [{ t: "Pleasant stretch in the back or legs", sig: {} }, { t: "Limited — couldn't reach far", sig: { ST: 1 } }, { t: "Pain in the back", sig: { FL: 1 } }, { t: "Sensation traveling down the leg (tingling, numbness, or pain)", sig: { NE: 1 } }] },
      { id: "lb_p8q2", text: "How far could you comfortably reach?", opts: [{ t: "Knees or below — good range", sig: {} }, { t: "Mid-shin", sig: { ST: 1 } }, { t: "Only to the knees", sig: { ST: 1 } }, { t: "Barely able to bend forward", sig: { ST: 1, LI: 1 } }] },
    ],
  },
  {
    id: "supine-twist", name: "Supine Twist", subtitle: "Supta Matsyendrasana",
    grad: ["#B4D0C0", "#7CB898"], time: "~60 sec", conditional: false, double_score: false, videoId: null,
    how: "Lie on back. Draw right knee to chest, guide across body to the left. Shoulders stay on floor. 4 breaths. Repeat other side.",
    qs: [
      { id: "lb_p9q1", text: "How did your back feel during the rotation?", opts: [{ t: "Relief — back relaxed into it", sig: {} }, { t: "Neutral", sig: {} }, { t: "Discomfort in the back", sig: { LI: 1 } }, { t: "Sensation in the buttock or hip", sig: { NE: 1 } }] },
      { id: "lb_p9q2", text: "Was there a difference rotating right vs. left?", opts: [{ t: "Both directions felt similar", sig: {} }, { t: "One direction was more free", sig: { ST: 1 } }, { t: "One direction caused discomfort", sig: { NE: 1 } }, { t: "Both directions caused discomfort", sig: { LI: 1 } }] },
    ],
  },
];

// --- HIP POSTURES -------------------------------------------------------------
const HIP_POSTURES = [
  { id: "hip_p1", name: "Bridge", subtitle: "Setu Bandha", grad: ["#DCC8B0", "#C0A484"], time: "~75 sec", conditional: false, double_score: false, videoId: null, how: "Lie on your back, knees bent, feet hip-width. Press feet into the floor and slowly lift your hips. Hold 3 breaths. Lower one vertebra at a time. Repeat 3×.", qs: [{ id: "hip_p1q1", text: "How did your hips and back of thigh feel during Bridge?", opts: [{ t: "Strong and stable", sig: {} }, { t: "Muscle effort only", sig: {} }, { t: "Tightness in buttock or back of thigh", sig: { PO: 1 } }, { t: "Pain in lower back or pelvis", sig: {}, xover: true }, { t: "Pain in hip", sig: { LA: 1, PO: 1, ST: 1 } }] }] },
  { id: "hip_p2", name: "Supta Padangusthasana", subtitle: "Reclined Hand-to-Foot", grad: ["#A8CCCA", "#6AA8A4"], time: "~60 sec", conditional: false, double_score: false, videoId: null, how: "Lie on your back. Lift one leg straight up, holding behind your thigh. Keep the other leg flat. Hold 4 breaths each side.", qs: [{ id: "hip_p2q1", text: "How did your leg feel during Supta Padangusthasana?", opts: [{ t: "Comfortable stretch", sig: {} }, { t: "Tightness limiting movement", sig: { MO: 1 } }, { t: "Pain in buttock or back of thigh", sig: { PO: 1 } }, { t: "Pulling sensation down the leg", sig: { NE: 1 } }, { t: "Pain in lower back", sig: {}, xover: true }] }] },
  { id: "hip_p3", name: "Reclined Figure-4", subtitle: "Supta Kapotasana  ★ ×2", grad: ["#C4B8D4", "#9880B4"], time: "~60 sec", conditional: false, double_score: true, videoId: null, how: "Lie on your back, cross one ankle over the opposite knee. Gently draw both legs toward your chest. Hold 5 breaths each side.", qs: [{ id: "hip_p3q1", text: "How did your hip feel in Reclined Figure-4?", opts: [{ t: "Stretch in hip / buttock", sig: {} }, { t: "Tight deep hip", sig: { MO: 2 } }, { t: "Pain in hip joint", sig: { AN: 2 } }, { t: "Pain spreading toward leg", sig: { NE: 2 } }, { t: "Pain in lower back", sig: {}, xover: true }] }] },
  { id: "hip_p4", name: "Half Locust", subtitle: "Ardha Salabhasana", grad: ["#B8CCDC", "#84A4C0"], time: "~60 sec", conditional: false, double_score: false, videoId: null, how: "Lie face-down, arms alongside your body. Lift one leg at a time off the floor, keeping it straight. Hold 3 breaths. Repeat each side.", qs: [{ id: "hip_p4q1", text: "How did your buttock and back of thigh feel during Half Locust?", opts: [{ t: "Smooth and controlled", sig: {} }, { t: "Muscle effort only", sig: {} }, { t: "Hard to lift or hold", sig: { ST: 1 } }, { t: "Pain in buttock or back of thigh", sig: { PO: 1 } }, { t: "Pain in lower back", sig: {}, xover: true }] }] },
  { id: "hip_p5", name: "Chair Pose", subtitle: "Utkatasana  ★ ×2", grad: ["#D0BCA8", "#B09880"], time: "~45 sec", conditional: false, double_score: true, videoId: null, how: "Stand feet hip-width. Bend knees and lower hips as if sitting into a chair. Hold 4 breaths. Come up slowly.", qs: [{ id: "hip_p5q1", text: "How did your hips feel in Chair Pose?", opts: [{ t: "Strong and stable", sig: {} }, { t: "Tight hips", sig: { MO: 2 } }, { t: "Pain in front of hip or groin", sig: { AN: 2 } }, { t: "Pain in knees", sig: {} }, { t: "Pain in lower back", sig: {}, xover: true }] }] },
  { id: "hip_p6", name: "Low Lunge", subtitle: "Anjaneyasana", grad: ["#B4D0B0", "#80B07C"], time: "~60 sec", conditional: false, double_score: false, videoId: null, how: "Step one foot forward into a lunge, back knee on the floor. Gently lower hips toward the floor. Hold 4 breaths each side.", qs: [{ id: "hip_p6q1", text: "How did your front hip feel in Low Lunge?", opts: [{ t: "Stretch front of hip", sig: {} }, { t: "Tight front of hip", sig: { MO: 1 } }, { t: "Deep groin pain", sig: { AN: 1 } }, { t: "Lower back pain", sig: {}, xover: true }, { t: "Sharp pain in front of hip", sig: { AN: 1 } }] }] },
  { id: "hip_p7", name: "Prasarita Padottanasana", subtitle: "Wide-Leg Forward Fold", grad: ["#B4D4C4", "#7CB898"], time: "~60 sec", conditional: false, double_score: false, videoId: null, how: "Stand with feet wide apart. Hinge forward from your hips, letting your upper body hang. Hold 4 breaths.", qs: [{ id: "hip_p7q1", text: "How did your hips feel in the wide-leg forward fold?", opts: [{ t: "Stretch in the inner thighs", sig: {} }, { t: "Tight movement", sig: { MO: 1 } }, { t: "One hip tighter than the other", sig: { MO: 1 } }, { t: "Pain in one hip joint", sig: { AN: 1 } }, { t: "Pain in lower back", sig: {}, xover: true }] }] },
  { id: "hip_p8", name: "Tree Pose", subtitle: "Vrksasana", grad: ["#C8B8DC", "#A090C0"], time: "~60 sec", conditional: false, double_score: false, videoId: null, how: "Stand on one leg. Place foot on inner calf or inner thigh (never on the knee). Hold 4 breaths each side.", qs: [{ id: "hip_p8q1", text: "How did your standing hip feel during Tree Pose?", opts: [{ t: "Stable", sig: {} }, { t: "Slight wobble", sig: { ST: 1 } }, { t: "One side weaker", sig: { ST: 1 } }, { t: "Pain on outside of hip", sig: { LA: 1 } }, { t: "Could not keep balance", sig: { ST: 1 } }] }] },
  { id: "hip_p9", name: "Warrior I → Warrior III", subtitle: "Virabhadrasana", grad: ["#DCC8B0", "#C0A484"], time: "~75 sec", conditional: false, double_score: false, videoId: null, how: "From Warrior I, slowly shift weight forward and extend back leg into Warrior III. Hands on wall for balance if needed. Both sides.", qs: [{ id: "hip_p9q1", text: "How did your hip respond to Warrior?", opts: [{ t: "Smooth and controlled", sig: {} }, { t: "Hard to control", sig: { ST: 1 } }, { t: "Tightness in hip", sig: { MO: 1 } }, { t: "Pain in hip or buttock", sig: { LA: 1, PO: 1 } }, { t: "Could not maintain balance", sig: { ST: 1 } }] }] },
];

// --- KNEE POSTURES ------------------------------------------------------------
const KNEE_POSTURES = [
  { id: "knee_p1", name: "Supine Knee Hug", subtitle: "Single Leg", grad: ["#A8CCCA", "#6AA8A4"], time: "~45 sec", conditional: false, double_score: false, videoId: null, how: "Lie on your back. Draw one knee toward your chest. Keep the other leg flat on the floor. Hold 4 breaths. Switch sides.", qs: [{ id: "knee_p1q1", text: "How does your knee feel when drawn toward your chest?", opts: [{ t: "Comfortable stretch", sig: {} }, { t: "Tightness behind the knee", sig: { PO: 1, MO: 1 } }, { t: "Pain behind the knee", sig: { PO: 1 } }, { t: "Pain in front of the knee", sig: { PA: 1 } }, { t: "Pain in hip or lower back", sig: {}, xover: true }, { t: "No sensation", sig: {} }] }] },
  { id: "knee_p2", name: "Standing Knee Extension", subtitle: "Terminal Extension Screen", grad: ["#B4D0B0", "#80B07C"], time: "~45 sec", conditional: false, double_score: false, videoId: null, how: "Stand with soft knees. Slowly straighten one leg fully. Hold 3 seconds. Release. Repeat 3× each side.", qs: [{ id: "knee_p2q1", text: "How does the knee feel at full extension?", opts: [{ t: "Easy and comfortable", sig: {} }, { t: "Tightness behind the knee", sig: { PO: 1, MO: 1 } }, { t: "Pain behind the knee", sig: { PO: 1 } }, { t: "Pain in front of the knee", sig: { PA: 1 } }, { t: "Hyperextension sensation", sig: { PO: 1 } }, { t: "Could not fully straighten", sig: { MO: 1 } }] }] },
  { id: "knee_p3", name: "Chair Pose", subtitle: "Utkatasana  ★ ×2", grad: ["#D0BCA8", "#B09880"], time: "~60 sec", conditional: false, double_score: true, videoId: null, how: "Round 1: feet together. Round 2: feet hip-width. Lower hips as far as comfortable — stop immediately if sharp pain. Hold 3 breaths each round.", qs: [{ id: "knee_p3q1", text: "How did your knees feel in the squat, and did they cave inward in round 2?", opts: [{ t: "Strong and stable", sig: {} }, { t: "Pain behind or around the kneecap", sig: { PA: 2 } }, { t: "Knees felt unstable or shaky", sig: { ST: 2 } }, { t: "Trembling in the front of the knee", sig: { ST: 2 } }, { t: "Knees caved inward (round 2)", sig: { ST: 2 } }, { t: "Knees stayed aligned (round 2)", sig: {} }, { t: "Pain in hip or groin", sig: {}, xover: true }] }] },
  { id: "knee_p4", name: "Low Lunge", subtitle: "Anjaneyasana", grad: ["#C4B8D4", "#9880B4"], time: "~75 sec", conditional: false, double_score: false, videoId: null, how: "Step one foot forward into a deep lunge, back knee on the floor. Front knee at 90°. Hold 4 breaths each side.", qs: [{ id: "knee_p4q1", text: "How did your front knee feel in the deep bend?", opts: [{ t: "Comfortable", sig: {} }, { t: "Pain on the inner side of the knee", sig: { ME: 1 } }, { t: "Pain on the outer side of the knee", sig: { LA: 1 } }, { t: "Pain in front of the knee", sig: { PA: 1 } }, { t: "Tightness limiting the bend", sig: { MO: 1 } }, { t: "Pain in hip or groin", sig: {}, xover: true }] }, { id: "knee_p4q2", text: "How did your back knee feel on the ground?", opts: [{ t: "No issue", sig: {} }, { t: "Pressure on kneecap", sig: { PA: 1 } }, { t: "Pain behind the knee", sig: { PO: 1 } }, { t: "Trembling or instability", sig: { ST: 1 } }, { t: "General discomfort", sig: {} }] }] },
  { id: "knee_p5", name: "Supported Virasana", subtitle: "Graduated — stop if sharp pain", grad: ["#B8CCDC", "#84A4C0"], time: "~60 sec", conditional: false, double_score: false, videoId: null, how: "Stand in 6-point stance (hands, knees, shins). Slowly sit hips back toward heels only as far as comfortable — stop immediately if sharp pain or pressure in the knee.", qs: [{ id: "knee_p5q1", text: "How far could you lower your hips comfortably?", opts: [{ t: "Hips to heels — no pain", sig: {} }, { t: "Hips to heels — with pain or pressure in the knee", sig: { ME: 1, LA: 1 } }, { t: "Halfway — stopped due to knee pain", sig: { ME: 1, LA: 1, MO: 1 } }, { t: "Limited by ankle position, not knee", sig: { MO: 1 } }, { t: "Significant knee pain prevented movement", sig: { ME: 1, LA: 1, ST: 1 } }] }] },
  { id: "knee_p6", name: "Standing Forward Fold", subtitle: "", grad: ["#B4D4C4", "#7CB898"], time: "~45 sec", conditional: false, double_score: false, videoId: null, how: "Stand feet hip-width. Slowly fold forward, knees slightly bent if needed. Let arms hang. Hold 4 breaths. Roll back up slowly.", qs: [{ id: "knee_p6q1", text: "What did you notice behind your knees or around the kneecap?", opts: [{ t: "Pleasant stretch — no pain", sig: {} }, { t: "Tightness behind the knee — limiting movement", sig: { MO: 1 } }, { t: "Pain behind the knee", sig: { PO: 1 } }, { t: "Pain behind or around the kneecap", sig: { PA: 1 } }, { t: "No sensation", sig: {} }] }] },
  { id: "knee_p7", name: "High Lunge", subtitle: "Loaded Single-Leg  ★ ×2", grad: ["#C8B8DC", "#A090C0"], time: "~60 sec", conditional: false, double_score: true, videoId: null, how: "Step one foot forward. Front knee bends to 90°, back leg straight. Hold 4 breaths under load. Both sides.", qs: [{ id: "knee_p7q1", text: "How did your front knee feel under load?", opts: [{ t: "Strong and stable", sig: {} }, { t: "Pain behind or around the kneecap", sig: { PA: 2 } }, { t: "Knee felt unstable or gave way", sig: { ST: 2 } }, { t: "Trembling or instability", sig: { ST: 2 } }, { t: "Pain in hip or groin", sig: {}, xover: true }] }] },
  { id: "knee_p8", name: "Tree Pose", subtitle: "Vrksasana", grad: ["#A8CCCA", "#6AA8A4"], time: "~60 sec", conditional: false, double_score: false, videoId: null, how: "Stand on one leg. Place other foot on inner calf or ankle. Hold 4 breaths each side.", qs: [{ id: "knee_p8q1", text: "How did your standing knee feel during balance?", opts: [{ t: "Stable", sig: {} }, { t: "Wobble or instability", sig: { ST: 1 } }, { t: "Pain on inner knee", sig: { ME: 1 } }, { t: "Pain on outer knee", sig: { LA: 1 } }] }] },
  { id: "knee_p9", name: "Single Leg Mini Squat", subtitle: "Dynamic Stability", grad: ["#B4D0C0", "#7CB898"], time: "~45 sec", conditional: false, double_score: false, videoId: null, how: "Stand on one leg. Slowly bend knee to a comfortable depth — hands on wall if needed. 5 controlled reps each side.", qs: [{ id: "knee_p9q1", text: "How did the knee behave during the movement?", opts: [{ t: "Deep and controlled — knee stayed aligned", sig: {} }, { t: "Moderate bend — knee stayed aligned", sig: {} }, { t: "Knee caved inward", sig: { ST: 1 } }, { t: "Trembling or weakness limited the movement", sig: { ST: 1 } }, { t: "Pain prevented the movement", sig: { ME: 1, LA: 1, ST: 1 } }] }] },
  { id: "knee_p10", name: "Warrior III", subtitle: "Virabhadrasana III", grad: ["#A8CCCA", "#6AA8A4"], time: "~60 sec", conditional: false, double_score: false, videoId: null, how: "Stand on one leg. Hinge forward and extend back leg behind you — hands on wall if needed. Hold 3 breaths. Both sides.", qs: [{ id: "knee_p10q1", text: "How did your standing knee respond to the forward lean?", opts: [{ t: "Smooth and controlled", sig: {} }, { t: "Hard to control", sig: { ST: 1 } }, { t: "Pain on outer knee", sig: { LA: 1 } }, { t: "Could not maintain balance", sig: { ST: 1 } }] }] },
  { id: "knee_summary", name: "Session Check-in", subtitle: "", grad: ["#E4DDD6", "#C4B8B0"], time: "", conditional: false, double_score: false, videoId: null, isSummary: true, how: "", qs: [{ id: "knee_summary_q", text: "Compared to before the session, how does your knee feel now?", opts: [{ t: "Better — less pain or more comfortable", sig: {} }, { t: "No change", sig: {} }, { t: "Slightly worse — more discomfort", sig: {} }, { t: "Significantly worse — pain increased", sig: {} }, { t: "I had no pain to begin with", sig: {} }] }] },
];

// --- ANKLE POSTURES -----------------------------------------------------------
const ANKLE_POSTURES = [
  { id: "ankle_p1", name: "Downward Dog", subtitle: "Adho Mukha Svanasana", grad: ["#A8CCCA", "#6AA8A4"], time: "~60 sec", conditional: false, double_score: false, videoId: null, how: "From hands and knees, tuck toes and lift hips to form an inverted V. Press heels gently toward the floor. Hold 5 breaths.", qs: [{ id: "ankle_p1q1", text: "When pressing your heels toward the floor, what did you feel?", opts: [{ t: "Heels reached the floor comfortably", sig: {} }, { t: "Tightness in calves — heels stayed up", sig: { AC: 1, MO: 1 } }, { t: "Pain in Achilles or back of ankle", sig: { AC: 1 } }, { t: "Pain under the heel or sole of foot", sig: { PF: 1 } }, { t: "No sensation", sig: {} }] }] },
  { id: "ankle_p2", name: "Chair Pose", subtitle: "Utkatasana  ★ ×2", grad: ["#D0BCA8", "#B09880"], time: "~45 sec", conditional: false, double_score: true, videoId: null, how: "Stand feet hip-width. Bend knees and lower hips. Focus attention on the front of your ankles. Hold 4 breaths. Stop if sharp pain.", qs: [{ id: "ankle_p2q1", text: "How did the front of your ankles feel in the squat?", opts: [{ t: "No issue", sig: {} }, { t: "Pinching or blocking at front of ankle", sig: { AN: 2 } }, { t: "Tightness or stiffness in the front of the ankle", sig: { MO: 2 } }, { t: "Tightness limiting depth", sig: { MO: 2 } }, { t: "Pain in knees instead", sig: {}, xover: true }] }] },
  { id: "ankle_p3", name: "Low Lunge", subtitle: "Anjaneyasana", grad: ["#B4D0B0", "#80B07C"], time: "~60 sec", conditional: false, double_score: false, videoId: null, how: "Step one foot forward into a lunge. Shift your front knee forward past your toes — feel the deep stretch in the front of the ankle. Hold 4 breaths each side.", qs: [{ id: "ankle_p3q1", text: "When your front knee moved past your toes, what did you feel in that ankle?", opts: [{ t: "Comfortable — no restriction", sig: {} }, { t: "Pinching at front of ankle", sig: { AN: 1 } }, { t: "Tightness limiting depth", sig: { MO: 1 } }, { t: "Pain in sole of foot", sig: { PF: 1 } }, { t: "Pain in back of ankle or Achilles", sig: { AC: 1 } }] }] },
  { id: "ankle_p4", name: "Single-Leg Heel Raise", subtitle: "Calf Strength Test", grad: ["#C4B8D4", "#9880B4"], time: "~60 sec", conditional: false, double_score: false, videoId: null, how: "Stand near a wall. Rise onto one foot's toes as high as possible. Lower slowly. Try up to 10 repetitions. If single leg is too difficult, perform on both feet.", qs: [{ id: "ankle_p4q1", text: "Standing on one leg, what happened when you rose onto your toes?", opts: [{ t: "Easy and controlled", sig: {} }, { t: "Pain in Achilles or back of ankle", sig: { AC: 1 } }, { t: "Pain under the heel", sig: { PF: 1 } }, { t: "Could not lift fully — weakness", sig: { AC: 1, ST: 1 } }, { t: "Ankle felt unstable", sig: { LA: 1, ST: 1 } }] }, { id: "ankle_p4q2", text: "How many raises could you complete before stopping?", opts: [{ t: "10 or more — single leg", sig: {} }, { t: "5–9 — single leg", sig: {} }, { t: "1–4 — single leg", sig: { AC: 1, ST: 1 } }, { t: "Performed on both legs (single leg too difficult)", sig: { AC: 1, ST: 1 } }, { t: "Could not complete any", sig: { AC: 1, ST: 1 } }] }] },
  { id: "ankle_p5", name: "Tree Pose", subtitle: "Vrksasana", grad: ["#B8CCDC", "#84A4C0"], time: "~60 sec", conditional: false, double_score: false, videoId: null, how: "Stand on one leg. Place other foot on inner calf or ankle. Hold 4 breaths. Switch sides. Focus on the ankle of the standing leg.", qs: [{ id: "ankle_p5q1", text: "How did your standing ankle feel during balance?", opts: [{ t: "Stable", sig: {} }, { t: "Ankle rolling outward or feeling like it might give way", sig: { LA: 1, ST: 1 } }, { t: "Wobble — hard to stabilize", sig: { ST: 1 } }, { t: "Felt stable but required effort", sig: { ST: 1 } }, { t: "Pain on outer ankle", sig: { LA: 1 } }, { t: "Pain in knee", sig: {}, xover: true }] }] },
  { id: "ankle_p6", name: "Warrior III", subtitle: "Virabhadrasana III", grad: ["#C8B8DC", "#A090C0"], time: "~60 sec", conditional: false, double_score: false, videoId: null, how: "Stand on one leg, hinge forward and extend back leg. Hands on wall if needed. Hold 3 breaths. Both sides.", qs: [{ id: "ankle_p6q1", text: "How did your standing ankle respond to the forward lean?", opts: [{ t: "Smooth and controlled", sig: {} }, { t: "Ankle felt unstable", sig: { LA: 1, ST: 1 } }, { t: "Felt stable but required effort", sig: { ST: 1 } }, { t: "Pain on outer ankle", sig: { LA: 1 } }, { t: "Could not maintain balance", sig: { ST: 1 } }, { t: "Pain in knee", sig: {}, xover: true }] }] },
  { id: "ankle_p7a", name: "Eyes-Closed Balance", subtitle: "Optional Stability Challenge", grad: ["#D0BCA8", "#B09880"], time: "~30 sec", conditional: true, double_score: false, videoId: null, how: "Stand on one leg and gently close your eyes for 5 seconds. Focus on ankle control. Open eyes if needed. Both sides.", qs: [{ id: "ankle_p7aq1", text: "How did your ankle feel with your eyes closed?", opts: [{ t: "Stable", sig: {} }, { t: "Slight wobble but controlled", sig: { ST: 1 } }, { t: "Significant wobble", sig: { LA: 1, ST: 1 } }, { t: "Could not maintain balance", sig: { LA: 1, ST: 1 } }, { t: "Pain on outer ankle", sig: { LA: 1 } }] }] },
  { id: "ankle_p7b", name: "Unstable Surface Balance", subtitle: "Optional Stability Challenge", grad: ["#B4D0C0", "#7CB898"], time: "~30 sec", conditional: true, double_score: false, videoId: null, how: "Stand on one leg on a folded blanket, cushion, or soft mat. Hold 5 seconds. Both sides.", qs: [{ id: "ankle_p7bq1", text: "How did your ankle feel on the unstable surface?", opts: [{ t: "Stable", sig: {} }, { t: "Slight wobble but controlled", sig: { ST: 1 } }, { t: "Significant wobble", sig: { LA: 1, ST: 1 } }, { t: "Could not maintain balance", sig: { LA: 1, ST: 1 } }, { t: "Pain on outer ankle", sig: { LA: 1 } }] }] },
  { id: "ankle_summary", name: "Session Check-in", subtitle: "", grad: ["#E4DDD6", "#C4B8B0"], time: "", conditional: false, double_score: false, videoId: null, isSummary: true, how: "", qs: [{ id: "ankle_summary_q", text: "Compared to before the session, how does your ankle feel now?", opts: [{ t: "Better — less pain or more comfortable", sig: {} }, { t: "No change", sig: {} }, { t: "Slightly worse — more discomfort", sig: {} }, { t: "Significantly worse — pain increased", sig: {} }, { t: "I had no pain to begin with", sig: {} }] }] },
];

// --- CROSSOVER MINI-SEQUENCES -------------------------------------------------
const LB_MINI_IDS = ["knee-hug", "sphinx", "hip-hinge", "bridge", "supine-twist"];
const HIP_MINI_IDS = ["hip_p1", "hip_p3", "hip_p5", "hip_p6", "hip_p8"];
const KNEE_MINI_IDS = ["knee_p3", "knee_p4", "knee_p5", "knee_p8", "knee_p7"];
const ANKLE_MINI_IDS = ["ankle_p2", "ankle_p3", "ankle_p4", "ankle_p5", "ankle_p6"];

function getCrossoverPostures(fromArea) {
  // Phase 2 uses the SAME body area's postures, not the adjacent area
  if (fromArea === "LB") return LB_POSTURES.filter((p) => LB_MINI_IDS.includes(p.id));
  if (fromArea === "HIP") return HIP_POSTURES.filter((p) => HIP_MINI_IDS.includes(p.id));
  if (fromArea === "KNEE") return KNEE_POSTURES.filter((p) => KNEE_MINI_IDS.includes(p.id));
  if (fromArea === "ANKLE") return ANKLE_POSTURES.filter((p) => ANKLE_MINI_IDS.includes(p.id));
  return [];
}

// --- ENGINE -------------------------------------------------------------------
function emptyScores(area) {
  if (area === "LB") return { FL: 0, EX: 0, NE: 0, LI: 0, ST: 0 };
  if (area === "HIP") return { AN: 0, LA: 0, PO: 0, NE: 0, ST: 0, MO: 0 };
  if (area === "KNEE") return { PA: 0, ME: 0, LA: 0, PO: 0, ST: 0, MO: 0 };
  if (area === "ANKLE") return { AN: 0, AC: 0, PF: 0, LA: 0, ST: 0, MO: 0 };
  return {};
}

function calculateScores(sessionAnswers, postures) {
  const scores = {};
  for (const posture of postures) {
    const mult = posture.double_score ? 2 : 1;
    for (const q of posture.qs) {
      const ans = sessionAnswers[q.id];
      if (!ans) continue;
      const opt = q.opts.find((o) => o.t === ans);
      if (!opt || !opt.sig) continue;
      for (const [profile, pts] of Object.entries(opt.sig)) {
        scores[profile] = (scores[profile] || 0) + pts * mult;
      }
    }
  }
  return scores;
}

function resolveProfile(area, rawScores, sessionAnswers, irritabilityLevel) {
  const s = { ...emptyScores(area), ...rawScores };
  if (area === "LB" && irritabilityLevel >= 3) s.LI = (s.LI || 0) + 1;
  const ranked = Object.entries(s).sort(([, a], [, b]) => b - a);
  const [top, topScore] = ranked[0];
  const [, secondScore] = ranked[1] ?? [null, 0];
  const isTie = secondScore === topScore && topScore > 0;
  const allZero = topScore === 0;
  const fallback = area === "LB" ? "LI" : "ST";
  let primary;
  if (allZero) { primary = fallback; }
  else if (isTie) {
    const tied = ranked.filter(([, v]) => v === topScore).map(([p]) => p);
    if (area === "LB" && tied.includes("LI") && tied.includes("ST")) primary = "LI";
    else if (area === "LB" && tied.includes("LI")) primary = "LI";
    else primary = top;
  } else { primary = top; }
  const highProfiles = ranked.filter(([, v]) => v >= 3).length;
  if (!allZero && highProfiles >= 3) primary = area === "LB" ? "LI" : "ST";
  let secondary = null;
  for (const [p, sc] of ranked) {
    if (p === primary) continue;
    if (sc >= 3) { secondary = p; break; }
  }
  if (area === "LB") {
    const neuralQ = [
      ["lb_p1q2", ["Also feel it in the buttock", "Also feel it in the leg"]],
      ["lb_p4q1", ["Felt a sensation traveling into the leg or buttock"]],
      ["lb_p7q1", ["One side caused pain or a leg sensation"]],
      ["lb_p8q1", ["Sensation traveling down the leg (tingling, numbness, or pain)"]],
      ["lb_p9q1", ["Sensation in the buttock or hip"]],
    ];
    const neSigs = neuralQ.filter(([id, vals]) => vals.includes(sessionAnswers[id])).length;
    if (neSigs >= 1 && primary !== "NE" && secondary !== "NE" && (s.NE || 0) > 0) secondary = "NE";
  }
  const summaryAns = sessionAnswers["knee_summary_q"] || sessionAnswers["ankle_summary_q"];
  let reassess = isTie || allZero;
  
  // Confidence scoring: count total signal points
  const totalSignal = Object.values(s).reduce((sum, v) => sum + v, 0);
  let confidence;
  if (totalSignal >= 5 && !isTie) confidence = "High";
  else if (totalSignal >= 3) confidence = "Medium";
  else confidence = "Low";
  
  if (summaryAns === "Significantly worse — pain increased") { reassess = true; confidence = "Low"; }
  if (summaryAns === "Better — less pain or more comfortable" && confidence === "Medium") confidence = "High";
  return { primary, secondary, confidence, reassess, scores: s };
}

function checkCrossover(area, sessionAnswers) {
  const vals = Object.values(sessionAnswers);
  if (area === "HIP") {
    const backPainPostures = { hip_p1q1: "Pain in lower back or pelvis", hip_p5q1: "Pain in lower back", hip_p6q1: "Lower back pain" };
    const backCount = Object.entries(backPainPostures).filter(([k, v]) => sessionAnswers[k] === v).length;
    const neural = vals.some((a) => a === "Pulling sensation down the leg" || a === "Pain spreading toward leg");
    const hipPain = ["Pain in hip joint", "Pain in front of hip or groin", "Pain in hip", "Pain in hip or buttock", "Pain on outside of hip"];
    const noHip = !vals.some((a) => hipPain.includes(a));
    const met = [backCount >= 2, neural, noHip].filter(Boolean).length;
    return met >= 2 ? "LB" : null;
  }
  if (area === "KNEE") {
    const hipQ = { knee_p3q1: "Pain in hip or groin", knee_p4q1: "Pain in hip or groin", knee_p7q1: "Pain in hip or groin" };
    const hipCount = Object.entries(hipQ).filter(([k, v]) => sessionAnswers[k] === v).length;
    const kneePainTerms = ["Pain behind or around the kneecap", "Pain on the inner side of the knee", "Pain on the outer side of the knee", "Pain in front of the knee", "Pain on inner knee", "Pain on outer knee"];
    const noKnee = !vals.some((a) => kneePainTerms.includes(a));
    const limitTerms = ["Tightness limiting the bend", "Could not fully straighten", "Halfway — stopped due to knee pain"];
    const fullROM = !vals.some((a) => limitTerms.includes(a));
    const met = [hipCount >= 2, noKnee, fullROM].filter(Boolean).length;
    return met >= 2 ? "HIP" : null;
  }
  if (area === "ANKLE") {
    const kneeQ = { ankle_p2q1: "Pain in knees instead", ankle_p5q1: "Pain in knee", ankle_p6q1: "Pain in knee" };
    const kneeCount = Object.entries(kneeQ).filter(([k, v]) => sessionAnswers[k] === v).length;
    const anklePain = ["Pinching or blocking at front of ankle", "Pinching at front of ankle", "Pain on outer ankle", "Pain in Achilles or back of ankle", "Pain in back of ankle or Achilles", "Pain under the heel"];
    const noAnkle = !vals.some((a) => anklePain.includes(a));
    const limitTerms = ["Tightness in calves — heels stayed up", "Tightness or stiffness in the front of the ankle", "Tightness limiting depth"];
    const fullROM = !vals.some((a) => limitTerms.includes(a));
    const met = [kneeCount >= 2, noAnkle, fullROM].filter(Boolean).length;
    return met >= 2 ? "KNEE" : null;
  }
  return null;
}

function buildActivePostures(area, allPostures, sessionAnswers, irritabilityLevel) {
  return allPostures.filter((p) => {
    if (p.isSummary) return true;
    if (!p.conditional) return true;
    if (area === "LB" && p.id === "sphinx") return sessionAnswers["lb_p3q2"] !== "Worsened with movement";
    if (area === "LB" && p.id === "trikonasana") return irritabilityLevel <= 1;
    if (area === "ANKLE" && (p.id === "ankle_p7a" || p.id === "ankle_p7b")) {
      const treeAns = sessionAnswers["ankle_p5q1"];
      const warrAns = sessionAnswers["ankle_p6q1"];
      const stableTree = treeAns === "Stable" || treeAns === "Felt stable but required effort";
      const stableWarr = warrAns === "Smooth and controlled" || warrAns === "Felt stable but required effort";
      return stableTree && stableWarr;
    }
    return true;
  });
}

function getPosturesForArea(area) {
  if (area === "LB") return LB_POSTURES;
  if (area === "HIP") return HIP_POSTURES;
  if (area === "KNEE") return KNEE_POSTURES;
  if (area === "ANKLE") return ANKLE_POSTURES;
  return [];
}

// --- RED FLAGS for pre-diagnostic safety check (body-area-specific) -----------
const RED_FLAGS_BY_AREA = {
  LB: [
    "Loss of bladder or bowel control",
    "Progressive weakness in your leg(s)",
    "Numbness in the groin or inner thighs",
    "Fever combined with back pain",
    "Unexplained weight loss",
    "History of cancer with new onset back pain",
    "Pain that consistently wakes you at night",
    "Rapidly worsening symptoms",
    "Severe pain following a fall or accident",
  ],
  KNEE: [
    "Sudden severe swelling of the knee (not caused by activity)",
    "Inability to bear weight on the leg",
    "Knee feels locked or unable to straighten fully",
    "Joint gives way suddenly and completely",
    "Fever with joint swelling and warmth",
    "Severe pain or visible deformity following a fall or accident",
    "Rapidly worsening symptoms without a clear cause",
  ],
  HIP: [
    "Inability to bear weight on the leg following a fall",
    "Severe groin or hip pain following trauma (possible fracture)",
    "Sudden and complete loss of hip movement",
    "Fever with hip pain and swelling",
    "Rapidly worsening leg weakness or numbness",
  ],
  ANKLE: [
    "Inability to bear weight (possible fracture)",
    "Severe swelling or bruising appearing immediately after an injury",
    "Visible deformity of the ankle or foot",
    "Complete loss of ankle movement after injury",
    "Numbness or tingling in the foot following trauma",
    "Severe pain following a fall or accident",
  ],
};

function getRedFlagsForArea(areaKey) {
  return RED_FLAGS_BY_AREA[areaKey] || RED_FLAGS_BY_AREA.LB;
}

// --- AFFIRMATIONS -------------------------------------------------------------
const AFFIRMATIONS = [
  "Good work — keep going.",
  "That tells us something useful.",
  "You're doing great.",
  "Good. A few more to go.",
  "Nearly there.",
  "Last one — finish strong.",
];

// --- MAIN COMPONENT -----------------------------------------------------------
export default function VinysDiagnostic({ onComplete, initialArea = null }) {
  const [phase, setPhase] = useState(initialArea ? "red_flags" : "intro");
  const [area, setArea] = useState(initialArea);
  const [originalArea, setOriginalArea] = useState(null);
  const [crossoverTriggered, setCrossoverTriggered] = useState(false);
  const [crossoverTarget, setCrossoverTarget] = useState(null);
  const [irritability, setIrritability] = useState(0);
  const [acuity, setAcuity] = useState("unknown");
  const [intakeStep, setIntakeStep] = useState(0);
  const [postureIdx, setPostureIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [activePostures, setActivePostures] = useState([]);
  const [sessionAnswers, setSessionAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [diagnosticOutput, setDiagnosticOutput] = useState(null);
  const [showingVideo, setShowingVideo] = useState(true);
  // Red flags
  const [redFlagsChecked, setRedFlagsChecked] = useState([]);
  const [noneChecked, setNoneChecked] = useState(false);
  // Clarification questions
  const [clarifyStep, setClarifyStep] = useState(0);
  const [clarifyAnswers, setClarifyAnswers] = useState({});

  const { speak, stop: stopTTS, isPlaying: ttsPlaying, isLoading: ttsLoading, isMuted, setMuted } = useTTS();

  const [videoPlaying, setVideoPlaying] = useState(false);

  const areaLabel = area ? AREA_CONFIG[area].label.toLowerCase() : "this area";

  const INTAKE = [
    {
      id: "irritability", label: "1 of 2",
      q: `How does your ${areaLabel} respond to movement?`,
      opts: [
        "Almost not sensitive — I can move quite freely",
        "Slightly sensitive — some movements are uncomfortable",
        "Sensitive — many movements cause pain",
        "Very sensitive — even small movement worsens the pain",
      ],
    },
    {
      id: "recovery", label: "2 of 2",
      q: "When pain appears, how long does it usually take to settle?",
      opts: ["A few seconds", "A few minutes", "An hour or more", "Hard to say"],
    },
  ];

  function getIrritabilityFromAnswer(ans) {
    if (ans === "Almost not sensitive — I can move quite freely") return 1;
    if (ans === "Slightly sensitive — some movements are uncomfortable") return 2;
    if (ans === "Sensitive — many movements cause pain") return 3;
    return 4;
  }

  function getAcuityFromAnswer(ans) {
    if (ans === "A few seconds") return "high";
    if (ans === "A few minutes") return "medium";
    if (ans === "An hour or more") return "low";
    return "unknown";
  }

  function getModeFromIrritability(irr) {
    if (irr <= 2) return "normal";
    if (irr === 3) return "easier";
    return "flare";
  }

  function startPostures(chosenArea, irr) {
    const postures = getPosturesForArea(chosenArea);
    const active = buildActivePostures(chosenArea, postures, {}, irr);
    setActivePostures(active);
    setPostureIdx(0);
    setQIdx(0);
    setShowingVideo(true);
    setPhase("postures");
  }

  // Reset video player when posture changes — auto-start video immediately
  useEffect(() => { setVideoPlaying(true); }, [postureIdx]);

  // Auto-speak posture instructions when video screen loads, and loop TTS
  const ttsTextRef = useRef("");
  useEffect(() => {
    if (phase === "postures" && showingVideo && activePostures[postureIdx]?.how && !isMuted) {
      const p = activePostures[postureIdx];
      ttsTextRef.current = `${p.name}. ${p.how}`;
      speak(ttsTextRef.current);
    } else {
      ttsTextRef.current = "";
    }
    return () => stopTTS();
  }, [phase, showingVideo, postureIdx, isMuted]);

  // Re-trigger TTS when it finishes (loop audio while on video screen)
  useEffect(() => {
    if (phase === "postures" && showingVideo && !isMuted && !ttsPlaying && !ttsLoading && ttsTextRef.current) {
      const timer = setTimeout(() => {
        if (ttsTextRef.current) speak(ttsTextRef.current);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [ttsPlaying, ttsLoading, phase, showingVideo, isMuted]);

  // Auto-speak question text when question screen loads
  useEffect(() => {
    if (phase === "postures" && !showingVideo && activePostures[postureIdx]?.qs?.[qIdx]?.text) {
      speak(activePostures[postureIdx].qs[qIdx].text);
    }
    return () => stopTTS();
  }, [phase, showingVideo, postureIdx, qIdx]);

  // Stop TTS on unmount
  useEffect(() => () => stopTTS(), []);

  // --- Shell wrapper ---
  const Shell = ({ children, className = "" }) => (
    <div className={`min-h-screen bg-background flex justify-center items-start ${className}`} style={fadeInStyle}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div className="w-full max-w-[460px] px-5 py-9">
        {children}
      </div>
    </div>
  );

  const totalPostures = activePostures.length > 0 ? activePostures.filter(p => !p.isSummary).length : getPosturesForArea("LB").filter(p => !p.isSummary).length;

  // ==========================================================================
  // PHASE: INTRO
  // ==========================================================================
  if (phase === "intro") {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center pt-8">
          <div className="mb-10">
            <BrandLogo size="lg" linkToHome={false} />
          </div>

          <h2 className="text-[28px] sm:text-[34px] font-bold leading-[1.15] text-foreground mb-5">
            Let's find your starting point
          </h2>

          <p className="text-[16px] leading-[1.7] text-muted-foreground max-w-[380px] mb-10">
            Before we build your plan, we need to understand how your body actually moves — not just what hurts.
            This 3-minute movement screen tests a few key positions so we can match you to the right therapeutic approach.
            There are no wrong answers.
          </p>

          <button
            onClick={() => setPhase("area_select")}
            className="w-full max-w-[320px] h-[52px] rounded-full bg-primary text-primary-foreground font-semibold text-base hover:bg-orange-hover active:bg-orange-active transition-all press-scale shadow-premium"
          >
            Start Assessment
          </button>

          <p className="text-xs text-muted-foreground mt-4">Takes about 3 minutes · {totalPostures} postures</p>
        </div>
      </Shell>
    );
  }

  // ==========================================================================
  // PHASE: AREA SELECTION
  // ==========================================================================
  if (phase === "area_select") {
    return (
      <Shell>
        <div className="mb-8">
          <span className="inline-block px-3.5 py-1 rounded-full bg-muted text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#888" }}>
            Movement Assessment
          </span>
          <h2 className="text-[26px] sm:text-[30px] font-bold leading-[1.15] text-foreground mb-3">
            Where would you like to start?
          </h2>
          <p className="text-[15px] text-muted-foreground leading-[1.65]">
            Select the area you'd like to assess. We'll guide you through a short movement screen to understand your pattern.
          </p>
        </div>

        <div className="space-y-3">
          {Object.entries(AREA_CONFIG).map(([id, cfg]) => (
            <button
              key={id}
              onClick={() => { setArea(id); setPhase("red_flags"); }}
              className="w-full p-5 rounded-2xl border border-border bg-card text-left flex items-center gap-4 hover:shadow-calm transition-all press-scale group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">{cfg.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[17px] font-bold text-foreground mb-0.5">{cfg.label}</div>
                <div className="text-[13px] text-muted-foreground leading-snug">{AREA_DESC[id]}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      </Shell>
    );
  }

  // ==========================================================================
  // PHASE: RED FLAGS SAFETY CHECK (FIX 1)
  // ==========================================================================
  if (phase === "red_flags") {
    const hasSelection = noneChecked || redFlagsChecked.length > 0;
    const hasRedFlag = redFlagsChecked.length > 0 && !noneChecked;

    return (
      <Shell>
        <div className="mb-6">
          <h2 className="text-[22px] font-bold text-foreground leading-snug mb-2">
            Before we continue — a quick safety check
          </h2>
          <p className="text-[15px] text-muted-foreground leading-[1.65]">
            Please let us know if you are currently experiencing any of the following
          </p>
        </div>

        <div className="space-y-2">
          {DIAGNOSTIC_RED_FLAGS.map((flag) => {
            const isChecked = redFlagsChecked.includes(flag);
            return (
              <button
                key={flag}
                onClick={() => {
                  setNoneChecked(false);
                  setRedFlagsChecked(prev =>
                    prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
                  );
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] border-2 transition-all text-left ${
                  isChecked ? "border-destructive bg-destructive/5" : "border-border bg-card"
                }`}
              >
                <div className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all ${
                  isChecked ? "border-destructive bg-destructive" : "border-border bg-card"
                }`}>
                  {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                </div>
                <span className="text-[14px] font-medium text-foreground">{flag}</span>
              </button>
            );
          })}

          {/* None of the above */}
          <button
            onClick={() => {
              setNoneChecked(true);
              setRedFlagsChecked([]);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] border-2 transition-all text-left ${
              noneChecked ? "border-secondary bg-secondary/10" : "border-border bg-card"
            }`}
          >
            <div className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all ${
              noneChecked ? "border-secondary bg-secondary" : "border-border bg-card"
            }`}>
              {noneChecked && <Check size={12} className="text-white" strokeWidth={3} />}
            </div>
            <span className="text-[14px] font-medium text-foreground">None of the above</span>
          </button>
        </div>

        <div className="mt-6">
          <PrimaryButton
            label="Continue"
            disabled={!hasSelection}
            onClick={() => {
              if (hasRedFlag) {
                setPhase("red_flag_stop");
              } else {
                setPhase("intake");
              }
            }}
          />
        </div>
      </Shell>
    );
  }

  // ==========================================================================
  // PHASE: RED FLAG STOP SCREEN
  // ==========================================================================
  if (phase === "red_flag_stop") {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center pt-12">
          <div className="w-20 h-20 rounded-full bg-destructive/8 flex items-center justify-center mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-[24px] font-bold text-foreground leading-snug mb-4">
            Please see a healthcare provider before continuing
          </h2>
          <p className="text-[15px] text-muted-foreground leading-[1.7] max-w-[380px] mb-8">
            One or more of your answers suggests a condition that should be evaluated by a doctor or physiotherapist before beginning a movement program. Vinys is not suitable as a first response to these symptoms.
          </p>
          <PrimaryButton
            label="I understand"
            onClick={() => {
              // Navigate back to landing — call onComplete with null to signal abort
              if (typeof window !== "undefined") window.location.href = "/";
            }}
          />
        </div>
      </Shell>
    );
  }

  // ==========================================================================
  // PHASE: INTAKE
  // ==========================================================================
  if (phase === "intake") {
    const q = INTAKE[intakeStep];
    return (
      <Shell>
        <div className="flex items-center justify-between mb-8">
          <span className="inline-block px-3.5 py-1 rounded-full bg-muted text-xs font-bold uppercase tracking-wider" style={{ color: "#888" }}>
            {AREA_CONFIG[area].label} · Setup
          </span>
          <span className="text-[13px] font-semibold" style={{ color: "#888" }}>{q.label}</span>
        </div>

        <h2 className="text-[22px] font-bold text-foreground leading-snug mb-7">{q.q}</h2>

        <div className="space-y-2.5">
          {q.opts.map((opt, i) => (
            <OptionTile key={i} label={opt} selected={selected === opt} onClick={() => setSelected(opt)} />
          ))}
        </div>

        <div className="mt-6">
          <PrimaryButton
            label={intakeStep < INTAKE.length - 1 ? "Continue" : "Begin assessment →"}
            disabled={!selected}
            onClick={() => {
              const ans = selected;
              if (intakeStep === 0) {
                const irr = getIrritabilityFromAnswer(ans);
                setIrritability(irr);
              }
              if (intakeStep === 1) {
                const ac = getAcuityFromAnswer(ans);
                setAcuity(ac);
              }
              if (intakeStep < INTAKE.length - 1) {
                setIntakeStep((s) => s + 1);
                setSelected(null);
              } else {
                setSelected(null);
                startPostures(area, irritability);
              }
            }}
          />
        </div>
      </Shell>
    );
  }

  // ==========================================================================
  // PHASE: POSTURES
  // ==========================================================================
  if (phase === "postures") {
    const posture = activePostures[postureIdx];
    if (!posture) return null;
    const q = posture.qs[qIdx];
    const isLastQ = qIdx === posture.qs.length - 1;
    const isLastP = postureIdx === activePostures.length - 1;
    const progressTotal = activePostures.filter((p) => !p.isSummary).length;

    function handleAnswer(ansText) {
      const newAnswers = { ...sessionAnswers, [q.id]: ansText };
      setSessionAnswers(newAnswers);

      if (isLastQ && !crossoverTriggered) {
        const target = checkCrossover(area, newAnswers);
        if (target) {
          setCrossoverTriggered(true);
          setOriginalArea(area);
          setCrossoverTarget(target);
          const miniPostures = getCrossoverPostures(area);
          setActivePostures(miniPostures);
          setPostureIdx(0);
          setQIdx(0);
          setSelected(null);
          setShowingVideo(true);
          return;
        }
      }

      if (!isLastQ) {
        setQIdx((qi) => qi + 1);
        setSelected(null);
        return;
      }

      const effectiveArea = crossoverTriggered ? crossoverTarget : area;
      const allPostures = crossoverTriggered ? getCrossoverPostures(area) : getPosturesForArea(effectiveArea);
      const rebuilt = buildActivePostures(effectiveArea, allPostures, newAnswers, irritability);

      if (!isLastP) {
        const nextIdx = rebuilt.findIndex((p, i) => i > postureIdx) !== -1 ? postureIdx + 1 : postureIdx;
        setActivePostures(rebuilt);
        setPostureIdx(nextIdx);
        setQIdx(0);
        setSelected(null);
        setShowingVideo(true);
      } else {
        const resolveArea = crossoverTriggered ? crossoverTarget : area;
        const scores = calculateScores(newAnswers, allPostures);
        const output = resolveProfile(resolveArea, scores, newAnswers, irritability);
        const result = {
          ...output,
          area: resolveArea,
          originalArea: crossoverTriggered ? area : null,
          crossoverTriggered,
          irritability,
          acuity,
          mode: getModeFromIrritability(irritability),
          redFlagsPassed: true,
        };
        setDiagnosticOutput(result);
        
        // Determine if clarification is needed based on confidence
        if (result.confidence === "High") {
          setPhase("summary");
        } else if (result.confidence === "Medium") {
          setClarifyStep(0);
          setClarifyAnswers({});
          setSelected(null);
          setPhase("clarify");
        } else {
          // Low confidence — 2 questions
          setClarifyStep(0);
          setClarifyAnswers({});
          setSelected(null);
          setPhase("clarify");
        }
      }
    }

    // --- Summary posture (final check-in) ---
    if (posture.isSummary) {
      return (
        <Shell>
          <span className="inline-block px-3.5 py-1 rounded-full bg-muted text-xs font-bold uppercase tracking-wider mb-6" style={{ color: "#888" }}>
            Final check-in
          </span>
          <h2 className="text-[22px] font-bold text-foreground leading-snug mb-7">{q.text}</h2>
          <div className="space-y-2.5">
            {q.opts.map((opt, i) => (
              <OptionTile key={i} label={opt.t} selected={selected === opt.t} onClick={() => setSelected(opt.t)} />
            ))}
          </div>
          <div className="mt-6">
            <PrimaryButton label="See your results →" disabled={!selected} onClick={() => handleAnswer(selected)} />
          </div>
        </Shell>
      );
    }

    // --- VIDEO / INSTRUCTIONS sub-phase ---
    if (showingVideo) {
      const cleanSubtitle = posture.subtitle ? posture.subtitle.replace(/★.*/, "").trim() : "";
      return (
        <Shell className="!pt-0">
          {/* Progress bar at top */}
          <div className="pt-4 pb-3">
            <p className="text-xs mb-1.5" style={{ color: "#888" }}>Posture {postureIdx + 1} of {progressTotal}</p>
            <div className="w-full h-1 rounded-full bg-border overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${((postureIdx + 1) / progressTotal) * 100}%` }} />
            </div>
          </div>

          {crossoverTriggered && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-300 text-[13px] text-amber-800 leading-relaxed">
              We're checking a few more things to give you the most accurate result.
            </div>
          )}

          {/* Video card — uses universal fallback video like Workout.tsx */}
          <div className="rounded-2xl overflow-hidden relative aspect-video mb-4" style={{ background: '#2A2A2A' }}>
            <video
              src={posture.videoSrc || universalVideo}
              autoPlay
              loop
              muted
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* Posture name overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
              {cleanSubtitle && (
                <span className="text-[11px] text-white/60 font-bold tracking-widest uppercase block">{cleanSubtitle}</span>
              )}
              <span className="text-[18px] font-bold text-white leading-tight">{posture.name}</span>
            </div>

            {/* TTS overlay bar */}
            <div style={{ position: "absolute", bottom: 10, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
              <button
                onClick={() => setMuted(!isMuted)}
                disabled={ttsLoading}
                style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {ttsLoading ? <RotateCcw className="w-4 h-4 animate-spin" /> : isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => speak(`${posture.name}. ${posture.how}`)}
                style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}
                aria-label="Replay instructions"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Instructions card */}
          {posture.how && (
            <div className="p-5 rounded-2xl bg-card border border-border shadow-calm mb-5">
              <span className="text-[11px] font-medium uppercase tracking-widest block mb-3" style={{ color: "#888" }}>How to do this</span>
              <p className="text-[15px] text-foreground leading-[1.7]">{posture.how}</p>
            </div>
          )}

          <PrimaryButton label="I've tried this →" onClick={() => { ttsTextRef.current = ""; stopTTS(); setShowingVideo(false); }} />
          <div className="flex justify-center">
            <button onClick={() => { ttsTextRef.current = ""; stopTTS(); setShowingVideo(false); }} style={{ color: '#888', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginTop: 8 }}>
              Skip video →
            </button>
          </div>
        </Shell>
      );
    }

    // --- QUESTIONS sub-phase ---
    return (
      <Shell>
        {/* Posture progress */}
        <p className="text-xs mb-1.5" style={{ color: "#888" }}>Posture {postureIdx + 1} of {progressTotal}</p>
        <div className="w-full h-1 rounded-full bg-border mb-5 overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${((postureIdx + 1) / progressTotal) * 100}%` }} />
        </div>

        {/* Mini posture header */}
        <div className="flex items-center gap-3 mb-5 p-3.5 rounded-2xl bg-card border border-border">
          <div
            className="w-10 h-10 rounded-xl flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${posture.grad[0]}, ${posture.grad[1]})` }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-bold text-foreground">{posture.name}</div>
            {posture.subtitle && (
              <div className="text-[12px] text-muted-foreground">{posture.subtitle.replace(/★.*/, "").trim()}</div>
            )}
          </div>
          <button
            onClick={() => setShowingVideo(true)}
            className="text-[12px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
            style={{ color: "#888", background: "rgba(136,136,136,0.08)" }}
          >
            <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
            Back
          </button>
        </div>

        {/* Question card */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-calm mb-5">
          {posture.qs.length > 1 && (
            <span className="text-[11px] font-bold uppercase tracking-wider block mb-2" style={{ color: "#888" }}>
              Question {qIdx + 1} of {posture.qs.length}
            </span>
          )}
          <h3 className="text-[17px] font-bold text-foreground leading-snug">{q.text}</h3>
        </div>

        <div className="space-y-2.5">
          {q.opts.map((opt, i) => (
            <OptionTile key={i} label={opt.t} selected={selected === opt.t} onClick={() => setSelected(opt.t)} />
          ))}
        </div>

        <div className="mt-6">
          <PrimaryButton
            label={isLastP && isLastQ ? "See my results →" : "Next"}
            disabled={!selected}
            onClick={() => { handleAnswer(selected); setSelected(null); }}
          />
        </div>

        {postureIdx > 0 && (
          <p className="mt-4 text-center text-[13px] text-muted-foreground italic">
            {AFFIRMATIONS[Math.min(postureIdx - 1, AFFIRMATIONS.length - 1)]}
          </p>
        )}
      </Shell>
    );
  }

  // ==========================================================================
  // PHASE: CLARIFICATION QUESTIONS (FIX 8)
  // ==========================================================================
  if (phase === "clarify" && diagnosticOutput) {
    const isLow = diagnosticOutput.confidence === "Low";
    const totalClarifyQs = isLow ? 2 : 1;

    const CLARIFY_QS = [
      {
        heading: "One quick follow-up",
        text: "How strong was the discomfort during the movement test overall?",
        opts: [
          "No pain — I moved freely",
          "Mild discomfort — manageable",
          "Moderate pain — I had to be careful",
          "Strong pain — I stopped or modified most movements",
        ],
      },
      {
        heading: "One more question",
        text: "Did the movement test change your pain afterwards?",
        opts: [
          "Pain improved after moving",
          "No change",
          "Pain increased after moving",
        ],
      },
    ];

    const currentQ = CLARIFY_QS[clarifyStep];
    if (!currentQ) { setPhase("summary"); return null; }

    return (
      <Shell>
        <div className="mb-8">
          <h2 className="text-[22px] font-bold text-foreground leading-snug mb-2">{currentQ.heading}</h2>
          <p className="text-[16px] text-foreground leading-[1.65] font-medium">{currentQ.text}</p>
        </div>

        <div className="space-y-2.5">
          {currentQ.opts.map((opt, i) => (
            <OptionTile key={i} label={opt} selected={selected === opt} onClick={() => setSelected(opt)} />
          ))}
        </div>

        <div className="mt-6">
          <PrimaryButton
            label={clarifyStep < totalClarifyQs - 1 ? "Continue" : "See your profile →"}
            disabled={!selected}
            onClick={() => {
              const newAnswers = { ...clarifyAnswers, [`clarify_${clarifyStep}`]: selected };
              setClarifyAnswers(newAnswers);

              // Update profile based on clarification
              if (clarifyStep === 0) {
                // Pain severity → adjust irritability
                const painMap = {
                  "No pain — I moved freely": 1,
                  "Mild discomfort — manageable": 2,
                  "Moderate pain — I had to be careful": 3,
                  "Strong pain — I stopped or modified most movements": 4,
                };
                const clarifiedIrr = painMap[selected] || irritability;
                // Average with existing irritability
                const newIrr = Math.round((irritability + clarifiedIrr) / 2);
                setIrritability(newIrr);
                setDiagnosticOutput(prev => ({
                  ...prev,
                  irritability: newIrr,
                  mode: getModeFromIrritability(newIrr),
                }));
              }

              if (clarifyStep < totalClarifyQs - 1) {
                setClarifyStep(s => s + 1);
                setSelected(null);
              } else {
                setSelected(null);
                setPhase("summary");
              }
            }}
          />
        </div>
      </Shell>
    );
  }

  // ==========================================================================
  // PHASE: SUMMARY (profile summary before calling onComplete)
  // ==========================================================================
  if (phase === "summary" && diagnosticOutput) {
    const { primary, secondary, confidence, reassess, area: resultArea, originalArea: origArea, crossoverTriggered: crossed } = diagnosticOutput;
    const prof = PROFILE_DATA[resultArea]?.[primary];
    const displayInfo = PROFILE_DISPLAY[primary] || { name: primary, description: "" };
    if (!prof) return <div className="p-6 text-muted-foreground">No profile resolved.</div>;

    const confBadgeClass =
      confidence === "High" ? "bg-secondary/10 text-secondary" :
      confidence === "Medium" ? "bg-primary/10 text-primary" :
      "bg-destructive/10 text-destructive";

    return (
      <Shell>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-secondary/10 mb-6">
            <Check className="w-4 h-4 text-secondary" />
            <span className="text-[13px] font-bold text-secondary uppercase tracking-wider">Assessment complete</span>
          </div>

          {crossed && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-[14px] text-amber-800 leading-relaxed text-left">
              <strong>Note:</strong> Your symptoms appear to originate in your{" "}
              {AREA_CONFIG[AREA_CONFIG[origArea]?.crossoverTo || "LB"]?.label}. Your practice plan is designed accordingly.
            </div>
          )}

          <h2 className="text-[26px] sm:text-[30px] font-bold text-foreground leading-[1.15] mb-3">
            Your movement profile
          </h2>

          <div className="text-[28px] sm:text-[34px] font-extrabold text-primary leading-tight mb-4">
            {displayInfo.name}
          </div>

          <span className={`inline-block px-3 py-1 rounded-full text-[12px] font-bold ${confBadgeClass} mb-6`}>
            {confidence === "High" ? "High confidence profile" : confidence === "Medium" ? "Good confidence — may refine over first sessions" : "Initial profile — will refine over your first sessions"}
          </span>

          <p className="text-[16px] text-foreground leading-[1.7] text-left max-w-[400px] mx-auto mb-2">
            {displayInfo.description}
          </p>

          {reassess && (
            <p className="text-[14px] text-muted-foreground leading-relaxed text-left max-w-[400px] mx-auto mt-4 p-4 rounded-2xl bg-card border border-border">
              We'll keep an eye on your progress and refine this over time.
            </p>
          )}
        </div>

        {/* Insights */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-calm mb-6">
          <span className="text-[11px] font-bold text-foreground uppercase tracking-widest block mb-4">
            What this means for you
          </span>
          <div className="space-y-3">
            {prof.insights.map((insight, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ChevronRight className="w-3 h-3 text-primary" />
                </div>
                <span className="text-[14px] text-foreground leading-[1.65]">{insight}</span>
              </div>
            ))}
          </div>
        </div>

        <PrimaryButton
          label="Build my plan →"
          onClick={() => onComplete && onComplete(diagnosticOutput)}
        />

        <div className="mt-3">
          <SecondaryButton
            label="Retake assessment"
            onClick={() => {
              setPhase("intro");
              setArea(null);
              setOriginalArea(null);
              setCrossoverTriggered(false);
              setCrossoverTarget(null);
              setIrritability(0);
              setAcuity("unknown");
              setIntakeStep(0);
              setPostureIdx(0);
              setQIdx(0);
              setActivePostures([]);
              setSessionAnswers({});
              setSelected(null);
              setDiagnosticOutput(null);
              setShowingVideo(true);
              setRedFlagsChecked([]);
              setNoneChecked(false);
              setClarifyStep(0);
              setClarifyAnswers({});
            }}
          />
        </div>
      </Shell>
    );
  }

  return null;
}

// =============================================================================
// UI PRIMITIVES (using design system)
// =============================================================================
function PrimaryButton({ label, onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-[52px] rounded-full font-semibold text-[15px] transition-all press-scale ${
        disabled
          ? "bg-muted text-muted-foreground cursor-default"
          : "bg-primary text-primary-foreground hover:bg-orange-hover active:bg-orange-active shadow-premium cursor-pointer"
      }`}
    >
      {label}
    </button>
  );
}

function SecondaryButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full h-[48px] rounded-full border-2 border-foreground text-foreground font-semibold text-[15px] hover:border-secondary hover:text-secondary active:bg-beige active:border-beige active:text-white transition-all press-scale cursor-pointer bg-transparent"
    >
      {label}
    </button>
  );
}

function OptionTile({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-2xl text-left flex items-start gap-3.5 transition-all press-scale cursor-pointer ${
        selected
          ? "border-l-4 border-primary bg-[#FFF8F3] text-foreground font-semibold shadow-sm"
          : "border-l-4 border-transparent bg-card text-foreground hover:bg-card/80 border border-border rounded-2xl"
      }`}
      style={selected ? { borderTop: '1px solid hsl(var(--border))', borderRight: '1px solid hsl(var(--border))', borderBottom: '1px solid hsl(var(--border))' } : {}}
    >
      <span
        className={`w-[22px] h-[22px] rounded-full flex-shrink-0 mt-0.5 border-[2.5px] flex items-center justify-center transition-all ${
          selected ? "border-primary bg-primary" : "border-muted bg-transparent"
        }`}
      >
        {selected && <span className="w-2 h-2 rounded-full bg-white block" />}
      </span>
      <span className={`flex-1 text-[14.5px] leading-snug ${selected ? "text-foreground" : ""}`}>{label}</span>
    </button>
  );
}
