import { createClient } from "@supabase/supabase-js";

// 1️⃣ Load environment variables (used in Netlify / Vercel / Vite)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2️⃣ Fallback for local development (safe to keep for testing)
const FALLBACK_URL = "https://qzigaimmzdtubahwcjyr.supabase.co";
const FALLBACK_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6aWdhaW1temR0dWJhaHdjanlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTIyOTAsImV4cCI6MjA3NTQ2ODI5MH0.cvxQVQKDi4J-QJw6FX3Zyvkn9fIIo2p6MLZaK1OTDVo";

// 3️⃣ Use environment variables if available; fallback for local
const url = SUPABASE_URL || FALLBACK_URL;
const key = SUPABASE_ANON_KEY || FALLBACK_KEY;

// 4️⃣ Warn if environment variables are missing (so you know Netlify didn’t load them)
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "⚠️ Using fallback Supabase credentials — only for local development. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Netlify Environment Variables."
  );
}

// 5️⃣ Initialize Supabase client
export const supabase = createClient(url, key);
