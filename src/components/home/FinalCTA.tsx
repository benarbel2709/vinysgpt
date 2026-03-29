import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useGetStarted } from "@/hooks/useGetStarted";
import NewProgramModal from "@/components/home/NewProgramModal";

export default function FinalCTA() {
  const { showModal, setShowModal, handleGetStarted, handleConfirmRestart } = useGetStarted();

  return (
    <>
      <section className="w-full vinys-section">
        <div className="vinys-container max-w-2xl text-center">
          <h2 className="font-display font-bold text-foreground mb-3" style={{ fontSize: "clamp(28px, 3vw, 34px)" }}>
            Meet your body where it is today.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-[560px] mx-auto leading-relaxed" style={{ fontSize: "clamp(17px, 1.8vw, 20px)" }}>
            A therapeutic yoga practice built around your condition, your energy, and your pace — starting now.
          </p>
          <Button onClick={handleGetStarted} variant="hero" size="lg" className="gap-2">
            Start My Plan
            <ArrowRight size={16} />
          </Button>
        </div>
      </section>
      <NewProgramModal open={showModal} onOpenChange={setShowModal} onConfirm={handleConfirmRestart} />
    </>
  );
}
