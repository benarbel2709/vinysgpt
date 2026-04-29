/**
 * exerciseVideoUrl — single resolver for exercise pose videos.
 *
 * Backend: Bunny Stream (Pull Zone, public CDN).
 * The `exercise_videos` table maps exercise_id → bunny_video_guid.
 *
 * URL shape (HLS): https://{CDN_HOSTNAME}/{guid}/playlist.m3u8
 * URL shape (MP4): https://{CDN_HOSTNAME}/{guid}/play_720p.mp4
 *
 * We return the MP4 URL by default since <video> handles it natively across
 * all browsers without needing hls.js. Switch to HLS later if we add adaptive
 * streaming.
 */

import { supabase } from "@/integrations/supabase/client";

const BUNNY_CDN_HOSTNAME = "vz-46ec48f5-3df.b-cdn.net"; // public — safe to ship; referrer-locked

const guidCache = new Map<string, string | null>(); // exercise_id → bunny_video_guid | null
let cacheLoaded = false;

async function loadCache(): Promise<void> {
  if (cacheLoaded) return;
  const { data, error } = await supabase
    .from("exercise_videos")
    .select("exercise_id, bunny_video_guid")
    .eq("is_active", true);
  if (error) {
    console.warn("[exerciseVideoUrl] failed to load video map:", error.message);
    return;
  }
  for (const row of data ?? []) {
    guidCache.set(row.exercise_id, row.bunny_video_guid);
  }
  cacheLoaded = true;
}

/**
 * Resolve a streamable URL for an exercise's pose video, or null if none uploaded.
 * Returns null silently when no mapping exists — caller should fall back to the
 * bundled universal video.
 */
export async function getExerciseVideoUrl(
  exerciseId: string,
): Promise<string | null> {
  await loadCache();
  const guid = guidCache.get(exerciseId);
  if (!guid) return null;
  return `https://${BUNNY_CDN_HOSTNAME}/${guid}/play_720p.mp4`;
}

/** Force a reload of the exercise → guid map (e.g. after admin upload). */
export function invalidateExerciseVideoCache(): void {
  guidCache.clear();
  cacheLoaded = false;
}
