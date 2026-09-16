import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  TextInput,
  Platform,
} from 'react-native';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  FolderKanban,
  Receipt,
  FileText,
  Briefcase,
  HelpCircle,
  BarChart3,
  CheckCircle2,
  Mail,
  Building,
  Send,
  Lock,
  Globe,
  Star,
  ChevronRight,
} from 'lucide-react-native';
import { colors, radii, spacing, typography, shadows } from '../../theme';
import { Button, Card, Badge, Input, CurrencyModal } from '../../components/common';
import { api } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import { useCurrency } from '../../context/CurrencyContext';

interface LandingScreenProps {
  onGoToAuth: (mode: 'login' | 'register') => void;
  onGoToPrivacy: () => void;
  onGoToTerms: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onGoToAuth,
  onGoToPrivacy,
  onGoToTerms,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const isTablet = width >= 640 && width < 960;
  const toast = useToast();
  const { currentCurrency, formatAmount, isAutoMode } = useCurrency();
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);

  // Interactive App Showcase Tab
  const [activeTab, setActiveTab] = useState<'crm' | 'finance' | 'projects' | 'workflows'>('crm');

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSending, setContactSending] = useState(false);

  const handleSendInquiry = async () => {
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      toast.error('Required Fields', 'Please enter your name, email, and message.');
      return;
    }

    try {
      setContactSending(true);
      await api.public.submitContact({
        name: contactName,
        email: contactEmail,
        company: contactCompany,
        subject: contactSubject || 'Enterprise Platform Inquiry',
        message: contactMessage,
      });
      toast.success(
        'Inquiry Transmitted',
        'Thank you! Our executive team at hello@celarox.com has received your request.'
      );
      setContactName('');
      setContactEmail('');
      setContactCompany('');
      setContactSubject('');
      setContactMessage('');
    } catch (err: any) {
      toast.error(
        'Submission Failed',
        err.response?.data?.error || 'Unable to submit your message right now. Please try again.'
      );
    } finally {
      setContactSending(false);
    }
  };

  const apps = [
    {
      icon: Users,
      title: 'CRM & Pipeline Hub',
      desc: 'Multi-stage visual deal pipelines, account tracking, and client interaction history.',
      color: '#6366F1',
    },
    {
      icon: FolderKanban,
      title: 'Operations & Projects',
      desc: 'Agile Kanban boards, sprint task tracking, subtask checklists, and time logging.',
      color: '#06B6D4',
    },
    {
      icon: Receipt,
      title: 'Finance & Invoicing',
      desc: 'Instant Apple-grade PDF invoices, itemized tax/discounts, payments, and expense tracking.',
      color: '#10B981',
    },
    {
      icon: FileText,
      title: 'Document Cloud',
      desc: 'High-speed asset storage via Cloudinary and Google Drive integration.',
      color: '#8B5CF6',
    },
    {
      icon: Zap,
      title: 'Workflow Engine',
      desc: 'Autonomous event triggers for deal updates, invoice payment dispatches, and tasks.',
      color: '#F59E0B',
    },
    {
      icon: Briefcase,
      title: 'HR & Team Hub',
      desc: 'Department directory, employee profiles, leave request approval flows, and notices.',
      color: '#EC4899',
    },
    {
      icon: HelpCircle,
      title: 'Forms & Support Desk',
      desc: 'Custom drag-and-drop dynamic forms with threaded customer support tickets.',
      color: '#3B82F6',
    },
    {
      icon: BarChart3,
      title: 'Executive Intelligence',
      desc: 'Real-time MRR analytics, project velocities, financial run rates, and team capacity.',
      color: '#14B8A6',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Navigation Header */}
      <View style={styles.navBar}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Sparkles size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.brandTitle}>Celarox</Text>
          <Text style={styles.brandTag}>ENTERPRISE</Text>
        </View>

        <View style={styles.navActions}>
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

          <TouchableOpacity onPress={() => onGoToAuth('login')} style={styles.navLink}>
            <Text style={styles.navLinkText}>Sign In</Text>
          </TouchableOpacity>
          <Button
            title="Launch Free Trial"
            onPress={() => onGoToAuth('register')}
            size="sm"
            variant="primary"
          />
        </View>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Badge
          label="Unified Enterprise Operating System • 2026 Edition"
          variant="primary"
          style={styles.heroBadge}
        />

        <Text style={[styles.heroTitle, isDesktop ? styles.heroTitleLg : styles.heroTitleSm]}>
          The Operating System for Modern High-Growth Business
        </Text>

        <Text style={styles.heroSubtitle}>
          Centralize your CRM pipelines, operational projects, automated invoicing, secure document
          clouds, HR teams, and customer support desk in one unified, Apple-grade interface.
        </Text>

        <View style={styles.heroCtaRow}>
          <Button
            title="Get Started Instantly"
            onPress={() => onGoToAuth('register')}
            size="lg"
            variant="primary"
            icon={<ArrowRight size={18} color="#FFFFFF" />}
            iconPosition="right"
          />
          <Button
            title="Access Workspace"
            onPress={() => onGoToAuth('login')}
            size="lg"
            variant="secondary"
            style={{ marginLeft: isDesktop ? spacing.md : 0, marginTop: isDesktop ? 0 : spacing.sm }}
          />
        </View>

        {/* Security & Reliability Badges */}
        <View style={styles.trustBadges}>
          <View style={styles.trustItem}>
            <ShieldCheck size={16} color={colors.success} />
            <Text style={styles.trustText}>Neon DB Serverless SSL</Text>
          </View>
          <View style={styles.trustItem}>
            <Lock size={16} color={colors.primary} />
            <Text style={styles.trustText}>End-to-End JWT Auth</Text>
          </View>
          <View style={styles.trustItem}>
            <Globe size={16} color={colors.accentCyan} />
            <Text style={styles.trustText}>Multi-Tenant Architecture</Text>
          </View>
        </View>
      </View>

      {/* Interactive App Preview Showcase */}
      <View style={styles.showcaseSection}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            onPress={() => setActiveTab('crm')}
            style={[styles.tabButton, activeTab === 'crm' && styles.tabButtonActive]}
          >
            <Users size={16} color={activeTab === 'crm' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'crm' && styles.tabTextActive]}>CRM Pipeline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('finance')}
            style={[styles.tabButton, activeTab === 'finance' && styles.tabButtonActive]}
          >
            <Receipt size={16} color={activeTab === 'finance' ? colors.success : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'finance' && styles.tabTextActive]}>Invoicing Studio</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('projects')}
            style={[styles.tabButton, activeTab === 'projects' && styles.tabButtonActive]}
          >
            <FolderKanban size={16} color={activeTab === 'projects' ? colors.accentCyan : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'projects' && styles.tabTextActive]}>Operations</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('workflows')}
            style={[styles.tabButton, activeTab === 'workflows' && styles.tabButtonActive]}
          >
            <Zap size={16} color={activeTab === 'workflows' ? colors.warning : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'workflows' && styles.tabTextActive]}>Automations</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.previewCard} padding="xl">
          {activeTab === 'crm' && (
            <View>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>Executive Deal Pipeline</Text>
                <Badge label={`Total Pipeline: ${formatAmount(485000)}`} variant="success" />
              </View>
              <View style={[styles.stageGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
                <View style={styles.stageColumn}>
                  <Text style={styles.stageTitle}>QUALIFIED (4)</Text>
                  <View style={styles.stageCard}>
                    <Text style={styles.stageCardTitle}>Acme Global Enterprise</Text>
                    <Text style={styles.stageCardValue}>{formatAmount(120000)} • 80% Prob</Text>
                  </View>
                  <View style={styles.stageCard}>
                    <Text style={styles.stageCardTitle}>Starlight Robotics</Text>
                    <Text style={styles.stageCardValue}>{formatAmount(65000)} • 70% Prob</Text>
                  </View>
                </View>
                <View style={styles.stageColumn}>
                  <Text style={styles.stageTitle}>PROPOSAL SENT (3)</Text>
                  <View style={styles.stageCard}>
                    <Text style={styles.stageCardTitle}>Apex FinTech Core</Text>
                    <Text style={styles.stageCardValue}>{formatAmount(210000)} • 90% Prob</Text>
                  </View>
                </View>
                <View style={styles.stageColumn}>
                  <Text style={styles.stageTitle}>CLOSED WON (8)</Text>
                  <View style={[styles.stageCard, { borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                    <Text style={styles.stageCardTitle}>Helios Dynamics</Text>
                    <Text style={[styles.stageCardValue, { color: colors.success }]}>{formatAmount(90000)} • Paid</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'finance' && (
            <View>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>Apple-Grade PDF Invoicing Engine</Text>
                <Badge label="Status: Ready to Dispatch" variant="info" />
              </View>
              <View style={styles.invoiceDemoBox}>
                <View style={styles.invoiceDemoRow}>
                  <Text style={styles.invoiceDemoLabel}>Invoice #:</Text>
                  <Text style={styles.invoiceDemoValue}>INV-2026-0842</Text>
                </View>
                <View style={styles.invoiceDemoRow}>
                  <Text style={styles.invoiceDemoLabel}>Client:</Text>
                  <Text style={styles.invoiceDemoValue}>Vertex Autonomous Corp</Text>
                </View>
                <View style={styles.invoiceDemoRow}>
                  <Text style={styles.invoiceDemoLabel}>Total Due:</Text>
                  <Text style={[styles.invoiceDemoValue, { color: colors.success, fontWeight: '700' }]}>{formatAmount(48500)}</Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'projects' && (
            <View>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>Real-Time Task Kanban & Sprints</Text>
                <Badge label="Active Sprint: Q3 Scale" variant="primary" />
              </View>
              <Text style={styles.previewDesc}>
                Track tasks, assignees, priorities, subtask progress, and time logs across all projects with zero friction.
              </Text>
            </View>
          )}

          {activeTab === 'workflows' && (
            <View>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>Autonomous Event-Driven Workflow Builder</Text>
                <Badge label="Engine: Live & Active" variant="warning" />
              </View>
              <Text style={styles.previewDesc}>
                Trigger automated Brevo transactional emails, create follow-up tasks, and update deal stages when domain events fire.
              </Text>
            </View>
          )}
        </Card>
      </View>

      {/* 9 Interconnected Enterprise Apps Grid */}
      <View style={styles.gridSection}>
        <Text style={styles.sectionHeading}>Everything You Need to Scale Your Enterprise</Text>
        <Text style={styles.sectionSubheading}>
          No more duct-taping ten disconnected subscriptions. One integrated workspace for your entire company.
        </Text>

        <View style={styles.cardsGrid}>
          {apps.map((app, idx) => {
            const Icon = app.icon;
            return (
              <View
                key={idx}
                style={[
                  styles.appCardWrapper,
                  { width: isDesktop ? '31%' : isTablet ? '47%' : '100%' },
                ]}
              >
                <Card style={styles.appCard} padding="lg">
                  <View style={[styles.appIconBox, { backgroundColor: `${app.color}20` }]}>
                    <Icon size={22} color={app.color} />
                  </View>
                  <Text style={styles.appCardTitle}>{app.title}</Text>
                  <Text style={styles.appCardDesc}>{app.desc}</Text>
                </Card>
              </View>
            );
          })}
        </View>
      </View>

      {/* Pricing Matrix */}
      <View style={styles.pricingSection}>
        <Text style={styles.sectionHeading}>Transparent, Predictable Enterprise Pricing</Text>
        <Text style={styles.sectionSubheading}>Choose the right plan to launch and scale your operations.</Text>

        <View style={[styles.pricingRow, { flexDirection: isDesktop ? 'row' : 'column' }]}>
          {/* Starter */}
          <Card style={styles.pricingCard} padding="xl">
            <Text style={styles.planName}>Starter</Text>
            <Text style={styles.planPrice}>{formatAmount(49, { showDecimals: false })}<Text style={styles.planPeriod}> / month</Text></Text>
            <Text style={styles.planDesc}>Ideal for growing startups and agile teams.</Text>
            <View style={styles.planFeatures}>
              <Text style={styles.planFeatureItem}>✓ Up to 5 Team Members</Text>
              <Text style={styles.planFeatureItem}>✓ Full CRM & Projects Hub</Text>
              <Text style={styles.planFeatureItem}>✓ Invoice Generation (50/mo)</Text>
              <Text style={styles.planFeatureItem}>✓ 10GB Cloud Storage</Text>
            </View>
            <Button title="Get Starter" onPress={() => onGoToAuth('register')} variant="secondary" />
          </Card>

          {/* Growth */}
          <Card style={[styles.pricingCard, styles.pricingCardFeatured]} padding="xl">
            <Badge label="MOST POPULAR" variant="primary" style={{ marginBottom: spacing.sm }} />
            <Text style={styles.planName}>Growth</Text>
            <Text style={styles.planPrice}>{formatAmount(149, { showDecimals: false })}<Text style={styles.planPeriod}> / month</Text></Text>
            <Text style={styles.planDesc}>For scaling enterprises with custom automation needs.</Text>
            <View style={styles.planFeatures}>
              <Text style={styles.planFeatureItem}>✓ Up to 25 Team Members</Text>
              <Text style={styles.planFeatureItem}>✓ Unlimited CRM & Invoices</Text>
              <Text style={styles.planFeatureItem}>✓ Autonomous Workflow Builder</Text>
              <Text style={styles.planFeatureItem}>✓ HR & Support Ticket Desk</Text>
              <Text style={styles.planFeatureItem}>✓ 100GB Cloud Storage</Text>
            </View>
            <Button title="Start 14-Day Free Trial" onPress={() => onGoToAuth('register')} variant="primary" />
          </Card>

          {/* Enterprise */}
          <Card style={styles.pricingCard} padding="xl">
            <Text style={styles.planName}>Enterprise</Text>
            <Text style={styles.planPrice}>{formatAmount(399, { showDecimals: false })}<Text style={styles.planPeriod}> / month</Text></Text>
            <Text style={styles.planDesc}>Dedicated infrastructure and bespoke integrations.</Text>
            <View style={styles.planFeatures}>
              <Text style={styles.planFeatureItem}>✓ Unlimited Team Members</Text>
              <Text style={styles.planFeatureItem}>✓ Multi-Tenant Isolation</Text>
              <Text style={styles.planFeatureItem}>✓ 99.99% SLA Guarantee</Text>
              <Text style={styles.planFeatureItem}>✓ Dedicated 24/7 Account Manager</Text>
              <Text style={styles.planFeatureItem}>✓ 1TB High-Speed Cloud</Text>
            </View>
            <Button title="Contact Sales" onPress={() => onGoToAuth('register')} variant="secondary" />
          </Card>
        </View>
      </View>

      {/* Public Contact & Inquiry Section */}
      <View style={styles.contactSection}>
        <Card style={styles.contactCard} padding="xl">
          <View style={[styles.contactRow, { flexDirection: isDesktop ? 'row' : 'column' }]}>
            <View style={[styles.contactInfo, { marginRight: isDesktop ? spacing['2xl'] : 0, marginBottom: isDesktop ? 0 : spacing.xl }]}>
              <Badge label="DIRECT EXECUTIVE INQUIRIES" variant="primary" style={{ marginBottom: spacing.sm }} />
              <Text style={styles.contactTitle}>Connect with Our Executive Team</Text>
              <Text style={styles.contactDesc}>
                Have specific technical requirements, custom integration requests, or enterprise SLA inquiries?
                Submit your inquiry and our team will get back to you promptly.
              </Text>

              <View style={styles.contactDetails}>
                <View style={styles.contactDetailRow}>
                  <Mail size={16} color={colors.primary} />
                  <Text style={styles.contactDetailText}>Direct: hello@celarox.com</Text>
                </View>
                <View style={styles.contactDetailRow}>
                  <Building size={16} color={colors.primary} />
                  <Text style={styles.contactDetailText}>Global HQ: Celarox Enterprise Inc.</Text>
                </View>
                <View style={styles.contactDetailRow}>
                  <Globe size={16} color={colors.primary} />
                  <Text style={styles.contactDetailText}>https://celarox.com</Text>
                </View>
              </View>
            </View>

            <View style={styles.contactForm}>
              <Input
                label="Full Name *"
                placeholder="Jason Kenneth"
                value={contactName}
                onChangeText={setContactName}
              />
              <Input
                label="Business Email *"
                placeholder="jason@company.com"
                value={contactEmail}
                onChangeText={setContactEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Company / Organization"
                placeholder="Acme Global Inc."
                value={contactCompany}
                onChangeText={setContactCompany}
              />
              <Input
                label="Inquiry Subject"
                placeholder="Enterprise Plan & Migration"
                value={contactSubject}
                onChangeText={setContactSubject}
              />
              <Input
                label="Your Message *"
                placeholder="Describe your organization's needs and current software stack..."
                value={contactMessage}
                onChangeText={setContactMessage}
                multiline
                numberOfLines={4}
                inputStyle={{ height: 90, textAlignVertical: 'top' }}
              />

              <Button
                title={contactSending ? 'Transmitting...' : 'Send Inquiry'}
                onPress={handleSendInquiry}
                loading={contactSending}
                variant="primary"
                icon={<Send size={16} color="#FFFFFF" />}
              />
            </View>
          </View>
        </Card>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerTop}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Sparkles size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.brandTitle}>Celarox</Text>
            <Text style={styles.brandTag}>ENTERPRISE</Text>
          </View>
          <Text style={styles.footerTagline}>
            The unified business management platform for next-generation enterprises.
          </Text>
        </View>

        <View style={styles.footerLinksRow}>
          <TouchableOpacity onPress={onGoToPrivacy}>
            <Text style={styles.footerLinkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <TouchableOpacity onPress={onGoToTerms}>
            <Text style={styles.footerLinkText}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <Text style={styles.footerLinkText}>Support: hello@celarox.com</Text>
        </View>

        <Text style={styles.copyright}>
          © 2026 Celarox Enterprise Inc. All rights reserved. Version 1.0.
        </Text>
      </View>

      <CurrencyModal
        visible={currencyModalOpen}
        onClose={() => setCurrencyModalOpen(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navBar: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.glassBg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  brandTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    letterSpacing: -0.5,
  },
  brandTag: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: typography.weights.heavy,
    fontFamily: typography.fontFamily,
    marginLeft: 8,
    letterSpacing: 1.2,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  currencyTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  currencyTopFlag: {
    fontSize: 14,
  },
  currencyTopCode: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  currencyTopSymbol: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: typography.fontFamily,
  },
  currencyAutoTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radii.sm,
    marginLeft: 2,
  },
  currencyAutoTagText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  navLink: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
  },
  navLinkText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
  },
  heroSection: {
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    maxWidth: 1080,
    alignSelf: 'center',
    width: '100%',
  },
  heroBadge: {
    marginBottom: spacing.lg,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontWeight: typography.weights.heavy,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: spacing.base,
  },
  heroTitleLg: {
    fontSize: typography.sizes['5xl'],
    lineHeight: 56,
  },
  heroTitleSm: {
    fontSize: typography.sizes['3xl'],
    lineHeight: 38,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.base,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    maxWidth: 720,
    lineHeight: 24,
    marginBottom: spacing['2xl'],
  },
  heroCtaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  trustBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.medium,
  },
  showcaseSection: {
    maxWidth: 1080,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing['4xl'],
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.xl,
    padding: 4,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radii.lg,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: colors.card,
    ...shadows.subtle,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
  },
  tabTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.weights.bold,
  },
  previewCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minHeight: 240,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  previewTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  previewDesc: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    fontFamily: typography.fontFamily,
  },
  stageGrid: {
    gap: spacing.md,
  },
  stageColumn: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  stageTitle: {
    color: colors.textTertiary,
    fontSize: 11,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  stageCard: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  stageCardTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  stageCardValue: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
  invoiceDemoBox: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  invoiceDemoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  invoiceDemoLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily,
  },
  invoiceDemoValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.medium,
  },
  gridSection: {
    maxWidth: 1180,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing['4xl'],
  },
  sectionHeading: {
    color: colors.textPrimary,
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  sectionSubheading: {
    color: colors.textSecondary,
    fontSize: typography.sizes.base,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    maxWidth: 680,
    alignSelf: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: 22,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.base,
    justifyContent: 'center',
  },
  appCardWrapper: {
    marginBottom: spacing.sm,
  },
  appCard: {
    height: '100%',
  },
  appIconBox: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appCardTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.xs,
  },
  appCardDesc: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    lineHeight: 18,
  },
  pricingSection: {
    maxWidth: 1080,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing['4xl'],
  },
  pricingRow: {
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  pricingCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  pricingCardFeatured: {
    borderColor: colors.primary,
    ...shadows.glow,
  },
  planName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.xs,
  },
  planPrice: {
    color: colors.textPrimary,
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.heavy,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.xs,
  },
  planPeriod: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
  },
  planDesc: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.lg,
  },
  planFeatures: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  planFeatureItem: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
  },
  contactSection: {
    maxWidth: 1080,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing['4xl'],
  },
  contactCard: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  contactRow: {
    gap: spacing.xl,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.sm,
  },
  contactDesc: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  contactDetails: {
    gap: spacing.md,
  },
  contactDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  contactDetailText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.medium,
  },
  contactForm: {
    flex: 1.2,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  footerTop: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  footerTagline: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginTop: spacing.xs,
  },
  footerLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  footerLinkText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
  },
  footerDivider: {
    color: colors.textMuted,
  },
  copyright: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: typography.fontFamily,
  },
});
