import { StyleSheet, Text, View } from 'react-native';
import { Card } from './card';
import { Colors } from '../../constants/theme';

interface MetricCardProps {
  label: string;
  value: string;
  note: string;
}

export function MetricCard({ label, value, note }: MetricCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.note}>{note}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 18,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 8,
  },
  label: {
    color: '#7A7A95',
    fontSize: 13,
    marginBottom: 10,
  },
  note: {
    color: '#8A8A8A',
    fontSize: 12,
  },
});
