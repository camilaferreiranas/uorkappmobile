import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

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
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    minWidth: 80,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 6,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginBottom: 6,
    lineHeight: 15,
  },
  note: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
});
