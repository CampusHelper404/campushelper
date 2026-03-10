const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const TOKEN_KEY = "campus_helper_token";

// ── Token helpers (browser only) ─────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ── Types ─────────────────────────────────────────────────────────────────────
export type UserRole = "student" | "helper" | "both" | "admin";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";
export type HelpRequestStatus = "pending" | "accepted" | "declined" | "cancelled" | "completed";
export type SessionStatus = "upcoming" | "in_progress" | "completed" | "cancelled" | "no_show";
export type PaymentStatus = "pending" | "authorized" | "captured" | "refunded" | "failed" | "cancelled";

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  bio: string | null;
  avatar_url: string | null;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  description: string | null;
}

export interface HelpRequest {
  id: number;
  student_id: number;
  course_id: number | null;
  title: string;
  description: string | null;
  status: HelpRequestStatus;
  preferred_date: string | null;
  preferred_time: string | null;
  created_at: string;
  updated_at: string;
  course_code?: string | null;
  course_name?: string | null;
}

export interface Session {
  id: number;
  help_request_id: number;
  student_id: number;
  helper_id: number;
  start_time: string;
  end_time: string | null;
  status: SessionStatus;
  meeting_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  student_name?: string | null;
  helper_name?: string | null;
  course_code?: string | null;
  course_name?: string | null;
}

export interface AvailabilitySlot {
  id: number;
  helper_id: number;
  weekday: number | null;
  start_time: string;
  end_time: string;
  specific_date: string | null;
  is_recurring: boolean;
  created_at: string;
}

export interface Message {
  id: number;
  help_request_id: number | null;
  session_id: number | null;
  sender_id: number;
  recipient_id: number;
  content: string;
  sent_at: string;
  read_at: string | null;
}

export interface Review {
  id: number;
  session_id: number;
  reviewer_id: number;
  reviewee_id: number;
  reviewer_role: "student" | "helper";
  rating: number | null;
  comment: string | null;
  created_at: string;
}

export interface Helper extends User {
  course_codes: string[];
  course_names: string[];
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string | null;
  body: string;
  data: Record<string, unknown> | null;
  channel: "in_app" | "email" | "sms" | "push";
  is_read: boolean;
  sent_at: string;
  read_at: string | null;
  error_message: string | null;
}

export interface Payment {
  id: number;
  session_id: number;
  student_id: number;
  helper_id: number;
  amount_cents: number;
  currency: string;
  status: PaymentStatus;
  provider: string | null;
  provider_payment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerificationRequest {
  id: number;
  helper_id: number;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by_admin_id: number | null;
  rejection_reason: string | null;
  helper_name?: string;
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  // token param takes priority; fall back to localStorage (browser only)
  const resolvedToken = token !== undefined ? token : getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
    ...(options.headers ?? {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `API error ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

// ── API factory ───────────────────────────────────────────────────────────────
// createApi(token) returns all API methods pre-bound to that token.
// When called without a token (browser context), each method falls back to localStorage.
export function createApi(token?: string | null) {
  const t = token;

  const auth = {
    register: (data: { full_name: string; email: string; password: string; role: UserRole; bio?: string; avatar_url?: string }) =>
      apiFetch<{ user: User; token: string }>("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),

    login: (email: string, password: string) =>
      apiFetch<{ user: User; token: string }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

    me: () => apiFetch<User>("/api/auth/me", {}, t),
  };

  const users = {
    me: () => apiFetch<User>("/api/users/me", {}, t),

    updateMe: (data: { full_name?: string; bio?: string; avatar_url?: string }) =>
      apiFetch<User>("/api/users/me", { method: "PATCH", body: JSON.stringify(data) }, t),

    getById: (id: number) =>
      apiFetch<User>(`/api/users/${id}`),

    list: (role?: UserRole) =>
      apiFetch<User[]>(`/api/users${role ? `?role=${role}` : ""}`),
  };

  const courses = {
    list: () => apiFetch<Course[]>("/api/courses"),

    create: (data: { code: string; name: string; description?: string }) =>
      apiFetch<Course>("/api/courses", { method: "POST", body: JSON.stringify(data) }, t),
  };

  const helpRequests = {
    list: (params?: { status?: HelpRequestStatus; student_id?: number; course_id?: number }) => {
      const q = new URLSearchParams();
      if (params?.status) q.set("status", params.status);
      if (params?.student_id) q.set("student_id", String(params.student_id));
      if (params?.course_id) q.set("course_id", String(params.course_id));
      return apiFetch<HelpRequest[]>(`/api/help-requests${q.size ? `?${q}` : ""}`);
    },

    getById: (id: number) =>
      apiFetch<HelpRequest>(`/api/help-requests/${id}`),

    create: (data: { course_id?: number; title: string; description?: string; preferred_date?: string; preferred_time?: string }) =>
      apiFetch<HelpRequest>("/api/help-requests", { method: "POST", body: JSON.stringify(data) }, t),

    updateStatus: (id: number, status: HelpRequestStatus) =>
      apiFetch<HelpRequest>(`/api/help-requests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, t),
  };

  const sessions = {
    list: (params?: { helper_id?: number; student_id?: number; status?: SessionStatus }) => {
      const q = new URLSearchParams();
      if (params?.helper_id) q.set("helper_id", String(params.helper_id));
      if (params?.student_id) q.set("student_id", String(params.student_id));
      if (params?.status) q.set("status", params.status);
      return apiFetch<Session[]>(`/api/sessions${q.size ? `?${q}` : ""}`);
    },

    getById: (id: number) =>
      apiFetch<Session>(`/api/sessions/${id}`),

    create: (data: { help_request_id: number; student_id: number; helper_id: number; start_time: string; end_time?: string; meeting_link?: string; notes?: string }) =>
      apiFetch<Session>("/api/sessions", { method: "POST", body: JSON.stringify(data) }, t),

    updateStatus: (id: number, status: SessionStatus) =>
      apiFetch<Session>(`/api/sessions/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }, t),
  };

  const helpers = {
    list: (course_id?: number) =>
      apiFetch<Helper[]>(`/api/helpers${course_id ? `?course_id=${course_id}` : ""}`),

    setCourses: (helperId: number, course_ids: number[]) =>
      apiFetch<{ helper_id: string; course_ids: number[] }>(`/api/helpers/${helperId}/courses`, {
        method: "PUT",
        body: JSON.stringify({ course_ids }),
      }, t),
  };

  const availability = {
    list: (helper_id: number) =>
      apiFetch<AvailabilitySlot[]>(`/api/availability?helper_id=${helper_id}`),

    create: (data: { weekday?: number; start_time: string; end_time: string; specific_date?: string; is_recurring?: boolean }) =>
      apiFetch<AvailabilitySlot>("/api/availability", { method: "POST", body: JSON.stringify(data) }, t),

    delete: (id: number) =>
      apiFetch<void>(`/api/availability/${id}`, { method: "DELETE" }, t),
  };

  const messages = {
    list: (params: { help_request_id?: number; session_id?: number }) => {
      const q = new URLSearchParams();
      if (params.help_request_id) q.set("help_request_id", String(params.help_request_id));
      if (params.session_id) q.set("session_id", String(params.session_id));
      return apiFetch<Message[]>(`/api/messages?${q}`, {}, t);
    },

    send: (data: { help_request_id?: number; session_id?: number; recipient_id: number; content: string }) =>
      apiFetch<Message>("/api/messages", { method: "POST", body: JSON.stringify(data) }, t),
  };

  const reviews = {
    list: (user_id: number, as?: "helper" | "student") =>
      apiFetch<Review[]>(`/api/reviews?user_id=${user_id}${as ? `&as=${as}` : ""}`, {}, t),

    create: (data: { session_id: number; reviewer_id: number; reviewee_id: number; reviewer_role: "student" | "helper"; rating?: number; comment?: string }) =>
      apiFetch<Review>("/api/reviews", { method: "POST", body: JSON.stringify(data) }, t),
  };

  const notifications = {
    list: (unread_only?: boolean) =>
      apiFetch<Notification[]>(`/api/notifications${unread_only ? "?unread_only=true" : ""}`, {}, t),

    markRead: (id: number) =>
      apiFetch<Notification>(`/api/notifications/${id}/read`, { method: "PATCH" }, t),
  };

  const payments = {
    list: (params?: { student_id?: number; helper_id?: number; status?: PaymentStatus }) => {
      const q = new URLSearchParams();
      if (params?.student_id) q.set("student_id", String(params.student_id));
      if (params?.helper_id) q.set("helper_id", String(params.helper_id));
      if (params?.status) q.set("status", params.status);
      return apiFetch<Payment[]>(`/api/payments${q.size ? `?${q}` : ""}`, {}, t);
    },

    create: (data: { session_id: number; student_id: number; helper_id: number; amount_cents: number; currency?: string; status?: PaymentStatus; provider?: string; provider_payment_id?: string }) =>
      apiFetch<Payment>("/api/payments", { method: "POST", body: JSON.stringify(data) }, t),
  };

  const verification = {
    submit: () =>
      apiFetch<VerificationRequest>("/api/verification", { method: "POST", body: JSON.stringify({}) }, t),

    list: (status?: "pending" | "approved" | "rejected") =>
      apiFetch<VerificationRequest[]>(`/api/verification${status ? `?status=${status}` : ""}`, {}, t),

    review: (id: number, data: { status: "approved" | "rejected"; rejection_reason?: string }) =>
      apiFetch<VerificationRequest>(`/api/verification/${id}`, { method: "PATCH", body: JSON.stringify(data) }, t),
  };

  const analytics = {
    track: (event_type: string, data?: { session_id?: number; help_request_id?: number; metadata?: Record<string, unknown> }) =>
      apiFetch<{ id: number }>("/api/analytics", { method: "POST", body: JSON.stringify({ event_type, ...data }) }, t),

    summary: () =>
      apiFetch<{ event_type: string; count: number }[]>("/api/analytics/summary", {}, t),
  };

  return { auth, users, courses, helpRequests, sessions, helpers, availability, messages, reviews, notifications, payments, verification, analytics };
}

// ── Default browser API instance (reads token from localStorage) ──────────────
export const api = createApi();

// Named exports for backwards compatibility and convenience
export const authApi = api.auth;
export const usersApi = api.users;
export const coursesApi = api.courses;
export const helpRequestsApi = api.helpRequests;
export const sessionsApi = api.sessions;
export const helpersApi = api.helpers;
export const availabilityApi = api.availability;
export const messagesApi = api.messages;
export const reviewsApi = api.reviews;
export const notificationsApi = api.notifications;
export const paymentsApi = api.payments;
export const verificationApi = api.verification;
export const analyticsApi = api.analytics;
