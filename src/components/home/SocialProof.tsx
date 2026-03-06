import { motion } from "framer-motion";
import { User, ShieldCheck, Sun } from "lucide-react";

const STATS = [
  {
    icon: <User size={28} className="text-secondary" />,
    label: "Built around your body today",
    desc: "Your session is generated from your condition, your current energy level, and the time you actually have available.",
    desc2: "Vinys adapts to the body you have today — not the one a program assumes.",
  },
  {
    icon: <Sun size={28} className="text-secondary" />,
    label: "Fits into real life",
    desc: "Practice for ten minutes before work or thirty minutes on the weekend.",
    desc2: "No studio, no booking, and no fixed schedule.",
  },
  {
    icon: <ShieldCheck size={28} className="text-secondary" />,
    label: "Responsive over time",
    desc: "After each session, you record how your body responded.",
    desc2: "Vinys gradually adapts your practice so progression happens safely and consistently.",
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
