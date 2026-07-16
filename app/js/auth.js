// ============================================================
// LegalConnects — Auth helpers
// ============================================================

import { supabase } from './config.js';

// --- PATH HANDLING ---
// The app may be served at the site root OR under a subfolder
// (e.g. legalconnects.netlify.app/app/). Never hardcode absolute
// paths — derive the app's base from the current location.
const APP_BASE = window.location.pathname.replace(/\/(auth|dashboard|admin)\/[^/]*$/, '');
export function appPath(p) { return APP_BASE + p; }

// --- REGISTER ---
// role must be 'client' or 'advocate' (never 'admin' from UI)
export async function registerUser({ fullName, email, password, role, phone }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role, phone: phone || null }
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
// After login/register on the PUBLIC site, send the user to their dashboard.
// Admin accounts are deliberately excluded here — the public login/register
// pages are for clients and advocates only. If an admin account ends up here
// (e.g. typed into the public login form), sign them out of this context and
// send them to the dedicated admin console instead, rather than opening the
// admin dashboard from a public-facing page.
export async function redirectByRole() {
  const profile = await getCurrentProfile();
  if (!profile) {
    window.location.href = appPath('/auth/login.html');
    return;
  }
  if (profile.role === 'admin') {
    await supabase.auth.signOut();
    window.location.href = appPath('/admin/');
    return;
  }
  if (profile.role === 'advocate') {
    // First-time advocates go straight into profile setup (onboarding),
    // returning advocates go to their dashboard.
    const { data: ap } = await supabase
      .from('advocate_profiles')
      .select('id')
      .eq('id', profile.id)
      .maybeSingle();
    window.location.href = appPath(ap
      ? '/dashboard/advocate.html'
      : '/dashboard/advocate-profile.html?welcome=1');
    return;
  }
  window.location.href = appPath(profile.role === 'client'
    ? '/dashboard/client.html'
    : '/auth/login.html');
}

// --- OAUTH (Google / LinkedIn) ---
// Social login can't carry the chosen role through the provider redirect,
// so we remember the intent locally and apply it when the user returns.
export async function oauthLogin(provider, intendedRole) {
  if (intendedRole) localStorage.setItem('lc_role_intent', intendedRole);
  const { error } = await supabase.auth.signInWithOAuth({
    provider, // 'google' or 'linkedin_oidc'
    options: { redirectTo: window.location.origin + appPath('/auth/login.html') }
  });
  if (error) throw error;
}

// Called on the login page whenever a session already exists (normal visit
// or return from an OAuth provider). Applies any stored role intent for
// brand-new social signups, then routes by role.
export async function handleAuthReturn() {
  const intent = localStorage.getItem('lc_role_intent');
  localStorage.removeItem('lc_role_intent');
  if (intent === 'advocate') {
    const profile = await getCurrentProfile();
    // New OAuth accounts default to 'client' (the signup trigger's fallback).
    // If this user chose "I'm an advocate" before the redirect, honour it.
    if (profile && profile.role === 'client') {
      await supabase.from('profiles').update({ role: 'advocate' }).eq('id', profile.id);
    }
  }
  await redirectByRole();
}
