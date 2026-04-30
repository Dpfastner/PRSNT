import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../../theme';
import { GIFT_CATEGORY_OPTIONS } from '../types';

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
  max?: number;
}

export function CategoriesStep({ value, onChange, max = 5 }: Props) {
  function toggle(cat: string) {
    if (value.includes(cat)) {
      onChange(value.filter((c) => c !== cat));
    } else if (value.length < max) {
      onChange([...value, cat]);
    }
  }

  return (
    <View style={styles.root}>
      <Text style={styles.helper}>
        Pick up to {max}. ({value.length}/{max})
      </Text>
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {GIFT_CATEGORY_OPTIONS.map((opt) => {
          const selected = value.includes(opt.value);
          const disabled = !selected && value.length >= max;
          return (
            <Pressable
              key={opt.value}
              onPress={() => toggle(opt.value)}
              disabled={disabled}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                disabled && styles.chipDisabled,
                pressed && !disabled && styles.chipPressed,
              ]}
            >
              <Text
                style={[
                  styles.chipLabel,
                  selected && styles.chipLabelSelected,
                  disabled && styles.chipLabelDisabled,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  helper: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipLabel: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: '500',
  },
  chipLabelSelected: {
    color: colors.textOnPrimary,
    fontWeight: '700',
  },
  chipLabelDisabled: {
    color: colors.textMuted,
  },
});
