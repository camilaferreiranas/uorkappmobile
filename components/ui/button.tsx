import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
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
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSecondary && styles.secondaryButton,
        isOutline && styles.outlineButton,
        disabled && styles.disabledButton,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? Colors.primary : Colors.white} />
      ) : (
        <Text
          style={[
            styles.text,
            isOutline && styles.outlineText,
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
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: Colors.black,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  disabledButton: {
    backgroundColor: Colors.primaryLight,
  },
  text: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  outlineText: {
    color: Colors.primary,
  },
  disabledText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
