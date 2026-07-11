// ============================================================
// LegalConnects — CMS data helpers (jobs, courses, team, advocate profiles)
// Shared by admin pages (app/admin/*) and the public site (demo/index.html)
// ============================================================

import { supabase } from './config.js';

// ---------- JOBS ----------
export async function listJobsPublic() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function listJobsAdmin() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveJob(job) {
  const { id, ...fields } = job;
  if (id) {
    const { error } = await supabase.from('jobs').update(fields).eq('id', id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('jobs').insert(fields);
    if (error) throw error;
  }
}

export async function deleteJob(id) {
  const { error } = await supabase.from('jobs').delete().eq('id', id);
  if (error) throw error;
}

export async function countApplications(jobId) {
  const { count, error } = await supabase
    .from('job_applications')
    .select('id', { count: 'exact', head: true })
    .eq('job_id', jobId);
  if (error) throw error;
  return count || 0;
}

export async function submitJobApplication(app) {
  const { error } = await supabase.from('job_applications').insert(app);
  if (error) throw error;
}

// ---------- COURSES ----------
export async function listCoursesPublic() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function listCoursesAdmin() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveCourse(course) {
  const { id, ...fields } = course;
  if (id) {
    const { error } = await supabase.from('courses').update(fields).eq('id', id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('courses').insert(fields);
    if (error) throw error;
  }
}

export async function deleteCourse(id) {
  const { error } = await supabase.from('courses').delete().eq('id', id);
  if (error) throw error;
}

export async function countEnrollments(courseId) {
  const { count, error } = await supabase
    .from('course_enrollments')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', courseId);
  if (error) throw error;
  return count || 0;
}

export async function submitCourseEnrollment(enroll) {
  const { error } = await supabase.from('course_enrollments').insert(enroll);
  if (error) throw error;
}

// ---------- TEAM MEMBERS ----------
export async function listTeamPublic() {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('status', 'active')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function listTeamAdmin() {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function saveTeamMember(member) {
  const { id, ...fields } = member;
  if (id) {
    const { error } = await supabase.from('team_members').update(fields).eq('id', id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('team_members').insert(fields);
    if (error) throw error;
  }
}

export async function deleteTeamMember(id) {
  const { error } = await supabase.from('team_members').delete().eq('id', id);
  if (error) throw error;
}

// ---------- ADVOCATE PROFILES ----------
export async function getAdvocateProfile(userId) {
  const { data, error } = await supabase
    .from('advocate_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Insert on first submit (defaults to verification_status='pending'),
// update on subsequent edits WITHOUT touching verification_status —
// once approved, an advocate's own edits stay instantly live.
export async function upsertAdvocateProfile(userId, fields, isFirstSubmit) {
  if (isFirstSubmit) {
    const { error } = await supabase
      .from('advocate_profiles')
      .insert({ id: userId, ...fields });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('advocate_profiles')
      .update(fields)
      .eq('id', userId);
    if (error) throw error;
  }
}

export async function listPendingAdvocates() {
  // advocate_profiles has two foreign keys into profiles (id, and reviewed_by),
  // so the embed must specify which relationship to follow — otherwise
  // PostgREST refuses with an ambiguous-embedding error (PGRST201).
  const { data, error } = await supabase
    .from('advocate_profiles')
    .select('*, profiles!advocate_profiles_id_fkey(full_name, phone)')
    .eq('verification_status', 'pending')
    .order('submitted_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function reviewAdvocateProfile(userId, status, reviewerId) {
  const { error } = await supabase
    .from('advocate_profiles')
    .update({ verification_status: status, reviewed_at: new Date().toISOString(), reviewed_by: reviewerId })
    .eq('id', userId);
  if (error) throw error;
}

// ---------- PHOTO UPLOAD ----------
// bucket: 'advocate-photos' (path must start with the user's own uid folder)
//         'team-photos'     (admin only)
export async function uploadPhoto(bucket, path, file) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
