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
        return { bg: colors.primaryLight, text: colors.primary, dot: colors.primary };
      case 'success':
        return { bg: colors.successLight, text: colors.success, dot: colors.success };
      case 'warning':
        return { bg: colors.warningLight, text: colors.warning, dot: colors.warning };
      case 'danger':
        return { bg: colors.dangerLight, text: colors.danger, dot: colors.danger };
      case 'info':
        return { bg: colors.infoLight, text: colors.info, dot: colors.info };
      default:
        return { bg: 'rgba(255, 255, 255, 0.08)', text: colors.textSecondary, dot: colors.textSecondary };
    }
  };

  const scheme = getColors();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: scheme.bg },
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
    alignSelf: 'flex-start',
  },
  containerMd: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm + 2,
  },
  containerSm: {
    paddingVertical: 2,
    paddingHorizontal: spacing.xs + 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
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
