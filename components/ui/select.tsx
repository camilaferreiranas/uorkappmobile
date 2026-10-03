import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Radii, Shadow } from '../../constants/theme';

interface SelectProps {
  label?: string;
  value: string;
  options: string[];
  placeholder?: string;
  error?: string;
  onSelect: (value: string) => void;
}

export function Select({
  label,
  value,
  options,
  placeholder,
  error,
  onSelect,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: isOpen }}
        style={[
          styles.input,
          isOpen && styles.inputOpen,
          error ? styles.inputError : null,
        ]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <MaterialIcons
          name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color={Colors.textSecondary}
        />
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {isOpen && (
        <View style={styles.dropdown}>
          {options.map((option) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
              onPress={() => {
                onSelect(option);
                setIsOpen(false);
              }}
            >
              <Text style={styles.optionText}>{option}</Text>
              {value === option && (
                <MaterialIcons name="check" size={18} color={Colors.brandPrimary} />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surfaceNeutral,
    borderRadius: Radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputOpen: {
    borderColor: Colors.brandPrimary,
    backgroundColor: Colors.surfaceWhite,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorSurface,
  },
  value: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  placeholder: {
    color: Colors.textMuted,
  },
  errorText: {
    marginTop: 6,
    color: Colors.errorText,
    fontSize: 13,
    lineHeight: 18,
  },
  dropdown: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radii.md,
    marginTop: 8,
    overflow: 'hidden',
    ...Shadow.card,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionPressed: {
    backgroundColor: Colors.brandTint,
  },
  optionText: {
    color: Colors.textPrimary,
    fontSize: 15,
  },
});
