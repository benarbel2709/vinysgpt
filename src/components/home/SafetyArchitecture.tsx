import { motion } from "framer-motion";
import { ShieldCheck, Filter, TrendingUp, Clock, Heart } from "lucide-react";

const POINTS = [
  {
    icon: <ShieldCheck size={20} className="text-secondary" />,
    title: "Condition-aware session generation",
    desc: "Sessions are assembled using condition-specific movement libraries.",
  },
  {
    icon: <Filter size={20} className="text-secondary" />,
    title: "Safety-first movement filtering",
    desc: "Movements that may conflict with certain conditions are excluded automatically.",
  },
  {
    icon: <TrendingUp size={20} className="text-secondary" />,
    title: "Gradual progression",
    desc: "Sessions evolve slowly based on feedback and consistency.",
  },
  {
    icon: <Clock size={20} className="text-secondary" />,
    title: "Short, realistic sessions",
    desc: "Sessions are designed to fit into real schedules — even on low-energy days.",
  },
  {
    icon: <Heart size={20} className="text-secondary" />,
    title: "Adaptation over perfection",
    desc: "The system prioritizes safe progress over ideal performance.",
  },
];

export default function SafetyArchitecture() {
  return (
    <section className="w-full vinys-section">
      <div className="vinys-container max-w-[720px]">
        <h2 className="font-display font-bold text-foreground text-center mb-3" style={{ fontSize: "clamp(24px, 2.8vw, 32px)" }}>
          Designed with safety in mind
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-10 max-w-[560px] mx-auto leading-relaxed">
          Vinys was built to support people navigating physical limitations, recovery, and fluctuating energy levels. Each session prioritizes relevance, gradual progression, and safe movement selection.
        </p>
        <div className="space-y-5">
          {POINTS.map((point, i) => (
            <motion.div
              key={point.title}
              className="flex items-start gap-4"
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              <div className="flex-shrink-0 mt-0.5">{point.icon}</div>
              <div>
                <h3 className="font-display font-bold text-foreground text-[15px] mb-1">{point.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{point.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
