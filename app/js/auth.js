// ============================================================
// LegalConnects — Auth helpers
// ============================================================

import { supabase } from './config.js';

// --- PATH HANDLING ---
// The app may be served at the site root OR under a subfolder
// (e.g. legalconnects.netlify.app/app/). Never hardcode absolute
// paths — derive the app's base from the current location.
const APP_BASE = window.location.pathname.replace(/\/(auth|dashboard)\/[^/]*$/, '');
export function appPath(p) { return APP_BASE + p; }

// --- REGISTER ---
// role must be 'client' or 'advocate' (never 'admin' from UI)
export async function registerUser({ fullName, email, password, role }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role }
    }
  });
  if (error) throw error;
  return data;
}

// --- LOGIN ---
export async function loginUser({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// --- SIGN OUT ---
export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = appPath('/auth/login.html');
}

// --- GET CURRENT USER PROFILE ---
export async function getCurrentProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Profile fetch error:', error);
    return null;
  }
  return profile;
}

// --- REQUIRE AUTH (redirect if not logged in) ---
// Call this at the top of any protected page.
export async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = appPath('/auth/login.html');
    return null;
  }
  return session;
}

// --- REDIRECT BY ROLE ---
// After login/register, send user to their dashboard.
export async function redirectByRole() {
  const profile = await getCurrentProfile();
  if (!profile) {
    window.location.href = appPath('/auth/login.html');
    return;
  }
  const routes = {
    client:   '/dashboard/client.html',
    advocate: '/dashboard/advocate.html',
    admin:    '/dashboard/admin.html',
  };
  window.location.href = appPath(routes[profile.role] || '/auth/login.html');
}
