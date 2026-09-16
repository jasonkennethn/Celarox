import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, Text, StyleSheet, Animated, Platform, TouchableOpacity } from 'react-native';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react-native';
import { colors, radii, spacing, typography, shadows } from '../theme';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const success = useCallback((title: string, message?: string) => showToast('success', title, message), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast('error', title, message), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast('info', title, message), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      <View style={styles.toastContainer} pointerEvents="box-none">
        {toasts.map((toast) => (
          <View
            key={toast.id}
            style={[
              styles.toast,
              toast.type === 'success' && styles.toastSuccess,
              toast.type === 'error' && styles.toastError,
              toast.type === 'info' && styles.toastInfo,
            ]}
          >
            <View style={styles.iconContainer}>
              {toast.type === 'success' && <CheckCircle2 size={20} color={colors.success} />}
              {toast.type === 'error' && <AlertCircle size={20} color={colors.danger} />}
              {toast.type === 'info' && <Info size={20} color={colors.info} />}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.toastTitle}>{toast.title}</Text>
              {toast.message ? <Text style={styles.toastMessage}>{toast.message}</Text> : null}
            </View>
            <TouchableOpacity onPress={() => removeToast(toast.id)} style={styles.closeButton}>
              <X size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 24 : 50,
    right: Platform.OS === 'web' ? 24 : 16,
    left: Platform.OS === 'web' ? 'auto' : 16,
    zIndex: 99999,
    maxWidth: Platform.OS === 'web' ? 420 : '100%',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
  },
  toastSuccess: {
    borderColor: 'rgba(16, 185, 129, 0.35)',
    backgroundColor: '#0C1B17',
  },
  toastError: {
    borderColor: 'rgba(239, 68, 68, 0.35)',
    backgroundColor: '#1E0E12',
  },
  toastInfo: {
    borderColor: 'rgba(56, 189, 248, 0.35)',
    backgroundColor: '#0E1726',
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  toastTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  toastMessage: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
});
