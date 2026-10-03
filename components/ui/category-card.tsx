import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Radii } from '../../constants/theme';

interface CategoryCardProps {
  title: string;
  icon: string;
  onPress?: () => void;
  iconFamily?: "material" | "community";
}

export function CategoryCard({ title, icon, onPress, iconFamily = "material" }: CategoryCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.iconWrapper}>
        {iconFamily === "community" ? (
          <MaterialCommunityIcons name={icon as any} size={22} color={Colors.brandPrimary} />
        ) : (
          <MaterialIcons name={icon as any} size={22} color={Colors.brandPrimary} />
        )}
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
<<<<<<< HEAD
    width: '23%',
    minHeight: 84,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.6,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceNeutral,
=======
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 18,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.ink,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
<<<<<<< HEAD
    fontSize: 12,
=======
    fontSize: 11,
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
