<<<<<<< HEAD
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Radii } from '../../constants/theme';
=======
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius } from '../../constants/theme';
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439

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
        {options.map((option) => {
          const active = value === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.pill,
                active && styles.pillActive,
                pressed && !active && styles.pillPressed,
              ]}
              onPress={() => onSelect(option)}
            >
              <Text style={[styles.text, active && styles.textActive]}>{option}</Text>
            </Pressable>
          );
        })}
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
<<<<<<< HEAD
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: 10,
=======
    color: Colors.ink,
    fontWeight: '600',
    marginBottom: 8,
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    flexGrow: 1,
    flexBasis: '30%',
    minHeight: 44,
    paddingVertical: 12,
<<<<<<< HEAD
    paddingHorizontal: 12,
    borderRadius: Radii.pill,
=======
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceNeutral,
  },
  pillActive: {
<<<<<<< HEAD
    backgroundColor: Colors.brandPrimary,
  },
  pillPressed: {
    backgroundColor: Colors.brandTint,
  },
  text: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  textActive: {
    color: Colors.textOnBrand,
=======
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
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
  },
});
