// Shared authorization for video-management edge functions.
// Requires a logged-in admin via Authorization header.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export type AuthOk = { ok: true; userId: string; mode: "admin" };
export type AuthFail = { ok: false; status: number; error: string };

export async function authorizeUploader(req: Request): Promise<AuthOk | AuthFail> {
  // Authenticated admin path — /admin/videos and /upload
  const auth = req.headers.get("Authorization");
  if (!auth) return { ok: false, status: 401, error: "unauthorized" };

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: auth } } },
  );
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return { ok: false, status: 401, error: "unauthorized" };

  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });
  if (!isAdmin) return { ok: false, status: 403, error: "forbidden" };

  return { ok: true, userId: user.id, mode: "admin" };
}
