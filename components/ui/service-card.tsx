import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from './card';

interface ServiceCardProps {
  title: string;
  price: string;
  subtitle: string;
  rating: number;
  onPress?: () => void;
}

export function ServiceCard({ title, price, subtitle, rating, onPress }: ServiceCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
    <Card style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{price}</Text>
        <View style={styles.ratingBadge}>
          <MaterialIcons name="star" size={14} color={Colors.warning} />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
      </View>
    </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7EA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  ratingText: {
    color: Colors.warning,
    fontWeight: '700',
    fontSize: 13,
  },
});
