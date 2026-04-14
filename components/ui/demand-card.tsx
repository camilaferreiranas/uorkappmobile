import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Card } from './card';
import { Colors } from '../../constants/theme';
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
    fontWeight: '800',
    marginBottom: 6,
    color: Colors.black,
  },
  subtitle: {
    fontSize: 13,
    color: '#7A7A95',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tag: {
    backgroundColor: '#F8F3E8',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    color: '#D86A3F',
    fontWeight: '700',
    fontSize: 12,
  },
  distance: {
    color: '#8A8A8A',
    fontSize: 12,
  },
  action: {
    alignItems: 'flex-end',
  },
  budget: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    height: 'auto',
    backgroundColor: '#0D3D8B',
  },
  buttonText: {
    fontSize: 12,
  }
});
