import { motion } from "framer-motion";
import { ShieldCheck, Heart, TrendingUp } from "lucide-react";

const STEPS = [
  { num: 1, title: "Tell us about your body", desc: "Conditions, energy level, available time." },
  { num: 2, title: "Get your personalised session", desc: "Built instantly from a therapeutic movement library." },
  { num: 3, title: "Practice and evolve", desc: "Each session adapts based on how your body responds." },
];

const DIFFERENTIATORS = [
  { icon: ShieldCheck, title: "Safety-first movement filtering", desc: "Movements that conflict with your condition are excluded automatically." },
  { icon: Heart, title: "Condition-aware sessions", desc: "Every session is assembled from exercises matched to your specific needs." },
  { icon: TrendingUp, title: "Adapts over time", desc: "Your practice evolves based on real feedback — not an arbitrary schedule." },
];

export default function GuidedWalkthrough() {
  return (
    <section id="how-it-works" className="w-full vinys-section">
      <div className="vinys-container">
        <h2 className="font-display font-bold text-foreground text-center mb-10" style={{ fontSize: "clamp(24px, 2.8vw, 32px)" }}>
          How it works
        </h2>

        {/* 3 numbered steps */}
        <div className="grid sm:grid-cols-3 gap-6 max-w-[800px] mx-auto mb-12">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="text-center"
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
            >
              <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-base font-bold mx-auto mb-3">
                {step.num}
              </div>
              <h3 className="font-display font-bold text-secondary text-[15px] mb-1.5">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed px-2">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Why it's different row */}
        <div className="border-t border-border/50 pt-8 max-w-[800px] mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground text-center mb-6">
            Why it's different
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {DIFFERENTIATORS.map((d, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3"
                initial={{ opacity: 1 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <d.icon size={16} className="text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">{d.title}</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{d.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
