import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from './card';
import { Button } from './button';

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
    <Card style={styles.card}>
      <TouchableOpacity 
        style={styles.profileInfo} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileText}>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileSpecialty}>{specialty || role}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.ratingBadge}>
              <MaterialIcons name="star" size={14} color="#FFB800" />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.distanceText}>{distance}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <Button
        title={buttonTitle}
        onPress={onButtonPress || onPress}
        style={styles.profileButton}
        textStyle={styles.profileButtonText}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    marginBottom: 16,
    borderRadius: 22,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 4,
  },
  profileSpecialty: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF4E8',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
  },
  ratingText: {
    color: '#BF6B00',
    fontSize: 13,
    fontWeight: '700',
  },
  distanceText: {
    color: Colors.gray,
    fontSize: 13,
  },
  profileButton: {
    marginTop: 18,
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    width: 'auto',
    height: 'auto',
  },
  profileButtonText: {
    fontSize: 14,
  },
});
