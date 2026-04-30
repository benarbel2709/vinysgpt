// Returns Bunny Stream encoding status for a list of video GUIDs.
// Admin-only.
//
// Response: { statuses: { [guid]: { status: number, label: string, encodeProgress: number } } }
//
// Bunny status codes:
//   0 = Created, 1 = Uploaded, 2 = Processing, 3 = Transcoding,
//   4 = Finished, 5 = Error, 6 = UploadFailed, 7 = JitSegmenting, 8 = JitPlaylistsCreated

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { buildCorsHeaders } from "../_shared/cors.ts";

const BUNNY_LIBRARY_ID = Deno.env.get("BUNNY_STREAM_LIBRARY_ID")!;
const BUNNY_API_KEY = Deno.env.get("BUNNY_STREAM_API_KEY")!;

const STATUS_LABEL: Record<number, string> = {
  0: "created",
  1: "uploaded",
  2: "processing",
  3: "transcoding",
  4: "ready",
  5: "error",
  6: "upload_failed",
  7: "segmenting",
  8: "ready",
};

Deno.serve(async (req) => {
  const cors = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "unauthorized" }, 401, cors);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "unauthorized" }, 401, cors);

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "forbidden" }, 403, cors);

    const body = await req.json().catch(() => ({}));
    const guids: string[] = Array.isArray(body?.guids) ? body.guids : [];
    if (guids.length === 0) return json({ statuses: {} }, 200, cors);

    // Fetch all in parallel; cap to avoid hammering Bunny.
    const results = await Promise.all(
      guids.slice(0, 100).map(async (guid) => {
        try {
          const r = await fetch(
            `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${guid}`,
            {
              headers: { AccessKey: BUNNY_API_KEY, accept: "application/json" },
            },
          );
          if (!r.ok) return [guid, { status: -1, label: "unknown", encodeProgress: 0 }] as const;
          const v = await r.json();
          const status = typeof v.status === "number" ? v.status : -1;
          return [
            guid,
            {
              status,
              label: STATUS_LABEL[status] ?? "unknown",
              encodeProgress: typeof v.encodeProgress === "number" ? v.encodeProgress : 0,
            },
          ] as const;
        } catch {
          return [guid, { status: -1, label: "unknown", encodeProgress: 0 }] as const;
        }
      }),
    );

    const statuses: Record<string, { status: number; label: string; encodeProgress: number }> = {};
    for (const [guid, info] of results) statuses[guid] = info;

    return json({ statuses }, 200, cors);
  } catch (e) {
    return json({ error: (e as Error).message }, 500, cors);
  }
});

function json(body: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
