import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/theme';

interface MetricCardProps {
  label: string;
  value: string;
  note: string;
}

export function MetricCard({ label, value, note }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
      <Text style={styles.note}>{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    minWidth: 80,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 6,
  },
  label: {
    color: '#7A7A95',
    fontSize: 11,
    marginBottom: 6,
    lineHeight: 15,
  },
  note: {
    color: '#B0B0B0',
    fontSize: 10,
    fontWeight: '600',
  },
});
