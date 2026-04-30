import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@prsnt/session';

export interface Session {
  userId: string;
  displayName: string;
}

export async function loadSession(): Promise<Session | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Session;
    if (typeof parsed.userId === 'string' && typeof parsed.displayName === 'string') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveSession(session: Session): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
