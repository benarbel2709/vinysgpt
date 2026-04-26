/**
 * exerciseVideoUrl — single resolver for exercise pose videos.
 *
 * MIGRATION POINT: when moving off Lovable Cloud Storage to Bunny / R2 / Mux,
 * change ONLY this file. The rest of the app calls `getExerciseVideoUrl(id)`
 * and is provider-agnostic.
 *
 * Current backend: Lovable Cloud (private "exercise-videos" bucket) + the
 * `exercise_videos` table mapping exercise_id → storage_path.
 *
 * URLs are signed and cached in-memory for ~50 min (signed URLs last 1h).
 */

import { supabase } from "@/integrations/supabase/client";

type CacheEntry = { url: string; expiresAt: number };

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour
const CACHE_TTL_MS = 50 * 60 * 1000; // refresh slightly before signed URL expiry

const urlCache = new Map<string, CacheEntry>();
const pathCache = new Map<string, string | null>(); // exercise_id → storage_path | null
let pathCacheLoaded = false;

async function loadPathCache(): Promise<void> {
  if (pathCacheLoaded) return;
  const { data, error } = await supabase
    .from("exercise_videos")
    .select("exercise_id, storage_path")
    .eq("is_active", true);
  if (error) {
    console.warn("[exerciseVideoUrl] failed to load video map:", error.message);
    return;
  }
  for (const row of data ?? []) {
    pathCache.set(row.exercise_id, row.storage_path);
  }
  pathCacheLoaded = true;
}

/**
 * Resolve a streamable URL for an exercise's pose video, or null if none uploaded.
 * Returns null silently when no mapping exists — caller should fall back to the
 * bundled universal video.
 */
export async function getExerciseVideoUrl(
  exerciseId: string
): Promise<string | null> {
  await loadPathCache();
  const path = pathCache.get(exerciseId);
  if (!path) return null;

  const cached = urlCache.get(path);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  const { data, error } = await supabase.storage
    .from("exercise-videos")
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    console.warn(
      `[exerciseVideoUrl] sign failed for ${exerciseId} (${path}):`,
      error?.message
    );
    return null;
  }

  urlCache.set(path, {
    url: data.signedUrl,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
  return data.signedUrl;
}

/** Force a reload of the exercise → path map (e.g. after admin upload). */
export function invalidateExerciseVideoCache(): void {
  pathCache.clear();
  urlCache.clear();
  pathCacheLoaded = false;
}
