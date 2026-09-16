import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Sparkles, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { colors, radii, spacing, typography, shadows } from '../../theme';
import { Button, Card, Input } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface LoginScreenProps {
  onGoToRegister: () => void;
  onGoToForgotPassword: () => void;
  onGoToLanding: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onGoToRegister,
  onGoToForgotPassword,
  onGoToLanding,
}) => {
  const { login, googleLogin } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      toast.error('Missing Credentials', 'Please enter both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      await login({ email: email.trim(), password });
      toast.success('Welcome back', 'Successfully authenticated into Celarox Enterprise.');
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Invalid email or password. Please try again.';
      toast.error('Authentication Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    toast.info('Google OAuth', 'Initiating secure enterprise sign-in...');
    // Simulated token for browser demo or can link to real OAuth flow
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={onGoToLanding} style={styles.backBtn}>
        <ArrowLeft size={16} color={colors.textSecondary} />
        <Text style={styles.backBtnText}>Back to website</Text>
      </TouchableOpacity>

      <Card style={styles.card} padding="xl">
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Sparkles size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Sign In to Celarox</Text>
          <Text style={styles.subtitle}>
            Enter your credentials to access your organization's unified workspace.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Corporate Email"
            placeholder="jason@company.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={16} color={colors.textTertiary} />}
          />

          <Input
            label="Password"
            placeholder="••••••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon={<Lock size={16} color={colors.textTertiary} />}
          />

          <TouchableOpacity
            onPress={onGoToForgotPassword}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <Button
            title={loading ? 'Authenticating...' : 'Sign In'}
            onPress={handleLogin}
            loading={loading}
            variant="primary"
            size="lg"
            icon={<ArrowRight size={18} color="#FFFFFF" />}
            iconPosition="right"
          />

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <Button
            title="Continue with Google"
            onPress={handleGoogleAuth}
            variant="secondary"
            size="md"
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have a workspace yet? </Text>
            <TouchableOpacity onPress={onGoToRegister}>
              <Text style={styles.registerLink}>Start free trial</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
    alignSelf: 'center',
  },
  backBtnText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.glow,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    lineHeight: 18,
  },
  form: {
    width: '100%',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -spacing.xs,
    marginBottom: spacing.lg,
  },
  forgotText: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.medium,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: typography.fontFamily,
    marginHorizontal: spacing.md,
    fontWeight: typography.weights.bold,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
  },
  registerLink: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
});
