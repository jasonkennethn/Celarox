import React, { ReactNode } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors, radii, spacing, typography, shadows } from '../../theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: number;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 600,
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.dialog, { maxWidth }]}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerText}>
                  <Text style={styles.title}>{title}</Text>
                  {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Body */}
              <ScrollView
                style={styles.body}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 12, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  dialog: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.cardBorder,
    maxHeight: '90%',
    overflow: 'hidden',
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerText: {
    flex: 1,
    marginRight: spacing.base,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  body: {
    padding: spacing.xl,
  },
});
