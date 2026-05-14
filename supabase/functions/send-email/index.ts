/**
 * Vinys — Resend transactional email Edge Function.
 *
 * PREREQUISITES (one-time setup):
 *   (a) Sign up for an account at https://resend.com.
 *   (b) Verify the vinys.app sending domain in Resend by adding the DNS
 *       records (SPF, DKIM, optionally DMARC) Resend provides at your DNS host.
 *   (c) Create an API key in the Resend dashboard (it starts with "re_").
 *   (d) Add the API key to Supabase Edge Function secrets as RESEND_API_KEY:
 *       Supabase dashboard → Project Settings → Edge Functions → Manage secrets.
 *
 * Without RESEND_API_KEY set, this function returns 500
 * with a clear "Missing RESEND_API_KEY" error.
 *
 * Request:  POST { template, to, variables? }  — requires valid Supabase user JWT.
 * Response: 200 { sent: true, id } on success, 4xx/500 { error } on failure.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/cors.ts";

const FROM = "Vinys <hello@vinys.app>";