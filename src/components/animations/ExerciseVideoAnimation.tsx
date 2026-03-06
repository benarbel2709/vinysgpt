/**
 * ExerciseVideoAnimation — AI-generated video loops for exercises.
 * Falls back to ExerciseAnimationV7 (SVG) when no video is available.
 */

import { Exercise } from "@/types";
import { useRef, useState } from "react";
import ExerciseAnimationV7 from "./ExerciseAnimationV7";

// Import universal fallback video
import universalVideo from "@/assets/exercises/universal-fallback.mp4";

/** Map exercise ID to a specific video, falling back to universal */
function getVideoSrc(_exercise: Exercise): string {
  // TODO: map specific exercise IDs to their dedicated videos here
  // e.g. if (exercise.id === "breath_box") return breathBoxVideo;
  return universalVideo;
}

const CAT_BG: Record<string, string> = {
  breath: "from-blue-50/60 to-blue-100/30",
  mobility: "from-emerald-50/60 to-emerald-100/30",
  stability: "from-amber-50/60 to-amber-100/30",
  release: "from-purple-50/60 to-purple-100/30",
};

interface Props {
  exercise: Exercise;
  compact?: boolean;
  large?: boolean;
}

export default function ExerciseVideoAnimation({ exercise, compact, large }: Props) {
  const videoSrc = getVideoSrc(exercise);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  // Failed to load video — fall back to SVG
  if (videoError) {
    return <ExerciseAnimationV7 exercise={exercise} compact={compact} large={large} />;
  }

  if (compact) {
    return (
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          onError={() => setVideoError(true)}
        />
      </div>
    );
  }

  const bgTint = CAT_BG[exercise.category] || CAT_BG.mobility;
  const height = large ? 280 : 180;
  const isBreathing = exercise.category === "breath";

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden ${isBreathing ? "animate-breathing" : ""}`}
      style={{
        aspectRatio: "16 / 9",
        background: "linear-gradient(180deg, hsl(var(--surface-soft)), hsl(var(--surface-warm) / 0.4))",
      }}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-contain rounded-xl"
        onError={() => setVideoError(true)}
        aria-label={exercise.name_he}
      />
    </div>
  );
}
