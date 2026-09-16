import React, { useState, ReactNode } from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Modal,
  SafeAreaView,
} from 'react-native';
import { colors } from '../../theme';
import { Sidebar, NavScreen } from './Sidebar';
import { TopBar } from './TopBar';

interface AppLayoutProps {
  currentScreen: NavScreen;
  onNavigate: (screen: NavScreen) => void;
  title: string;
  subtitle?: string;
  onQuickAction?: () => void;
  quickActionLabel?: string;
  onViewLanding?: () => void;
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentScreen,
  onNavigate,
  title,
  subtitle,
  onQuickAction,
  quickActionLabel,
  onViewLanding,
  children,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Desktop Permanent Sidebar */}
        {isDesktop && (
          <Sidebar
            currentScreen={currentScreen}
            onNavigate={onNavigate}
          />
        )}

        {/* Mobile / Tablet Drawer Modal */}
        {!isDesktop && (
          <Modal
            visible={mobileSidebarVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setMobileSidebarVisible(false)}
          >
            <View style={styles.mobileDrawerOverlay}>
              <Sidebar
                currentScreen={currentScreen}
                onNavigate={onNavigate}
                onCloseMobile={() => setMobileSidebarVisible(false)}
              />
            </View>
          </Modal>
        )}

        {/* Main Content Area */}
        <View style={styles.main}>
          <TopBar
            title={title}
            subtitle={subtitle}
            onToggleSidebar={() => setMobileSidebarVisible(true)}
            onQuickAction={onQuickAction}
            quickActionLabel={quickActionLabel}
            onViewLanding={onViewLanding}
          />
          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
    height: '100%',
  },
  main: {
    flex: 1,
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mobileDrawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
  },
});
