import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
}

const ratingLabels = ['Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente!'];

export function StarRating({ rating, onRatingChange, size = 42 }: StarRatingProps) {
  return (
    <View style={styles.container}>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((value) => (
          <TouchableOpacity
            key={value}
            onPress={() => onRatingChange(value)}
            style={styles.starButton}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={rating >= value ? 'star' : 'star-border'}
              size={size}
              color={rating >= value ? '#FFB800' : Colors.gray}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>
        {rating > 0 ? ratingLabels[rating - 1] : 'Selecione uma nota'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  label: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.gray,
    fontWeight: '600',
  },
});
