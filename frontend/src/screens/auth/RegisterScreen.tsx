import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Sparkles, Mail, Lock, User, Building, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { colors, radii, spacing, typography, shadows } from '../../theme';
import { Button, Card, Input } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface RegisterScreenProps {
  onGoToLogin: () => void;
  onGoToLanding: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onGoToLogin,
  onGoToLanding,
}) => {
  const { register } = useAuth();
  const toast = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      toast.error('Required Fields', 'Please complete all required fields.');
      return;
    }

    if (password.length < 8) {
      toast.error('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      await register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        company_name: companyName.trim() || `${firstName}'s Enterprise Workspace`,
        password,
      });
      toast.success('Workspace Created', 'Welcome to Celarox Enterprise!');
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.password?.[0] ||
        err.response?.data?.error ||
        'Registration failed. Please check your details and try again.';
      toast.error('Registration Error', errorMsg);
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.title}>Create Enterprise Workspace</Text>
          <Text style={styles.subtitle}>
            Launch your company's digital operating system in under 60 seconds.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.nameRow}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Input
                label="First Name *"
                placeholder="Jason"
                value={firstName}
                onChangeText={setFirstName}
                icon={<User size={16} color={colors.textTertiary} />}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Last Name *"
                placeholder="Kenneth"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          <Input
            label="Corporate Email *"
            placeholder="jason@company.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={16} color={colors.textTertiary} />}
          />

          <Input
            label="Company / Workspace Name"
            placeholder="Acme Global Technologies"
            value={companyName}
            onChangeText={setCompanyName}
            icon={<Building size={16} color={colors.textTertiary} />}
          />

          <Input
            label="Master Password (min 8 chars) *"
            placeholder="••••••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon={<Lock size={16} color={colors.textTertiary} />}
          />

          <Button
            title={loading ? 'Creating Workspace...' : 'Launch Free Trial'}
            onPress={handleRegister}
            loading={loading}
            variant="primary"
            size="lg"
            icon={<ArrowRight size={18} color="#FFFFFF" />}
            iconPosition="right"
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={onGoToLogin}>
              <Text style={styles.loginLink}>Sign in</Text>
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
    maxWidth: 480,
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
    textAlign: 'center',
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
  nameRow: {
    flexDirection: 'row',
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
  loginLink: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
});
