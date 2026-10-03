import { StyleSheet, View, ViewProps } from 'react-native';
<<<<<<< HEAD
import { Colors, Radii, Shadow } from '../../constants/theme';
=======
import { Colors, Radius, Spacing } from '../../constants/theme';
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439

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
<<<<<<< HEAD
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
=======
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.space6,
    shadowColor: Colors.ink,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
  },
});
