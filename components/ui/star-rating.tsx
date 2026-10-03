import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/theme';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
}

const ratingLabels = ['Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente!'];

export function StarRating({ rating, onRatingChange, size = 40 }: StarRatingProps) {
  return (
    <View style={styles.container}>
      <View style={styles.starsRow} accessibilityRole="adjustable">
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityLabel={`${value} ${value === 1 ? 'estrela' : 'estrelas'}`}
            accessibilityState={{ selected: rating >= value }}
            onPress={() => onRatingChange(value)}
            style={styles.starButton}
            hitSlop={6}
          >
            <MaterialIcons
              name={rating >= value ? 'star' : 'star-border'}
              size={size}
<<<<<<< HEAD
              color={rating >= value ? Colors.rating : Colors.textMuted}
=======
              color={rating >= value ? Colors.warning : Colors.textSecondary}
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
            />
          </Pressable>
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
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
