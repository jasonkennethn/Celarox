import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Menu, Plus, Bell, Search, Globe, ShieldCheck } from 'lucide-react-native';
import { colors, radii, spacing, typography } from '../../theme';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

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
  const { activeWorkspace } = useAuth();

  return (
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
        {onViewLanding && !isMobile && (
          <TouchableOpacity
            onPress={onViewLanding}
            style={styles.landingBtn}
            activeOpacity={0.8}
          >
            <Globe size={14} color={colors.textSecondary} />
            <Text style={styles.landingBtnText}>Public Website</Text>
          </TouchableOpacity>
        )}

        <View style={styles.liveIndicator}>
          <ShieldCheck size={14} color={colors.success} />
          {!isMobile && <Text style={styles.liveText}>Enterprise Cloud v1.0</Text>}
        </View>

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
  landingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: spacing.xs,
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
    marginRight: spacing.xs,
  },
  liveText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    marginLeft: 4,
  },
});
