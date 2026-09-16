import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ArrowLeft, FileCheck, Sparkles } from 'lucide-react-native';
import { colors, radii, spacing, typography } from '../../theme';
import { Card } from '../../components/common';

interface TermsOfServiceScreenProps {
  onBack: () => void;
}

export const TermsOfServiceScreen: React.FC<TermsOfServiceScreenProps> = ({ onBack }) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={18} color={colors.textPrimary} />
          <Text style={styles.backBtnText}>Return to Home</Text>
        </TouchableOpacity>
        <View style={styles.brandRow}>
          <Sparkles size={16} color={colors.primary} />
          <Text style={styles.brandTitle}>Celarox Enterprise</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <FileCheck size={36} color={colors.primary} />
          <Text style={styles.title}>Terms of Service</Text>
          <Text style={styles.subtitle}>Last updated: September 16, 2026</Text>
        </View>

        <Card style={styles.card} padding="xl">
          <Text style={styles.heading}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using the Celarox Enterprise platform ("Service") hosted at https://celarox.com and backend endpoints at https://celarox.onrender.com, you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity.
          </Text>

          <Text style={styles.heading}>2. Multi-Tenant Account & Workspace Responsibilities</Text>
          <Text style={styles.paragraph}>
            You are responsible for maintaining the confidentiality of your workspace login credentials, API secrets, and tenant access tokens. You are solely responsible for all activities and data mutations that occur under your tenant workspace.
          </Text>

          <Text style={styles.heading}>3. Subscription & Billing</Text>
          <Text style={styles.paragraph}>
            Celarox Enterprise offers Starter, Growth, and Enterprise subscription plans. Invoices are generated automatically and sent electronically. Payments must be remitted in accordance with the payment terms specified on each invoice.
          </Text>

          <Text style={styles.heading}>4. Acceptable Use Policy</Text>
          <Text style={styles.paragraph}>
            You agree not to misuse the Service, reverse engineer platform modules, transmit malicious code, bypass access controls, or utilize the email dispatch integration for unauthorized spam or unsolicited bulk communications.
          </Text>

          <Text style={styles.heading}>5. Service Level Agreement & Uptime</Text>
          <Text style={styles.paragraph}>
            We endeavor to maintain 99.9% platform availability across our global infrastructure, subject to standard scheduled maintenance windows.
          </Text>

          <Text style={styles.heading}>6. Contact & Legal Inquiries</Text>
          <Text style={styles.paragraph}>
            For legal notices, billing questions, or SLA clarifications, please reach out to our legal department:
            {"\n"}Email: hello@celarox.com
            {"\n"}Celarox Enterprise Legal Affairs
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backBtnText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  brandTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  content: {
    maxWidth: 880,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  heading: {
    color: colors.textPrimary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  paragraph: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
});
