import { motion } from "framer-motion";
import { ShieldCheck, Filter, TrendingUp, Clock } from "lucide-react";

const STEPS = [
  { num: 1, title: "Tell Vinys about you", desc: "Select your condition, discomfort level, current capacity, available time, and any equipment you have." },
  { num: 2, title: "Your session is built instantly", desc: "Vinys assembles a structured session from a therapeutic movement library matched to your condition." },
  { num: 3, title: "Practice at your own pace", desc: "Follow guided movement demonstrations and breath cues — no prior yoga experience needed." },
  { num: 4, title: "Your practice evolves with you", desc: "After each session, note how your body felt. Your next session adjusts based on that feedback." },
];

const HIGHLIGHTS = [
  { icon: ShieldCheck, text: "Every session is assembled from a movement library matched to your specific condition." },
  { icon: Filter, text: "Movements that may conflict with certain conditions are excluded automatically." },
  { icon: TrendingUp, text: "Your practice evolves slowly and deliberately, based on real feedback — not an arbitrary schedule." },
  { icon: Clock, text: "Sessions are designed for real life — including the days when energy is low." },
];

export default function GuidedWalkthrough() {
  return (
    <section id="how-it-works" className="w-full vinys-section">
      <div className="vinys-container">
        <h2 className="font-display font-bold text-foreground text-center mb-10" style={{ fontSize: "clamp(24px, 2.8vw, 32px)" }}>
          How it works
        </h2>

        {/* 4 numbered steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[960px] mx-auto mb-14">
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
              <h3 className="font-display font-bold text-secondary text-[15px] mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed px-2">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Key highlights */}
        <div className="max-w-[640px] mx-auto border-t border-border/50 pt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground text-center mb-5">
            Built with safety in mind
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {HIGHLIGHTS.map((h, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3"
                initial={{ opacity: 1 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <h.icon size={16} className="text-secondary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">{h.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
