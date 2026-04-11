import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useGetStarted } from "@/hooks/useGetStarted";
import NewProgramModal from "@/components/home/NewProgramModal";

export default function HomeHero() {
  const { showModal, setShowModal, handleGetStarted, handleConfirmRestart } = useGetStarted();

  const handleSecondary = () => {
    document.getElementById("conditions")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <section className="relative w-full overflow-hidden" style={{ minHeight: "clamp(580px, 72vh, 780px)" }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("https://xyuvmzonhrrjslehggyo.supabase.co/storage/v1/object/public/public-assets/vinys-hero-darkwood-v3.png")`,
            backgroundSize: "cover",
            backgroundPosition: "center right",
          }}
        />
        <div
          className="absolute inset-0 z-[1]"
          style={{ background: "linear-gradient(to right, rgba(15,10,6,0.70) 0%, rgba(15,10,6,0.50) 35%, rgba(15,10,6,0.22) 60%, rgba(15,10,6,0.00) 80%)" }}
        />
        <div className="relative z-[2] flex items-end sm:items-center h-full vinys-container pb-12 sm:pb-0" style={{ paddingTop: "100px" }}>
          <div className="max-w-[520px] text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: "rgba(255,255,255,0.55)" }}>
              Therapeutic Yoga, Built for Your Body
            </p>
            <h1
              className="font-display font-extrabold text-white mb-4"
              style={{ fontSize: "clamp(32px, 4.2vw, 54px)", lineHeight: 1.15, letterSpacing: "-0.5px" }}
            >
              Yoga that adapts to you
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.5vw, 17px)", lineHeight: 1.6, maxWidth: "46ch", color: "rgba(255,255,255,0.72)" }}>
              You need a practice that actually knows your body — what it's carrying today, what it can handle safely, and how to move it forward.
            </p>
            <p className="font-bold" style={{ fontSize: "clamp(16px, 1.6vw, 19px)", color: "rgba(255,255,255,0.90)", marginTop: "10px" }}>
              That's Vinys.
            </p>
            <p className="mb-7" style={{ fontSize: "clamp(14px, 1.3vw, 15px)", lineHeight: 1.6, maxWidth: "46ch", color: "rgba(255,255,255,0.50)", marginTop: "8px", fontStyle: "italic" }}>
              Movement should support your body — not fight against it.
            </p>
            <div className="flex flex-col items-center sm:items-start gap-3">
              <Button onClick={handleGetStarted} variant="hero" size="lg" className="gap-2">
                Start My Plan
                <ArrowRight size={16} />
              </Button>
              <p className="text-xs text-white/50">Free to start — no credit card required.</p>
              <p className="text-xs text-white/40">Sessions run 10–30 minutes, or however long you choose.</p>
              <p className="text-xs text-white/35">No subscription needed to try it.</p>
              <button
                onClick={handleSecondary}
                className="text-sm font-semibold underline underline-offset-4 transition-colors"
                style={{ color: "rgba(255,255,255,0.80)" }}
              >
                See how it works ↓
              </button>
            </div>
          </div>
        </div>
      </section>
      <NewProgramModal open={showModal} onOpenChange={setShowModal} onConfirm={handleConfirmRestart} />
    </>
  );
}
