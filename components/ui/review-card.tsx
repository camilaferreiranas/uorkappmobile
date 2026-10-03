<<<<<<< HEAD
=======
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius } from '../../constants/theme';
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, ProfessionalColors, Radii } from '../../constants/theme';
import { Card } from './card';

interface ReviewCardProps {
  tone?: 'client' | 'professional';
  name: string;
  comment: string;
  rating: number;
  date?: string;
  distance?: string;
}

export function ReviewCard({ name, comment, rating, date, distance, tone = 'client' }: ReviewCardProps) {
  const Colors = tone === 'professional' ? ProfessionalColors : ClientColors;
  const styles = tone === 'professional' ? professionalStyles : clientStyles;
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          {(date || distance) && <Text style={styles.meta}>{date || distance}</Text>}
        </View>
<<<<<<< HEAD
        <View
          style={styles.ratingBadge}
          accessibilityLabel={`Avaliação ${rating.toFixed(1)} de 5`}
        >
          <MaterialIcons name="star" size={14} color={Colors.rating} />
=======
        <View style={styles.ratingBadge}>
          <MaterialIcons name="star" size={14} color={Colors.warning} />
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
      </View>
      <Text style={styles.comment}>{comment}</Text>
    </Card>
  );
}

const createStyles = (Colors: typeof ClientColors) => StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
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
    backgroundColor: Colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.textOnBrand,
    fontWeight: '800',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 14,
<<<<<<< HEAD
    fontWeight: '800',
    color: Colors.textPrimary,
=======
    fontWeight: '700',
    color: Colors.ink,
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
  },
  meta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
<<<<<<< HEAD
    backgroundColor: Colors.ratingSurface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.md,
  },
  ratingText: {
    color: Colors.warningText,
=======
    backgroundColor: '#FFF7EA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  ratingText: {
    color: Colors.warning,
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
    fontWeight: '700',
    fontSize: 13,
  },
  comment: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

const ClientColors = Colors;
const clientStyles = createStyles(ClientColors);
const professionalStyles = createStyles(ProfessionalColors);
