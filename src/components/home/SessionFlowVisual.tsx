import { motion } from "framer-motion";

const FLOW_STEPS = [
  "User Inputs",
  "Condition Profile",
  "Movement Library",
  "Safety Filtering",
  "Session Generation",
  "Feedback",
  "Adaptive Progression",
];

export default function SessionFlowVisual() {
  return (
    <section className="w-full vinys-section" style={{ background: "hsl(var(--surface-soft))" }}>
      <div className="vinys-container">
        <h2 className="font-display font-bold text-foreground text-center mb-3" style={{ fontSize: "clamp(24px, 2.8vw, 32px)" }}>
          How your session is built
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-10 max-w-[520px] mx-auto leading-relaxed">
          Vinys combines your inputs with a condition-specific movement library to generate a session tailored to your body and your current capacity.
        </p>

        {/* Horizontal flow — desktop */}
        <div className="hidden sm:flex items-center justify-center gap-0 flex-wrap">
          {FLOW_STEPS.map((step, i) => (
            <motion.div
              key={step}
              className="flex items-center"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
            >
              <div
                className="px-4 py-2 rounded-lg text-xs font-semibold text-foreground text-center whitespace-nowrap"
                style={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                }}
              >
                {step}
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <span className="text-muted-foreground/50 text-sm px-1.5">→</span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Vertical stacked flow — mobile */}
        <div className="flex sm:hidden flex-col items-center gap-0">
          {FLOW_STEPS.map((step, i) => (
            <div key={step} className="flex flex-col items-center">
              <div
                className="px-5 py-2.5 rounded-lg text-xs font-semibold text-foreground text-center"
                style={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                }}
              >
                {step}
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <span className="text-muted-foreground/50 text-sm py-1">↓</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
