import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Share2, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function CompletePage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const plan = state.currentPlan;

  useEffect(() => { document.title = "Practice Complete — Vinys"; }, []);

  const completedThisWeek = plan?.sessions.filter((s) => s.status === "done").length || 0;
  const totalThisWeek = plan?.sessions.length || 0;
  const sessionDuration = plan?.sessions.find(s => s.status === "done")?.durationMinutes || state.profile.minutesPerSession;

  const shareText = `I just completed a Vinys adaptive yoga session. ${sessionDuration} min · ${state.profile.conditions?.map(c => c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())).join(", ") || "Therapeutic"} program · vinys.app`;

  const handleShare = useCallback(async () => {
    const shareData = {
      title: "I just completed a Vinys session",
      text: shareText,
      url: "https://vinys.app",
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        toast({ title: "Copied!", description: "Link copied to clipboard" });
      }
    } catch {
      // user cancelled
    }
  }, [shareText]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
          <CheckCircle2 size={32} className="text-secondary" />
        </div>
        <h1 className="font-display text-foreground font-bold text-3xl mb-2">Practice complete!</h1>
        <p className="text-muted-foreground text-base mb-1">
          {completedThisWeek} of {totalThisWeek} sessions completed this week.
        </p>
        <p className="text-muted-foreground text-sm mb-8">
          {sessionDuration} minutes · {state.profile.conditions?.length || 0} condition{(state.profile.conditions?.length || 0) !== 1 ? "s" : ""}
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button variant="hero" size="lg" className="gap-2 w-full" onClick={() => navigate("/plan")}>
            Return to my plan
            <ArrowRight size={16} />
          </Button>
          <Button variant="outline" size="lg" className="gap-2 w-full" onClick={handleShare}>
            <Share2 size={16} />
            Share your progress
          </Button>
        </div>
      </div>
    </Layout>
  );
}
