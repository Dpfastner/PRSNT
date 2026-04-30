import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../theme';
import { postOnboarding } from '../api/client';
import { StepShell } from './StepShell';
import { NameStep } from './steps/NameStep';
import { BirthdayStep } from './steps/BirthdayStep';
import { PartyStyleStep } from './steps/PartyStyleStep';
import { CategoriesStep } from './steps/CategoriesStep';
import { WontBuySelfStep } from './steps/WontBuySelfStep';
import {
  buildBirthdayIso,
  INITIAL_STATE,
  isStepValid,
  OnboardingState,
  STEP_ORDER,
  Step,
} from './types';

interface Props {
  onComplete: (result: {
    userId: string;
    profileId: string;
    displayName: string;
  }) => void;
}

const TOTAL = STEP_ORDER.length;

export function OnboardingFlow({ onComplete }: Props) {
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step: Step = STEP_ORDER[stepIndex] ?? 'name';
  const valid = isStepValid(step, state);
  const isLast = stepIndex === TOTAL - 1;

  function update<K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function back() {
    setError(null);
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  async function next() {
    setError(null);
    if (!isLast) {
      setStepIndex(stepIndex + 1);
      return;
    }
    const birthday = buildBirthdayIso(state);
    if (!birthday || !state.partyStyle) return;
    const wontBuySelf = state.wontBuySelf
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    setSubmitting(true);
    try {
      const displayName = state.displayName.trim();
      const result = await postOnboarding({
        displayName,
        birthday,
        partyStyle: state.partyStyle,
        giftCategoriesLiked: state.giftCategoriesLiked,
        wontBuySelf,
      });
      onComplete({ ...result, displayName });
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  if (submitting) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Saving your profile…</Text>
      </View>
    );
  }

  let content;
  switch (step) {
    case 'name':
      content = (
        <NameStep
          value={state.displayName}
          onChange={(v) => update('displayName', v)}
        />
      );
      break;
    case 'birthday':
      content = (
        <BirthdayStep
          month={state.birthdayMonth}
          day={state.birthdayDay}
          year={state.birthdayYear}
          onChange={(field, v) => update(field, v)}
        />
      );
      break;
    case 'partyStyle':
      content = (
        <PartyStyleStep
          value={state.partyStyle}
          onChange={(v) => update('partyStyle', v)}
        />
      );
      break;
    case 'categories':
      content = (
        <CategoriesStep
          value={state.giftCategoriesLiked}
          onChange={(v) => update('giftCategoriesLiked', v)}
        />
      );
      break;
    case 'wontBuySelf':
      content = (
        <WontBuySelfStep
          values={state.wontBuySelf}
          onChange={(i, v) => {
            const next = [...state.wontBuySelf] as [string, string, string];
            next[i] = v;
            update('wontBuySelf', next);
          }}
        />
      );
      break;
    default:
      content = null;
  }

  const titles: Record<Exclude<Step, 'submitting' | 'done'>, { title: string; subtitle?: string }> = {
    name: {
      title: 'What should we call you?',
      subtitle: 'This is what shows up on gift suggestions.',
    },
    birthday: {
      title: 'When were you born?',
      subtitle: 'So your people don\'t miss it (and so we can keep things age-appropriate).',
    },
    partyStyle: {
      title: 'How do you want to spend your birthday?',
      subtitle: 'No wrong answers. Pick the one closest to your vibe.',
    },
    categories: {
      title: 'What kinds of gifts make you happy?',
    },
    wontBuySelf: {
      title: 'Things you love but won\'t buy yourself.',
      subtitle: 'The single best signal for a great gift. Examples: candles, fancy chocolate, car detailing.',
    },
  };
  const tt = titles[step as Exclude<Step, 'submitting' | 'done'>];

  return (
    <>
      <StepShell
        stepNumber={stepIndex + 1}
        totalSteps={TOTAL}
        title={tt.title}
        subtitle={tt.subtitle}
        onBack={stepIndex > 0 ? back : undefined}
        onNext={next}
        nextDisabled={!valid}
        nextLabel={isLast ? 'Finish' : 'Continue'}
      >
        {content}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </StepShell>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  error: {
    marginTop: spacing.md,
    color: colors.danger,
    fontSize: fontSize.caption,
  },
});
