import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import { colors, radii, spacing, shadows } from '../../theme';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'glass' | 'interactive' | 'flat';
  onPress?: () => void;
  padding?: keyof typeof spacing;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  onPress,
  padding = 'base',
}) => {
  const cardStyle: ViewStyle = {
    padding: spacing[padding],
    ...(variant === 'glass' ? styles.glass : styles.default),
    ...(variant === 'flat' ? styles.flat : {}),
  };

  if (onPress || variant === 'interactive') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[styles.base, cardStyle, styles.interactive, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.base, cardStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  default: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
  },
  glass: {
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.card,
  },
  flat: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  interactive: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
});
