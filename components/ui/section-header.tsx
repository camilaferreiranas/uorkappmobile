<<<<<<< HEAD
import { Pressable, StyleSheet, Text, View } from 'react-native';
=======
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
import { Colors } from '../../constants/theme';

interface SectionHeaderProps {
  title: string;
  /** Muted supporting text (e.g. a count). */
  subtitle?: string;
<<<<<<< HEAD
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
=======
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
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
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
<<<<<<< HEAD
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
=======
    fontSize: 19,
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.3,
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
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
