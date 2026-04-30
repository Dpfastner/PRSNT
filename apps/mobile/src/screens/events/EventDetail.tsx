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
import { colors, fontSize, radius, spacing } from '../../theme';
import {
  drawSecretSanta,
  getEvent,
  postSuggestions,
  type EventDetail as EventDetailData,
  type RankedSuggestion,
} from '../../api/client';
import type { ScreenProps } from '../../navigation/types';

interface Props extends ScreenProps<'EventDetail'> {
  userId: string;
}

export function EventDetail({ route, userId }: Props) {
  const { eventId } = route.params;
  const [data, setData] = useState<EventDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<RankedSuggestion[] | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await getEvent(eventId));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function runDraw() {
    setBusy(true);
    setError(null);
    try {
      const result = await drawSecretSanta(eventId);
      if ('error' in result) {
        setError(result.error);
      } else {
        await load();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function getSuggestions() {
    if (!data) return;
    const recipientId =
      data.recipientUserId ??
      data.pairings.find((p) => p.giverUserId === userId)?.recipientUserId;
    if (!recipientId) {
      setError('No recipient yet. Run the draw first or add a birthday person.');
      return;
    }
    setBusy(true);
    setError(null);
    setSuggestions(null);
    try {
      const result = await postSuggestions(userId, recipientId, eventId);
      setSuggestions(result.ranked);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (loading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!data) return null;

  const myPairing = data.pairings.find((p) => p.giverUserId === userId);
  const myRecipientName = myPairing
    ? data.participants.find((p) => p.userId === myPairing.recipientUserId)?.displayName
    : null;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
    >
      <Text style={styles.title}>{data.name}</Text>
      <Text style={styles.meta}>
        {data.type.replace('_', ' ')}
        {data.budgetMaxUsd ? ` • up to $${data.budgetMaxUsd}` : ''}
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {data.type === 'secret_santa' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your match</Text>
          {myPairing && myRecipientName ? (
            <View style={styles.matchCard}>
              <Text style={styles.matchLabel}>You're giving to</Text>
              <Text style={styles.matchName}>{myRecipientName}</Text>
            </View>
          ) : (
            <>
              <Text style={styles.empty}>
                {data.pairings.length === 0
                  ? 'No draw yet.'
                  : "You're not in this draw."}
              </Text>
              {data.pairings.length === 0 ? (
                <Pressable
                  onPress={runDraw}
                  disabled={busy}
                  style={({ pressed }) => [
                    styles.cta,
                    busy && styles.ctaDisabled,
                    pressed && styles.ctaPressed,
                  ]}
                >
                  {busy ? (
                    <ActivityIndicator color={colors.text} />
                  ) : (
                    <Text style={styles.ctaLabel}>Run the draw</Text>
                  )}
                </Pressable>
              ) : null}
            </>
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gift suggestions</Text>
        <Pressable
          onPress={getSuggestions}
          disabled={busy}
          style={({ pressed }) => [
            styles.secondary,
            busy && styles.ctaDisabled,
            pressed && styles.ctaPressed,
          ]}
        >
          {busy ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.secondaryLabel}>
              {suggestions ? 'Refresh suggestions' : 'Get ideas'}
            </Text>
          )}
        </Pressable>

        {suggestions?.map((s, i) => (
          <View key={i} style={styles.suggestionCard}>
            <Text style={styles.suggestionTitle}>{s.concept.title}</Text>
            <Text style={styles.suggestionWhy}>{s.whyThisWorks}</Text>
            <Text style={styles.suggestionMeta}>
              {s.concept.category.replace('_', ' ')} • {s.concept.searchQuery}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Participants</Text>
        {data.participants.map((p) => (
          <View key={p.userId} style={styles.row}>
            <Text style={styles.rowLabel}>{p.displayName}</Text>
            <Text style={styles.rowMeta}>{p.role}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: fontSize.hero, fontWeight: '700', color: colors.text },
  meta: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: { gap: spacing.sm, marginTop: spacing.lg },
  sectionTitle: { fontSize: fontSize.title, fontWeight: '700', color: colors.text },
  empty: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    paddingVertical: spacing.sm,
  },
  matchCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  matchLabel: { fontSize: fontSize.caption, color: colors.textOnPrimary, opacity: 0.7 },
  matchName: { fontSize: fontSize.hero, fontWeight: '700', color: colors.textOnPrimary, marginTop: spacing.sm },
  suggestionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  suggestionTitle: { fontSize: fontSize.subtitle, fontWeight: '600', color: colors.text },
  suggestionWhy: { fontSize: fontSize.body, color: colors.text, lineHeight: 22 },
  suggestionMeta: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    textTransform: 'capitalize',
    marginTop: spacing.xs,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: { fontSize: fontSize.body, color: colors.text, fontWeight: '500' },
  rowMeta: { fontSize: fontSize.caption, color: colors.textMuted, textTransform: 'capitalize' },
  cta: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  ctaDisabled: { backgroundColor: colors.divider },
  ctaPressed: { opacity: 0.85 },
  ctaLabel: { fontSize: fontSize.subtitle, fontWeight: '600', color: colors.textOnPrimary },
  secondary: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
  },
  secondaryLabel: { fontSize: fontSize.body, fontWeight: '600', color: colors.text },
  error: { color: colors.danger, fontSize: fontSize.caption },
});
