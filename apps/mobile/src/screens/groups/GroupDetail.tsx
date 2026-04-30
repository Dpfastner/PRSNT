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
import { getGroup, type GroupDetail as GroupDetailData } from '../../api/client';
import type { ScreenProps } from '../../navigation/types';

interface Props extends ScreenProps<'GroupDetail'> {
  userId: string;
}

export function GroupDetail({ route, navigation }: Props) {
  const { groupId } = route.params;
  const [data, setData] = useState<GroupDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await getGroup(groupId));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

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
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
    >
      <Text style={styles.title}>{data?.name}</Text>
      <Text style={styles.meta}>{data?.type}</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Members ({data?.members.length})</Text>
          <Pressable
            onPress={() => navigation.navigate('AddMember', { groupId })}
            hitSlop={12}
          >
            <Text style={styles.action}>+ Add</Text>
          </Pressable>
        </View>
        {data?.members.map((m) => (
          <View key={m.userId} style={styles.row}>
            <Text style={styles.rowLabel}>{m.displayName}</Text>
            <Text style={styles.rowMeta}>{m.role}</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => navigation.navigate('CreateEvent', { groupId })}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
      >
        <Text style={styles.ctaLabel}>Plan an event</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: fontSize.title, fontWeight: '700', color: colors.text },
  action: { fontSize: fontSize.body, color: colors.primary, fontWeight: '600' },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: { fontSize: fontSize.body, color: colors.text, fontWeight: '500' },
  rowMeta: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  cta: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  ctaPressed: { opacity: 0.85 },
  ctaLabel: { fontSize: fontSize.subtitle, fontWeight: '600', color: colors.textOnPrimary },
  error: { color: colors.danger, fontSize: fontSize.caption },
});
