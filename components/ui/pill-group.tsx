import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/theme';

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
    color: Colors.black,
    fontWeight: '700',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  text: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: '700',
  },
  textActive: {
    color: Colors.white,
  },
});
