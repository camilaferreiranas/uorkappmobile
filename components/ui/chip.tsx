import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Colors, Radii } from '../../constants/theme';

interface ChipProps {
  label: string;
  active?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
}

export function Chip({ label, active = false, icon, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && !active && styles.chipPressed,
      ]}
    >
      {icon && (
        <MaterialIcons
          name={icon}
          size={15}
          color={active ? Colors.textOnBrand : Colors.textSecondary}
        />
      )}
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

interface ChipRowProps {
  children: React.ReactNode;
}

/** Horizontally scrolling row of chips with edge padding that bleeds to screen edges. */
export function ChipRow({ children }: ChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginHorizontal: -16,
  },
  row: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: Radii.pill,
    backgroundColor: Colors.surfaceNeutral,
  },
  chipActive: {
    backgroundColor: Colors.brandPrimary,
  },
  chipPressed: {
    backgroundColor: Colors.brandTint,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  textActive: {
    color: Colors.textOnBrand,
  },
});
