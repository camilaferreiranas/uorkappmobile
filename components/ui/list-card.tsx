import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Radii } from '../../constants/theme';

interface ListCardProps {
  title: string;
  /** Secondary line, usually a place or role. */
  subtitle?: string;
  subtitleIcon?: keyof typeof MaterialIcons.glyphMap;
  price?: string;
  priceUnit?: string;
  /** Avatar initials (mutually exclusive with `icon`). */
  initials?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  rating?: number;
  /** Trailing control. */
  trailing?: 'favorite' | 'chevron' | 'none';
  favorited?: boolean;
  onToggleFavorite?: () => void;
  onPress?: () => void;
}

export function ListCard({
  title,
  subtitle,
  subtitleIcon = 'place',
  price,
  priceUnit,
  initials,
  icon,
  rating,
  trailing = 'chevron',
  favorited = false,
  onToggleFavorite,
  onPress,
}: ListCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.media}>
        {initials ? (
          <Text style={styles.initials}>{initials}</Text>
        ) : (
          <MaterialIcons name={icon ?? 'work'} size={24} color={Colors.brandPrimary} />
        )}
        {typeof rating === 'number' && (
          <View style={styles.ratingChip}>
            <MaterialIcons name="star" size={10} color={Colors.rating} />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <View style={styles.metaRow}>
            <MaterialIcons name={subtitleIcon} size={13} color={Colors.textSecondary} />
            <Text style={styles.meta} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        ) : null}
        {price ? (
          <Text style={styles.price}>
            {price}
            {priceUnit ? <Text style={styles.priceUnit}> {priceUnit}</Text> : null}
          </Text>
        ) : null}
      </View>

      {trailing === 'favorite' && (
        <Pressable
          onPress={onToggleFavorite}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={favorited ? 'Remover dos salvos' : 'Salvar'}
          style={styles.trailingBtn}
        >
          <MaterialIcons
            name={favorited ? 'favorite' : 'favorite-border'}
            size={22}
            color={favorited ? Colors.error : Colors.textMuted}
          />
        </Pressable>
      )}
      {trailing === 'chevron' && (
        <MaterialIcons
          name="chevron-right"
          size={22}
          color={Colors.textMuted}
          style={styles.trailingBtn}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surfaceNeutral,
    borderRadius: Radii.lg,
    padding: 12,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  media: {
    width: 64,
    height: 64,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.brandPrimary,
  },
  ratingChip: {
    position: 'absolute',
    top: -6,
    right: -6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.brandDark,
    borderRadius: Radii.pill,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textOnBrand,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  meta: {
    fontSize: 12,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.brandDark,
    marginTop: 2,
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  trailingBtn: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
