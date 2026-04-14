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
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.black,
  },
  subtitle: {
    fontSize: 13,
    color: '#7A7A95',
  },
});
