export default function ViniyogaSection() {
  return (
    <section className="w-full vinys-section" style={{ background: "hsl(var(--surface-soft))" }}>
      <div className="vinys-container max-w-3xl">
        <h2 className="font-display font-bold text-foreground text-center mb-6" style={{ fontSize: "clamp(24px, 2.8vw, 32px)" }}>
          Rooted in Viniyoga
        </h2>
        <div className="text-[15px] text-muted-foreground leading-relaxed max-w-[600px] mx-auto space-y-4 text-center sm:text-left">
          <p>Vinys is built on the principles of Viniyoga, a tradition developed by T.K.V. Desikachar, who believed that yoga must adapt to the individual — never the other way around.</p>
          <p>Breath leads movement. Function matters more than form. Progression serves the person, not the pose.</p>
        </div>
        <blockquote className="max-w-[520px] mx-auto text-center my-8">
          <p className="italic text-foreground/90" style={{ fontSize: "clamp(17px, 1.8vw, 20px)", lineHeight: 1.5 }}>
            "The greatness of yoga is its adaptability."
          </p>
          <p className="italic text-muted-foreground mt-2 text-sm">T.K.V. Desikachar</p>
        </blockquote>

        <div className="border-t border-border pt-8 mt-4">
          <h3 className="font-display font-bold text-foreground text-center mb-4" style={{ fontSize: "clamp(18px, 2vw, 22px)" }}>
            Why Viniyoga — and not any other tradition?
          </h3>
          <p className="text-muted-foreground leading-relaxed max-w-[600px] mx-auto text-center" style={{ fontSize: "16px" }}>
            Most yoga styles ask you to adapt to the practice. Viniyoga does the opposite. Developed by T.K.V. Desikachar over decades of one-on-one therapeutic work, it is the only classical tradition built entirely around the individual — their condition, their breath, their moment. It is the foundation chosen by physical therapists, occupational therapists, and yoga therapists worldwide precisely because it prioritizes function over form, and safety over aesthetics. Vinys was built on this tradition because nothing else comes close for people navigating real physical and emotional challenges.
          </p>
        </div>
      </div>
    </section>
  );
}
