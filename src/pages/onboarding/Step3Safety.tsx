import EnergyFlareSelector from "@/components/onboarding/EnergyFlareSelector";
import { RED_FLAGS } from "@/constants/conditions";
import { Check } from "lucide-react";
import type { EnergyLevel } from "@/constants/conditions";

interface Props {
  energyLevel: EnergyLevel;
  onEnergyChange: (level: EnergyLevel) => void;
  flareToday: boolean;
  onFlareChange: (flare: boolean) => void;
  redFlags: string[];
  onToggleFlag: (flag: string) => void;
}

export default function Step3Safety({
  energyLevel, onEnergyChange,
  flareToday, onFlareChange,
  redFlags, onToggleFlag,
}: Props) {
  return (
    <div className="space-y-8">
      {/* Energy & Flare */}
      <EnergyFlareSelector
        energyLevel={energyLevel}
        onEnergyChange={onEnergyChange}
        flareToday={flareToday}
        onFlareChange={onFlareChange}
      />

      {/* Safety check */}
      <div className="space-y-3">
        <h2 className="text-foreground font-bold text-center text-lg">Safety check</h2>
        <p className="text-sm text-muted-foreground text-center">
          Are you experiencing any of the following right now?
        </p>
        {RED_FLAGS.map((flag) => {
          const isChecked = redFlags.includes(flag);
          return (
            <label
              key={flag}
              className={`flex items-center gap-3 cursor-pointer p-4 rounded-[12px] border-2 transition-all ${
                isChecked
                  ? "border-accent bg-accent/10"
                  : "border-border bg-card"
              }`}
            >
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                isChecked
                  ? "border-accent bg-accent"
                  : "border-border bg-card"
              }`}>
                {isChecked && <Check size={14} className="text-white" strokeWidth={3} />}
              </div>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggleFlag(flag)}
                className="sr-only"
              />
              <span className="text-[15px] font-medium text-foreground">{flag}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
