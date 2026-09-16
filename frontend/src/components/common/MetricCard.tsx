import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { colors, radii, spacing, typography } from '../../theme';
import { Card } from './Card';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number; // e.g. +14.2%
  changePeriod?: string;
  icon?: ReactNode;
  variant?: 'default' | 'highlight';
  style?: StyleProp<ViewStyle>;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changePeriod = 'vs last month',
  icon,
  variant = 'default',
  style,
}) => {
  const isPositive = (change ?? 0) >= 0;

  return (
    <Card style={[styles.card, style]} padding="base">
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
      </View>

      <Text style={styles.value}>{value}</Text>

      {change !== undefined && (
        <View style={styles.bottomRow}>
          <View
            style={[
              styles.changeBadge,
              {
                backgroundColor: isPositive ? colors.successBg : colors.dangerBg,
                borderColor: isPositive ? 'rgba(5, 150, 105, 0.2)' : 'rgba(220, 38, 38, 0.2)',
              },
            ]}
          >
            {isPositive ? (
              <TrendingUp size={12} color={colors.success} />
            ) : (
              <TrendingDown size={12} color={colors.danger} />
            )}
            <Text
              style={[
                styles.changeText,
                { color: isPositive ? colors.success : colors.danger },
              ]}
            >
              {isPositive ? '+' : ''}
              {change}%
            </Text>
          </View>
          <Text style={styles.periodText}>{changePeriod}</Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#FFFFFF',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
    letterSpacing: 0.3,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    color: colors.textPrimary,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    marginVertical: spacing.xs,
    letterSpacing: -0.5,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  changeText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    marginLeft: 3,
  },
  periodText: {
    color: colors.textTertiary,
    fontSize: 11,
    fontFamily: typography.fontFamily,
  },
});
