import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export function cors(res) {
  const allowed = process.env.ALLOWED_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", allowed);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,X-Admin-Key"
  );
  res.setHeader("Vary", "Origin");
}

export function clean(value, max = 500) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

export function fingerprint(req) {
  const ip = String(req.headers["x-forwarded-for"] || "")
    .split(",")[0]
    .trim() || "unknown";
  const ua = String(req.headers["user-agent"] || "");
  return hash(ip + "|" + ua);
}

function hash(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ("00000000" + (h >>> 0).toString(16)).slice(-8);
}

export function adminAuth(req, res) {
  const expected = process.env.ADMIN_KEY;
  const supplied = req.headers["x-admin-key"];

  if (!expected || supplied !== expected) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }

  return true;
}
