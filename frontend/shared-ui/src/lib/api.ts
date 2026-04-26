/**
 * API Client — Typed wrapper for backend communication.
 *
 * Design:
 * - Returns `T | null` — null means the call failed (offline / error).
 * - Callers fall back to mock data when null is returned.
 * - All POST bodies are JSON-serialized automatically.
 * - Timeout of 8 seconds per request (configurable).
 */

const MARKETPLACE_URL = import.meta.env.VITE_MARKETPLACE_URL || 'http://localhost:8002';
const AI_AGENT_URL = import.meta.env.VITE_AI_AGENT_URL || 'http://localhost:8001';
const DEFAULT_TIMEOUT_MS = 8_000;

// ===========================================
// Core fetch wrapper
// ===========================================

interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

async function apiFetch<T>(
  url: string,
  options?: RequestInit & { timeoutMs?: number },
): Promise<T | null> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options ?? {};

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...fetchOptions,
    });

    clearTimeout(timer);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: APIResponse<T> = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.warn(`[API] Timeout — ${url}`);
    } else {
      console.warn(`[API] Offline or error — ${url}`);
    }
    return null;
  }
}

// ===========================================
// Intake
// ===========================================

export interface IntakeSubmission {
  user_id: string;
  mobility: string;
  sensory: string;
  digital_literacy?: string;
  meaning_tags: string[];
  loneliness_score: number;
  prefers_group_activities: boolean;
  core_dream?: string;
  goals?: string[];
}

export interface IntakeResponse {
  success: boolean;
  profile_id: string;
  persona_summary: {
    primary: string;
    key_traits: string[];
    engagement_tips: string[];
  } | null;
  risk_summary: {
    flags: string[];
    is_lonely: boolean;
  } | null;
  message_he: string;
}

export function submitIntake(data: IntakeSubmission) {
  return apiFetch<IntakeResponse>(`${MARKETPLACE_URL}/api/v1/lev/intake/submit`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getIntakeQuestions() {
  return apiFetch<{ questions: unknown[]; welcome_message_he: string }>(
    `${MARKETPLACE_URL}/api/v1/lev/intake/questions`,
  );
}

// ===========================================
// Recommendations
// ===========================================

export interface RecommendationItem {
  service_id: string;
  title_he: string;
  content_world: string;
  total_score: number;
  subsidy_percentage: number;
  client_pays: number;
  base_price: number;
  recommendation_reason_he: string;
  is_group_activity: boolean;
  distance_km: number;
}

export interface RecommendationResult {
  user_id: string;
  recommendations: RecommendationItem[];
  generated_at: string;
}

export function getRecommendations(userId: string, limit = 10) {
  return apiFetch<RecommendationResult>(
    `${MARKETPLACE_URL}/api/v1/lev/recommendations/${encodeURIComponent(userId)}?limit=${limit}`,
  );
}

// ===========================================
// Subsidy
// ===========================================

export interface SubsidyResult {
  content_world: string;
  subsidy_tier: string;
  base_subsidy_percentage: number;
  boosters_applied: string[];
  boosters_total: number;
  final_subsidy_percentage: number;
  service_base_price: number;
  subsidy_amount: number;
  client_pays: number;
  subsidy_tier_label_he: string;
  explanation_he: string;
}

export function calculateSubsidy(params: {
  service_base_price: number;
  content_world: string;
  is_group_activity?: boolean;
  user_has_income_supplement?: boolean;
  user_is_lonely?: boolean;
}) {
  return apiFetch<SubsidyResult>(`${MARKETPLACE_URL}/api/v1/lev/subsidy/calculate`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// ===========================================
// Bookings
// ===========================================

export interface BookingResponse {
  booking_id: string;
  user_id: string;
  service_id: string;
  status: string;
  units_cost: number;
  scheduled_datetime: string;
}

export function createBooking(params: {
  user_id: string;
  service_id: string;
  scheduled_datetime: string;
}) {
  return apiFetch<BookingResponse>(`${MARKETPLACE_URL}/api/v1/bookings`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function listBookings(userId?: string) {
  const qs = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  return apiFetch<BookingResponse[]>(`${MARKETPLACE_URL}/api/v1/bookings${qs}`);
}

export function completeBooking(bookingId: string) {
  return apiFetch<{ message: string; units_charged: number }>(
    `${MARKETPLACE_URL}/api/v1/bookings/${encodeURIComponent(bookingId)}/complete`,
    { method: 'POST' },
  );
}

// ===========================================
// CRM Actions
// ===========================================

export interface CRMActionData {
  action_id: string;
  action_type: string;
  user_id: string;
  user_name: string;
  title_he: string;
  description_he: string;
  suggested_action_he: string;
  priority: string;
  due_date: string;
  status: string;
  created_at: string;
  persona_hint?: string;
  engagement_tips?: string[];
  suggested_service_id?: string;
  suggested_service_name?: string;
  escalated?: boolean;
  escalated_at?: string;
  escalation_reason?: string;
}

export function getCRMActions(filters?: { priority?: string; status?: string }) {
  const params = new URLSearchParams();
  if (filters?.priority) params.set('priority', filters.priority);
  if (filters?.status) params.set('status', filters.status);
  return apiFetch<{ actions: CRMActionData[]; total: number; summary: Record<string, unknown> }>(
    `${MARKETPLACE_URL}/api/v1/lev/crm/actions?${params}`,
  );
}

export function updateCRMAction(actionId: string, update: { status: string; notes?: string }) {
  return apiFetch<{ action_id: string; status: string; updated_at: string }>(
    `${MARKETPLACE_URL}/api/v1/lev/crm/actions/${encodeURIComponent(actionId)}`,
    { method: 'PATCH', body: JSON.stringify(update) },
  );
}

export function getCRMDashboard() {
  return apiFetch<Record<string, unknown>>(`${MARKETPLACE_URL}/api/v1/lev/crm/dashboard`);
}

// ===========================================
// Persona Verification
// ===========================================

export function verifyPersona(userId: string, data: {
  approved: boolean;
  override_persona?: string;
  case_manager_notes?: string;
}) {
  return apiFetch<{ user_id: string; approved: boolean; message_he: string }>(
    `${MARKETPLACE_URL}/api/v1/lev/persona/${encodeURIComponent(userId)}/verify`,
    { method: 'POST', body: JSON.stringify(data) },
  );
}

// ===========================================
// Feedback
// ===========================================

export interface FeedbackResult {
  feedback_id: string;
  booking_id: string;
  rating: number;
  submitted_at: string;
  message_he: string;
}

export function submitFeedback(data: {
  booking_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  would_recommend?: boolean;
}) {
  return apiFetch<FeedbackResult>(`${MARKETPLACE_URL}/api/v1/lev/feedback`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getFeedbackForService(serviceId: string) {
  return apiFetch<{
    service_id: string;
    average_rating: number;
    total_reviews: number;
    would_recommend_percent: number;
    recent_comments: { rating: number; comment: string; date: string }[];
  }>(`${MARKETPLACE_URL}/api/v1/lev/feedback/service/${encodeURIComponent(serviceId)}`);
}

// ===========================================
// ICF Verification
// ===========================================

export function verifyICF(userId: string, data: {
  verified: boolean;
  verified_by: string;
  notes?: string;
}) {
  return apiFetch<{ user_id: string; icf_verified: boolean; message_he: string }>(
    `${MARKETPLACE_URL}/api/v1/lev/icf/${encodeURIComponent(userId)}/verify`,
    { method: 'POST', body: JSON.stringify(data) },
  );
}

// ===========================================
// Health check
// ===========================================

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2_000);
    const res = await fetch(`${MARKETPLACE_URL}/health`, { signal: controller.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}
