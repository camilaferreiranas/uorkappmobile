import { StyleSheet, Text, View, ViewProps } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

interface SuccessMessageProps extends ViewProps {
  message: string;
}

export function SuccessMessage({ message, style, ...props }: SuccessMessageProps) {
  return (
    <View style={[styles.container, style]} {...props}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    padding: 14,
    backgroundColor: '#EAF7ED',
    borderRadius: Radius.md,
  },
  text: {
    color: Colors.success,
    fontSize: 14,
    lineHeight: 20,
  },
});
