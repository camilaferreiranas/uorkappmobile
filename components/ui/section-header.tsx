import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  style?: any;
}

export function SectionHeader({ title, subtitle, style }: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
  },
});
