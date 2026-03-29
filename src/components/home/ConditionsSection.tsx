import ConditionCategoryGrid from "@/components/ConditionCategoryGrid";

export default function ConditionsSection() {
  return (
    <section id="conditions-section" className="w-full vinys-section">
      <div className="vinys-container">
        <h2 className="font-display font-bold text-foreground text-center mb-2" style={{ fontSize: "clamp(24px, 2.8vw, 32px)" }}>
          Physical Conditions
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-8 max-w-[520px] mx-auto leading-relaxed">
          Vinys supports the following range of movement-related conditions:
        </p>
        <ConditionCategoryGrid />
        <p className="text-sm text-muted-foreground text-center mt-6">
          And many more.
        </p>
      </div>
    </section>
  );
}
