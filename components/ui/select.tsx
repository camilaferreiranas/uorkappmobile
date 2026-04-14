import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface SelectProps {
  label?: string;
  value: string;
  options: string[];
  placeholder?: string;
  onSelect: (value: string) => void;
}

export function Select({ label, value, options, placeholder, onSelect }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <MaterialIcons
          name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color={Colors.gray}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.option}
              onPress={() => {
                onSelect(option);
                setIsOpen(false);
              }}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
  input: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  value: {
    fontSize: 16,
    color: Colors.black,
  },
  placeholder: {
    color: Colors.gray,
  },
  dropdown: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionText: {
    color: Colors.black,
    fontSize: 15,
  },
});
