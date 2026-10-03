import { useState } from 'react';
<<<<<<< HEAD
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Colors, Radii } from '../../constants/theme';
=======
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  /** Optional helper text shown when there is no error. */
  hint?: string;
}

<<<<<<< HEAD
export function Input({ label, error, hint, style, onFocus, onBlur, ...props }: InputProps) {
=======
export function Input({ label, error, style, onFocus, onBlur, ...props }: InputProps) {
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
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
<<<<<<< HEAD
        placeholderTextColor={Colors.textMuted}
        accessibilityLabel={label}
=======
        placeholderTextColor={Colors.textSecondary}
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
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
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
<<<<<<< HEAD
    marginBottom: 16,
    width: '100%',
  },
  label: {
    color: Colors.textPrimary,
=======
    marginBottom: Spacing.space5,
    width: '100%',
  },
  label: {
    color: Colors.ink,
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.space2,
  },
  input: {
<<<<<<< HEAD
    backgroundColor: Colors.surfaceNeutral,
    borderRadius: Radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
    color: Colors.textPrimary,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
=======
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
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
  },
  inputFocused: {
    borderColor: Colors.brandPrimary,
    backgroundColor: Colors.surfaceWhite,
  },
  inputError: {
    borderColor: Colors.error,
<<<<<<< HEAD
    backgroundColor: Colors.errorSurface,
=======
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
  },
  errorText: {
    marginTop: 6,
    color: Colors.errorText,
    fontSize: 13,
    lineHeight: 18,
  },
  hintText: {
    marginTop: 6,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
