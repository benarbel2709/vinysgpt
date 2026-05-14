// Shared CORS allowlist for all Vinys edge functions.
// Add new origins here as needed (preview branches, custom domains).
const ALLOWED_ORIGINS = new Set([
  "https://vinys.app",
  "https://www.vinys.app",
  "https://vinys.life",
  "https://www.vinys.life",
  "https://vinysgpt.lovable.app",
  "https://id-preview--29005e22-3838-404d-b469-c7893db0b285.lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
]);

const BASE_HEADERS = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-upload-code, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
};

export function buildCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allow =
    ALLOWED_ORIGINS.has(origin) || /^https:\/\/[a-z0-9-]+\.lovable\.app$/i.test(origin)
      ? origin
      : "https://vinys.app";
  return { ...BASE_HEADERS, "Access-Control-Allow-Origin": allow };
}
