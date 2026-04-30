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
import { addGroupMember } from '../../api/client';
import type { ScreenProps } from '../../navigation/types';

export function AddMember({ route, navigation }: ScreenProps<'AddMember'>) {
  const { groupId } = route.params;
  const [userId, setUserId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    const id = userId.trim();
    if (!id) return;
    setSubmitting(true);
    setError(null);
    try {
      await addGroupMember(groupId, id);
      setDone(true);
      setTimeout(() => navigation.goBack(), 600);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Add a member</Text>
      <Text style={styles.subtitle}>
        Paste their PRSNT user ID. Once auth ships, this becomes a share link.
      </Text>
      <TextInput
        value={userId}
        onChangeText={setUserId}
        placeholder="user id"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {done ? (
        <Text style={styles.ok}>Added.</Text>
      ) : (
        <Pressable
          onPress={submit}
          disabled={!userId.trim() || submitting}
          style={({ pressed }) => [
            styles.cta,
            (!userId.trim() || submitting) && styles.ctaDisabled,
            pressed && styles.ctaPressed,
          ]}
        >
          {submitting ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.ctaLabel}>Add</Text>
          )}
        </Pressable>
      )}
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
  subtitle: { fontSize: fontSize.body, color: colors.textMuted },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.body,
    color: colors.text,
    fontFamily: 'Courier',
  },
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
  ok: { color: colors.primary, fontSize: fontSize.body, fontWeight: '600' },
});
