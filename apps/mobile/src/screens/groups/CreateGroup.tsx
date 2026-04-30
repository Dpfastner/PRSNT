import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, fontSize, radius, spacing } from '../../theme';
import { createGroup } from '../../api/client';
import type { ScreenProps } from '../../navigation/types';

const TYPES = ['family', 'friends', 'coworkers', 'mixed'] as const;
type GroupType = (typeof TYPES)[number];

interface Props extends ScreenProps<'CreateGroup'> {
  userId: string;
}

export function CreateGroup({ navigation, userId }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<GroupType>('family');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const group = await createGroup({
        name: name.trim(),
        type,
        createdByUserId: userId,
      });
      navigation.replace('GroupDetail', { groupId: group.id });
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>New group</Text>
      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. Smith Family"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoFocus
        maxLength={80}
      />
      <Text style={styles.label}>Type</Text>
      <View style={styles.row}>
        {TYPES.map((t) => (
          <Pressable
            key={t}
            onPress={() => setType(t)}
            style={({ pressed }) => [
              styles.chip,
              type === t && styles.chipSelected,
              pressed && styles.chipPressed,
            ]}
          >
            <Text style={[styles.chipLabel, type === t && styles.chipLabelSelected]}>
              {t}
            </Text>
          </Pressable>
        ))}
      </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: { fontSize: fontSize.hero, fontWeight: '700', color: colors.text },
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
    fontSize: fontSize.subtitle,
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
  chipLabel: { color: colors.text, fontSize: fontSize.body, textTransform: 'capitalize' },
  chipLabelSelected: { fontWeight: '700' },
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
  error: { color: colors.danger, fontSize: fontSize.caption },
});
