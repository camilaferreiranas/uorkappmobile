import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Card } from './card';
import { Colors, Radius } from '../../constants/theme';
import { Button } from './button';

interface DemandCardProps {
  title: string;
  subtitle: string;
  budget: string;
  urgency: string;
  distance: string;
  onPressAction?: () => void;
}

export function DemandCard({
  title,
  subtitle,
  budget,
  urgency,
  distance,
  onPressAction,
}: DemandCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.metaRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{urgency}</Text>
          </View>
          <Text style={styles.distance}>{distance}</Text>
        </View>
      </View>
      <View style={styles.action}>
        <Text style={styles.budget}>{budget}</Text>
        <Button 
          title="Proposta" 
          onPress={onPressAction} 
          style={styles.button}
          textStyle={styles.buttonText} 
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    marginHorizontal: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    color: Colors.ink,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tag: {
    backgroundColor: '#FFF7EA',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    color: Colors.warning,
    fontWeight: '700',
    fontSize: 12,
  },
  distance: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  action: {
    alignItems: 'flex-end',
  },
  budget: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    height: 'auto',
  },
  buttonText: {
    fontSize: 12,
  }
});
