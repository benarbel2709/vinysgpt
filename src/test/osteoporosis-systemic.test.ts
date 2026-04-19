import { describe, expect, it } from "vitest";
import { buildSession } from "@/engine/engine2_session_builder";

describe("systemic osteoporosis safety filtering", () => {
  it("builds a session without spinal-flexion pose families", () => {
    const result = buildSession({
      user_profile: [],
      stage: 1,
      experience_level: "beginner",
      duration_minutes: 20,
      conditions: ["osteoporosis"],
    });

    expect(result.selected_poses.length).toBeGreaterThan(0);

    const unsafeNames = result.selected_poses.map((pose) => pose.exercise.name);
    expect(
      unsafeNames.some((name) =>
        /(Knees to Chest|Child's Pose|Paschimottanasana|Forward Fold|Uttanasana|Cat-Cow)/i.test(name)
      )
    ).toBe(false);

    expect(
      result.selected_poses.some((pose) =>
        pose.exercise.clinical_rationale.toLowerCase().includes("spinal flexion")
      )
    ).toBe(false);
  });

  it("does not introduce high-impact poses for osteoporosis", () => {
    const result = buildSession({
      user_profile: [],
      stage: 1,
      experience_level: "beginner",
      duration_minutes: 20,
      conditions: ["osteoporosis"],
    });

    expect(
      result.selected_poses.some((pose) =>
        /(high impact|jump|jumping|hop|hopping|plyometric)/i.test(
          `${pose.exercise.name} ${pose.exercise.pose_family} ${pose.exercise.clinical_rationale}`
        )
      )
    ).toBe(false);
  });
});
