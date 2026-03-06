interface Props {
  current: number;
  total: number;
}

export default function FlowProgress({ current, total }: Props) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {Array.from({ length: total }, (_, i) => {
        const stepNum = i + 1;
        const isPast = stepNum < current;
        const isCurrent = stepNum === current;

        return (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              isCurrent
                ? "w-8 bg-primary"
                : isPast
                ? "w-3 bg-primary/40"
                : "w-3 bg-border"
            }`}
            aria-label={`Step ${stepNum}`}
            aria-current={isCurrent ? "step" : undefined}
          />
        );
      })}
    </div>
  );
}
