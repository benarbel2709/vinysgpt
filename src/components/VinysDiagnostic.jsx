import { useState } from "react";

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#F5F2ED",
  surface: "#FFFFFF",
  border: "#E4DDD6",
  primary: "#4A7B6F",
  primaryDark: "#2E5247",
  primaryLight: "#EBF3F1",
  text: "#1C2B26",
  muted: "#7A8E89",
  accent: "#D4845A",
};

// ─── AREAS ────────────────────────────────────────────────────────────────────
const AREA_CONFIG = {
  LB:    { label: "Lower Back", icon: "◎", color: "#4A7B6F", crossoverTo: null },
  HIP:   { label: "Hip",        icon: "⟳", color: "#7B4A6F", crossoverTo: "LB"   },
  KNEE:  { label: "Knee",       icon: "↓", color: "#6F7B4A", crossoverTo: "HIP"  },
  ANKLE: { label: "Ankle",      icon: "⌇", color: "#4A6F7B", crossoverTo: "KNEE" },
};

const AREA_DESC = {
  LB:    "Pain, stiffness, sciatica or disc symptoms",
  HIP:   "Hip joint, groin, outer hip or mobility",
  KNEE:  "Kneecap, instability, inner or outer knee",
  ANKLE: "Achilles, plantar fascia or ankle instability",
};

// ─── PROFILE DEFINITIONS ──────────────────────────────────────────────────────
const PROFILE_DATA = {
  LB: {
    FL: { name: "Flexion Sensitive",   sub: "Your back prefers neutral or slightly extended positions", color: "#B84838", bg: "#FDF0EE", tag: "Most common pattern",     insights: ["Forward bending tends to aggravate your back — the most common lower back pattern.", "Your practice prioritises neutral spine postures and gradual, supported extension.", "Deep forward folds are introduced later, once your back has settled and strengthened."] },
    EX: { name: "Extension Sensitive", sub: "Your back prefers neutral or gently rounded positions",    color: "#B87028", bg: "#FDF4EE", tag: "Facet / stenosis pattern", insights: ["Arching your back tends to aggravate your symptoms — a facet joint or stenosis pattern.", "Your practice avoids strong backbends and builds on decompression and neutral spine.", "Supported forward bending and spinal lengthening form your foundation."] },
    NE: { name: "Neural Component",    sub: "There may be some nerve involvement in your pattern",      color: "#5840B0", bg: "#F2EFFE", tag: "Nerve involvement",         insights: ["We noticed sensations suggesting your sciatic nerve or nerve roots may be involved.", "Your practice is designed to reduce nerve irritation — no strong flexion or compression early on.", "If leg sensations persist outside practice, mention this to a healthcare provider."] },
    LI: { name: "Load Intolerant",     sub: "Your back responds best to gentle, progressive loading",   color: "#B83858", bg: "#FDF0F3", tag: "Very addressable pattern", insights: ["Your back muscles fatigue or respond quickly to load — a very common and addressable pattern.", "Your practice starts gently and builds load progressively as your tolerance grows.", "Short, regular sessions beat occasional intense ones — consistency is your best tool here."] },
    ST: { name: "Stiff & Hypomobile",  sub: "Your back needs movement and circulation more than rest",  color: "#207890", bg: "#EEF5FD", tag: "Movement is the medicine", insights: ["Your back is stiff rather than acutely painful — movement is genuinely the medicine here.", "Your practice focuses on restoring range of motion through regular, gentle mobility work.", "You'll likely feel better after moving — the key is keeping that cycle going daily."] },
  },
  HIP: {
    AN: { name: "Anterior Hip Overload",         sub: "Front-of-hip or groin pain under load",             color: "#B84838", bg: "#FDF0EE", tag: "Hip joint / flexor pattern", insights: ["Pain at the front of your hip suggests the joint, hip flexor, or labrum are being overloaded.", "Your practice avoids deep hip flexion under load and focuses on decompression and glute strength.", "Strengthening the glutes reduces the demand placed on the anterior hip structures."] },
    LA: { name: "Lateral Hip / Gluteal Overload", sub: "Outer-hip pain — gluteal or IT band",               color: "#B87028", bg: "#FDF4EE", tag: "Gluteal pattern",            insights: ["Pain on the outside of the hip is typically gluteal tendinopathy or IT band involvement.", "Avoid hip adduction (crossing legs) — this compresses the gluteal tendons.", "Gluteal strengthening is the priority. Graded lateral loading is the treatment, not rest."] },
    PO: { name: "Posterior Hip",                 sub: "Buttock or back-of-thigh pain",                     color: "#5840B0", bg: "#F2EFFE", tag: "Hamstring / piriformis",    insights: ["Pain in the buttock or back of the thigh suggests proximal hamstring or piriformis involvement.", "Avoid sustained sitting on hard surfaces and heavy stretching of the hamstring insertion.", "Hip external rotation work and piriformis release form the foundation of your practice."] },
    NE: { name: "Neural Component",              sub: "Symptoms spreading toward the leg",                 color: "#6C3483", bg: "#F4ECF7", tag: "Neural involvement",        insights: ["Sensations spreading toward the leg suggest neural tension from the hip or lower back.", "Your practice avoids slump positions and sustained hip flexion with knee extension.", "Neural glides in hip-friendly positions are a core part of your program."] },
    ST: { name: "Hip Needs Strength",            sub: "Instability and weakness under load",               color: "#B83858", bg: "#FDF0F3", tag: "Stability first",           insights: ["Instability and weakness are the primary finding — the hip needs progressive loading.", "Single-leg stability work is essential. You'll progress from bilateral to unilateral.", "Balance training supports all hip work and prevents re-injury."] },
    MO: { name: "Hip Needs Mobility",            sub: "Restricted range without sharp pain",               color: "#207890", bg: "#EEF5FD", tag: "Mobility first",            insights: ["Restricted range without sharp pain means mobility work is safe and beneficial.", "Internal and external rotation need equal attention — stiffness is often asymmetrical.", "Hip mobility directly supports lower back health and overall movement quality."] },
  },
  KNEE: {
    PA: { name: "Patellofemoral Overload",     sub: "Anterior knee pain — kneecap area",               color: "#B84838", bg: "#FDF0EE", tag: "Kneecap pattern",          insights: ["Pain around the kneecap is a patellofemoral pattern — very common and very addressable.", "Avoid deep knee flexion under load while the kneecap settles. VMO activation is key.", "Step-down exercises and quad control are the therapeutic foundation of your program."] },
    ME: { name: "Medial Knee Stress",          sub: "Inner knee pain",                                 color: "#B87028", bg: "#FDF4EE", tag: "MCL / meniscus pattern",   insights: ["Inner knee pain suggests MCL, medial meniscus, or pes anserinus involvement.", "Avoid valgus knee positions — hip abductor and glute strength reduces medial load.", "Foot position and alignment strongly influence medial knee stress."] },
    LA: { name: "Lateral Knee Stress",         sub: "Outer knee pain",                                 color: "#5840B0", bg: "#F2EFFE", tag: "IT band / LCL pattern",    insights: ["Outer knee pain suggests IT band syndrome, LCL, or lateral meniscus involvement.", "Hip abductor flexibility and lateral glute strength are the key levers.", "IT band mobility work before loading is the approach — not foam rolling alone."] },
    PO: { name: "Posterior Knee / Hamstring",  sub: "Back-of-knee pain",                               color: "#6C3483", bg: "#F4ECF7", tag: "Hamstring / Baker's cyst", insights: ["Back-of-knee pain suggests Baker's cyst, hamstring insertion, or posterior capsule.", "Avoid hyperextension. Hamstring loading at longer lengths is therapeutic.", "Terminal knee extension exercises are a key part of your recovery."] },
    ST: { name: "Knee Needs Strength",         sub: "Instability and weakness under load",             color: "#B83858", bg: "#FDF0F3", tag: "Stability first",           insights: ["Instability and weakness under load are the primary finding. Strengthening is the treatment.", "Single-leg work is the focus — progress slowly through range of motion.", "Proprioception training is essential and often the missing piece in knee recovery."] },
    MO: { name: "Knee Needs Mobility",         sub: "Stiffness without sharp pain",                    color: "#207890", bg: "#EEF5FD", tag: "Mobility first",            insights: ["Restricted range and stiffness without sharp pain — mobility work is safe and beneficial.", "Posterior chain flexibility is a major contributor to knee mobility.", "Gradual, progressive flexion is the approach — never forced."] },
  },
  ANKLE: {
    AN: { name: "Anterior Ankle Impingement",   sub: "Front-of-ankle pinching in dorsiflexion",         color: "#B84838", bg: "#FDF0EE", tag: "Impingement pattern",     insights: ["Front-of-ankle pinching in dorsiflexion suggests a bone spur or capsule restriction.", "Avoid deep dorsiflexion under load while the joint settles.", "Ankle joint mobilisation and posterior chain flexibility reduce the anterior demand."] },
    AC: { name: "Achilles / Posterior Overload", sub: "Back-of-ankle or Achilles pain",                  color: "#B87028", bg: "#FDF4EE", tag: "Achilles pattern",         insights: ["Back-of-ankle pain is an Achilles tendinopathy pattern — graded loading is the treatment.", "Avoid prolonged passive stretching of the Achilles, especially when irritated.", "Eccentric heel lowering is the gold standard exercise for Achilles recovery."] },
    PF: { name: "Plantar Fascia Involvement",    sub: "Heel or sole-of-foot pain",                       color: "#5840B0", bg: "#F2EFFE", tag: "Plantar fascia pattern",   insights: ["Heel or sole-of-foot pain is a plantar fasciitis pattern — very common and very manageable.", "Morning first steps are often the worst — this is characteristic of plantar fascia loading.", "Calf release, intrinsic foot strength, and graded loading are the therapeutic tools."] },
    LA: { name: "Lateral Ankle Instability",     sub: "Outer ankle giving way or unstable",              color: "#6C3483", bg: "#F4ECF7", tag: "Instability pattern",      insights: ["Outer ankle instability suggests chronic lateral ankle sprains or peroneal weakness.", "Single-leg balance training is the priority — proprioception is the key deficit.", "Peroneal strengthening and progressive loading prevent re-injury."] },
    ST: { name: "Ankle Needs Strength",          sub: "Weakness and poor single-leg stability",          color: "#B83858", bg: "#FDF0F3", tag: "Strength first",           insights: ["Weakness and instability on single-leg tasks are the primary findings.", "Heel raise progressions from bilateral to single-leg are the foundation.", "Ankle strength affects knee and hip mechanics — improving it benefits the whole chain."] },
    MO: { name: "Ankle Needs Mobility",          sub: "Restricted range — stiffness without sharp pain", color: "#207890", bg: "#EEF5FD", tag: "Mobility first",           insights: ["Restricted dorsiflexion or plantarflexion stiffness — mobility work is safe and beneficial.", "Calf stretching and ankle circles address the most common restrictions.", "Ankle mobility directly affects knee and hip movement quality."] },
  },
};

// ─── LB POSTURES ──────────────────────────────────────────────────────────────
const LB_POSTURES = [
  { id:"knee-hug",    name:"Supine Knee Hug",          subtitle:"Apanasana",                   grad:["#A8CCCA","#6AA8A4"], time:"~45 sec",  conditional:false, double_score:false, videoId:null, how:"Lie on your back, knees bent. Gently draw both knees toward your chest, hands resting on your shins. Hold for 5 slow breaths.",
    qs:[{ id:"lb_p1q1", text:"With your knees drawn toward your chest, how does your lower back feel?", opts:[{t:"The position relieved the pain",sig:{EX:1}},{t:"Neutral — no change",sig:{}},{t:"Mild discomfort",sig:{FL:1}},{t:"Pain or pressure",sig:{FL:1}}] },
        { id:"lb_p1q2", text:"Does the sensation stay in your back, or do you feel anything toward the buttock or leg?", opts:[{t:"Stays in the back only",sig:{}},{t:"Also feel it in the buttock",sig:{NE:1}},{t:"Also feel it in the leg",sig:{NE:1}},{t:"No sensation at all",sig:{}}] }] },
  { id:"pelvic-tilt", name:"Pelvic Tilts",             subtitle:"",                            grad:["#B4D0B0","#80B07C"], time:"~60 sec",  conditional:false, double_score:false, videoId:null, how:"Lie on your back, knees bent. Gently flatten your lower back (posterior tilt), then allow a small arch (anterior tilt). 8 easy cycles.",
    qs:[{ id:"lb_p2q1", text:"Which direction felt better for your back?", opts:[{t:"Back flat / rounded (posterior tilt)",sig:{EX:1}},{t:"Back arched / curved (anterior tilt)",sig:{FL:1}},{t:"Neutral — both felt similar",sig:{}},{t:"Both caused discomfort",sig:{LI:1}}] },
        { id:"lb_p2q2", text:"How free was the movement?", opts:[{t:"Fully free — no limitation",sig:{}},{t:"Slightly limited — didn't reach full range",sig:{ST:1}},{t:"Very limited — felt real stiffness",sig:{ST:1}},{t:"Movement was painful",sig:{LI:1}}] }] },
  { id:"cat-cow",     name:"Cat–Cow",                  subtitle:"Marjaryasana / Bitilasana",   grad:["#C4B8D4","#9880B4"], time:"~60 sec",  conditional:false, double_score:false, videoId:null, how:"On hands and knees. Inhale — belly drops, head lifts (Cow). Exhale — round spine, tuck chin (Cat). 6 slow cycles.",
    qs:[{ id:"lb_p3q1", text:"What did you feel during the transitions?", opts:[{t:"One direction felt better than the other",sig:{}},{t:"Both directions fine — movement was free",sig:{}},{t:"Both directions limited — difficult to move",sig:{ST:1}},{t:"The transition itself was painful",sig:{LI:1}}] },
        { id:"lb_p3q2", text:"Did the discomfort change as you continued moving?", opts:[{t:"Improved with movement",sig:{ST:1}},{t:"Stayed the same",sig:{}},{t:"Worsened with movement",sig:{LI:1}},{t:"No discomfort",sig:{}}] }] },
  { id:"sphinx",      name:"Sphinx",                   subtitle:"Salamba Bhujangasana",        grad:["#D0BCA8","#B09880"], time:"~45 sec",  conditional:true,  double_score:true,  videoId:null, how:"Lie face-down. Forearms on floor, elbows under shoulders. Press forearms to lift chest — pelvis stays on floor. 5 slow breaths.",
    qs:[{ id:"lb_p4q1", text:"How did your back respond to resting on your forearms?", opts:[{t:"Felt relief — back relaxed",sig:{FL:1}},{t:"No change",sig:{}},{t:"Felt pressure or pain in the back",sig:{EX:1,LI:1}},{t:"Felt a sensation traveling into the leg or buttock",sig:{NE:1}}] }] },
  { id:"bird-dog",    name:"Bird-Dog",                 subtitle:"Parsva Balasana",             grad:["#B8CCDC","#84A4C0"], time:"~60 sec",  conditional:false, double_score:false, videoId:null, how:"On hands and knees. Slowly extend right arm and left leg simultaneously — hips level. 3 breaths. Switch sides.",
    qs:[{ id:"lb_p5q1", text:"What did you feel during the movement?", opts:[{t:"Stable on both sides",sig:{}},{t:"Muscle effort only, no pain",sig:{}},{t:"One side was noticeably harder",sig:{LI:1}},{t:"Back pain or difficulty holding",sig:{LI:1}},{t:"Quick muscle fatigue",sig:{LI:1}}] }] },
  { id:"bridge",      name:"Bridge",                   subtitle:"Setu Bandhasana",             grad:["#DCC8B0","#C0A484"], time:"~75 sec",  conditional:false, double_score:false, videoId:null, how:"Lie on back, knees bent. Press feet into floor and lift hips. Squeeze glutes at top. Hold 3 breaths. Lower slowly. Repeat 3×.",
    qs:[{ id:"lb_p6q1", text:"How did your back feel while lifting your pelvis?", opts:[{t:"Stable — smooth lift",sig:{}},{t:"Muscle effort only, no pain",sig:{}},{t:"Pain or pressure in the back",sig:{EX:1,LI:1}},{t:"Difficult to stabilize or lift",sig:{LI:1}}] }] },
  { id:"trikonasana", name:"Triangle Pose",            subtitle:"Trikonasana",                 grad:["#B4D4C4","#7CB898"], time:"~60 sec",  conditional:true,  double_score:false, videoId:null, how:"Stand feet wide. Right foot out 90°. Reach right hand toward shin, left arm up. 4 breaths each side.",
    qs:[{ id:"lb_p7q1", text:"Was there a difference between the right and left sides?", opts:[{t:"Both sides similar — free movement",sig:{}},{t:"Both sides similar — limited range",sig:{ST:1}},{t:"One side was clearly more free",sig:{ST:1}},{t:"One side caused pain or a leg sensation",sig:{NE:1}}] }] },
  { id:"hip-hinge",   name:"Hip Hinge → Forward Fold", subtitle:"Uttanasana",                  grad:["#C8B8DC","#A090C0"], time:"~60 sec",  conditional:false, double_score:true,  videoId:null, how:"Stand feet hip-width, knees soft. Slowly hinge forward from hips — arms and upper body hang. 4 breaths. Roll back up slowly.",
    qs:[{ id:"lb_p8q1", text:"When you folded forward, what did you feel?", opts:[{t:"Pleasant stretch in the back or legs",sig:{}},{t:"Limited — couldn't reach far",sig:{ST:1}},{t:"Pain in the back",sig:{FL:1}},{t:"Sensation traveling down the leg (tingling, numbness, or pain)",sig:{NE:1}}] },
        { id:"lb_p8q2", text:"How far could you comfortably reach?", opts:[{t:"Knees or below — good range",sig:{}},{t:"Mid-shin",sig:{ST:1}},{t:"Only to the knees",sig:{ST:1}},{t:"Barely able to bend forward",sig:{ST:1,LI:1}}] }] },
  { id:"supine-twist",name:"Supine Twist",             subtitle:"Supta Matsyendrasana",        grad:["#B4D0C0","#7CB898"], time:"~60 sec",  conditional:false, double_score:false, videoId:null, how:"Lie on back. Draw right knee to chest, guide across body to the left. Shoulders stay on floor. 4 breaths. Repeat other side.",
    qs:[{ id:"lb_p9q1", text:"How did your back feel during the rotation?", opts:[{t:"Relief — back relaxed into it",sig:{}},{t:"Neutral",sig:{}},{t:"Discomfort in the back",sig:{LI:1}},{t:"Sensation in the buttock or hip",sig:{NE:1}}] },
        { id:"lb_p9q2", text:"Was there a difference rotating right vs. left?", opts:[{t:"Both directions felt similar",sig:{}},{t:"One direction was more free",sig:{ST:1}},{t:"One direction caused discomfort",sig:{NE:1}},{t:"Both directions caused discomfort",sig:{LI:1}}] }] },
];

// ─── HIP POSTURES ─────────────────────────────────────────────────────────────
const HIP_POSTURES = [
  { id:"hip_p1", name:"Bridge",                   subtitle:"Setu Bandha",                 grad:["#DCC8B0","#C0A484"], time:"~75 sec",  conditional:false, double_score:false, videoId:null,
    how:"Lie on your back, knees bent, feet hip-width. Press feet into the floor and slowly lift your hips. Hold 3 breaths. Lower one vertebra at a time. Repeat 3×.",
    qs:[{ id:"hip_p1q1", text:"How did your hips and back of thigh feel during Bridge?",
      opts:[{t:"Strong and stable",sig:{}},{t:"Muscle effort only",sig:{}},{t:"Tightness in buttock or back of thigh",sig:{PO:1}},{t:"Pain in lower back or pelvis",sig:{},xover:true},{t:"Pain in hip",sig:{LA:1,PO:1,ST:1}}] }] },
  { id:"hip_p2", name:"Supta Padangusthasana",    subtitle:"Reclined Hand-to-Foot",       grad:["#A8CCCA","#6AA8A4"], time:"~60 sec",  conditional:false, double_score:false, videoId:null,
    how:"Lie on your back. Lift one leg straight up, holding behind your thigh. Keep the other leg flat. Hold 4 breaths each side.",
    qs:[{ id:"hip_p2q1", text:"How did your leg feel during Supta Padangusthasana?",
      opts:[t:"Comfortable stretch",sig:{}},{t:"Tightness limiting movement",sig:{MO:1}},{t:"Pain in buttock or back of thigh",sig:{PO:1}},{t:"Pulling sensation down the leg",sig:{NE:1}},{t:"Pain in lower back",sig:{},xover:true}] }] },
  { id:"hip_p3", name:"Reclined Figure-4",        subtitle:"Supta Kapotasana  ★ ×2",      grad:["#C4B8D4","#9880B4"], time:"~60 sec",  conditional:false, double_score:false, videoId:null,
    how:"Lie on your back, cross one ankle over the opposite knee. Gently draw both legs toward your chest. Hold 5 breaths each side.",
    qs:[{ id:"hip_p3q1", text:"How did your hip feel in Reclined Figure-4?",
      opts:[{t:"Stretch in hip / buttock",sig:{}},{t:"Tight deep hip",sig:{MO:2}},{t:"Pain in hip joint",sig:{AN:2 }},{t:"Pain spreading toward leg",sig:{NE:2}},{t:"Pain in lower back",sig:{},xover:true}] }] },
  { id:"hip_p4", name:"Half Locust",              subtitle:"Ardha Salabhasana",            grad:["#B8CCDC","#84A4C0"], time:"~60 sec",  conditional:false, double_score:false, videoId:null,
    how:"Lie face-down, arms alongside your body. Lift one leg at a time off the floor, keeping it straight. Hold 3 breaths. Repeat each side.",
    qs:[{ id:"hip_p4q1", text:"How did your buttock and back of thigh feel during Half Locust?",
      opts:[{t:"Smooth and controlled",sig:{}},{t:"Muscle effort only",sig:{}},{t:"Hard to lift or hold",sig:{ST:1}},{t:"Pain in buttock or back of thigh",sig:{PO:1}},{t:"Pain in lower back",sig:{},xover:true}] }] },
  { id:"hip_p5", name:"Chair Pose",               subtitle:"Utkatasana  ★ ×2",            grad:["#D0BCA8","#B09880"], time:"~45 sec",  conditional:false, double_score:false, videoId:null,
    how:"Stand feet hip-width. Bend knees and lower hips as if sitting into a chair. Hold 4 breaths. Come up slowly.",
    qs:[{ id:"hip_p5q1", text:"How did your hips feel in Chair Pose?",
      opts:[{t:"Strong and stable",sig:{}},{t:"Tight hips",sig:{MO:2}},{t:"Pain in front of hip or groin",sig:{AN:2}},{t:"Pain in knees",sig:{}},{t:"Pain in lower back",sig:{},xover:true}] }] },
  { id:"hip_p6", name:"Low Lunge",                subtitle:"Anjaneyasana",                grad:["#B4D0B0","#80B07C"], time:"~60 sec",  conditional:false, double_score:false, videoId:null,
    how:"Step one foot forward into a lunge, back knee on the floor. Gently lower hips toward the floor. Hold 4 breaths each side.",
    qs:[{ id:"hip_p6q1", text:"How did your front hip feel in Low Lunge?",
      opts:[{t:"Stretch front of hip",sig:{}},{t:"Tight front of hip",sig:{MO:1}},{t:"Deep groin pain",sig:{AN:1}},{t:"Lower back pain",sig:{},xover:true},{t:"Sharp pain in front of hip",sig:{AN:1}}] }] },
  { id:"hip_p7", name:"Prasarita Padottanasana",  subtitle:"Wide-Leg Forward Fold",       grad:["#B4D4C4","#7CB898"], time:"~60 sec",  conditional:false, double_score:false, videoId:null,
    how:"Stand with feet wide apart. Hinge forward from your hips, letting your upper body hang. Hold 4 breaths.",
    qs:[{ id:"hip_p7q1", text:"How did your hips feel in the wide-leg forward fold?",
      opts:[{t:"Stretch in the inner thighs",sig:{}},{t:"Tight movement",sig:{MO:1}},{t:"One hip tighter than the other",sig:{MO:1}},{t:"Pain in one hip joint",sig:{AN:1}},{t:"Pain in lower back",sig:{},xover:true}] }] },
  { id:"hip_p8", name:"Tree Pose",                subtitle:"Vrksasana",                   grad:["#C8B8DC","#A090C0"], time:"~60 sec",  conditional:false, double_score:false, videoId:null,
    how:"Stand on one leg. Place foot on inner calf or inner thigh (never on the knee). Hold 4 breaths. Switch sides.",
    qs:[{ id:"hip_p8q1", text:"How did your standing hip feel during Tree Pose?",
      opts:[{t:"Stable",sig:{}},{t:"Slight wobble",sig:{ST:1}},{t:"One side weaker",sig:{ST:1}},{t:"Pain on outside of hip",sig:{LA:1}},{t:"Could not keep balance",sig:{ST:1}}] }] },
  { id:"hip_p9", name:"Warrior I → Warrior III",  subtitle:"Virabhadrasana",              grad:["#DCC8B0","#C0A484"], time:"~75 sec",  conditional:false, double_score:false, videoId:null,
    how:"From Warrior I, slowly shift weight forward and extend back leg into Warrior III. Hands on wall for balance if needed. Both sides.",
    qs:[{ id:"hip_p9q1", text:"How did your hip respond to Warrior?",
      opts:[{t:"Smooth and controlled",sig:{}},{t:"Hard to control",sig:{ST:1}},{t:"Tightness in hip",sig:{MO:1}},{t:"Pain in hip or buttock",sig:{LA:1,PO:1}},{t:"Could not maintain balance",sig:{ST:1}}] }] },
];

// ─── KNEE POSTURES ────────────────────────────────────────────────────────────
const KNEE_POSTURES = [
  { id:"knee_p1", name:"Supine Knee Hug",           subtitle:"Single Leg",                  grad:["#A8CCCA","#6AA8A4"], time:"~45 sec",  conditional:false, double_score:false, videoId:null,
    how:"Lie on your back. Draw one knee toward your chest. Keep the other leg flat on the floor. Hold 4 breaths. Switch sides.",
    qs:[{ id:"knee_p1q1", text:"How does your knee feel when drawn toward your chest?",
      opts:[{t:"Comfortable stretch",sig:{}},{t:"Tightness behind the knee",sig:{PO:1,MO:1}},{t:"Pain behind the knee",sig:{PO:1}},{t:"Pain in front of the knee",sig:{PA:1}},{t:"Pain in hip or lower back",sig:{},xover:true}] }] },
  { id:"knee_p2", name:"Standing Knee Extension",    subtitle:"Terminal Extension Screen",   grad:["#B4D0B0","#80B07C"], time:"~45 sec",  conditional:false, double_score:false, videoId:null,
    how:"Stand with soft knees. Slowly straighten one leg fully. Hold 3 seconds. Release. Repeat 3× each side.",
    qs:[{ id:"knee_p2q1", text:"How does the knee feel at full extension?",
      opts:[{t:"Easy and comfortable",sig:{}},{t:"Tightness behind the knee",sig:{PO:1,MO:1}},{t:"Pain behind the knee",sig:{PO:1}},{t:"Pain in front of the knee",sig:{PA:1}},{t:"Hyperextension sensation",sig:{PO:1}},{t:"Could not fully straighten",sig:{MO:1}}] }] },
  { id:"knee_p3", name:"Chair Pose",                 subtitle:"Utkatasana  ★ ×2",            grad:["#D0BCA8","#B09880"], time:"~60 sec",  conditional:false, double_score:false, videoId:null,
    how:"Round 1: feet together. Round 2: feet hip-width. Lower hips as far as comfortable — stop immediately if sharp pain. Hold 3 breaths each round.",
    qs:[{ id:"knee_p3q1", text:"How did your knees feel in the squat, and did they cave inward in round 2?",
      opts:[{t:"Strong and stable",sig:{}},{t:"Pain behind or around the kneecap",sig:{PA:2}},{t:"Knees felt unstable or shaky",sig:{ST:2}},{t:"Trembling in the front of the knee",sig:{ST:2}},{t:"Knees caved inward (round 2)",sig:{ST:2}},{t:"Knees stayed aligned (round 2)",sig:{}},{t:"Pain in hip or groin",sig:{},xover:true}] }] },
  { id:"knee_p4", name:"Low Lunge",                  subtitle:"Anjaneyasana",                grad:["#C4B8D4","#9880B4"], time:"~75 sec",  conditional:false, double_score:false, videoId:null,
    how:"Step one foot forward into a deep lunge, back knee on the floor. Front knee at 90°. Hold 4 breaths each side.",
    qs:[{ id:"knee_p4q1", text:"How did your front knee feel in the deep bend?",
      opts:[{t:"Comfortable",sig:{}},{t:"Pain on the inner side of the knee",sig:{ME:1}},{t:"Pain on the outer side of the knee",sig:{LA:1}},{t:"Pain in front of the knee",sig:{PA:1}},{t:"Tightness limiting the bend",sig:{MO:1}},{t:"Pain in hip or groin",sig:{},xover:true}] },
        { id:"knee_p4q2", text:"How did your back knee feel on the ground?",
      opts:[{t:"No issue",sig:{}},{t:"Pressure on kneecap",sig:{PA:1}},{t:"Pain behind the knee",sig:{PO:1}},{t:"Trembling or instability",sig:{ST:1}},{t:"General discomfort",sig:{}}] }] },
  { id:"knee_p5", name:"Supported Virasana",         subtitle:"Graduated — stop if sharp pain", grad:["#B8CCDC","#84A4C0"], time:"~60 sec", conditional:false, double_score:false, videoId:null,
    how:"Stand in 6-point stance (hands, knees, shins). Slowly sit hips back toward heels only as far as comfortable — stop immediately if sharp pain or pressure in the knee.",
    qs:[{ id:"knee_p5q1", text:"How far could you lower your hips comfortably?",
      opts:[{t:"Hips to heels — no pain",sig:{}},{t:"Hips to heels — with pain or pressure in the knee",sig:{ME:1,LA:1}},{t:"Halfway — stopped due to knee pain",sig:{ME:1,LA:1,MO:1}},{t:"Limited by ankle position, not knee",sig:{MO:1}},{t:"Significant knee pain prevented movement",sig:{ME:1,LA:1,ST:1}}] }] },
  { id:"knee_p6", name:"Standing Forward Fold",      subtitle:"",                            grad:["#B4D4C4","#7CB898"], time:"~45 sec",  conditional:false, double_score:false, videoId:null,
    how:"Stand feet hip-width. Slowly fold forward, knees slightly bent if needed. Let arms hang. Hold 4 breaths. Roll back up slowly.",
    qs:[{ id:"knee_p6q1", text:"What did you notice behind your knees or around the kneecap?",
      opts:[{t:"Pleasant stretch — no pain",sig:{}},{t:"Tightness behind the knee — limiting movement",sig:{MO:1}},{t:"Pain behind the knee",sig:{PO:1}},{t:"Pain behind or around the kneecap",sig:{PA:1}},{t:"No sensation",sig:{}}] }] },
  { id:"knee_p7", name:"High Lunge",                 subtitle:"Loaded Single-Leg  ★ ×2",     grad:["#C8B8DC","#A090C0"], time:"~60 sec",  conditional:false, double_score:false, videoId:null,
    how:"Step one foot forward. Front knee bends to 90°, back leg straight. Hold 4 breaths under load. Both sides.",
    qs:[{ id:"knee_p7q1", text:"How did your front knee feel under load?",
      opts:[{t:"Strong and stable",sig:{}},{t:"Pain behind or around the kneecap",sig:{PA:2}},{t:"Knee felt unstable or gave way",sig:{ST:2}},{t:"Trembling or instability",sig:{ST:2}},{t:"Pain in hip or groin",sig:{},xover:true}] }] },
  { id:"knee_p8", name:"Tree Pose",                  subtitle:"Vrksasana",                   grad:["#DCC8B0","#C0A484"], time:"~60 sec",  conditional:false, double_score:false, videoId:null,
    how:"Stand on one leg. Place foot on inner calf or ankle — NOT directly on the knee. Hold 4 breaths. Switch sides.",
    qs:[{ id:"knee_p8q1", text:"How did your standing knee feel?",
      opts:[{t:"Stable",sig:{}},{t:"Wobble or instability",sig:{ST:1}},{t:"Pain on inner knee",sig:{ME:1}},{t:"Pain on outer knee",sig:{LA:1}}] }] },
  { id:"knee_p9", name:"Single Leg Mini Squat",      subtitle:"Dynamic Stability",           grad:["#B4D0C0","#7CB898"], time:"~45 sec",  conditional:false, double_score:false, videoId:null,
    how:"Stand on one leg. Slowly bend knee to a comfortable depth — hands on wall if needed. 5 controlled reps each side.",
    qs:[{ id:"knee_p9q1", text:"How did the knee behave during the movement?",
      opts:[{t:"Deep and controlled — knee stayed aligned",sig:{}},{t:"Moderate bend — knee stayed aligned",sig:{}},{t:"Knee caved inward",sig:{ST:1}},{t:"Trembling or weakness limited the movement",sig:{ST:1}},{t:"Pain prevented the movement",sig:{ME:1,LA:1,ST:1}}] }] },
  { id:"knee_p10",name:"Warrior III",                subtitle:"Virabhadrasana III",           grad:["#A8CCCA","#6AA8A4"], time:"~60 sec",  conditional:false, double_score:false, videoId:null,
    how:"Stand on one leg. Hinge forward and extend back leg behind you — hands on wall if needed. Hold 3 breaths. Both sides.",
    qs:[{ id:"knee_p10q1", text:"How did your standing knee respond to the forward lean?",
      opts:[{t:"Smooth and controlled",sig:{}},{t:"Hard to control",sig:{ST:1}},{t:"Pain on outer knee",sig:{LA:1}},{t:"Could not maintain balance",sig:{ST:1}}] }] },
  { id:"knee_summary", name:"Session Check-in",      subtitle:"",                            grad:["#E4DDD6","#C4B8B0"], time:"",          conditional:false, double_score:false, videoId:null, isSummary:true,
    how:"",
    qs:[{ id:"knee_summary_q", text:"Compared to before the session, how does your knee feel now?",
      opts:[{t:"Better — less pain or more comfortable",sig:{}},{t:"No change",sig:{}},{t:"Slightly worse — more discomfort",sig:{}},{t:"Significantly worse — pain increased",sig:{}},{t:"I had no pain to begin with",sig:{}}] }] },
];

// ─── ANKLE POSTURES ───────────────────────────────────────────────────────────
const ANKLE_POSTURES = [
  { id:"ankle_p1", name:"Downward Dog",              subtitle:"Adho Mukha Svanasana",        grad:["#A8CCCA","#6AA8A4"], time:"~60 sec",  conditional:false, double_score:false, videoId:null,
    how:"From hands and knees, tuck toes and lift hips to form an inverted V. Press heels gently toward the floor. Hold 5 breaths.",
    qs:[{ id:"ankle_p1q1", text:"When pressing your heels toward the floor, what did you feel?",
      opts:[{t:"Heels reached the floor comfortably",sig:{}},{t:"Tightness in calves — heels stayed up",sig:{AC:1,MO:1}},{t:"Pain in Achilles or back of ankle",sig:{AC:1}},{t:"Pain under the heel or sole of foot",sig:{PF:1}},{t:"No sensation",sig:{}}] }] },
  { id:"ankle_p2", name:"Chair Pose",                subtitle:"Utkatasana  ★ ×2",             grad:["#D0BCA8","#B09880"], time:"~45 sec",  conditional:false, double_score:false, videoId:null,
    how:"Stand feet hip-width. Bend knees and lower hips. Focus attention on the front of your ankles. Hold 4 breaths. Stop if sharp pain.",
    qs:[{ id:"ankle_p2q1", text:"How did the front of your ankles feel in the squat?",
      opts:[{t:"No issue",sig:{}},{t:"Pinching or blocking at front of ankle",sig:{AN:2}},{t:"Tightness or stiffness in the front of the ankle",sig:{MO:2}},{t:"Tightness limiting depth",sig:{MO:2}},{t:"Pain in knees instead",sig:{},xover:true}] }] },
  { id:"ankle_p3", name:"Low Lunge",                 subtitle:"Anjaneyasana",                grad:["#B4D0B0","#80B07C"], time:"~60 sec",  conditional:false, double_score:false, videoId:null,
    how:"Step one foot forward into a lunge. Shift your front knee forward past your toes — feel the deep stretch in the front of the ankle. Hold 4 breaths each side.",
    qs:[{ id:"ankle_p3q1", text:"When your front knee moved past your toes, what did you feel in that ankle?",
      opts:[{t:"Comfortable — no restriction",sig:{}},{t:"Pinching at front of ankle",sig:{AN:1}},{t:"Tightness limiting depth",sig:{MO:1}},{t:"Pain in sole of foot",sig:{PF:1}},{t:"Pain in back of ankle or Achilles",sig:{AC:1}}] }] },
  { id:"ankle_p4", name:"Single-Leg Heel Raise",     subtitle:"Calf Strength Test",          grad:["#C4B8D4","#9880B4"], time:"~60 sec",  conditional:false, double_score:false, videoId:null,
    how:"Stand near a wall. Rise onto one foot's toes as high as possible. Lower slowly. Try up to 10 repetitions. If single leg is too difficult, perform on both feet.",
    qs:[{ id:"ankle_p4q1", text:"Standing on one leg, what happened when you rose onto your toes?",
      opts:[{t:"Easy and controlled",sig:{}},{t:"Pain in Achilles or back of ankle",sig:{AC:1}},{t:"Pain under the heel",sig:{PF:1}},{t:"Could not lift fully — weakness",sig:{AC:1,ST:1}},{t:"Ankle felt unstable",sig:{LA:1,ST:1}}] },
        { id:"ankle_p4q2", text:"How many raises could you complete before stopping?",
      opts:[{t:"10 or more — single leg",sig:{}},{t:"5–9 — single leg",sig:{}},{t:"1–4 — single leg",sig:{AC:1,ST:1}},{t:"Performed on both legs (single leg too difficult)",sig:{AC:1,ST:1}},{t:"Could not complete any",sig:{AC:1,ST:1}}] }] },
  { id:"ankle_p5", name:"Tree Pose",                 subtitle:"Vrksasana",                   grad:["#B8CCDC","#84A4C0"], time:"~60 sec",  conditional:false, double_score:false, videoId:null,
    how:"Stand on one leg. Place other foot on inner calf or ankle. Hold 4 breaths. Switch sides. Focus on the ankle of the standing leg.",
    qs:[{ id:"ankle_p5q1", text:"How did your standing ankle feel during balance?",
      opts:[{t:"Stable",sig:{}},{t:"Ankle rolling outward or feeling like it might give way",sig:{LA:1,ST:1}},{t:"Wobble — hard to stabilize",sig:{ST:1}},{t:"Felt stable but required effort",sig:{ST:1}},{t:"Pain on outer ankle",sig:{LA:1}},{t:"Pain in knee",sig:{},xover:true}] }] },
  { id:"ankle_p6", name:"Warrior III",               subtitle:"Virabhadrasana III",           grad:["#C8B8DC","#A090C0"], time:"~60 sec",  conditional:false, double_score:false, videoId:null,
    how:"Stand on one leg, hinge forward and extend back leg. Hands on wall if needed. Hold 3 breaths. Both sides.",
    qs:[{ id:"ankle_p6q1", text:"How did your standing ankle respond to the forward lean?",
      opts:[{t:"Smooth and controlled",sig:{}},{t:"Ankle felt unstable",sig:{LA:1,ST:1}},{t:"Felt stable but required effort",sig:{ST:1}},{t:"Pain on outer ankle",sig:{LA:1}},{t:"Could not maintain balance",sig:{ST:1}},{t:"Pain in knee",sig:{},xover:true}] }] },
  { id:"ankle_p7a", name:"Eyes-Closed Balance",      subtitle:"Optional Stability Challenge", grad:["#D0BCA8","#B09880"], time:"~30 sec",  conditional:true,  double_score:false, videoId:null,
    how:"Stand on one leg and gently close your eyes for 5 seconds. Focus on ankle control. Open eyes if needed. Both sides.",
    qs:[{ id:"ankle_p7aq1", text:"How did your ankle feel with your eyes closed?",
      opts:[{t:"Stable",sig:{}},{t:"Slight wobble but controlled",sig:{ST:1}},{t:"Significant wobble",sig:{LA:1,ST:1}},{t:"Could not maintain balance",sig:{LA:1,ST:1}},{t:"Pain on outer ankle",sig:{LA:1}}] }] },
  { id:"ankle_p7b", name:"Unstable Surface Balance", subtitle:"Optional Stability Challenge", grad:["#B4D0C0","#7CB898"], time:"~30 sec",  conditional:true,  double_score:false, videoId:null,
    how:"Stand on one leg on a folded blanket, cushion, or soft mat. Hold 5 seconds. Both sides.",
    qs:[{ id:"ankle_p7bq1", text:"How did your ankle feel on the unstable surface?",
      opts:[{t:"Stable",sig:{}},{t:"Slight wobble but controlled",sig:{ST:1}},{t:"Significant wobble",sig:{LA:1,ST:1}},{t:"Could not maintain balance",sig:{LA:1,ST:1}},{t:"Pain on outer ankle",sig:{LA:1}}] }] },
  { id:"ankle_summary", name:"Session Check-in",     subtitle:"",                            grad:["#E4DDD6","#C4B8B0"], time:"",          conditional:false, double_score:false, videoId:null, isSummary:true,
    how:"",
    qs:[{ id:"ankle_summary_q", text:"Compared to before the session, how does your ankle feel now?",
      opts:[{t:"Better — less pain or more comfortable",sig:{}},{t:"No change",sig:{}},{t:"Slightly worse — more discomfort",sig:{}},{t:"Significantly worse — pain increased",sig:{}},{t:"I had no pain to begin with",sig:{}}] }] },
];

// ─── CROSSOVER MINI-SEQUENCES ─────────────────────────────────────────────────
const LB_MINI_IDS   = ["knee-hug", "sphinx", "hip-hinge", "bridge", "supine-twist"];
const HIP_MINI_IDS  = ["hip_p1", "hip_p3", "hip_p5", "hip_p6", "hip_p8"];
const KNEE_MINI_IDS = ["knee_p3", "knee_p4", "knee_p5", "knee_p8", "knee_p7"];

function getCrossoverPostures(fromArea) {
  if (fromArea === "HIP")   return LB_POSTURES.filter(p => LB_MINI_IDS.includes(p.id));
  if (fromArea === "KNEE")  return HIP_POSTURES.filter(p => HIP_MINI_IDS.includes(p.id));
  if (fromArea === "ANKLE") return KNEE_POSTURES.filter(p => KNEE_MINI_IDS.includes(p.id));
  return [];
}

// ─── ENGINE ───────────────────────────────────────────────────────────────────
function emptyScores(area) {
  if (area === "LB")    return { FL:0, EX:0, NE:0, LI:0, ST:0 };
  if (area === "HIP")   return { AN:0, LA:0, PO:0, NE:0, ST:0, MO:0 };
  if (area === "KNEE")  return { PA:0, ME:0, LA:0, PO:0, ST:0, MO:0 };
  if (area === "ANKLE") return { AN:0, AC:0, PF:0, LA:0, ST:0, MO:0 };
  return {};
}

function calculateScores(sessionAnswers, postures) {
  const scores = {};
  for (const posture of postures) {
    const mult = posture.double_score ? 2 : 1;
    for (const q of posture.qs) {
      const ans = sessionAnswers[q.id];
      if (!ans) continue;
      const opt = q.opts.find(o => o.t === ans);
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
  const ranked = Object.entries(s).sort(([,a],[,b]) => b - a);
  const [top, topScore] = ranked[0];
  const [second, secondScore] = ranked[1] ?? [null, 0];
  const isTie = secondScore === topScore && topScore > 0;
  const allZero = topScore === 0;
  const fallback = (area === "LB") ? "LI" : "ST";
  let primary;
  if (allZero) {
    primary = fallback;
  } else if (isTie) {
    const tied = ranked.filter(([,v]) => v === topScore).map(([p]) => p);
    if (area === "LB" && tied.includes("LI") && tied.includes("ST")) primary = "LI";
    else if (area === "LB" && tied.includes("LI")) primary = "LI";
    else primary = top;
  } else {
    primary = top;
  }
  const highProfiles = ranked.filter(([,v]) => v >= 3).length;
  if (!allZero && highProfiles >= 3) primary = (area === "LB") ? "LI" : "ST";
  let secondary = null;
  for (const [p, sc] of ranked) {
    if (p === primary) continue;
    if (sc >= 3) { secondary = p; break; }
  }
  if (area === "LB") {
    const neuralQ = [
      ["lb_p1q2",["Also feel it in the buttock","Also feel it in the leg"]],
      ["lb_p4q1",["Felt a sensation traveling into the leg or buttock"]],
      ["lb_p7q1",["One side caused pain or a leg sensation"]],
      ["lb_p8q1",["Sensation traveling down the leg (tingling, numbness, or pain)"]],
      ["lb_p9q1",["Sensation in the buttock or hip"]],
    ];
    const neSigs = neuralQ.filter(([id,vals]) => vals.includes(sessionAnswers[id])).length;
    if (neSigs >= 1 && primary !== "NE" && secondary !== "NE" && (s.NE || 0) > 0) secondary = "NE";
  }
  const summaryAns = sessionAnswers["knee_summary_q"] || sessionAnswers["ankle_summary_q"];
  let reassess = isTie || allZero;
  let confidence = isTie ? "Low" : topScore >= 4 ? "High" : "Medium";
  if (summaryAns === "Significantly worse — pain increased") { reassess = true; confidence = "Low"; }
  if (summaryAns === "Better — less pain or more comfortable" && confidence === "Medium") confidence = "High";
  return { primary, secondary, confidence, reassess, scores: s };
}

function checkCrossover(area, sessionAnswers) {
  const vals = Object.values(sessionAnswers);
  if (area === "HIP") {
    const backPainPostures = { hip_p1q1:"Pain in lower back or pelvis", hip_p5q1:"Pain in lower back", hip_p6q1:"Lower back pain" };
    const backCount = Object.entries(backPainPostures).filter(([k,v]) => sessionAnswers[k] === v).length;
    const neural = vals.some(a => a === "Pulling sensation down the leg" || a === "Pain spreading toward leg");
    const hipPain = ["Pain in hip joint","Pain in front of hip or groin","Pain in hip","Pain in hip or buttock","Pain on outside of hip"];
    const noHip = !vals.some(a => hipPain.includes(a));
    const met = [backCount >= 2, neural, noHip].filter(Boolean).length;
    return met >= 2 ? "LB" : null;
  }
  if (area === "KNEE") {
    const hipQ = { knee_p3q1:"Pain in hip or groin", knee_p4q1:"Pain in hip or groin", knee_p7q1:"Pain in hip or groin" };
    const hipCount = Object.entries(hipQ).filter(([k,v]) => sessionAnswers[k] === v).length;
    const kneePainTerms = ["Pain behind or around the kneecap","Pain on the inner side of the knee","Pain on the outer side of the knee","Pain in front of the knee","Pain on inner knee","Pain on outer knee"];
    const noKnee = !vals.some(a => kneePainTerms.includes(a));
    const limitTerms = ["Tightness limiting the bend","Could not fully straighten","Halfway — stopped due to knee pain"];
    const fullROM = !vals.some(a => limitTerms.includes(a));
    const met = [hipCount >= 2, noKnee, fullROM].filter(Boolean).length;
    return met >= 2 ? "HIP" : null;
  }
  if (area === "ANKLE") {
    const kneeQ = { ankle_p2q1:"Pain in knees instead", ankle_p5q1:"Pain in knee", ankle_p6q1:"Pain in knee" };
    const kneeCount = Object.entries(kneeQ).filter(([k,v]) => sessionAnswers[k] === v).length;
    const anklePain = ["Pinching or blocking at front of ankle","Pinching at front of ankle","Pain on outer ankle","Pain in Achilles or back of ankle","Pain in back of ankle or Achilles","Pain under the heel"];
    const noAnkle = !vals.some(a => anklePain.includes(a));
    const limitTerms = ["Tightness in calves — heels stayed up","Tightness or stiffness in the front of the ankle","Tightness limiting depth"];
    const fullROM = !vals.some(a => limitTerms.includes(a));
    const met = [kneeCount >= 2, noAnkle, fullROM].filter(Boolean).length;
    return met >= 2 ? "KNEE" : null;
  }
  return null;
}

function buildActivePostures(area, allPostures, sessionAnswers, irritabilityLevel) {
  return allPostures.filter(p => {
    if (p.isSummary) return true;
    if (!p.conditional) return true;
    if (area === "LB" && p.id === "sphinx")
      return sessionAnswers["lb_p3q2"] !== "Worsened with movement";
    if (area === "LB" && p.id === "trikonasana")
      return irritabilityLevel <= 1;
    if (area === "ANKLE" && (p.id === "ankle_p7a" || p.id === "ankle_p7b")) {
      const treeAns  = sessionAnswers["ankle_p5q1"];
      const warrAns  = sessionAnswers["ankle_p6q1"];
      const stableTree = treeAns === "Stable" || treeAns === "Felt stable but required effort";
      const stableWarr = warrAns === "Smooth and controlled" || warrAns === "Felt stable but required effort";
      return stableTree && stableWarr;
    }
    return true;
  });
}

function getPosturesForArea(area) {
  if (area === "LB")    return LB_POSTURES;
  if (area === "HIP")   return HIP_POSTURES;
  if (area === "KNEE")  return KNEE_POSTURES;
  if (area === "ANKLE") return ANKLE_POSTURES;
  return [];
}

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
const AFFIRMATIONS = [
  "Good work — keep going.",
  "That tells us something useful.",
  "You're doing great.",
  "Good. A few more to go.",
  "Nearly there.",
  "Last one — finish strong.",
];

function ProgressBar({ current, total }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <div style={{ flex:1, display:"flex", gap:4 }}>
        {Array.from({length:total}).map((_,i) => (
          <div key={i} style={{
            height:4, flex:1, borderRadius:2,
            background: i <= current ? C.primary : C.border,
            transition:"background 0.3s ease",
          }} />
        ))}
      </div>
      <div style={{ fontSize:12, color:C.muted, fontWeight:600, whiteSpace:"nowrap", marginLeft:4 }}>
        {current+1}/{total}
      </div>
    </div>
  );
}

function VideoCard({ posture }) {
  const [playing, setPlaying] = useState(false);
  const cleanSubtitle = posture.subtitle ? posture.subtitle.replace(/★.*/, "").trim() : "";

  if (posture.videoId && playing) {
    return (
      <div style={{ borderRadius:18, overflow:"hidden", position:"relative", paddingBottom:"56.25%", background:"#000" }}>
        <iframe
          src={`https://www.youtube.com/embed/${posture.videoId}?autoplay=1&rel=0`}
          style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", border:"none" }}
          allow="autoplay; fullscreen"
          title={posture.name}
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => posture.videoId && setPlaying(true)}
      style={{
        borderRadius:18, overflow:"hidden", position:"relative",
        paddingBottom:"56.25%", background:"#1C2B26",
        cursor: posture.videoId ? "pointer" : "default",
      }}
    >
      <div style={{
        position:"absolute", inset:0,
        background:`linear-gradient(145deg, ${posture.grad[0]}CC, ${posture.grad[1]}EE)`,
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        gap:8, padding:"20px 24px", textAlign:"center",
      }}>
        {cleanSubtitle && (
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.65)", fontWeight:700, letterSpacing:1.5, textTransform:"uppercase" }}>
            {cleanSubtitle}
          </div>
        )}
        <div style={{ fontSize:22, fontWeight:800, color:"#fff", lineHeight:1.2 }}>
          {posture.name}
        </div>
        {posture.time && (
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.6)" }}>{posture.time}</div>
        )}
        <div style={{
          marginTop:10, width:52, height:52, borderRadius:"50%",
          background:"rgba(255,255,255,0.15)", border:"2px solid rgba(255,255,255,0.3)",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          {posture.videoId ? (
            <span style={{ fontSize:18, color:"rgba(255,255,255,0.9)", marginLeft:3 }}>▶</span>
          ) : (
            <span style={{ fontSize:18, color:"rgba(255,255,255,0.4)" }}>▶</span>
          )}
        </div>
        {!posture.videoId && (
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", letterSpacing:0.8, textTransform:"uppercase", marginTop:-4 }}>
            Video guide coming soon
          </div>
        )}
      </div>
    </div>
  );
}

function PrimaryBtn({ label, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", padding:"18px 20px", borderRadius:14,
      border:"none",
      background: disabled ? "#D8D3CD" : C.primary,
      color: disabled ? "#9BA8A4" : "#fff",
      fontFamily:"inherit", fontSize:15, fontWeight:700,
      cursor: disabled ? "default" : "pointer",
      transition:"all 0.15s ease",
      WebkitTapHighlightColor:"transparent",
      letterSpacing:0.2,
    }}>{label}</button>
  );
}

function GhostBtn({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      width:"100%", padding:"16px 20px", borderRadius:14,
      border:`1.5px solid ${C.border}`,
      background:C.surface, color:C.text,
      fontFamily:"inherit", fontSize:15, fontWeight:600,
      cursor:"pointer", transition:"all 0.15s ease",
      WebkitTapHighlightColor:"transparent",
    }}>{label}</button>
  );
}

function OptionTile({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      width:"100%", padding:"16px 20px", marginBottom:10, borderRadius:14,
      border:`2px solid ${selected ? C.primary : C.border}`,
      background: selected ? C.primaryLight : C.surface,
      color: selected ? C.primaryDark : C.text,
      fontFamily:"inherit", fontSize:14.5, fontWeight: selected?600:400,
      textAlign:"left", cursor:"pointer", lineHeight:1.45,
      display:"flex", alignItems:"flex-start", gap:14,
      transition:"all 0.12s ease",
      WebkitTapHighlightColor:"transparent",
    }}>
      <span style={{
        width:22, height:22, borderRadius:"50%", flexShrink:0, marginTop:1,
        border:`2.5px solid ${selected ? C.primary : "#D0CBC4"}`,
        background: selected ? C.primary : "transparent",
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"all 0.12s ease",
      }}>
        {selected && <span style={{width:8,height:8,borderRadius:"50%",background:"#fff",display:"block"}}/>}
      </span>
      <span style={{ flex:1 }}>{label}</span>
    </button>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function VinysDiagnostic({ onComplete }) {
  const [phase, setPhase]                           = useState("area_select");
  const [area, setArea]                             = useState(null);
  const [originalArea, setOriginalArea]             = useState(null);
  const [crossoverTriggered, setCrossoverTriggered] = useState(false);
  const [crossoverTarget, setCrossoverTarget]       = useState(null);
  const [irritability, setIrritability]             = useState(0);
  const [intakeStep, setIntakeStep]                 = useState(0);
  const [postureIdx, setPostureIdx]                 = useState(0);
  const [qIdx, setQIdx]                             = useState(0);
  const [activePostures, setActivePostures]         = useState([]);
  const [sessionAnswers, setSessionAnswers]         = useState({});
  const [selected, setSelected]                     = useState(null);
  const [diagnosticOutput, setDiagnosticOutput]     = useState(null);
  const [showingVideo, setShowingVideo]             = useState(true); // video/instructions sub-phase

  const areaLabel = area ? AREA_CONFIG[area].label.toLowerCase() : "this area";
  const INTAKE = [
    { id:"irritability", label:"1 of 2",
      q:`How does your ${areaLabel} respond to movement?`,
      opts:["Almost not sensitive — I can move quite freely","Slightly sensitive — some movements are uncomfortable","Sensitive — many movements cause pain","Very sensitive — even small movement worsens the pain"] },
    { id:"vEcovery", label:"2 of 2",
      q:"When pain appears, how long does it usually take to settle?",
      opts:["A few seconds","A few minutes","An hour or more","Hard to say"] },
  ];

  function getIrritabilityFromAnswer(ans) {
    if (ans === "Almost not sensitive — I can move quite freely") return 0;
    if (ans === "Slightly sensitive — some movements are uncomfortable") return 1;
    if (ans === "Sensitive — many movements cause pain") return 2;
    return 3;
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

  // ── PHASE: AREA SELECTION ──────────────────────────────────────────────────
  if (phase === "area_select") {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", justifyContent:"center", alignItems:"flex-start", padding:"36px 20px 40px" }}>
        <div style={{ width:"100%", maxWidth:460 }}>
          <div style={{ marginBottom:32 }}>
            <div style={{ display:"inline-block", padding:"5px 14px", borderRadius:20, background:C.primaryLight, marginBottom:16 }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.primary, letterSpacing:1, textTransform:"uppercase" }}>Movement Assessment</span>
            </div>
            <div style={{ fontSize:28, fontWeight:800, color:C.text, lineHeight:1.2, marginBottom:10 }}>
              Where would you like to start?
            </div>
            <div style={{ fontSize:15, color:C.muted, lineHeight:1.65 }}>
              Select the area you'd like to assess. We'll guide you through a short movement screen to understand your pattern.
            </div>
          </div>

          {Object.entries(AREA_CONFIG).map(([id, cfg]) => (
            <button key={id} onClick={() => { setArea(id); setPhase("intake"); }}
              style={{
                width:"100%", padding:"20px 22px", marginBottom:12, borderRadius:18,
                border:`1.5px solid ${C.border}`, background:C.surface,
                display:"flex", alignItems:"center", gap:18,
                cursor:"pointer", textAlign:"left",
                transition:"all 0.15s ease",
                WebkitTapHighlightColor:"transparent",
                boxShadow:"0 1px 4px rgba(28,43,38,0.06)",
              }}>
              <div style={{
                width:48, height:48, borderRadius:12, flexShrink:0,
                background:`${cfg.color}12`,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <span style={{ fontSize:22 }}>{cfg.icon}</span>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:3 }}>{cfg.label}</div>
                <div style={{ fontSize:13, color:C.muted, lineHeight:1.4 }}>{AREA_DESC[id]}</div>
              </div>
              <span style={{ fontSize:20, color:"#C8C0B8", lineHeight:1 }}>›</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── PHASE: INTAKE ──────────────────────────────────────────────────────────
  if (phase === "intake") {
    const q = INTAKE[intakeStep];
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", justifyContent:"center", alignItems:"flex-start", padding:"36px 20px 40px" }}>
        <div style={{ width:"100%", maxWidth:460 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:30 }}>
            <div style={{ padding:"5px 14px", borderRadius:20, background:C.primaryLight }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.primary, letterSpacing:0.8, textTransform:"uppercase" }}>
                {AREA_CONFIG[area].label} · Setup
              </span>
            </div>
            <div style={{ fontSize:13, color:C.muted, fontWeight:600 }}>{q.label}</div>
          </div>

          <div style={{ fontSize:22, fontWeight:700, color:C.text, lineHeight:1.38, marginBottom:28 }}>{q.q}</div>

          {q.opts.map((opt, i) => (
            <OptionTile key={i} label={opt} selected={selected === opt} onClick={() => setSelected(opt)} />
          ))}

          <div style={{ marginTop:8 }}>
            <PrimaryBtn
              label={intakeStep < INTAKE.length-1 ? "Continue" : "Begin assessment →"}
              disabled={!selected}
              onClick={() => {
                const ans = selected;
                if (intakeStep === 0) setIrritability(getIrritabilityFromAnswer(ans));
                if (intakeStep < INTAKE.length-1) {
                  setIntakeStep(s => s+1);
                  setSelected(null);
                } else {
                  setSelected(null);
                  startPostures(area, irritability);
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── PHASE: POSTURES ────────────────────────────────────────────────────────
  if (phase === "postures") {
    const posture = activePostures[postureIdx];
    if (!posture) return null;
    const q = posture.qs[qIdx];
    const isLastQ = qIdx === posture.qs.length - 1;
    const isLastP = postureIdx === activePostures.length - 1;

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
        setQIdx(qi => qi+1);
        setSelected(null);
        return;
      }

      const effectiveArea = crossoverTriggered ? crossoverTarget : area;
      const allPostures = crossoverTriggered ? getCrossoverPostures(area) : getPosturesForArea(effectiveArea);
      const rebuilt = buildActivePostures(effectiveArea, allPostures, newAnswers, irritability);

      if (!isLastP) {
        const nextIdx = rebuilt.findIndex((p,i) => i > postureIdx) !== -1 ? postureIdx+1 : postureIdx;
        setActivePostures(rebuilt);
        setPostureIdx(nextIdx);
        setQIdx(0);
        setSelected(null);
        setShowingVideo(true);
      } else {
        const resolveArea = crossoverTriggered ? crossoverTarget : area;
        const scores = calculateScores(newAnswers, allPostures);
        const output = resolveProfile(resolveArea, scores, newAnswers, irritability);
        const result = { ...output, area: resolveArea, originalArea: crossoverTriggered ? area : null, crossoverTriggered };
        setDiagnosticOutput(result);
        setPhase("results");
      }
    }

    const progressTotal = activePostures.filter(p => !p.isSummary).length;

    // Summary posture
    if (posture.isSummary) {
      return (
        <div style={{ minHeight:"100vh", background:C.bg, display:"flex", justifyContent:"center", alignItems:"flex-start", padding:"36px 20px 40px" }}>
          <div style={{ width:"100%", maxWidth:460 }}>
            <div style={{ display:"inline-block", padding:"5px 14px", borderRadius:20, background:"#FFF3E8", marginBottom:24 }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.accent, letterSpacing:0.8, textTransform:"uppercase" }}>Final check-in</span>
            </div>
            <div style={{ fontSize:22, fontWeight:700, color:C.text, lineHeight:1.38, marginBottom:28 }}>{q.text}</div>
            {q.opts.map((opt, i) => (
              <OptionTile key={i} label={opt.t} selected={selected === opt.t} onClick={() => setSelected(opt.t)} />
            ))}
            <div style={{ marginTop:8 }}>
              <PrimaryBtn label="See your results →" disabled={!selected} onClick={() => handleAnswer(selected)} />
            </div>
          </div>
        </div>
      );
    }

    // ── VIDEO / INSTRUCTIONS sub-phase ────────────────────────────────────────
    if (showingVideo) {
      return (
        <div style={{ minHeight:"100vh", background:C.bg, display:"flex", justifyContent:"center", alignItems:"flex-start", padding:"28px 20px 40px" }}>
          <div style={{ width:"100%", maxWidth:460 }}>
            <div style={{ marginBottom:18 }}>
              <ProgressBar current={postureIdx} total={progressTotal} />
            </div>

            {crossoverTriggered && (
              <div style={{ marginBottom:16, padding:"10px 14px", borderRadius:12, background:"#FEF9E7", border:"1px solid #F0C060", fontSize:13, color:"#8A6A00", lineHeight:1.5 }}>
                We're checking a few more things to give you the most accurate result.
              </div>
            )}

            {/* Video player */}
            <VideoCard posture={posture} />

            {/* Instructions */}
            {posture.how && (
              <div style={{
                marginTop:16, padding:"20px 22px", borderRadius:16,
                background:C.surface, border:`1px solid ${C.border}`,
                boxShadow:"0 1px 6px rgba(28,43,38,0.07)",
              }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.primary, letterSpacing:1.2, textTransform:"uppercase", marginBottom:10 }}>
                  How to do this exercise
                </div>
                <div style={{ fontSize:15, color:C.text, lineHeight:1.7 }}>{posture.how}</div>
              </div>
            )}

            <div style={{ marginTop:20 }}>
              <PrimaryBtn label="Done — answer assessment questions →" onClick={() => setShowingVideo(false)} />
            </div>
          </div>
        </div>
      );
    }

    // ── QUESTIONS sub-phase ──────────────────────────────────────────────────
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", justifyContent:"center", alignItems:"flex-start", padding:"28px 20px 40px" }}>
        <div style={{ width:"100%", maxWidth:460 }}>
          {/* Mini posture header */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22, padding:"14px 18px", borderRadius:14, background:C.surface, border:`1px solid ${C.border}` }}>
            <div style={{
              width:38, height:38, borderRadius:10, flexShrink:0,
              background:`linear-gradient(135deg, ${posture.grad[0]}, ${posture.grad[1]})`,
            }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{posture.name}</div>
              {posture.subtitle && (
                <div style={{ fontSize:12, color:C.muted }}>{posture.subtitle.replace(/★.*/, "").trim()}</div>
              )}
            </div>
            <button
              onClick={() => setShowingVideo(true)}
              style={{ fontSize:12, color:C.primary, fontWeight:600, background:"none", border:"none", cursor:"pointer", padding:"4px 8px", borderRadius:8, background:C.primaryLight }}
            >
              ← Back
            </button>
          </div>

          {/* Question card */}
          <div style={{
            padding:"20px 22px", borderRadius:16,
            background:C.surface, border:`1px solid ${C.border}`,
            marginBottom:20, boxShadow:"0 1px 6px rgba(28,43,38,0.07)",
          }}>
            {posture.qs.length > 1 && (
              <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>
                Question {qIdx+1} of {posture.qs.length}
              </div>
            )}
            <div style={{ fontSize:17, fontWeight:700, color:C.text, lineHeight:1.45 }}>{q.text}</div>
          </div>

          {q.opts.map((opt, i) => (
            <OptionTile key={i} label={opt.t} selected={selected === opt.t} onClick={() => setSelected(opt.t)} />
          ))}

          <div style={{ marginTop:8 }}>
            <PrimaryBtn
              label={isLastP && isLastQ ? "See my results →" : "Next"}
              disabled={!selected}
              onClick={() => { handleAnswer(selected); setSelected(null); }}
            />
          </div>

          {postureIdx > 0 && (
            <div style={{ marginTop:16, textAlign:"center", fontSize:13, color:C.muted, fontStyle:"italic" }}>
              {AFFIRMATIONS[Math.min(postureIdx-1, AFFIRMATIONS.length-1)]}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── PHASE: RESULTS ─────────────────────────────────────────────────────────
  if (phase === "results" && diagnosticOutput) {
    const { primary, secondary, confidence, reassess, scores, area: resultArea, originalArea: origArea, crossoverTriggered: crossed } = diagnosticOutput;
    const prof = PROFILE_DATA[resultArea]?.[primary];
    const secProf = secondary ? PROFILE_DATA[resultArea]?.[secondary] : null;
    if (!prof) return <div style={{ padding:24, color:C.muted }}>No profile resolved.</div>;

    const confColor = confidence === "High" ? "#207890" : confidence === "Medium" ? "#B87028" : "#B83858";
    const confBg    = confidence === "High" ? "#EEF5FD" : confidence === "Medium" ? "#FDF4EE" : "#FDF0F3";

    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", justifyContent:"center", alignItems:"flex-start", padding:"36px 20px 48px" }}>
        <div style={{ width:"100%", maxWidth:460 }}>

          {/* Completion badge */}
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"8px 20px", borderRadius:24, background:C.primaryLight }}>
              <span style={{ fontSize:15, color:C.primary }}>✓</span>
              <span style={{ fontSize:13, fontWeight:700, color:C.primary, letterSpacing:0.8 }}>Assessment complete</span>
            </div>
          </div>

          {crossed && (
            <div style={{ marginBottom:18, padding:"14px 18px", borderRadius:14, background:"#FEF9E7", border:"1px solid #F0C060", fontSize:14, color:"#8A6A00", lineHeight:1.6 }}>
              <strong>Note:</strong> Your symptoms appear to originate in your {AREA_CONFIG[AREA_CONFIG[origArea]?.crossoverTo || "LB"]?.label}. Your practice plan is designed accordingly.
            </div>
          )}

          {/* Primary profile card */}
          <div style={{ borderRadius:20, background:prof.bg, border:`2px solid ${prof.color}25`, padding:"26px 24px 22px", marginBottom:14, boxShadow:`0 4px 20px ${prof.color}15` }}>
            <div style={{ fontSize:11, color:prof.color, fontWeight:700, letterSpacing:1.3, textTransform:"uppercase", marginBottom:8 }}>
              {AREA_CONFIG[resultArea]?.label} · Your movement pattern
            </div>
            <div style={{ fontSize:28, fontWeight:800, color:prof.color, lineHeight:1.15, marginBottom:8 }}>{prof.name}</div>
            <div style={{ fontSize:15, color:`${prof.color}CC`, lineHeight:1.6 }}>{prof.sub}</div>
            {prof.tag && (
              <div style={{ marginTop:14, display:"inline-block", padding:"5px 14px", borderRadius:20, background:`${prof.color}15`, fontSize:12, color:prof.color, fontWeight:700, letterSpacing:0.5 }}>
                {prof.tag}
              </div>
            )}
          </div>

          {/* Confidence + secondary */}
          <div style={{ display:"flex", gap:10, marginBottom:14 }}>
            <div style={{ flex:1, borderRadius:14, background:confBg, border:`1.5px solid ${confColor}30`, padding:"14px 16px" }}>
              <div style={{ fontSize:11, color:confColor, fontWeight:700, letterSpacing:0.8, textTransform:"uppercase", marginBottom:4 }}>Confidence</div>
              <div style={{ fontSize:18, fontWeight:800, color:confColor }}>{confidence}</div>
            </div>
            {secProf && (
              <div style={{ flex:2, borderRadius:14, background:secProf.bg, border:`1.5px solid ${secProf.color}30`, padding:"14px 16px" }}>
                <div style={{ fontSize:11, color:secProf.color, fontWeight:700, letterSpacing:0.8, textTransform:"uppercase", marginBottom:4 }}>Secondary pattern</div>
                <div style={{ fontSize:16, fontWeight:700, color:secProf.color }}>{secProf.name}</div>
              </div>
            )}
          </div>

          {reassess && (
            <div style={{ marginBottom:14, padding:"14px 18px", borderRadius:14, background:"#FDF0F3", border:"1.5px solid #B8385825", fontSize:14, color:"#B83858", lineHeight:1.6 }}>
              We'll start with a gentle session and refine your profile after 2–3 sessions.
            </div>
          )}

          {/* Insights */}
          <div style={{ borderRadius:16, background:C.surface, border:`1px solid ${C.border}`, padding:"20px 22px", marginBottom:14, boxShadow:"0 1px 6px rgba(28,43,38,0.07)" }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.text, marginBottom:16, textTransform:"uppercase", letterSpacing:1.2 }}>What this means for you</div>
            {prof.insights.map((insight, i) => (
              <div key={i} style={{ display:"flex", gap:12, marginBottom: i < prof.insights.length-1 ? 14 : 0, alignItems:"flex-start" }}>
                <div style={{
                  width:22, height:22, borderRadius:"50%", background:C.primaryLight,
                  flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", marginTop:1,
                }}>
                  <span style={{ color:C.primary, fontWeight:800, fontSize:11 }}>→</span>
                </div>
                <span style={{ fontSize:14, color:C.text, lineHeight:1.65 }}>{insight}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ marginTop:8 }}>
            <PrimaryBtn
              label="Build my practice plan →"
              onClick={() => onComplete && onComplete(diagnosticOutput)}
            />
          </div>
          <div style={{ marginTop:10 }}>
            <GhostBtn
              label="Retake assessment"
              onClick={() => {
                setPhase("area_select"); setArea(null); setOriginalArea(null);
                setCrossoverTriggered(false); setCrossoverTarget(null);
                setIrritability(0); setIntakeStep(0);
                setPostureIdx(0); setQIdx(0);
                setActivePostures([]); setSessionAnswers({});
                setSelected(null); setDiagnosticOutput(null);
                setShowingVideo(true);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
