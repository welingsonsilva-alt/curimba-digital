import { createClient } from '@supabase/supabase-url-helpers'; // Ou '@supabase/supabase-js'
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Atenção: Credenciais do Supabase não encontradas!");
}

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);