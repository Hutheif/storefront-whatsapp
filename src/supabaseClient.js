import { createClient } from "@supabase/supabase-js";

// Read from environment variables (Vite-compatible)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback (optional) – ensures local dev still works if .env missing
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "⚠️ Missing Supabase environment variables. Using fallback values (development only)."
  );
}

export const supabase = createClient(
  SUPABASE_URL || "https://qzigaimmzdtubahwcjyr.supabase.co",
  SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6aWdhaW1temR0dWJhaHdjanlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTIyOTAsImV4cCI6MjA3NTQ2ODI5MH0.cvxQVQKDi4J-QJw6FX3Zyvkn9fIIo2p6MLZaK1OTDVo"
);
