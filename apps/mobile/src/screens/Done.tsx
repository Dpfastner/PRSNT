import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

interface Props {
  userId: string;
  onRestart: () => void;
}

export function Done({ userId, onRestart }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <Text style={styles.emoji}>🎁</Text>
        <Text style={styles.title}>You're set.</Text>
        <Text style={styles.body}>
          Profile saved. The people in your group can now get suggestions
          tuned to you.
        </Text>
        <Text style={styles.userId}>id: {userId}</Text>
      </View>
      <Pressable
        onPress={onRestart}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
      >
        <Text style={styles.ctaLabel}>Start over (dev)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  emoji: {
    fontSize: 72,
  },
  title: {
    marginTop: spacing.lg,
    fontSize: fontSize.hero,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    marginTop: spacing.md,
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 320,
  },
  userId: {
    marginTop: spacing.xl,
    fontSize: fontSize.caption,
    color: colors.textMuted,
    fontFamily: 'Courier',
  },
  cta: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaLabel: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.text,
  },
});
