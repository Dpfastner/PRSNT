/**
 * Until auth lands, the mobile app talks to a hardcoded local API. Override
 * by setting EXPO_PUBLIC_API_URL in apps/mobile/.env (e.g. for a tunnel).
 */
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

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

export async function postOnboarding(
  payload: OnboardingPayload,
): Promise<OnboardingResult> {
  const response = await fetch(`${API_URL}/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`onboarding failed (${response.status}): ${text}`);
  }
  return response.json();
}
