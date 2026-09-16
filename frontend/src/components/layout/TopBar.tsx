import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Menu, Plus, Globe, ShieldCheck, ChevronDown, Coins } from 'lucide-react-native';
import { colors, radii, spacing, typography } from '../../theme';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CurrencyModal } from '../common/CurrencyModal';

interface TopBarProps {
  title: string;
  subtitle?: string;
  onToggleSidebar?: () => void;
  onQuickAction?: () => void;
  quickActionLabel?: string;
  onViewLanding?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  onToggleSidebar,
  onQuickAction,
  quickActionLabel = 'New Record',
  onViewLanding,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const { activeWorkspace } = useAuth();
  const { currentCurrency, isAutoMode } = useCurrency();
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          {isMobile && onToggleSidebar && (
            <TouchableOpacity onPress={onToggleSidebar} style={styles.menuBtn}>
              <Menu size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>

        <View style={styles.rightSection}>
          {/* Currency Switcher Pill */}
          <TouchableOpacity
            style={styles.currencyPill}
            activeOpacity={0.75}
            onPress={() => setCurrencyModalOpen(true)}
          >
            <Text style={styles.currencyFlag}>{currentCurrency.flag}</Text>
            <Text style={styles.currencyCode}>{currentCurrency.code}</Text>
            <Text style={styles.currencySymbol}>({currentCurrency.symbol})</Text>
            {isAutoMode && (
              <View style={styles.autoPill}>
                <Text style={styles.autoPillText}>AUTO</Text>
              </View>
            )}
            <ChevronDown size={12} color={colors.textTertiary} />
          </TouchableOpacity>

          {onViewLanding && !isMobile && !isTablet && (
            <TouchableOpacity
              onPress={onViewLanding}
              style={styles.landingBtn}
              activeOpacity={0.8}
            >
              <Globe size={14} color={colors.textSecondary} />
              <Text style={styles.landingBtnText}>Public Website</Text>
            </TouchableOpacity>
          )}

          {!isMobile && (
            <View style={styles.liveIndicator}>
              <ShieldCheck size={14} color={colors.success} />
              <Text style={styles.liveText}>SSL Secured</Text>
            </View>
          )}

          {onQuickAction && (
            <Button
              title={quickActionLabel}
              onPress={onQuickAction}
              size="sm"
              variant="primary"
              icon={<Plus size={14} color="#FFFFFF" />}
            />
          )}
        </View>
      </View>

      <CurrencyModal
        visible={currencyModalOpen}
        onClose={() => setCurrencyModalOpen(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuBtn: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  titleWrapper: {
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    letterSpacing: -0.2,
  },
  subtitle: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginTop: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  currencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 4,
  },
  currencyFlag: {
    fontSize: 13,
    marginRight: 2,
  },
  currencyCode: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  currencySymbol: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  autoPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radii.full,
    marginLeft: 2,
  },
  autoPillText: {
    color: colors.success,
    fontSize: 8,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  landingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  landingBtnText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginLeft: 6,
    fontWeight: typography.weights.medium,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
  },
  liveText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    marginLeft: 4,
  },
});
