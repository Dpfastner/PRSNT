import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';
import { getHome, type HomePayload } from '../api/client';
import { clearSession } from '../storage/session';
import type { ScreenProps } from '../navigation/types';

interface Props extends ScreenProps<'Home'> {
  userId: string;
  displayName: string;
  onSignOut: () => void;
}

export function Home({ navigation, userId, displayName, onSignOut }: Props) {
  const [data, setData] = useState<HomePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await getHome(userId));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function signOut() {
    await clearSession();
    onSignOut();
  }

  if (loading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi {displayName.split(' ')[0]}.</Text>
        <Pressable onPress={signOut} hitSlop={12}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your groups</Text>
          <Pressable
            onPress={() => navigation.navigate('CreateGroup')}
            hitSlop={12}
          >
            <Text style={styles.action}>+ New</Text>
          </Pressable>
        </View>
        {data?.groups.length === 0 ? (
          <Text style={styles.empty}>
            No groups yet. Create one to invite family or friends.
          </Text>
        ) : (
          data?.groups.map((g) => (
            <Pressable
              key={g.id}
              onPress={() => navigation.navigate('GroupDetail', { groupId: g.id })}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <Text style={styles.cardTitle}>{g.name}</Text>
              <Text style={styles.cardMeta}>{g.type} • {g.role}</Text>
            </Pressable>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming</Text>
        {data?.upcomingEvents.length === 0 ? (
          <Text style={styles.empty}>No events on the horizon.</Text>
        ) : (
          data?.upcomingEvents.map((e) => (
            <Pressable
              key={e.id}
              onPress={() => navigation.navigate('EventDetail', { eventId: e.id })}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <Text style={styles.cardTitle}>{e.name}</Text>
              <Text style={styles.cardMeta}>
                {e.type.replace('_', ' ')}
                {e.startsAt ? ` • ${new Date(e.startsAt).toLocaleDateString()}` : ''}
              </Text>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: spacing.xl, gap: spacing.xl },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontSize: fontSize.hero, fontWeight: '700', color: colors.text },
  signOut: { fontSize: fontSize.caption, color: colors.textMuted },
  section: { gap: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.text,
  },
  action: {
    fontSize: fontSize.body,
    color: colors.primary,
    fontWeight: '600',
  },
  empty: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    paddingVertical: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardPressed: { opacity: 0.85 },
  cardTitle: { fontSize: fontSize.subtitle, fontWeight: '600', color: colors.text },
  cardMeta: { fontSize: fontSize.caption, color: colors.textMuted, textTransform: 'capitalize' },
  error: { color: colors.danger, fontSize: fontSize.caption },
});
