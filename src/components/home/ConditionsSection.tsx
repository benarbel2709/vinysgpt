import ConditionCategoryGrid from "@/components/ConditionCategoryGrid";

export default function ConditionsSection() {
  return (
    <section id="conditions-section" className="w-full vinys-section">
      <div className="vinys-container">
        <h2 className="font-display font-bold text-foreground text-center mb-2" style={{ fontSize: "clamp(24px, 2.8vw, 32px)" }}>
          Designed for real physical conditions.
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-8 max-w-[520px] mx-auto leading-relaxed">
          Vinys supports many movement-related conditions. Here are some common examples.
        </p>
        <ConditionCategoryGrid />
        <p className="text-sm text-muted-foreground text-center mt-6">
          And many other movement-related conditions.
        </p>
      </div>
    </section>
  );
}
