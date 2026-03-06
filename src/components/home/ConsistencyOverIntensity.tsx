import { motion } from "framer-motion";

export default function ConsistencyOverIntensity() {
  return (
    <section className="w-full vinys-section" style={{ background: "hsl(var(--surface-soft))" }}>
      <div className="vinys-container max-w-[640px]">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="font-display font-bold text-foreground mb-4" style={{ fontSize: "clamp(24px, 2.8vw, 32px)" }}>
            Consistency matters more than intensity
          </h2>
          <div className="text-[15px] text-muted-foreground leading-relaxed space-y-4 text-center sm:text-left">
            <p>For many people navigating pain, fatigue, or recovery, the biggest challenge is not motivation — it is finding a practice that works with their body.</p>
            <p>Vinys focuses on creating sessions that are achievable and sustainable so that practice becomes consistent over time.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
