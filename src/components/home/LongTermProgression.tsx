import { motion } from "framer-motion";

export default function LongTermProgression() {
  return (
    <section className="w-full vinys-section">
      <div className="vinys-container max-w-[640px]">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4 }}
        >
          <h2
            className="font-display font-bold text-foreground mb-4"
            style={{ fontSize: "clamp(24px, 2.8vw, 32px)" }}
          >
            A practice designed for the long term
          </h2>
          <div className="text-[15px] text-muted-foreground leading-relaxed space-y-4 text-center sm:text-left">
            <p>Real change rarely comes from intense programs.</p>
            <p>It comes from consistent practice that adapts to the body over time.</p>
            <p>Vinys focuses on creating sessions that people can sustain — even on difficult days.</p>
            <p>Over weeks and months, this consistency helps build strength, mobility, and confidence in movement again.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
