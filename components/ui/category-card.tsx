import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Colors } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CONTAINER_H_PADDING = 44; // 2 × 22px from categoriesGrid paddingHorizontal
const NUM_COLS = 4;
const GAP = 12;

interface CategoryCardProps {
  title: string;
  icon: string;
  onPress?: () => void;
}

export function CategoryCard({ title, icon, onPress }: CategoryCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - CONTAINER_H_PADDING - GAP * (NUM_COLS - 1)) / NUM_COLS;

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons
          name={icon as any}
          size={26}
          color={Colors.primary}
        />
      </View>
      <Text style={styles.label} numberOfLines={2}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFE9E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
    fontSize: 11,
    color: '#444',
    fontWeight: '600',
    lineHeight: 15,
  },
});
