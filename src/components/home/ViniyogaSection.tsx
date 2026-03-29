export default function ViniyogaSection() {
  return (
    <section className="w-full vinys-section" style={{ background: "hsl(var(--surface-soft))" }}>
      <div className="vinys-container max-w-3xl">
        <h2 className="font-display font-bold text-foreground text-center mb-6" style={{ fontSize: "clamp(24px, 2.8vw, 32px)" }}>
          Rooted in Viniyoga
        </h2>
        <div className="text-[15px] text-muted-foreground leading-relaxed max-w-[600px] mx-auto space-y-4 text-center sm:text-left">
          <p>Vinys is built on principles from the Viniyoga tradition — a therapeutic approach developed by T.K.V. Desikachar.</p>
          <p>At its core, Viniyoga insists that the practice must adapt to the person — not the other way around.</p>
          <p>Breath leads movement. Function matters more than form. Progression serves the person, not the pose.</p>
          <p>This therapeutic orientation made Viniyoga the natural foundation for Vinys.</p>
        </div>
        <blockquote className="max-w-[520px] mx-auto text-center my-8">
          <p className="italic text-foreground/90" style={{ fontSize: "clamp(17px, 1.8vw, 20px)", lineHeight: 1.5 }}>
            "The greatness of yoga is its adaptability."
          </p>
          <p className="italic text-muted-foreground mt-2 text-sm">T.K.V. Desikachar</p>
        </blockquote>
      </div>
    </section>
  );
}
