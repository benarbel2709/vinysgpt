import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";
import { AlertTriangle } from "lucide-react";

export default function MedicalStop() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full" style={{ backgroundColor: "rgba(217,209,197,0.40)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center justify-between h-[72px] px-6 max-w-5xl mx-auto">
          <BrandLogo size="md" linkToHome={false} />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 space-y-6 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-destructive/8 flex items-center justify-center">
          <AlertTriangle size={36} className="text-destructive" />
        </div>

        <h1 className="font-display text-foreground font-bold text-2xl">Please consult a medical professional</h1>

        <p className="text-muted-foreground text-base leading-relaxed">
          Based on your selection, we can't safely continue. Please speak with a clinician before practicing.
        </p>

        <Button variant="hero" size="lg" onClick={() => navigate("/")} className="w-full max-w-xs">
          Return to home
        </Button>
      </main>
    </div>
  );
}
