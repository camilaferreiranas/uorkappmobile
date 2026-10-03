import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Colors, Radius } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { ProfileAvatar } from './profile-avatar';

interface ProfessionalCardProps {
  name: string;
  specialty?: string;
  role?: string;
  rating: number;
  distance: string;
  initials: string;
  imageUrl?: string | null;
  onPress?: () => void;
  buttonTitle?: string;
  onButtonPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ProfessionalCard({
  name,
  specialty,
  role,
  rating,
  distance,
  initials,
  imageUrl,
  onPress,
  buttonTitle = 'Ver perfil',
  onButtonPress,
  style,
}: ProfessionalCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.row}>
        <ProfileAvatar
          imageUrl={imageUrl}
          initials={initials}
          size={48}
          backgroundColor={Colors.primary}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.role}>{specialty || role}</Text>
          <View style={styles.metaRow}>
            <View style={styles.ratingBadge}>
              <MaterialIcons name="star" size={13} color={Colors.warning} />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
            <View style={styles.distanceBadge}>
              <MaterialIcons name="location-on" size={13} color={Colors.textSecondary} />
              <Text style={styles.distanceText}>{distance}</Text>
            </View>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={onButtonPress || onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{buttonTitle}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: Colors.ink,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 3,
  },
  role: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF7EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  ratingText: {
    color: Colors.warning,
    fontSize: 12,
    fontWeight: '700',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  distanceText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
