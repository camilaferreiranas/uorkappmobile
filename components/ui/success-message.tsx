import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View, ViewProps } from 'react-native';
<<<<<<< HEAD
import { Colors, Radii } from '../../constants/theme';

type Variant = 'success' | 'warning' | 'error' | 'info';
=======
import { Colors, Radius } from '../../constants/theme';
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439

interface SuccessMessageProps extends ViewProps {
  message: string;
  variant?: Variant;
  title?: string;
}

const TONE: Record<
  Variant,
  { bg: string; fg: string; icon: keyof typeof MaterialIcons.glyphMap }
> = {
  success: { bg: Colors.successSurface, fg: Colors.successText, icon: 'check-circle' },
  warning: { bg: Colors.warningSurface, fg: Colors.warningText, icon: 'error-outline' },
  error: { bg: Colors.errorSurface, fg: Colors.errorText, icon: 'error-outline' },
  info: { bg: Colors.brandTint, fg: Colors.brandDark, icon: 'info-outline' },
};

export function SuccessMessage({
  message,
  variant = 'success',
  title,
  style,
  ...props
}: SuccessMessageProps) {
  const tone = TONE[variant];
  return (
    <View
      accessibilityRole="alert"
      style={[styles.container, { backgroundColor: tone.bg }, style]}
      {...props}
    >
      <MaterialIcons name={tone.icon} size={20} color={tone.fg} style={styles.icon} />
      <View style={styles.body}>
        {title ? <Text style={[styles.title, { color: tone.fg }]}>{title}</Text> : null}
        <Text style={[styles.text, { color: tone.fg }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 14,
<<<<<<< HEAD
    borderRadius: Radii.md,
    flexDirection: 'row',
    gap: 10,
  },
  icon: {
    marginTop: 1,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  text: {
=======
    backgroundColor: '#EAF7ED',
    borderRadius: Radius.md,
  },
  text: {
    color: Colors.success,
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
    fontSize: 14,
    lineHeight: 20,
  },
});
