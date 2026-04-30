import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../../theme';

interface Props {
  values: [string, string, string];
  onChange: (index: 0 | 1 | 2, value: string) => void;
}

const PLACEHOLDERS = [
  'e.g. fancy candles',
  'e.g. car detailing',
  'e.g. nice stationery',
];

export function WontBuySelfStep({ values, onChange }: Props) {
  return (
    <ScrollView
      contentContainerStyle={styles.list}
      keyboardShouldPersistTaps="handled"
    >
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.fieldWrap}>
          <TextInput
            style={styles.input}
            value={values[i] ?? ''}
            onChangeText={(v) => onChange(i as 0 | 1 | 2, v)}
            placeholder={PLACEHOLDERS[i]}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="sentences"
            autoCorrect
            autoFocus={i === 0}
            maxLength={80}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  fieldWrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.body,
    color: colors.text,
  },
});
