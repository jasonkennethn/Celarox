import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react-native';
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
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>CELAROX</Text>
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
              placeholder="Enter Your Email"
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

            <TouchableOpacity onPress={onGoToLogin} style={styles.backToLogin} activeOpacity={0.7}>
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
    backgroundColor: '#FFFFFF',
    ...shadows.card,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoImage: {
    width: 48,
    height: 48,
    marginBottom: spacing.xs,
  },
  brandTitle: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    letterSpacing: 2,
    marginBottom: spacing.xs,
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
    fontWeight: typography.weights.medium,
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
