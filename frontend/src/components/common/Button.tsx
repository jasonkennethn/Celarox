import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, spacing, typography, shadows } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const isInteractive = !loading && !disabled;

  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'ghost':
        return styles.ghost;
      case 'danger':
        return styles.danger;
      case 'outline':
        return styles.outline;
      default:
        return styles.primary;
    }
  };

  const getPaddingStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 6, paddingHorizontal: 12, borderRadius: radii.md };
      case 'lg':
        return { paddingVertical: 14, paddingHorizontal: 28, borderRadius: radii.xl };
      default:
        return { paddingVertical: 10, paddingHorizontal: 20, borderRadius: radii.lg };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'ghost':
      case 'outline':
      case 'secondary':
        return { color: colors.textPrimary };
      case 'danger':
        return { color: '#FFFFFF' };
      default:
        return { color: '#FFFFFF' };
    }
  };

  const getFontSize = (): TextStyle => {
    switch (size) {
      case 'sm':
        return { fontSize: typography.sizes.xs };
      case 'lg':
        return { fontSize: typography.sizes.base };
      default:
        return { fontSize: typography.sizes.sm };
    }
  };

  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={!isInteractive}
        activeOpacity={0.85}
        style={[styles.base, style, disabled && styles.disabled]}
      >
        <LinearGradient
          colors={['#6366F1', '#4F46E5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientContent, getPaddingStyle()]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              {icon && iconPosition === 'left' && <>{icon}</>}
              <Text
                style={[
                  styles.text,
                  getTextStyle(),
                  getFontSize(),
                  icon && iconPosition === 'left' ? { marginLeft: spacing.sm } : undefined,
                  icon && iconPosition === 'right' ? { marginRight: spacing.sm } : undefined,
                  textStyle,
                ]}
              >
                {title}
              </Text>
              {icon && iconPosition === 'right' && <>{icon}</>}
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!isInteractive}
      activeOpacity={0.75}
      style={[
        styles.base,
        getContainerStyle(),
        getPaddingStyle(),
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : colors.primary}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && <>{icon}</>}
          <Text
            style={[
              styles.text,
              getTextStyle(),
              getFontSize(),
              icon && iconPosition === 'left' ? { marginLeft: spacing.sm } : undefined,
              icon && iconPosition === 'right' ? { marginRight: spacing.sm } : undefined,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && <>{icon}</>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradientContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primary: {
    backgroundColor: colors.primary,
    ...shadows.glow,
  },
  secondary: {
    backgroundColor: colors.cardHover,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.danger,
    ...shadows.subtle,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
  },
});
