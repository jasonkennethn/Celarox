import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Receipt,
  FileText,
  Zap,
  Briefcase,
  HelpCircle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Building,
  ChevronRight,
  Shield,
  Globe,
} from 'lucide-react-native';

import { colors, radii, spacing, typography } from './src/theme';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import { CurrencyProvider, useCurrency } from './src/context/CurrencyContext';
import { CurrencyModal } from './src/components/common/CurrencyModal';

// Public Screens
import { LandingScreen } from './src/screens/public/LandingScreen';
import { PrivacyPolicyScreen } from './src/screens/public/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from './src/screens/public/TermsOfServiceScreen';

// Auth Screens
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { RegisterScreen } from './src/screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from './src/screens/auth/ForgotPasswordScreen';

// App Screens
import { DashboardScreen } from './src/screens/app/DashboardScreen';
import { CrmScreen } from './src/screens/app/CrmScreen';
import { ProjectsScreen } from './src/screens/app/ProjectsScreen';
import { FinanceScreen } from './src/screens/app/FinanceScreen';
import { DocumentsScreen } from './src/screens/app/DocumentsScreen';
import { WorkflowsScreen } from './src/screens/app/WorkflowsScreen';
import { HrScreen } from './src/screens/app/HrScreen';
import { FormsSupportScreen } from './src/screens/app/FormsSupportScreen';
import { AnalyticsScreen } from './src/screens/app/AnalyticsScreen';
import { SettingsScreen } from './src/screens/app/SettingsScreen';

type Route =
  | 'landing'
  | 'privacy'
  | 'terms'
  | 'login'
  | 'register'
  | 'forgot_password'
  | 'dashboard'
  | 'crm'
  | 'projects'
  | 'finance'
  | 'documents'
  | 'workflows'
  | 'hr'
  | 'forms_support'
  | 'analytics'
  | 'settings';

interface NavItem {
  id: Route;
  label: string;
  icon: (color: string) => React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Command Center',
    icon: (c) => <LayoutDashboard size={18} color={c} />,
  },
  {
    id: 'crm',
    label: 'CRM & Pipeline',
    icon: (c) => <Users size={18} color={c} />,
  },
  {
    id: 'projects',
    label: 'Operations & Tasks',
    icon: (c) => <KanbanSquare size={18} color={c} />,
  },
  {
    id: 'finance',
    label: 'Finance & Invoicing',
    icon: (c) => <Receipt size={18} color={c} />,
  },
  {
    id: 'documents',
    label: 'Cloud Documents',
    icon: (c) => <FileText size={18} color={c} />,
  },
  {
    id: 'workflows',
    label: 'Automations & Rules',
    icon: (c) => <Zap size={18} color={c} />,
  },
  {
    id: 'hr',
    label: 'HR & Team Hub',
    icon: (c) => <Briefcase size={18} color={c} />,
  },
  {
    id: 'forms_support',
    label: 'Forms & Support',
    icon: (c) => <HelpCircle size={18} color={c} />,
  },
  {
    id: 'analytics',
    label: 'Analytics & Intel',
    icon: (c) => <BarChart3 size={18} color={c} />,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (c) => <Settings size={18} color={c} />,
  },
];

const MainAppNavigator: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const { isAuthenticated, isLoading, user, currentWorkspace, logout } = useAuth();
  const { currentCurrency, isAutoMode } = useCurrency();

  const [currentRoute, setCurrentRoute] = useState<Route>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);

  // Sync route with web browser URL if on Web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/privacy') setCurrentRoute('privacy');
      else if (path === '/terms') setCurrentRoute('terms');
      else if (path === '/login') setCurrentRoute('login');
      else if (path === '/register') setCurrentRoute('register');
      else if (path === '/forgot-password') setCurrentRoute('forgot_password');
      else if (path.startsWith('/app')) {
        const sub = path.replace('/app', '').replace('/', '');
        const match = NAV_ITEMS.find((n) => n.id === sub);
        if (match) setCurrentRoute(match.id);
        else setCurrentRoute('dashboard');
      }
    }
  }, []);

  const navigateTo = (route: Route) => {
    setCurrentRoute(route);
    setMobileMenuOpen(false);

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      let targetPath = '/';
      if (route === 'privacy') targetPath = '/privacy';
      else if (route === 'terms') targetPath = '/terms';
      else if (route === 'login') targetPath = '/login';
      else if (route === 'register') targetPath = '/register';
      else if (route === 'forgot_password') targetPath = '/forgot-password';
      else if (route !== 'landing') targetPath = `/app/${route}`;

      window.history.pushState({}, '', targetPath);
    }
  };

  // Automatically route to dashboard upon authentication if currently on auth pages
  useEffect(() => {
    if (
      isAuthenticated &&
      (currentRoute === 'login' || currentRoute === 'register' || currentRoute === 'forgot_password')
    ) {
      navigateTo('dashboard');
    }
  }, [isAuthenticated]);

  // Render Public Screens
  if (currentRoute === 'landing') {
    return (
      <LandingScreen
        onGoToAuth={(mode) => navigateTo(mode)}
        onGoToPrivacy={() => navigateTo('privacy')}
        onGoToTerms={() => navigateTo('terms')}
      />
    );
  }

  if (currentRoute === 'privacy') {
    return <PrivacyPolicyScreen onBack={() => navigateTo('landing')} />;
  }

  if (currentRoute === 'terms') {
    return <TermsOfServiceScreen onBack={() => navigateTo('landing')} />;
  }

  // Render Auth Screens
  if (currentRoute === 'login') {
    return (
      <LoginScreen
        onGoToRegister={() => navigateTo('register')}
        onGoToForgotPassword={() => navigateTo('forgot_password')}
        onGoToLanding={() => navigateTo('landing')}
      />
    );
  }

  if (currentRoute === 'register') {
    return (
      <RegisterScreen
        onGoToLogin={() => navigateTo('login')}
        onGoToLanding={() => navigateTo('landing')}
      />
    );
  }

  if (currentRoute === 'forgot_password') {
    return (
      <ForgotPasswordScreen
        onGoToLogin={() => navigateTo('login')}
      />
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated && !isLoading) {
    return (
      <LoginScreen
        onGoToRegister={() => navigateTo('register')}
        onGoToForgotPassword={() => navigateTo('forgot_password')}
        onGoToLanding={() => navigateTo('landing')}
      />
    );
  }

  // Active App Screen Selector
  const renderAppScreen = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardScreen onNavigate={(r: any) => navigateTo(r)} />;
      case 'crm':
        return <CrmScreen />;
      case 'projects':
        return <ProjectsScreen />;
      case 'finance':
        return <FinanceScreen />;
      case 'documents':
        return <DocumentsScreen />;
      case 'workflows':
        return <WorkflowsScreen />;
      case 'hr':
        return <HrScreen />;
      case 'forms_support':
        return <FormsSupportScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen onNavigate={(r: any) => navigateTo(r)} />;
    }
  };

  const activeNav = NAV_ITEMS.find((n) => n.id === currentRoute) || NAV_ITEMS[0];

  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar style="dark" />

      {/* Sidebar for Desktop */}
      {isDesktop ? (
        <View style={styles.sidebar}>
          {/* Logo Brand */}
          <TouchableOpacity
            style={styles.logoRow}
            onPress={() => navigateTo('landing')}
            activeOpacity={0.8}
          >
            <Image
              source={require('./assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.logoText}>CELAROX</Text>
              <Text style={styles.logoSubText}>ENTERPRISE</Text>
            </View>
          </TouchableOpacity>

          {/* Workspace Pill */}
          <View style={styles.workspacePill}>
            <Building size={14} color={colors.primary} />
            <Text style={styles.workspaceName} numberOfLines={1}>
              {currentWorkspace?.name || 'Celarox Enterprise'}
            </Text>
          </View>

          {/* Nav Items */}
          <ScrollView style={styles.navList} showsVerticalScrollIndicator={false}>
            {NAV_ITEMS.map((item) => {
              const isActive = currentRoute === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => navigateTo(item.id)}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  activeOpacity={0.7}
                >
                  <View style={styles.navItemLeft}>
                    {item.icon(isActive ? colors.primary : colors.textTertiary)}
                    <Text
                      style={[styles.navItemText, isActive && styles.navItemTextActive]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  {isActive && <ChevronRight size={14} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Public Website Button */}
          <TouchableOpacity
            style={styles.publicWebBtn}
            onPress={() => navigateTo('landing')}
            activeOpacity={0.75}
          >
            <Globe size={15} color={colors.textTertiary} />
            <Text style={styles.publicWebText}>Landing Showcase</Text>
          </TouchableOpacity>

          {/* User Profile / Logout footer */}
          <View style={styles.sidebarFooter}>
            <View style={styles.userTile}>
              <View style={styles.userAvatar}>
                <Text style={styles.avatarLetter}>
                  {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.full_name || 'Executive User'}
                </Text>
                <Text style={styles.userRole} numberOfLines={1}>
                  {user?.email || 'admin@celarox.com'}
                </Text>
              </View>
              <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.7}>
                <LogOut size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}

      {/* Main Area */}
      <View style={styles.mainContentArea}>
        {/* Top Bar for Tablet/Mobile or breadcrumb on Desktop */}
        <View style={styles.topHeader}>
          {!isDesktop && (
            <TouchableOpacity
              onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={styles.mobileMenuToggle}
              activeOpacity={0.7}
            >
              {mobileMenuOpen ? <X size={22} color={colors.textPrimary} /> : <Menu size={22} color={colors.textPrimary} />}
            </TouchableOpacity>
          )}

          <View style={styles.headerTitleRow}>
            <Text style={styles.currentScreenTitle}>{activeNav.label}</Text>
          </View>

          <View style={styles.headerRight}>
            {/* Currency Pill */}
            <TouchableOpacity
              onPress={() => setCurrencyModalOpen(true)}
              style={styles.currencyTopBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.currencyTopFlag}>{currentCurrency.flag}</Text>
              <Text style={styles.currencyTopCode}>{currentCurrency.code}</Text>
              <Text style={styles.currencyTopSymbol}>({currentCurrency.symbol})</Text>
              {isAutoMode && (
                <View style={styles.currencyAutoTag}>
                  <Text style={styles.currencyAutoTagText}>AUTO</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigateTo('settings')}
              style={styles.headerPill}
              activeOpacity={0.7}
            >
              <Shield size={14} color={colors.success} />
              <Text style={styles.headerPillText}>Encrypted (Neon / TLS)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Currency Modal */}
        <CurrencyModal
          visible={currencyModalOpen}
          onClose={() => setCurrencyModalOpen(false)}
        />

        {/* Mobile Dropdown Nav Menu */}
        {!isDesktop && mobileMenuOpen && (
          <View style={styles.mobileNavDropdown}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {NAV_ITEMS.map((item) => {
                const isActive = currentRoute === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => navigateTo(item.id)}
                    style={[styles.mobileNavItem, isActive && styles.mobileNavItemActive]}
                  >
                    {item.icon(isActive ? colors.primary : colors.textTertiary)}
                    <Text
                      style={[styles.navItemText, isActive && styles.navItemTextActive]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                onPress={() => navigateTo('landing')}
                style={styles.mobileNavItem}
              >
                <Globe size={18} color={colors.textSecondary} />
                <Text style={styles.navItemText}>Landing Showcase</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={logout}
                style={[styles.mobileNavItem, { marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }]}
              >
                <LogOut size={18} color={colors.danger} />
                <Text style={[styles.navItemText, { color: colors.danger }]}>Sign Out</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Screen Content */}
        <View style={styles.screenHost}>{renderAppScreen()}</View>
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <ToastProvider>
          <MainAppNavigator />
        </ToastProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: colors.background,
    flexDirection: 'row',
    height: '100%',
    overflow: 'hidden',
  },
  sidebar: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: colors.border,
    flexDirection: 'column',
    height: '100%',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoImage: {
    width: 36,
    height: 36,
  },
  logoText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    letterSpacing: 1.5,
  },
  logoSubText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.5,
  },
  workspacePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  workspaceName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  navList: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    marginBottom: 2,
  },
  navItemActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  navItemText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
  },
  navItemTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  publicWebBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  publicWebText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  sidebarFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  userTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  avatarLetter: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
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
  },
  logoutBtn: {
    padding: 6,
  },
  mainContentArea: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: colors.background,
    height: '100%',
    overflow: 'hidden',
  },
  topHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  mobileMenuToggle: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentScreenTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  currencyTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  currencyTopFlag: {
    fontSize: 12,
  },
  currencyTopCode: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  currencyTopSymbol: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  currencyAutoTag: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radii.full,
    marginLeft: 2,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  currencyAutoTagText: {
    color: colors.success,
    fontSize: 8,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.successBg,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  headerPillText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  mobileNavDropdown: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: spacing.md,
    maxHeight: 380,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  mobileNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
  },
  mobileNavItemActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  screenHost: {
    flex: 1,
    overflow: 'hidden',
  },
});
