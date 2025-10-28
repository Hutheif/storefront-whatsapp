import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qzigaimmzdtubahwcjyr.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6aWdhaW1temR0dWJhaHdjanlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTIyOTAsImV4cCI6MjA3NTQ2ODI5MH0.cvxQVQKDi4J-QJw6FX3Zyvkn9fIIo2p6MLZaK1OTDVo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
