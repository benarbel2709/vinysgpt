import ConditionCategoryGrid from "@/components/ConditionCategoryGrid";

export default function ConditionsSection() {
  return (
    <section id="conditions-section" className="w-full vinys-section">
      <div className="vinys-container">
        <h2 className="font-display font-bold text-foreground text-center mb-2" style={{ fontSize: "clamp(24px, 2.8vw, 32px)" }}>
          Whatever your body is navigating, we built for that.
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-8 max-w-[520px] mx-auto leading-relaxed">
          Vinys was designed for people navigating real physical and emotional challenges. Your practice is adapted to your condition — not the other way around.
        </p>
        <ConditionCategoryGrid />
      </div>
    </section>
  );
}
