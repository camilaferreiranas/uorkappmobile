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
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
