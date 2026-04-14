import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Colors } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={Colors.gray}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    width: '100%',
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.lightGray,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.black,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: Colors.primary,
  },
  errorText: {
    marginTop: 6,
    color: Colors.error,
    fontSize: 13,
  },
});
