import { motion } from "framer-motion";
import { User, ShieldCheck, Sun } from "lucide-react";

const STATS = [
  {
    icon: <User size={28} className="text-secondary" />,
    label: "Made for you, today",
    desc: "Built around your condition, your energy level, and how much time you actually have — not a program you have to adapt yourself.",
  },
  {
    icon: <Sun size={28} className="text-secondary" />,
    label: "Fits into your day, any day",
    desc: "Ten minutes before work or thirty minutes on the weekend — Vinys adapts to your time and space.",
    desc2: "No studio, no booking, no fixed schedule.",
  },
  {
    icon: <ShieldCheck size={28} className="text-secondary" />,
    label: "Safe, effective, and you'll feel it",
    desc: "Every exercise is matched to what your body can handle right now. After each session, your plan responds — getting smarter about what works for you.",
  },
];

export default function SocialProof() {
  return (
    <section className="w-full vinys-section">
      <div className="vinys-container">
        <h2 className="font-display font-bold text-foreground text-center mb-8" style={{ fontSize: "clamp(24px, 2.8vw, 32px)" }}>
          Your body. Your practice. Your pace.
        </h2>
        <div className="grid sm:grid-cols-3 gap-6 max-w-[900px] mx-auto">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center px-4"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
            >
              <div className="flex justify-center mb-3">{stat.icon}</div>
              <h3 className="font-display font-bold text-secondary mb-2" style={{ fontSize: "18px" }}>{stat.label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{stat.desc}</p>
              {stat.desc2 && <p className="text-sm text-muted-foreground leading-relaxed mt-2">{stat.desc2}</p>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
