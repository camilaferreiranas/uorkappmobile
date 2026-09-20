import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, onFocus, onBlur, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          error ? styles.inputError : null,
          style,
        ]}
        placeholderTextColor={Colors.textSecondary}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.space5,
    width: '100%',
  },
  label: {
    color: Colors.ink,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.space2,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.space4,
    paddingVertical: 14,
    minHeight: 44,
    color: Colors.ink,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputFocused: {
    borderColor: Colors.primary,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    marginTop: 6,
    color: Colors.error,
    fontSize: 13,
  },
});
