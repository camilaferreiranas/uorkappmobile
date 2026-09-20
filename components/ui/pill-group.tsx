import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

interface PillGroupProps {
  label?: string;
  options: string[];
  value: string;
  onSelect: (value: string) => void;
}

export function PillGroup({ label, options, value, onSelect }: PillGroupProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.pill, value === option && styles.pillActive]}
            onPress={() => onSelect(option)}
            activeOpacity={0.7}
          >
            <Text style={[styles.text, value === option && styles.textActive]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: Colors.ink,
    fontWeight: '600',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  pillActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  text: {
    fontSize: 14,
    color: Colors.ink,
    fontWeight: '600',
  },
  textActive: {
    color: Colors.primary,
  },
});
