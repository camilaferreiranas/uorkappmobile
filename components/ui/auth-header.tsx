import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/theme';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  title: {
<<<<<<< HEAD
    color: Colors.brandDark,
    fontSize: 32,
    fontWeight: '800',
=======
    color: Colors.white,
    fontSize: 34,
    fontWeight: '700',
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
});
