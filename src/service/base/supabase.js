import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://onzuxwcgtpjmwccktdhi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uenV4d2NndHBqbXdjY2t0ZGhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg5NDg0NTMsImV4cCI6MjA0NDUyNDQ1M30.9KOxyYXXdfro7YqqTzhEnN4mCsJ2Kczc-2mIk3KA1Vk";
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
