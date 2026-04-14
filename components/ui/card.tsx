import { StyleSheet, View, ViewProps } from 'react-native';
import { Colors } from '../../constants/theme';

export function Card({ style, children, ...props }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 28,
    padding: 24,
    shadowColor: Colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
});
