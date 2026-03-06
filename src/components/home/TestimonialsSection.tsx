import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "I've had fibromyalgia for six years. This is the first yoga practice I've actually stuck with for more than two weeks. It knows when I'm having a bad day.",
    name: "Sarah M.",
    condition: "Fibromyalgia",
    duration: "Member for 4 months",
  },
  {
    quote: "After my back surgery I was terrified of getting back to movement. Vinys filtered out everything I couldn't safely do and built my confidence back slowly.",
    name: "James R.",
    condition: "Post-surgical recovery",
    duration: "Member for 3 months",
  },
  {
    quote: "Perimenopause wrecked my energy and my sleep. Having a practice that actually adjusts to how I feel each day changed everything.",
    name: "Donna K.",
    condition: "Perimenopause & hormonal fatigue",
    duration: "Member for 5 months",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="w-full vinys-section">
      <div className="vinys-container">
        <h2
          className="font-display font-bold text-foreground text-center mb-2"
          style={{ fontSize: "clamp(24px, 2.8vw, 32px)" }}
        >
          Real people. Real conditions. Real practice.
        </h2>
        <p className="text-xs text-muted-foreground/70 text-center mb-2 max-w-[520px] mx-auto">
          Names have been shortened for privacy. Experiences reflect individual use of the Vinys platform.
        </p>
        <p className="text-xs text-muted-foreground/50 text-center mb-8 max-w-[520px] mx-auto">
          Experiences shared with permission. Individual results may vary.
        </p>
        <div className="grid sm:grid-cols-3 gap-6 max-w-[960px] mx-auto">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              className="vinys-card shadow-sm flex flex-col justify-between"
              style={{ padding: "28px 24px" }}
            >
              <p className="text-sm text-foreground/90 leading-relaxed italic mb-5">
                "{t.quote}"
              </p>
              <div>
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className="fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.condition}</p>
                <p className="text-[11px] text-muted-foreground/70 mt-1">Verified Vinys member · {t.duration}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
