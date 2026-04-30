import { StyleSheet, TextInput } from 'react-native';
import { colors, fontSize, radius, spacing } from '../../theme';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function NameStep({ value, onChange }: Props) {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder="Your name"
      placeholderTextColor={colors.textMuted}
      autoCapitalize="words"
      autoCorrect={false}
      autoFocus
      maxLength={60}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.title,
    color: colors.text,
  },
});
