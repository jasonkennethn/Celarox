import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  dot = false,
  size = 'md',
  style,
  textStyle,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primaryLight, text: colors.primary, dot: colors.primary, border: 'rgba(37, 99, 235, 0.2)' };
      case 'success':
        return { bg: colors.successBg, text: colors.success, dot: colors.success, border: 'rgba(5, 150, 105, 0.2)' };
      case 'warning':
        return { bg: colors.warningBg, text: colors.warning, dot: colors.warning, border: 'rgba(217, 119, 6, 0.2)' };
      case 'danger':
        return { bg: colors.dangerBg, text: colors.danger, dot: colors.danger, border: 'rgba(220, 38, 38, 0.2)' };
      case 'info':
        return { bg: colors.infoBg, text: colors.info, dot: colors.info, border: 'rgba(2, 132, 199, 0.2)' };
      default:
        return { bg: colors.backgroundTertiary, text: colors.textSecondary, dot: colors.textTertiary, border: colors.border };
    }
  };

  const scheme = getColors();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: scheme.bg, borderColor: scheme.border },
        isSmall ? styles.containerSm : styles.containerMd,
        style,
      ]}
    >
      {dot && <View style={[styles.dot, { backgroundColor: scheme.dot }]} />}
      <Text
        style={[
          styles.text,
          { color: scheme.text },
          isSmall ? styles.textSm : styles.textMd,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  containerMd: {
    paddingVertical: 3,
    paddingHorizontal: spacing.sm + 2,
  },
  containerSm: {
    paddingVertical: 2,
    paddingHorizontal: spacing.xs + 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  text: {
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
    textTransform: 'capitalize',
  },
  textMd: {
    fontSize: typography.sizes.xs,
  },
  textSm: {
    fontSize: 10,
  },
});
