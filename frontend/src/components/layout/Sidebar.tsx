import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Receipt,
  FileText,
  Zap,
  Briefcase,
  HelpCircle,
  BarChart3,
  Settings,
  ChevronDown,
  Building2,
  LogOut,
  Sparkles,
} from 'lucide-react-native';
import { colors, radii, spacing, typography } from '../../theme';
import { useAuth } from '../../context/AuthContext';

export type NavScreen =
  | 'dashboard'
  | 'crm'
  | 'projects'
  | 'finance'
  | 'documents'
  | 'workflows'
  | 'hr'
  | 'forms-support'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  currentScreen: NavScreen;
  onNavigate: (screen: NavScreen) => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  onCloseMobile,
}) => {
  const { user, activeWorkspace, logout } = useAuth();

  const navItems: Array<{
    id: NavScreen;
    label: string;
    icon: React.ComponentType<{ size: number; color: string }>;
    badge?: string;
  }> = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'crm', label: 'CRM & Pipeline', icon: Users },
    { id: 'projects', label: 'Operations & Tasks', icon: FolderKanban },
    { id: 'finance', label: 'Finance & Invoicing', icon: Receipt },
    { id: 'documents', label: 'Documents Cloud', icon: FileText },
    { id: 'workflows', label: 'Automations', icon: Zap },
    { id: 'hr', label: 'Team & HR Hub', icon: Briefcase },
    { id: 'forms-support', label: 'Forms & Support Desk', icon: HelpCircle },
    { id: 'analytics', label: 'Analytics & Intelligence', icon: BarChart3 },
    { id: 'settings', label: 'Workspace Settings', icon: Settings },
  ];

  const handleSelect = (screen: NavScreen) => {
    onNavigate(screen);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <View style={styles.container}>
      {/* Brand & Workspace Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Sparkles size={18} color="#FFFFFF" />
          </View>
          <View style={styles.brandInfo}>
            <Text style={styles.brandName}>Celarox</Text>
            <Text style={styles.brandTag}>ENTERPRISE</Text>
          </View>
        </View>

        {/* Workspace Chip */}
        <TouchableOpacity style={styles.workspaceSelector} activeOpacity={0.8}>
          <Building2 size={16} color={colors.primary} />
          <Text style={styles.workspaceName} numberOfLines={1}>
            {activeWorkspace?.name || 'Main Workspace'}
          </Text>
          <ChevronDown size={14} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Navigation List */}
      <ScrollView
        style={styles.navList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.navContent}
      >
        <Text style={styles.sectionLabel}>ENTERPRISE APPS</Text>
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          const IconComponent = item.icon;

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleSelect(item.id)}
              activeOpacity={0.75}
              style={[styles.navItem, isActive && styles.navItemActive]}
            >
              <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
                <IconComponent
                  size={18}
                  color={isActive ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.navLabel,
                  isActive && styles.navLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* User Footer */}
      <View style={styles.footer}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.full_name || user?.email || 'User'}
            </Text>
            <Text style={styles.userRole} numberOfLines={1}>
              {user?.role || 'Executive'}
            </Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <LogOut size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 260,
    backgroundColor: colors.backgroundSecondary,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    letterSpacing: -0.5,
  },
  brandTag: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: typography.weights.heavy,
    fontFamily: typography.fontFamily,
    marginLeft: 6,
    letterSpacing: 1,
  },
  workspaceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: radii.md,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  workspaceName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  navList: {
    flex: 1,
  },
  navContent: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    letterSpacing: 1,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    marginBottom: 2,
  },
  navItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  navLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
  },
  navLabelActive: {
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },
  footer: {
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  avatarText: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  userRole: {
    color: colors.textTertiary,
    fontSize: 10,
    fontFamily: typography.fontFamily,
    textTransform: 'capitalize',
  },
  logoutBtn: {
    padding: spacing.xs,
    borderRadius: radii.sm,
  },
});
