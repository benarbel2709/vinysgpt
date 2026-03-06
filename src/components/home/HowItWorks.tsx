import { motion } from "framer-motion";

const STEPS = [
  { num: 1, title: "Tell us how your body is doing", desc: "Your condition, energy level, available time, and equipment." },
  { num: 2, title: "Get a session built for you", desc: "A session drawn from a therapeutic exercise library built around your condition — matched to your body and how you're feeling today." },
  { num: 3, title: "Adjust daily, progress consistently", desc: "After each session, note how you felt.", desc2: "Your plan evolves week to week." },
];

export default function HowItWorks() {
  return (
    <section id="how-section" className="w-full vinys-section" style={{ background: "hsl(var(--surface-soft))" }}>
      <div className="vinys-container">
        <h2 className="font-display font-bold text-foreground text-center mb-8" style={{ fontSize: "clamp(24px, 2.8vw, 32px)" }}>
          How it works
        </h2>
        <div className="flex flex-col sm:flex-row items-start gap-10 sm:gap-0 max-w-[900px] mx-auto">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="text-center flex-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-base font-bold mx-auto mb-3">
                {step.num}
              </div>
              <h3 className="font-display font-bold text-secondary text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed px-2">{step.desc}</p>
              {step.desc2 && <p className="text-sm text-muted-foreground leading-relaxed px-2 mt-2">{step.desc2}</p>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
