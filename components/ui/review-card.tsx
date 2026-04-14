import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from './card';

interface ReviewCardProps {
  name: string;
  comment: string;
  rating: number;
  date?: string;
  distance?: string;
}

export function ReviewCard({ name, comment, rating, date, distance }: ReviewCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          {(date || distance) && (
            <Text style={styles.meta}>{date || distance}</Text>
          )}
        </View>
        <View style={styles.ratingBadge}>
          <MaterialIcons name="star" size={14} color="#FFB800" />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
      </View>
      <Text style={styles.comment}>{comment}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 14,
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontWeight: '800',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.black,
  },
  meta: {
    fontSize: 12,
    color: Colors.gray,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF4E8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ratingText: {
    color: '#BF6B00',
    fontWeight: '700',
    fontSize: 13,
  },
  comment: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 20,
  },
});
