// ============================================================
// LegalConnects — Supabase client config
// ============================================================
// These values are safe to have in frontend code.
// NEVER put your service_role key here.
// ============================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL  = 'https://nudqpyxxjyxsbuxtlkrd.supabase.co';
const SUPABASE_ANON = 'sb_publishable_q48wl2upaPOJVMxmuYmFQw_F1q_zEtj';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
