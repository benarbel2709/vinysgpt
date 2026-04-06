import { useApp } from "@/context/AppContext";

const STAGES = [
  { label: "Stage 1", threshold: 5 },
  { label: "Stage 2", threshold: 12 },
  { label: "Stage 3", threshold: null },
];

export default function StageProgressIndicator() {
  const { state } = useApp();
  const stage = state.stage ?? 1;
  const count = state.session_count ?? 0;

  // Progress within current stage
  let stageStart: number;
  let stageEnd: number;
  let sessionsInStage: number;
  let progressInStage: number;

  if (stage === 1) {
    stageStart = 0;
    stageEnd = 5;
    sessionsInStage = count;
    progressInStage = Math.min(count / 5, 1);
  } else if (stage === 2) {
    stageStart = 5;
    stageEnd = 12;
    sessionsInStage = count - 5;
    progressInStage = Math.min(sessionsInStage / 7, 1);
  } else {
    stageStart = 12;
    stageEnd = 0;
    sessionsInStage = count - 12;
    progressInStage = 1;
  }

  const progressLabel =
    stage === 3
      ? `Session ${count} — Stage 3`
      : `Session ${count} of ${stageEnd} — Stage ${stage}`;

  return (
    <div className="w-full">
      {/* Stage pills */}
      <div className="flex gap-2 mb-3">
        {STAGES.map((s, i) => {
          const stageNum = i + 1;
          const isCurrent = stage === stageNum;
          const isCompleted = stage > stageNum;

          return (
            <div
              key={stageNum}
              className="flex-1 text-center py-1.5 rounded-full text-xs font-semibold transition-all"
              style={
                isCurrent
                  ? { backgroundColor: "#0D9488", color: "#fff" }
                  : isCompleted
                  ? { backgroundColor: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }
                  : { border: "1.5px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))", backgroundColor: "transparent" }
              }
            >
              {s.label}
            </div>
          );
        })}
      </div>

      {/* Progress text */}
      <p className="text-xs text-muted-foreground text-center mb-2">{progressLabel}</p>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(var(--muted))" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progressInStage * 100}%`, backgroundColor: "#0D9488" }}
        />
      </div>
    </div>
  );
}