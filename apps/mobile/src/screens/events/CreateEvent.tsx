import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, fontSize, radius, spacing } from '../../theme';
import {
  createEvent,
  getGroup,
  type GroupDetail as GroupDetailData,
} from '../../api/client';
import type { ScreenProps } from '../../navigation/types';

const EVENT_TYPES: { value: 'secret_santa' | 'birthday'; label: string }[] = [
  { value: 'secret_santa', label: 'Secret Santa' },
  { value: 'birthday', label: 'Birthday' },
];

interface Props extends ScreenProps<'CreateEvent'> {
  userId: string;
}

export function CreateEvent({ route, navigation, userId }: Props) {
  const { groupId } = route.params;
  const [group, setGroup] = useState<GroupDetailData | null>(null);
  const [type, setType] = useState<'secret_santa' | 'birthday'>('secret_santa');
  const [name, setName] = useState('');
  const [recipientUserId, setRecipientUserId] = useState<string | null>(null);
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [budgetMax, setBudgetMax] = useState('50');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGroup(groupId)
      .then((g) => {
        setGroup(g);
        setParticipantIds(g.members.map((m) => m.userId));
      })
      .catch((err) => setError((err as Error).message));
  }, [groupId]);

  function toggleParticipant(id: string) {
    setParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function submit() {
    if (!name.trim()) return;
    if (type === 'birthday' && !recipientUserId) {
      setError('Pick a birthday person.');
      return;
    }
    if (participantIds.length < 2 && type === 'secret_santa') {
      setError('Need at least 2 participants for Secret Santa.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const max = parseInt(budgetMax, 10);
      const event = await createEvent({
        groupId,
        type,
        name: name.trim(),
        budgetMaxUsd: Number.isFinite(max) ? max : undefined,
        recipientUserId: type === 'birthday' ? recipientUserId ?? undefined : undefined,
        participantUserIds: participantIds,
        createdByUserId: userId,
      });
      navigation.replace('EventDetail', { eventId: event.id });
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  if (!group) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>New event</Text>

      <Text style={styles.label}>Type</Text>
      <View style={styles.row}>
        {EVENT_TYPES.map((t) => (
          <Pressable
            key={t.value}
            onPress={() => setType(t.value)}
            style={({ pressed }) => [
              styles.chip,
              type === t.value && styles.chipSelected,
              pressed && styles.chipPressed,
            ]}
          >
            <Text style={[styles.chipLabel, type === t.value && styles.chipLabelSelected]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={type === 'birthday' ? "Sarah's 30th" : 'Holiday Secret Santa'}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        maxLength={120}
      />

      <Text style={styles.label}>Budget (max, USD)</Text>
      <TextInput
        value={budgetMax}
        onChangeText={(v) => setBudgetMax(v.replace(/\D/g, ''))}
        keyboardType="number-pad"
        style={styles.input}
        maxLength={5}
      />

      {type === 'birthday' ? (
        <>
          <Text style={styles.label}>Birthday person</Text>
          {group.members.map((m) => (
            <Pressable
              key={m.userId}
              onPress={() => setRecipientUserId(m.userId)}
              style={({ pressed }) => [
                styles.option,
                recipientUserId === m.userId && styles.optionSelected,
                pressed && styles.optionPressed,
              ]}
            >
              <Text style={styles.optionLabel}>{m.displayName}</Text>
            </Pressable>
          ))}
        </>
      ) : (
        <>
          <Text style={styles.label}>Participants</Text>
          {group.members.map((m) => {
            const selected = participantIds.includes(m.userId);
            return (
              <Pressable
                key={m.userId}
                onPress={() => toggleParticipant(m.userId)}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && styles.optionPressed,
                ]}
              >
                <Text style={styles.optionLabel}>{m.displayName}</Text>
                {selected ? <Text style={styles.check}>✓</Text> : null}
              </Pressable>
            );
          })}
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        onPress={submit}
        disabled={!name.trim() || submitting}
        style={({ pressed }) => [
          styles.cta,
          (!name.trim() || submitting) && styles.ctaDisabled,
          pressed && styles.ctaPressed,
        ]}
      >
        {submitting ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={styles.ctaLabel}>Create</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: fontSize.hero, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  label: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.body,
    color: colors.text,
  },
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: '#FFF1D6' },
  chipPressed: { opacity: 0.85 },
  chipLabel: { color: colors.text, fontSize: fontSize.body },
  chipLabelSelected: { fontWeight: '700' },
  option: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: '#FFF1D6' },
  optionPressed: { opacity: 0.85 },
  optionLabel: { fontSize: fontSize.body, color: colors.text, fontWeight: '500' },
  check: { fontSize: fontSize.body, color: colors.primary, fontWeight: '700' },
  cta: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  ctaDisabled: { backgroundColor: colors.divider },
  ctaPressed: { opacity: 0.85 },
  ctaLabel: { fontSize: fontSize.subtitle, fontWeight: '600', color: colors.textOnPrimary },
  error: { color: colors.danger, fontSize: fontSize.caption, marginTop: spacing.sm },
});
