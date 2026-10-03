import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
} from 'react-native';
<<<<<<< HEAD
import { Colors, Radii } from '../../constants/theme';
=======
import { Colors, Radius, Typography } from '../../constants/theme';
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  loading?: boolean;
<<<<<<< HEAD
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  /** Shown below the button when it is disabled, so the user knows why. */
  disabledReason?: string;
  style?: any;
=======
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
  textStyle?: any;
}

export function Button({
  title,
  loading,
  variant = 'primary',
  disabled,
  disabledReason,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const isSecondary = variant === 'secondary';
<<<<<<< HEAD
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  const isDisabled = disabled || loading;
  const spinnerColor = isOutline ? Colors.brandPrimary : Colors.textOnBrand;

  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.button,
          isSecondary && styles.secondaryButton,
          isOutline && styles.outlineButton,
          isDanger && styles.dangerButton,
          pressed && !isDisabled && styles.pressed,
          isDisabled && (isOutline ? styles.outlineDisabled : styles.disabledButton),
          style,
        ]}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={spinnerColor} />
        ) : (
          <Text
            style={[
              styles.text,
              isOutline && styles.outlineText,
              isDisabled && (isOutline ? styles.outlineDisabledText : styles.disabledText),
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </Pressable>
      {isDisabled && !loading && disabledReason ? (
        <Text style={styles.disabledReason}>{disabledReason}</Text>
      ) : null}
    </View>
=======
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
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  button: {
<<<<<<< HEAD
    backgroundColor: Colors.brandPrimary,
    borderRadius: Radii.pill,
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 54,
=======
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    minHeight: 44,
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  secondaryButton: {
<<<<<<< HEAD
    backgroundColor: Colors.brandDark,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: Colors.brandPrimary,
  },
  dangerButton: {
=======
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  destructiveButton: {
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
    backgroundColor: Colors.error,
  },
  disabledButton: {
    backgroundColor: Colors.brandPrimaryMuted,
  },
  outlineDisabled: {
    borderColor: Colors.border,
  },
  text: {
<<<<<<< HEAD
    color: Colors.textOnBrand,
    fontSize: 16,
    fontWeight: '700',
  },
  outlineText: {
    color: Colors.brandPrimary,
=======
    color: Colors.white,
    fontSize: Typography.button.fontSize,
    fontWeight: Typography.button.fontWeight,
  },
  secondaryText: {
    color: Colors.ink,
  },
  ghostText: {
    color: Colors.textSecondary,
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
  },
  disabledText: {
    color: Colors.textOnBrand,
  },
  outlineDisabledText: {
    color: Colors.textMuted,
  },
  disabledReason: {
    marginTop: 8,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
