import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { KeyRound, Mail, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { colors, radii, spacing, typography, shadows } from '../../theme';
import { Button, Card, Input } from '../../components/common';
import { api } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';

interface ForgotPasswordScreenProps {
  onGoToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onGoToLogin,
}) => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      toast.error('Email Required', 'Please enter your registered email address.');
      return;
    }

    try {
      setLoading(true);
      await api.auth.requestPasswordReset(email.trim());
      setSubmitted(true);
      toast.success('Reset Link Sent', 'Check your inbox for password recovery instructions.');
    } catch (err: any) {
      toast.error('Error', err.response?.data?.error || 'Unable to process reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card} padding="xl">
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <KeyRound size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Password Recovery</Text>
          <Text style={styles.subtitle}>
            Enter your corporate email address to receive reset instructions.
          </Text>
        </View>

        {submitted ? (
          <View style={styles.submittedBox}>
            <Text style={styles.submittedTitle}>Instructions Dispatched</Text>
            <Text style={styles.submittedText}>
              If an account exists for {email}, you will receive an email from no-reply@celarox.com shortly.
            </Text>
            <Button
              title="Return to Login"
              onPress={onGoToLogin}
              variant="primary"
              style={{ marginTop: spacing.base }}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <Input
              label="Registered Corporate Email"
              placeholder="jason@company.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Mail size={16} color={colors.textTertiary} />}
            />

            <Button
              title={loading ? 'Processing...' : 'Send Reset Instructions'}
              onPress={handleReset}
              loading={loading}
              variant="primary"
              size="lg"
              icon={<ArrowRight size={18} color="#FFFFFF" />}
              iconPosition="right"
            />

            <TouchableOpacity onPress={onGoToLogin} style={styles.backToLogin}>
              <ArrowLeft size={14} color={colors.textSecondary} />
              <Text style={styles.backToLoginText}>Back to login</Text>
            </TouchableOpacity>
          </View>
        )}
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
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  backToLoginText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
  },
  submittedBox: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  submittedTitle: {
    color: colors.success,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.xs,
  },
  submittedText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    lineHeight: 20,
  },
});
