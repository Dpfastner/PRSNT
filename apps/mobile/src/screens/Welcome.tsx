import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

interface Props {
  onStart: () => void;
}

export function Welcome({ onStart }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <Text style={styles.brand}>PRSNT</Text>
        <Text style={styles.tagline}>So you want to buy me a gift.</Text>
        <Text style={styles.body}>
          Fill out a short profile so the people who love you can find a gift
          you'll actually want. Takes about 90 seconds.
        </Text>
      </View>
      <Pressable
        onPress={onStart}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
      >
        <Text style={styles.ctaLabel}>Get started</Text>
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
  brand: {
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: 6,
    color: colors.text,
  },
  tagline: {
    marginTop: spacing.md,
    fontSize: fontSize.subtitle,
    color: colors.textMuted,
    textAlign: 'center',
  },
  body: {
    marginTop: spacing.xl,
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 320,
  },
  cta: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaLabel: {
    fontSize: fontSize.subtitle,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
});
