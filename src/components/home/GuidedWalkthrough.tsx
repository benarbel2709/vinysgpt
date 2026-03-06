import { motion } from "framer-motion";

const STEPS = [
  { num: 1, title: "Tell Vinys about your body", desc: "Choose your condition, current discomfort level, available time, and equipment." },
  { num: 2, title: "A session is generated for you", desc: "Vinys builds a structured session using a therapeutic movement library designed for specific conditions." },
  { num: 3, title: "Practice at your own pace", desc: "Follow guided movement demonstrations and breath cues." },
  { num: 4, title: "Your practice adapts over time", desc: "After each session you record how your body responded.", desc2: "Future sessions evolve based on your feedback." },
];

export default function GuidedWalkthrough() {
  return (
    <section className="w-full vinys-section">
      <div className="vinys-container">
        <h2 className="font-display font-bold text-foreground text-center mb-3" style={{ fontSize: "clamp(24px, 2.8vw, 32px)" }}>
          See how Vinys adapts to your body
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-10 max-w-[540px] mx-auto leading-relaxed">
          Vinys creates a yoga practice that adapts to your condition, your energy level, and how your body responds over time.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[960px] mx-auto">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="text-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
            >
              <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-base font-bold mx-auto mb-3">
                {step.num}
              </div>
              <h3 className="font-display font-bold text-secondary text-[15px] mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed px-2">{step.desc}</p>
              {"desc2" in step && step.desc2 && <p className="text-sm text-muted-foreground leading-relaxed px-2 mt-2">{step.desc2}</p>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
