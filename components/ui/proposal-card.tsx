import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Radii, Shadow } from '../../constants/theme';
import { Button } from './button';

interface ProposalCardProps {
  name: string;
  initials: string;
  rating: number;
  jobs: number;
  message: string;
  price: string;
  eta: string;
  highlighted?: boolean;
  onAccept?: () => void;
  onViewProfile?: () => void;
}

export function ProposalCard({
  name,
  initials,
  rating,
  jobs,
  message,
  price,
  eta,
  highlighted = false,
  onAccept,
  onViewProfile,
}: ProposalCardProps) {
  return (
    <View style={[styles.card, highlighted && styles.highlighted]}>
      {highlighted && (
        <View style={styles.badge}>
          <MaterialIcons name="bolt" size={13} color={Colors.textOnBrand} />
          <Text style={styles.badgeText}>Melhor proposta</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.metaRow}>
            <MaterialIcons name="star" size={13} color={Colors.rating} />
            <Text style={styles.meta}>
              {rating.toFixed(1)} · {jobs} serviços
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.message}>{message}</Text>

      <View style={styles.figures}>
        <View>
          <Text style={styles.figureLabel}>Valor proposto</Text>
          <Text style={styles.price}>{price}</Text>
        </View>
        <View style={styles.etaBlock}>
          <Text style={styles.figureLabel}>Prazo</Text>
          <Text style={styles.eta}>{eta}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <View style={styles.acceptWrap}>
          <Button title="Aceitar proposta" onPress={onAccept} style={styles.accept} />
        </View>
        <Pressable
          onPress={onViewProfile}
          accessibilityRole="button"
          style={({ pressed }) => [styles.profileBtn, pressed && styles.profileBtnPressed]}
        >
          <Text style={styles.profileBtnText}>Ver perfil</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radii.xl,
    padding: 16,
    marginBottom: 12,
    ...Shadow.card,
  },
  highlighted: {
    borderWidth: 1.5,
    borderColor: Colors.brandPrimary,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.brandPrimary,
    borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  badgeText: {
    color: Colors.textOnBrand,
    fontSize: 11,
    fontWeight: '800',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.textOnBrand,
    fontWeight: '800',
    fontSize: 16,
  },
  headerText: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  figures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: Colors.surfaceNeutral,
    borderRadius: Radii.md,
    padding: 12,
    marginBottom: 14,
  },
  etaBlock: {
    alignItems: 'flex-end',
  },
  figureLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.brandDark,
  },
  eta: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  acceptWrap: {
    flex: 1,
  },
  accept: {
    minHeight: 46,
    paddingVertical: 12,
  },
  profileBtn: {
    minHeight: 46,
    paddingHorizontal: 16,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtnPressed: {
    backgroundColor: Colors.surfaceNeutral,
  },
  profileBtnText: {
    color: Colors.brandPrimary,
    fontWeight: '800',
    fontSize: 14,
  },
});
