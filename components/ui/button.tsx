import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors, Radii } from '../../constants/theme';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  /** Shown below the button when it is disabled, so the user knows why. */
  disabledReason?: string;
  style?: any;
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
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  button: {
    backgroundColor: Colors.brandPrimary,
    borderRadius: Radii.pill,
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 54,
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
    backgroundColor: Colors.brandDark,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: Colors.brandPrimary,
  },
  dangerButton: {
    backgroundColor: Colors.error,
  },
  disabledButton: {
    backgroundColor: Colors.brandPrimaryMuted,
  },
  outlineDisabled: {
    borderColor: Colors.border,
  },
  text: {
    color: Colors.textOnBrand,
    fontSize: 16,
    fontWeight: '700',
  },
  outlineText: {
    color: Colors.brandPrimary,
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
