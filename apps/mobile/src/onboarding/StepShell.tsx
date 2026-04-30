import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

interface StepShellProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}

export function StepShell({
  stepNumber,
  totalSteps,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel = 'Continue',
}: StepShellProps) {
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.progress}>
          {stepNumber} of {totalSteps}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(stepNumber / totalSteps) * 100}%` },
            ]}
          />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.content}>{children}</View>
      </View>

      <View style={styles.footer}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.backBtn,
              pressed && styles.btnPressed,
            ]}
          >
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
        ) : (
          <View style={styles.backBtnSpacer} />
        )}
        <Pressable
          onPress={onNext}
          disabled={nextDisabled}
          style={({ pressed }) => [
            styles.nextBtn,
            nextDisabled && styles.nextBtnDisabled,
            pressed && !nextDisabled && styles.btnPressed,
          ]}
        >
          <Text
            style={[
              styles.nextLabel,
              nextDisabled && styles.nextLabelDisabled,
            ]}
          >
            {nextLabel}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  progress: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  progressBar: {
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 42,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: fontSize.body,
    color: colors.textMuted,
    lineHeight: 22,
  },
  content: {
    marginTop: spacing.xl,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  backBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  backBtnSpacer: {
    width: 1,
  },
  backLabel: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    fontWeight: '500',
  },
  nextBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: colors.divider,
  },
  btnPressed: {
    opacity: 0.85,
  },
  nextLabel: {
    fontSize: fontSize.subtitle,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  nextLabelDisabled: {
    color: colors.textMuted,
  },
});
