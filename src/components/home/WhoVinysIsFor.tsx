import { motion } from "framer-motion";
import { Check } from "lucide-react";

const AUDIENCES = [
  "People living with chronic physical conditions",
  "People returning to movement after injury or illness",
  "People dealing with unpredictable energy levels",
  "People who want structured guidance — not generic yoga classes",
  "People who are tired of adapting themselves to a yoga program",
];

export default function WhoVinysIsFor() {
  return (
    <section className="w-full vinys-section" style={{ background: "hsl(var(--surface-soft))" }}>
      <div className="vinys-container max-w-[640px]">
        <h2 className="font-display font-bold text-foreground text-center mb-8" style={{ fontSize: "clamp(24px, 2.8vw, 32px)" }}>
          Who Vinys is for
        </h2>
        <div className="space-y-4">
          {AUDIENCES.map((item, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-3"
              initial={{ opacity: 1, x: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Check size={18} className="text-secondary flex-shrink-0 mt-0.5" />
              <p className="text-[15px] text-foreground/90 leading-relaxed">{item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
