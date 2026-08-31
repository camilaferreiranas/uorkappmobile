import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onSubtitlePress?: () => void;
  style?: any;
}

export function SectionHeader({ title, subtitle, onSubtitlePress, style }: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && onSubtitlePress ? (
        <TouchableOpacity
          onPress={onSubtitlePress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={subtitle}
          hitSlop={10}
        >
          <Text style={styles.subtitle}>{subtitle}</Text>
        </TouchableOpacity>
      ) : subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}
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
