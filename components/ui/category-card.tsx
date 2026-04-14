import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface CategoryCardProps {
  title: string;
  icon: string;
  onPress?: () => void;
}

export function CategoryCard({ title, icon, onPress }: CategoryCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconWrapper}>
        <MaterialIcons name={icon as any} size={24} color={Colors.primary} />
      </View>
      <Text style={styles.label} numberOfLines={1}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '23%',
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFE9E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
    fontSize: 12,
    color: '#444',
    fontWeight: '600',
  },
});
