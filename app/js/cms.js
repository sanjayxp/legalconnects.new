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

// Advocates who created an account (role='advocate') but never submitted
// their profile form — no advocate_profiles row exists for them yet.
// Useful for admin follow-up on stalled signups.
export async function listIncompleteAdvocateSignups() {
  const { data: started, error: e1 } = await supabase
    .from('advocate_profiles')
    .select('id');
  if (e1) throw e1;
  const startedIds = new Set((started || []).map(a => a.id));

  const { data: accounts, error: e2 } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'advocate')
    .order('created_at', { ascending: false });
  if (e2) throw e2;

  return (accounts || []).filter(p => !startedIds.has(p.id));
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

// ---------- BOOKINGS (recurring availability + client booking requests) ----------
// Advocates set their working hours ONCE (advocate_availability, one row per
// weekday) plus optional one-off blocked dates (advocate_time_off). Nobody
// manually creates individual bookable slots anymore. A booking_slots row
// only exists once a client actually requests a time. Lifecycle of that row:
// requested (client asked, advocate hasn't decided) -> confirmed (advocate
// accepted — this slot is now blocked for everyone else) or declined
// (advocate said no, or lost to another confirmed request for the same
// time) -> completed / cancelled after the fact.

// ---- Weekly working hours ----
// weekday: 0=Sun .. 6=Sat (matches JS Date.getDay()).
export async function getAvailability(advocateId) {
  const { data, error } = await supabase
    .from('advocate_availability')
    .select('*')
    .eq('advocate_id', advocateId)
    .order('weekday', { ascending: true });
  if (error) throw error;
  return data || [];
}

// Replaces the advocate's entire weekly schedule with `days`, an array of
// { weekday, start_time, end_time, slot_minutes }. Omit a weekday to mark it
// as a day off.
export async function setAvailability(advocateId, days) {
  const { error: delErr } = await supabase.from('advocate_availability').delete().eq('advocate_id', advocateId);
  if (delErr) throw delErr;
  if (!days.length) return;
  const rows = days.map(d => ({ advocate_id: advocateId, ...d }));
  const { error } = await supabase.from('advocate_availability').insert(rows);
  if (error) throw error;
}

// ---- One-off blocked dates (holidays, court dates, leave) ----
export async function listTimeOff(advocateId) {
  const { data, error } = await supabase
    .from('advocate_time_off')
    .select('*')
    .eq('advocate_id', advocateId)
    .order('off_date', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addTimeOff(advocateId, offDate, note) {
  const { error } = await supabase.from('advocate_time_off').insert({ advocate_id: advocateId, off_date: offDate, note: note || null });
  if (error) throw error;
}

export async function deleteTimeOff(timeOffId) {
  const { error } = await supabase.from('advocate_time_off').delete().eq('id', timeOffId);
  if (error) throw error;
}

// ---- Public booking flow ----
// Computed on the fly server-side (weekly hours minus time-off minus
// confirmed bookings) — never reads booking_slots rows directly, so no
// other client's name/email/phone is ever exposed to the browser.
export async function listOpenSlotsPublic(advocateId, fromDate, toDate) {
  const { data, error } = await supabase.rpc('list_open_slots', {
    p_advocate_id: advocateId,
    p_from: fromDate,
    p_to: toDate,
  });
  if (error) throw error;
  return data || [];
}

// Public — request a slot. Re-validated against real availability
// server-side. Multiple clients can request the same time; only one will
// end up confirmed.
export async function requestSlot(advocateId, slotStart, slotEnd, { mode, client_name, client_email, client_phone, client_notes }) {
  const { data, error } = await supabase.rpc('request_booking_slot', {
    p_advocate_id: advocateId,
    p_slot_start: slotStart,
    p_slot_end: slotEnd,
    p_mode: mode,
    p_client_name: client_name,
    p_client_email: client_email || null,
    p_client_phone: client_phone,
    p_client_notes: client_notes || null,
  });
  if (error) throw new Error(error.message || 'Could not send that request.');
  return data;
}

// ---- Advocate — every request/booking they own, regardless of status ----
export async function listMySlots(advocateId) {
  const { data, error } = await supabase
    .from('booking_slots')
    .select('*')
    .eq('advocate_id', advocateId)
    .order('slot_start', { ascending: true });
  if (error) throw error;
  return data || [];
}

// Advocate — accept one pending request; every other pending request for
// that exact same slot_start is automatically declined.
export async function confirmBookingRequest(requestId) {
  const { data, error } = await supabase.rpc('confirm_booking_request', { p_request_id: requestId });
  if (error) throw new Error(error.message || 'Could not confirm that request.');
  return data;
}

// Advocate — decline a single pending request.
export async function declineBookingRequest(requestId) {
  const { data, error } = await supabase.rpc('decline_booking_request', { p_request_id: requestId });
  if (error) throw new Error(error.message || 'Could not decline that request.');
  return data;
}

// Advocate — housekeeping on an already-confirmed booking (mark completed
// after the meeting happened, or cancel it).
export async function updateSlotStatus(slotId, status) {
  const { error } = await supabase
    .from('booking_slots')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', slotId);
  if (error) throw error;
}

export async function deleteSlot(slotId) {
  const { error } = await supabase.from('booking_slots').delete().eq('id', slotId);
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

// ---------- BAR COUNCIL CERTIFICATE (private, owner + admin only) ----------
// Path is namespaced by the advocate's own uid, mirroring advocate-photos —
// the storage RLS policies only allow an owner to read/write inside their
// own folder, plus a separate admin-only policy for verification review.
export async function uploadBarCertificate(userId, file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const path = `${userId}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from('bar-certificates').upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
  return path;
}

// Works for both the owning advocate and an admin — RLS resolves which
// policy applies. Bucket is private, so this always needs a signed URL.
export async function getBarCertificateSignedUrl(path) {
  const { data, error } = await supabase.storage.from('bar-certificates').createSignedUrl(path, 300);
  if (error) throw error;
  return data.signedUrl;
}

// ---------- JOB APPLICATION RESUMES ----------
// Private bucket — anyone (including anonymous applicants) can upload their
// own resume, but only admins can read/download one back. Path is namespaced
// by job so admin's applicant viewer can also just list a job's folder if
// ever needed.
export async function uploadResume(jobId, file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const path = `${jobId}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from('job-resumes').upload(path, file, {
    contentType: file.type,
  });
  if (error) throw error;
  return path;
}

// Admin-only — the bucket is private, so viewing a resume needs a short-lived
// signed URL rather than a public one.
export async function getResumeSignedUrl(path) {
  const { data, error } = await supabase.storage.from('job-resumes').createSignedUrl(path, 300);
  if (error) throw error;
  return data.signedUrl;
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

// Looks up a case on the official eCourts data network by CNR (Case Number
// Record, e.g. DLHC010001232024) and returns pre-filled fields for the
// court_cases form. Calls the ecourts-lookup Edge Function rather than the
// eCourtsIndia API directly — the paid API token lives only in Supabase's
// server-side secrets, never in this browser code.
export async function lookupCaseByCNR(cnr) {
  const { data, error } = await supabase.functions.invoke('ecourts-lookup', {
    body: { cnr },
  });
  if (error) {
    // Supabase's FunctionsHttpError hides the actual JSON error body on
    // `error`; the real message is on the response the SDK attaches to it.
    let msg = 'Could not look up that CNR. Please try again.';
    try {
      const body = await error.context.json();
      if (body?.error) msg = body.error;
    } catch (_) { /* fall back to generic message */ }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data.data;
}

// ---------- PROFILE VIEWS ----------
export async function incrementProfileView(advocateProfileId) {
  const { error } = await supabase.rpc('increment_profile_view', { profile_id: advocateProfileId });
  if (error) throw error;
}

// ================= PHASE A: CASE WORKSPACE =================

export async function listCaseEvents(caseId) {
  const { data, error } = await supabase.from('case_events')
    .select('*').eq('case_id', caseId)
    .order('event_date', { ascending: false }).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function addCaseEvent(caseId, advocateId, fields) {
  const { error } = await supabase.from('case_events')
    .insert({ case_id: caseId, advocate_id: advocateId, ...fields });
  if (error) throw error;
}
export async function deleteCaseEvent(id) {
  const { error } = await supabase.from('case_events').delete().eq('id', id);
  if (error) throw error;
}

export async function setCaseLabels(caseId, labels) {
  const { error } = await supabase.from('court_cases')
    .update({ labels, updated_at: new Date().toISOString() }).eq('id', caseId);
  if (error) throw error;
}

export async function listCaseDocuments(caseId) {
  const { data, error } = await supabase.from('case_documents')
    .select('*').eq('case_id', caseId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function uploadCaseDocument(caseId, advocateId, file) {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${advocateId}/${caseId}/${Date.now()}_${safe}`;
  const { error: upErr } = await supabase.storage.from('case-docs').upload(path, file);
  if (upErr) throw upErr;
  const { error } = await supabase.from('case_documents')
    .insert({ case_id: caseId, advocate_id: advocateId, file_name: file.name, file_path: path });
  if (error) throw error;
}
export async function caseDocumentUrl(filePath) {
  const { data, error } = await supabase.storage.from('case-docs').createSignedUrl(filePath, 3600);
  if (error) throw error;
  return data.signedUrl;
}
export async function deleteCaseDocument(doc) {
  await supabase.storage.from('case-docs').remove([doc.file_path]);
  const { error } = await supabase.from('case_documents').delete().eq('id', doc.id);
  if (error) throw error;
}

export async function getCase(caseId) {
  const { data, error } = await supabase.from('court_cases').select('*').eq('id', caseId).maybeSingle();
  if (error) throw error;
  return data;
}

// ================= PHASE C: CLIENT MANAGEMENT =================

export async function listMyClients(advocateId) {
  const { data, error } = await supabase.from('advocate_clients')
    .select('*').eq('advocate_id', advocateId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function addClient(advocateId, fields) {
  const { data, error } = await supabase.from('advocate_clients')
    .insert({ advocate_id: advocateId, ...fields }).select().single();
  if (error) throw error;
  return data;
}
export async function updateClient(id, fields) {
  const { error } = await supabase.from('advocate_clients').update(fields).eq('id', id);
  if (error) throw error;
}
export async function deleteClient(id) {
  const { error } = await supabase.from('advocate_clients').delete().eq('id', id);
  if (error) throw error;
}
export async function linkCaseToClient(caseId, registerClientId) {
  const { error } = await supabase.from('court_cases')
    .update({ register_client_id: registerClientId }).eq('id', caseId);
  if (error) throw error;
}
export async function listClientCases(advocateId, registerClientId) {
  const { data, error } = await supabase.from('court_cases')
    .select('id, case_title, next_hearing_date, stage')
    .eq('advocate_id', advocateId).eq('register_client_id', registerClientId);
  if (error) throw error;
  return data || [];
}

export async function logClientUpdate(advocateId, clientId, caseId, message, channel) {
  const { error } = await supabase.from('client_updates')
    .insert({ advocate_id: advocateId, client_id: clientId, case_id: caseId || null, message, channel });
  if (error) throw error;
}
export async function listClientUpdates(clientId) {
  const { data, error } = await supabase.from('client_updates')
    .select('*').eq('client_id', clientId).order('sent_at', { ascending: false }).limit(20);
  if (error) throw error;
  return data || [];
}

export async function listMyInvoices(advocateId) {
  const { data, error } = await supabase.from('invoices')
    .select('*, advocate_clients(full_name)')
    .eq('advocate_id', advocateId).order('issued_on', { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function addInvoice(advocateId, fields) {
  const { error } = await supabase.from('invoices').insert({ advocate_id: advocateId, ...fields });
  if (error) throw error;
}
export async function setInvoiceStatus(id, status) {
  const patch = { status };
  if (status === 'paid') patch.paid_on = new Date().toISOString().slice(0,10);
  const { error } = await supabase.from('invoices').update(patch).eq('id', id);
  if (error) throw error;
}
