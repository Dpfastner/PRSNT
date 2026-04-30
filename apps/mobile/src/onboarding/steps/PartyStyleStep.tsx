import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, fontSize, radius, spacing } from '../../theme';
import { PARTY_STYLE_OPTIONS, PartyStyle } from '../types';

interface Props {
  value: PartyStyle | null;
  onChange: (value: PartyStyle) => void;
}

export function PartyStyleStep({ value, onChange }: Props) {
  return (
    <ScrollView
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    >
      {PARTY_STYLE_OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.option,
              selected && styles.optionSelected,
              pressed && styles.optionPressed,
            ]}
          >
            <Text
              style={[styles.label, selected && styles.labelSelected]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  option: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF1D6',
  },
  optionPressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: '500',
  },
  labelSelected: {
    fontWeight: '700',
  },
});
