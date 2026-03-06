import { motion } from "framer-motion";

const FLOW_STEPS = [
  "User inputs",
  "Condition profile",
  "Therapeutic movement library",
  "Safety filtering",
  "Session generation",
  "Feedback loop",
  "Adaptive progression",
];

export default function SessionFlowVisual() {
  return (
    <section className="w-full vinys-section" style={{ background: "hsl(var(--surface-soft))" }}>
      <div className="vinys-container max-w-[600px]">
        <h2 className="font-display font-bold text-foreground text-center mb-3" style={{ fontSize: "clamp(24px, 2.8vw, 32px)" }}>
          How your session is built
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-10 max-w-[520px] mx-auto leading-relaxed">
          Vinys combines your inputs with a condition-specific movement library to generate a session designed for your body and your current capacity.
        </p>
        <div className="flex flex-col items-center gap-0">
          {FLOW_STEPS.map((step, i) => (
            <motion.div
              key={step}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              <div
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-foreground text-center"
                style={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  minWidth: "220px",
                }}
              >
                {step}
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <div className="text-muted-foreground/50 text-lg leading-none py-1">↓</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
