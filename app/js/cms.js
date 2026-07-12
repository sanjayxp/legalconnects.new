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

// Public directory — only advocates who have been approved by an admin.
export async function listApprovedAdvocatesPublic() {
  const { data, error } = await supabase
    .from('advocate_profiles')
    .select('*, profiles!advocate_profiles_id_fkey(full_name)')
    .eq('verification_status', 'approved')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
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

// Admin management view — every advocate profile regardless of status,
// newest submissions first.
export async function listAllAdvocates() {
  const { data, error } = await supabase
    .from('advocate_profiles')
    .select('*, profiles!advocate_profiles_id_fkey(full_name, phone)')
    .order('submitted_at', { ascending: false });
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

// Admin editing an advocate's own profile fields directly (typo fixes, etc.)
// without disturbing verification_status unless explicitly included in `fields`.
export async function adminUpdateAdvocateProfile(userId, fields) {
  const { error } = await supabase
    .from('advocate_profiles')
    .update(fields)
    .eq('id', userId);
  if (error) throw error;
}

// Removes the advocate_profiles row only. The advocate's login/account is
// untouched — if they log back in, it looks like a fresh, unfilled profile
// (verification_status/submitted_at reset to nothing) and they can start over.
export async function deleteAdvocateProfile(userId) {
  const { error } = await supabase
    .from('advocate_profiles')
    .delete()
    .eq('id', userId);
  if (error) throw error;
}

// ---------- JOB APPLICANTS / COURSE ENROLLEES (admin) ----------
export async function listJobApplicants(jobId) {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .eq('job_id', jobId)
    .order('applied_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function listCourseEnrollees(courseId) {
  const { data, error } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('course_id', courseId)
    .order('enrolled_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ---------- CLIENTS (admin, read-only) ----------
export async function listClients() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ---------- ADMIN ACCOUNTS ----------
export async function listAdmins() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'admin')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

// Looks up an already-registered account (signed up normally as a client or
// advocate) by email, so an existing admin can promote them.
export async function findProfileByEmail(email) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', email.trim())
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function promoteToAdmin(userId) {
  const { error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId);
  if (error) throw error;
}

// Lets a signed-in user (client or advocate) update their own display name.
export async function updateOwnName(userId, fullName) {
  const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', userId);
  if (error) throw error;
}

// ---------- BOOKINGS (advocate availability + client booking requests) ----------
// Lifecycle of a row: open (advocate's free slot) -> booked (client claimed
// it, awaiting advocate confirmation — this is a "lead") -> confirmed
// (advocate accepted — this is an upcoming booking) -> completed / cancelled.

// Public — open slots for a specific advocate, for the booking widget on
// their profile. Client PII columns are always null on open rows.
export async function listOpenSlotsPublic(advocateId) {
  const { data, error } = await supabase
    .from('booking_slots')
    .select('*')
    .eq('advocate_id', advocateId)
    .eq('status', 'open')
    .gt('slot_start', new Date().toISOString())
    .order('slot_start', { ascending: true });
  if (error) throw error;
  return data || [];
}

// Public — claim an open slot. Fails (throws) if someone else claimed it
// first, since the update only matches rows still 'open'.
export async function bookSlot(slotId, { mode, client_name, client_email, client_phone, client_notes }) {
  const { data, error } = await supabase
    .from('booking_slots')
    .update({
      status: 'booked',
      mode, client_name, client_email, client_phone, client_notes,
      booked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', slotId)
    .eq('status', 'open')
    .select();
  if (error) throw error;
  if (!data || !data.length) throw new Error('Sorry, that slot was just taken. Please pick another time.');
  return data[0];
}

// Advocate — every slot they own, regardless of status.
export async function listMySlots(advocateId) {
  const { data, error } = await supabase
    .from('booking_slots')
    .select('*')
    .eq('advocate_id', advocateId)
    .order('slot_start', { ascending: true });
  if (error) throw error;
  return data || [];
}

// Advocate — add a new open (bookable) slot to their calendar.
export async function createSlot(advocateId, slotStart, slotEnd) {
  const { error } = await supabase
    .from('booking_slots')
    .insert({ advocate_id: advocateId, slot_start: slotStart, slot_end: slotEnd, status: 'open' });
  if (error) throw error;
}

export async function deleteSlot(slotId) {
  const { error } = await supabase.from('booking_slots').delete().eq('id', slotId);
  if (error) throw error;
}

export async function updateSlotStatus(slotId, status) {
  const { error } = await supabase
    .from('booking_slots')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', slotId);
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

// ---------- LEGAL Q&A (real, public forum) ----------
// Anyone can read and ask a question (anonymous by default). Only a
// signed-in, Bar Council-approved advocate can post an answer.

export async function listQuestionsPublic(topic) {
  let q = supabase.from('questions').select('*, answers(count)').order('created_at', { ascending: false });
  if (topic && topic !== 'all') q = q.eq('topic', topic);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function getQuestionDetail(questionId) {
  const { data: question, error: qErr } = await supabase.from('questions').select('*').eq('id', questionId).maybeSingle();
  if (qErr) throw qErr;
  if (!question) return null;
  // `answers` only has a foreign key to `profiles` (for the display name) —
  // there's no direct FK to `advocate_profiles`, so headline/practice_areas
  // are fetched in a second query and merged client-side rather than via
  // a PostgREST embed (which requires an actual FK relationship).
  const { data: answers, error: aErr } = await supabase
    .from('answers')
    .select('*, profiles!answers_advocate_id_fkey(full_name)')
    .eq('question_id', questionId)
    .order('upvote_count', { ascending: false });
  if (aErr) throw aErr;
  const advocateIds = [...new Set((answers || []).map(a => a.advocate_id))];
  let advocateInfo = {};
  if (advocateIds.length) {
    const { data: profs, error: pErr } = await supabase
      .from('advocate_profiles')
      .select('id, headline, practice_areas')
      .in('id', advocateIds);
    if (pErr) throw pErr;
    (profs || []).forEach(p => { advocateInfo[p.id] = p; });
  }
  const answersWithProfiles = (answers || []).map(a => ({ ...a, advocate_profiles: advocateInfo[a.advocate_id] || null }));
  const answerIds = answersWithProfiles.map(a => a.id);
  let comments = [];
  if (answerIds.length) {
    const { data: c, error: cErr } = await supabase.from('answer_comments').select('*').in('answer_id', answerIds).order('created_at', { ascending: true });
    if (cErr) throw cErr;
    comments = c || [];
  }
  return { question, answers: answersWithProfiles, comments };
}

export async function incrementQuestionViews(questionId) {
  const { error } = await supabase.rpc('increment_question_views', { q_id: questionId });
  if (error) throw error;
}

export async function submitQuestion({ topic, title, body, budget, client_id }) {
  const { data, error } = await supabase.from('questions').insert({ topic, title, body, budget, client_id: client_id || null }).select().maybeSingle();
  if (error) throw error;
  return data;
}

export async function submitAnswer(questionId, advocateId, body) {
  const { error } = await supabase.from('answers').insert({ question_id: questionId, advocate_id: advocateId, body });
  if (error) throw error;
}

export async function upvoteAnswer(answerId) {
  const { error } = await supabase.rpc('increment_answer_upvotes', { a_id: answerId });
  if (error) throw error;
}

export async function addAnswerComment(answerId, authorRole, authorId, body) {
  const { error } = await supabase.from('answer_comments').insert({ answer_id: answerId, author_role: authorRole, author_id: authorId || null, body });
  if (error) throw error;
}

// How many real answers this advocate has posted (used on the Overview stats card).
export async function countMyAnswers(advocateId) {
  const { count, error } = await supabase.from('answers').select('id', { count: 'exact', head: true }).eq('advocate_id', advocateId);
  if (error) throw error;
  return count || 0;
}

// ---------- CASE TRACKING (manual now, CRN field ready for eCourts sync later) ----------
export async function listMyCases(advocateId) {
  const { data, error } = await supabase.from('court_cases').select('*').eq('advocate_id', advocateId).order('next_hearing_date', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data || [];
}

export async function createCase(advocateId, fields) {
  const { error } = await supabase.from('court_cases').insert({ advocate_id: advocateId, source: 'manual', ...fields });
  if (error) throw error;
}

export async function updateCase(caseId, fields) {
  const { error } = await supabase.from('court_cases').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', caseId);
  if (error) throw error;
}

export async function deleteCase(caseId) {
  const { error } = await supabase.from('court_cases').delete().eq('id', caseId);
  if (error) throw error;
}

// ---------- PROFILE VIEWS ----------
export async function incrementProfileView(advocateProfileId) {
  const { error } = await supabase.rpc('increment_profile_view', { profile_id: advocateProfileId });
  if (error) throw error;
}
