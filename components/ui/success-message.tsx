import { StyleSheet, Text, View, ViewProps } from 'react-native';

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
    backgroundColor: '#E8F6EC',
    borderRadius: 16,
  },
  text: {
    color: '#176B36',
    fontSize: 14,
    lineHeight: 20,
  },
});
