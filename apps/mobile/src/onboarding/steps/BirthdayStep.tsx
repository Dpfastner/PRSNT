import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../../theme';

interface Props {
  month: string;
  day: string;
  year: string;
  onChange: (field: 'birthdayMonth' | 'birthdayDay' | 'birthdayYear', value: string) => void;
}

export function BirthdayStep({ month, day, year, onChange }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <Text style={styles.label}>Month</Text>
        <TextInput
          style={styles.input}
          value={month}
          onChangeText={(v) => onChange('birthdayMonth', v.replace(/\D/g, '').slice(0, 2))}
          placeholder="MM"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={2}
          autoFocus
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Day</Text>
        <TextInput
          style={styles.input}
          value={day}
          onChangeText={(v) => onChange('birthdayDay', v.replace(/\D/g, '').slice(0, 2))}
          placeholder="DD"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={2}
        />
      </View>
      <View style={styles.fieldYear}>
        <Text style={styles.label}>Year</Text>
        <TextInput
          style={styles.input}
          value={year}
          onChangeText={(v) => onChange('birthdayYear', v.replace(/\D/g, '').slice(0, 4))}
          placeholder="YYYY"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={4}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  field: {
    flex: 1,
  },
  fieldYear: {
    flex: 1.4,
  },
  label: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.title,
    color: colors.text,
    textAlign: 'center',
  },
});
