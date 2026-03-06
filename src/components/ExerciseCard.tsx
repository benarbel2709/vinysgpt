import { Exercise } from "@/types";
import { Wind, Move, Shield, Heart, ChevronDown, ChevronUp, Lightbulb, ShieldCheck } from "lucide-react";
import { useState } from "react";
import ExerciseVideoAnimation from "@/components/animations/ExerciseVideoAnimation";
import { MASTER_LOOKUP } from "@/data/exerciseAdapter";
import { EQUIPMENT_LABELS, CATEGORY_LABELS } from "@/constants/conditions";

const CATEGORY_ICONS = {
  breath: Wind,
  mobility: Move,
  stability: Shield,
  release: Heart,
};

const CATEGORY_COLORS: Record<string, string> = {
  breath: "bg-surface-soft text-accent",
  mobility: "bg-surface-sage text-secondary",
  stability: "bg-surface-gold text-accent",
  release: "bg-surface-warm text-foreground",
};

interface Props {
  exercise: Exercise;
  index: number;
  perExerciseMinutes: number;
  isActive?: boolean;
  onComplete?: () => void;
}

export default function ExerciseCard({ exercise, index, perExerciseMinutes, isActive, onComplete }: Props) {
  const [expanded, setExpanded] = useState(!!isActive);
  const colorClasses = CATEGORY_COLORS[exercise.category];
  const master = MASTER_LOOKUP[exercise.id];

  return (
    <div className={`card-premium overflow-hidden transition-all ${isActive ? "border-primary/40 shadow-calm-lg" : ""}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full p-4 flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex-shrink-0">{index + 1}</span>
          <div>
            <h3 className="font-bold text-foreground text-[15px]">{master?.title || exercise.name_he}</h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClasses}`}>{CATEGORY_LABELS[exercise.category]}</span>
              <span className="text-xs text-muted-foreground">{perExerciseMinutes} min</span>
              <span className="text-xs text-muted-foreground">
                {exercise.equipment.length > 0
                  ? exercise.equipment.map(eq => EQUIPMENT_LABELS[eq.toLowerCase()] || eq).join(", ")
                  : "No equipment needed"}
              </span>
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp size={18} className="text-muted-foreground flex-shrink-0" /> : <ChevronDown size={18} className="text-muted-foreground flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
          <ExerciseVideoAnimation exercise={exercise} />
          {master?.cue && <p className="text-[12px] italic text-muted-foreground text-center">{master.cue}</p>}
          <ol className="space-y-2.5 text-[15px] border-l-2 border-primary/20 pl-3">
            {(master?.instructions || exercise.steps_he).map((step, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="text-primary font-bold text-xs mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">{i + 1}</span>
                <span className="text-foreground leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
          {master?.breathing && (
            <div className="rounded-2xl px-4 py-2.5 flex items-center gap-2.5 bg-surface-warm">
              <Wind size={15} className="text-foreground flex-shrink-0 opacity-70" />
              <span className="text-[13px] font-medium text-foreground">{master.breathing}</span>
            </div>
          )}
          {master && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-secondary text-foreground">{master.reps}</span>
              <span className="text-xs text-muted-foreground">{master.range}</span>
            </div>
          )}
          <div className="rounded-2xl px-4 py-3 flex items-start gap-2.5 bg-surface-soft">
            <Lightbulb size={15} className="text-primary mt-0.5 flex-shrink-0" />
            <p className="text-[14px] text-muted-foreground">{master?.why || exercise.why_he}</p>
          </div>
          <div className="border-l-2 border-destructive/40 rounded-lg pl-3 py-2 flex items-start gap-2">
            <ShieldCheck size={14} className="text-destructive/60 mt-0.5 flex-shrink-0" />
            <span className="text-[13px] text-muted-foreground">{master?.safety || exercise.safety_he}</span>
          </div>
          {exercise.equipment.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {exercise.equipment.map((eq) => (
                <span key={eq} className="text-xs bg-surface-soft px-2.5 py-1 rounded-full text-foreground font-medium">{EQUIPMENT_LABELS[eq] || eq}</span>
              ))}
            </div>
          )}
          {isActive && onComplete && (
            <button onClick={(e) => { e.stopPropagation(); onComplete(); }}
              className="w-full py-2.5 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-colors border border-primary/20">
              Done with this exercise →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
