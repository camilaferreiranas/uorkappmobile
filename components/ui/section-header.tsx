import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/theme';

interface SectionHeaderProps {
  title: string;
  /** Muted supporting text (e.g. a count). */
  subtitle?: string;
  /** Tappable action shown on the right (e.g. "Ver todos"). */
  actionLabel?: string;
  onAction?: () => void;
  style?: any;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {actionLabel && (
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={onAction}
          style={({ pressed }) => pressed && styles.actionPressed}
        >
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  action: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.brandPrimary,
  },
  actionPressed: {
    opacity: 0.6,
  },
});
