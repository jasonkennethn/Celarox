import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { ArrowLeft, Shield } from 'lucide-react-native';
import { colors, radii, spacing, typography, shadows } from '../../theme';
import { Card } from '../../components/common';

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onBack }) => {
  return (
    <View style={styles.outerContainer}>
      {/* LOCKED TOP NAVIGATION BAR */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={16} color={colors.textPrimary} />
          <Text style={styles.backBtnText}>Return to Home</Text>
        </TouchableOpacity>
        <View style={styles.brandRow}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.brandInfo}>
            <Text style={styles.brandTitle}>CELAROX</Text>
            <Text style={styles.brandTag}>ENTERPRISE</Text>
          </View>
        </View>
      </View>

      {/* BOUNDED SCROLLABLE CONTENT */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Shield size={36} color={colors.primary} />
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.subtitle}>Last updated: September 16, 2026</Text>
          </View>

          <Card style={styles.card} padding="xl">
            <Text style={styles.heading}>1. Commitment to Data Privacy</Text>
            <Text style={styles.paragraph}>
              At Celarox Enterprise Inc. ("Celarox", "we", "our", or "us"), we are dedicated to protecting your organization's sensitive corporate records, customer relationship data, financial documents, and operational files. This Privacy Policy governs our data collection, processing, and protection practices across our cloud platform at https://celarox.com and associated API endpoints.
            </Text>

            <Text style={styles.heading}>2. Information We Collect</Text>
            <Text style={styles.paragraph}>
              • Account & Identity Information: Names, corporate email addresses, encrypted passwords, authentication tokens, and profile photographs provided upon registration.
            </Text>
            <Text style={styles.paragraph}>
              • Business Operations Data: CRM contacts, leads, accounts, operational task items, invoice line items, expenses, and HR department records created within your tenant workspace.
            </Text>
            <Text style={styles.paragraph}>
              • Document & File Metadata: File URLs, document revisions, and asset storage paths managed via our Cloudinary and Google Drive integrations.
            </Text>
            <Text style={styles.paragraph}>
              • Technical & Session Logs: IP addresses, browser agents, timestamp logs, and authentication verification tokens.
            </Text>

            <Text style={styles.heading}>3. How We Use and Protect Your Data</Text>
            <Text style={styles.paragraph}>
              Your data is used strictly to provision multi-tenant enterprise software services, execute automated event-driven workflows, send system notifications and invoices via Brevo (from no-reply@celarox.com), and deliver platform analytics. We enforce multi-tenant isolation, SSL database connections via serverless Neon DB PostgreSQL, and industry-standard JWT token encryption.
            </Text>

            <Text style={styles.heading}>4. Sub-processors and Third-Party Services</Text>
            <Text style={styles.paragraph}>
              We partner only with vetted SOC2 and ISO27001 compliant cloud infrastructure providers:
              {'\n'}• Database Infrastructure: Neon DB PostgreSQL Serverless (AWS us-east / ap-southeast)
              {'\n'}• Transactional Email: Brevo (Sendinblue) API
              {'\n'}• Cloud Document Storage: Cloudinary Enterprise SDK & Google Drive API
              {'\n'}• Application Hosting: Render Cloud (Backend) & Vercel Edge Network (Frontend)
            </Text>

            <Text style={styles.heading}>5. Data Retention & Deletion</Text>
            <Text style={styles.paragraph}>
              Workspace administrators maintain full ownership and control of their data. You may export or request complete deletion of your workspace tenant records at any time by contacting our security team at hello@celarox.com.
            </Text>

            <Text style={styles.heading}>6. Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have questions regarding this Privacy Policy or our security standards, please contact our Data Protection Officer at:
              {'\n'}Email: hello@celarox.com
              {'\n'}Celarox Enterprise Data Governance Team
            </Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    height: '100%',
    overflow: 'hidden',
  },
  navBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
    ...shadows.subtle,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backBtnText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 32,
    height: 32,
    marginRight: spacing.xs + 2,
  },
  brandInfo: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  brandTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    letterSpacing: 1,
  },
  brandTag: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    letterSpacing: 1.2,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing['3xl'],
  },
  content: {
    maxWidth: 880,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: spacing.xl,
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
    backgroundColor: '#FFFFFF',
    ...shadows.card,
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
