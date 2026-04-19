import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://dovinauminsyyldhrymu.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdmluYXVtaW5zeXlsZGhyeW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODk3NjMsImV4cCI6MjA4NzM2NTc2M30.y76T02LY6oBCLOjYcqKohbCqb_gSKDA0QLbd686msCk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);