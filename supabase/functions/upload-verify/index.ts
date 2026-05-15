// Verifies the caller is an authenticated admin.
import { buildCorsHeaders } from "../_shared/cors.ts";
import { authorizeUploader } from "../_shared/uploadAuth.ts";

Deno.serve(async (req) => {
  const cors = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const auth = await authorizeUploader(req);
    if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status, cors);
    return json({ ok: true }, 200, cors);
  } catch (e) {
    return json({ ok: false, error: (e as Error).message }, 500, cors);
  }
});

function json(body: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
