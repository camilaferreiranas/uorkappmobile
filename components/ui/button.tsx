import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
} from 'react-native';
import { Colors, Radius, Typography } from '../../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  textStyle?: any;
}

export function Button({
  title,
  loading,
  variant = 'primary',
  disabled,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';
  const isDestructive = variant === 'destructive';
  const needsDarkIndicator = isSecondary || isGhost;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSecondary && styles.secondaryButton,
        isGhost && styles.ghostButton,
        isDestructive && styles.destructiveButton,
        disabled && styles.disabledButton,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={needsDarkIndicator ? Colors.primary : Colors.white} />
      ) : (
        <Text
          style={[
            styles.text,
            isSecondary && styles.secondaryText,
            isGhost && styles.ghostText,
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  destructiveButton: {
    backgroundColor: Colors.error,
  },
  disabledButton: {
    backgroundColor: Colors.primaryLight,
  },
  text: {
    color: Colors.white,
    fontSize: Typography.button.fontSize,
    fontWeight: Typography.button.fontWeight,
  },
  secondaryText: {
    color: Colors.ink,
  },
  ghostText: {
    color: Colors.textSecondary,
  },
  disabledText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
