import { StyleSheet, View, ViewProps } from 'react-native';
import { Colors, Radii, Shadow } from '../../constants/theme';

interface CardProps extends ViewProps {
  /** Flat card: hairline border instead of a shadow. */
  flat?: boolean;
}

export function Card({ style, children, flat = false, ...props }: CardProps) {
  return (
    <View style={[styles.card, flat ? styles.flat : styles.raised, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radii.xl,
    padding: 20,
  },
  raised: {
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  flat: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
