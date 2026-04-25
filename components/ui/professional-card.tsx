import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface ProfessionalCardProps {
  name: string;
  specialty?: string;
  role?: string;
  rating: number;
  distance: string;
  initials: string;
  onPress?: () => void;
  buttonTitle?: string;
  onButtonPress?: () => void;
}

export function ProfessionalCard({
  name,
  specialty,
  role,
  rating,
  distance,
  initials,
  onPress,
  buttonTitle = 'Ver perfil',
  onButtonPress,
}: ProfessionalCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.role}>{specialty || role}</Text>
          <View style={styles.metaRow}>
            <View style={styles.ratingBadge}>
              <MaterialIcons name="star" size={13} color="#FFB800" />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
            <View style={styles.distanceBadge}>
              <MaterialIcons name="location-on" size={13} color={Colors.gray} />
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
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 3,
  },
  role: {
    fontSize: 13,
    color: Colors.gray,
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
    backgroundColor: '#FFF4E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: {
    color: '#BF6B00',
    fontSize: 12,
    fontWeight: '700',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  distanceText: {
    color: Colors.gray,
    fontSize: 12,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
