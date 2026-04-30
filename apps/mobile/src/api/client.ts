const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function request<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init?.headers as Record<string, string> | undefined) ?? {}),
  };
  const body = init?.json !== undefined ? JSON.stringify(init.json) : init?.body;
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    body,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${init?.method ?? 'GET'} ${path} failed (${response.status}): ${text}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

// -- Onboarding -----------------------------------------------------------

export interface OnboardingPayload {
  displayName: string;
  birthday: string;
  partyStyle: string;
  giftCategoriesLiked: string[];
  wontBuySelf: string[];
}
export interface OnboardingResult {
  userId: string;
  profileId: string;
}
export const postOnboarding = (payload: OnboardingPayload) =>
  request<OnboardingResult>('/onboarding', { method: 'POST', json: payload });

// -- Home -----------------------------------------------------------------

export interface HomePayload {
  user: { id: string; displayName: string; hasProfile: boolean };
  groups: { id: string; name: string; type: string; role: string }[];
  upcomingEvents: {
    id: string;
    groupId: string;
    type: string;
    name: string;
    startsAt: string | null;
    recipientUserId: string | null;
  }[];
}
export const getHome = (userId: string) =>
  request<HomePayload>(`/users/${userId}/home`);

// -- Groups ---------------------------------------------------------------

export interface CreateGroupPayload {
  name: string;
  type?: 'family' | 'friends' | 'coworkers' | 'mixed';
  createdByUserId: string;
}
export interface Group {
  id: string;
  name: string;
  type: string;
  createdBy: string;
}
export const createGroup = (payload: CreateGroupPayload) =>
  request<Group>('/groups', { method: 'POST', json: payload });

export interface GroupDetail {
  id: string;
  name: string;
  type: string;
  members: { userId: string; displayName: string; role: string }[];
  relationships: {
    id: string;
    fromUserId: string;
    toUserId: string;
    type: string;
  }[];
}
export const getGroup = (id: string) => request<GroupDetail>(`/groups/${id}`);

export const addGroupMember = (
  groupId: string,
  userId: string,
  role: 'admin' | 'member' = 'member',
) =>
  request<{ ok: boolean; alreadyMember?: boolean }>(
    `/groups/${groupId}/members`,
    { method: 'POST', json: { userId, role } },
  );

// -- Events ---------------------------------------------------------------

export interface CreateEventPayload {
  groupId: string;
  type:
    | 'secret_santa'
    | 'birthday'
    | 'anniversary'
    | 'graduation'
    | 'wedding'
    | 'baby_shower'
    | 'corporate'
    | 'just_because';
  name: string;
  startsAt?: string;
  budgetMinUsd?: number;
  budgetMaxUsd?: number;
  occasionContext?: string;
  recipientUserId?: string;
  participantUserIds: string[];
  createdByUserId: string;
}
export interface EventRow {
  id: string;
  groupId: string;
  type: string;
  name: string;
  startsAt: string | null;
  budgetMinUsd: number | null;
  budgetMaxUsd: number | null;
  recipientUserId: string | null;
}
export const createEvent = (payload: CreateEventPayload) =>
  request<EventRow>('/events', { method: 'POST', json: payload });

export interface EventDetail extends EventRow {
  participants: { userId: string; displayName: string; role: string }[];
  pairings: { giverUserId: string; recipientUserId: string }[];
}
export const getEvent = (id: string) => request<EventDetail>(`/events/${id}`);

export const drawSecretSanta = (eventId: string, force = false) =>
  request<
    | { ok: true; cached: boolean; seed: number; pairings: { giverId: string; recipientId: string }[] }
    | { error: string }
  >(`/events/${eventId}/draw`, { method: 'POST', json: { force } });

// -- Suggestions ----------------------------------------------------------

export interface RankedSuggestion {
  concept: {
    title: string;
    rationale: string;
    category: string;
    searchQuery: string;
  };
  items: unknown[];
  score: number;
  whyThisWorks: string;
}
export const postSuggestions = (
  giverId: string,
  recipientId: string,
  eventId: string,
) =>
  request<{ ok: true; id: string; createdAt: string; ranked: RankedSuggestion[] }>(
    '/suggestions',
    { method: 'POST', json: { giverId, recipientId, eventId } },
  );
