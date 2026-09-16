import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Image,
} from 'react-native';
import {
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
  ChevronDown,
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
      desc: 'Multi-stage visual deal pipelines, account tracking, and customer interaction telemetry.',
      color: colors.primary,
    },
    {
      icon: FolderKanban,
      title: 'Operations & Projects',
      desc: 'Agile Kanban boards, sprint task tracking, subtask checklists, and deliverable workflows.',
      color: '#0284C7',
    },
    {
      icon: Receipt,
      title: 'Finance & Invoicing',
      desc: 'Instant Apple-grade PDF invoices, itemized tax/discounts, payments, and expense tracking.',
      color: colors.success,
    },
    {
      icon: FileText,
      title: 'Document Cloud',
      desc: 'High-speed encrypted asset storage via Cloudinary and Google Drive integration.',
      color: '#7C3AED',
    },
    {
      icon: Zap,
      title: 'Workflow Engine',
      desc: 'Autonomous event triggers for deal milestones, invoice dispatches, and notification rules.',
      color: colors.warning,
    },
    {
      icon: Briefcase,
      title: 'HR & Team Hub',
      desc: 'Department directory, employee profiles, leave request approvals, and corporate notices.',
      color: '#DB2777',
    },
    {
      icon: HelpCircle,
      title: 'Forms & Support Desk',
      desc: 'Custom dynamic web forms with threaded customer support ticket management.',
      color: colors.primary,
    },
    {
      icon: BarChart3,
      title: 'Executive Intelligence',
      desc: 'Real-time MRR analytics, project velocities, financial run rates, and capacity models.',
      color: '#0D9488',
    },
  ];

  return (
    <View style={styles.outerContainer}>
      {/* LOCKED TOP NAVIGATION BAR */}
      <View style={styles.navBar}>
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

        <View style={styles.navActions}>
          {/* Currency Pill */}
          <TouchableOpacity
            onPress={() => setCurrencyModalOpen(true)}
            style={styles.currencyTopBtn}
            activeOpacity={0.75}
          >
            <Text style={styles.currencyTopFlag}>{currentCurrency.flag}</Text>
            <Text style={styles.currencyTopCode}>{currentCurrency.code}</Text>
            <Text style={styles.currencyTopSymbol}>({currentCurrency.symbol})</Text>
            {isAutoMode && (
              <View style={styles.currencyAutoTag}>
                <Text style={styles.currencyAutoTagText}>AUTO</Text>
              </View>
            )}
            <ChevronDown size={12} color={colors.textTertiary} />
          </TouchableOpacity>

          {!isTablet && width >= 500 && (
            <TouchableOpacity onPress={() => onGoToAuth('login')} style={styles.navLink}>
              <Text style={styles.navLinkText}>Sign In</Text>
            </TouchableOpacity>
          )}

          <Button
            title="Launch Free Trial"
            onPress={() => onGoToAuth('register')}
            size="sm"
            variant="primary"
          />
        </View>
      </View>

      {/* BOUNDED SCROLLABLE CONTENT */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Badge
            label="Unified Enterprise Operating System • 2026 Edition"
            variant="primary"
            style={styles.heroBadge}
          />
          <Text style={[styles.heroTitle, isDesktop ? styles.heroTitleLg : styles.heroTitleSm]}>
            One Platform to Run Every Enterprise Workflow
          </Text>
          <Text style={styles.heroSubtitle}>
            Celarox replaces fragmented point solutions with an integrated operating system for CRM,
            Operations, Finance, Cloud Documents, HR, Support, and Autonomous Workflows.
          </Text>

          <View style={styles.heroCtaRow}>
            <Button
              title="Start 14-Day Free Trial"
              onPress={() => onGoToAuth('register')}
              size="lg"
              variant="primary"
              icon={<ArrowRight size={18} color="#FFFFFF" />}
              iconPosition="right"
              style={{ marginRight: isDesktop ? spacing.md : 0, marginBottom: spacing.sm }}
            />
            <Button
              title="Sign In to Workspace"
              onPress={() => onGoToAuth('login')}
              size="lg"
              variant="secondary"
              icon={<Lock size={16} color={colors.textPrimary} />}
              style={{ marginBottom: spacing.sm }}
            />
          </View>

          {/* Trust Badges */}
          <View style={styles.trustBadges}>
            <View style={styles.trustItem}>
              <ShieldCheck size={16} color={colors.success} />
              <Text style={styles.trustText}>Neon DB PostgreSQL (SSL)</Text>
            </View>
            <View style={styles.trustItem}>
              <CheckCircle2 size={16} color={colors.primary} />
              <Text style={styles.trustText}>Brevo Transactional SMTP</Text>
            </View>
            <View style={styles.trustItem}>
              <CheckCircle2 size={16} color={colors.primary} />
              <Text style={styles.trustText}>Cloudinary & Google Drive Cloud</Text>
            </View>
          </View>
        </View>

        {/* Interactive Feature Demo Showcase */}
        <View style={styles.showcaseSection}>
          <View style={styles.tabBar}>
            {(
              [
                { id: 'crm', label: 'CRM & Pipeline', icon: Users },
                { id: 'finance', label: 'Finance & Invoicing', icon: Receipt },
                { id: 'projects', label: 'Sprint Kanban', icon: FolderKanban },
                { id: 'workflows', label: 'Automations', icon: Zap },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={[styles.tabButton, isActive && styles.tabButtonActive]}
                  activeOpacity={0.8}
                >
                  <Icon size={16} color={isActive ? colors.primary : colors.textTertiary} />
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Showcase Preview Box */}
          <Card style={styles.previewCard} padding="xl">
            {activeTab === 'crm' && (
              <View>
                <View style={styles.previewHeader}>
                  <View>
                    <Text style={styles.previewTitle}>Multi-Stage Enterprise Deal Flow</Text>
                    <Text style={styles.previewDesc}>
                      Visual Kanban stages with automatic win probability weighting and revenue forecasting.
                    </Text>
                  </View>
                  <Badge label="Live Pipeline Preview" variant="success" dot />
                </View>

                <View style={[styles.stageGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
                  <View style={styles.stageColumn}>
                    <Text style={styles.stageTitle}>QUALIFIED LEADS (3)</Text>
                    <View style={styles.stageCard}>
                      <Text style={styles.stageCardTitle}>Starlight Robotics Global</Text>
                      <Text style={styles.stageCardValue}>{formatAmount(65000)} • 60% prob</Text>
                    </View>
                    <View style={styles.stageCard}>
                      <Text style={styles.stageCardTitle}>Apex Financial Core</Text>
                      <Text style={styles.stageCardValue}>{formatAmount(140000)} • 50% prob</Text>
                    </View>
                  </View>

                  <View style={styles.stageColumn}>
                    <Text style={styles.stageTitle}>PROPOSAL SENT (2)</Text>
                    <View style={styles.stageCard}>
                      <Text style={styles.stageCardTitle}>Acme Cloud Migration</Text>
                      <Text style={styles.stageCardValue}>{formatAmount(120000)} • 80% prob</Text>
                    </View>
                  </View>

                  <View style={styles.stageColumn}>
                    <Text style={styles.stageTitle}>CLOSED WON (5)</Text>
                    <View style={styles.stageCard}>
                      <Text style={styles.stageCardTitle}>Vanguard BioTech ERP</Text>
                      <Text style={styles.stageCardValue}>{formatAmount(280000)} • 100% Won</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'finance' && (
              <View>
                <View style={styles.previewHeader}>
                  <View>
                    <Text style={styles.previewTitle}>Apple-Caliber Invoicing & Billing</Text>
                    <Text style={styles.previewDesc}>
                      Itemized PDF invoices, payment tracking, and automated email dispatches via Brevo API.
                    </Text>
                  </View>
                  <Badge label="Automated Billing" variant="primary" />
                </View>

                <View style={styles.invoiceDemoBox}>
                  <View style={styles.invoiceDemoRow}>
                    <Text style={styles.invoiceDemoLabel}>Invoice #</Text>
                    <Text style={styles.invoiceDemoValue}>INV-2026-0042</Text>
                  </View>
                  <View style={styles.invoiceDemoRow}>
                    <Text style={styles.invoiceDemoLabel}>Client</Text>
                    <Text style={styles.invoiceDemoValue}>Acme Global Technologies Inc.</Text>
                  </View>
                  <View style={styles.invoiceDemoRow}>
                    <Text style={styles.invoiceDemoLabel}>Line Items (3)</Text>
                    <Text style={styles.invoiceDemoValue}>Platform License, SRE Cluster, SLA Support</Text>
                  </View>
                  <View style={[styles.invoiceDemoRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 8 }]}>
                    <Text style={[styles.invoiceDemoLabel, { fontWeight: '700', color: colors.textPrimary }]}>Total Amount</Text>
                    <Text style={[styles.invoiceDemoValue, { fontWeight: '700', color: colors.success }]}>
                      {formatAmount(24500)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'projects' && (
              <View>
                <View style={styles.previewHeader}>
                  <View>
                    <Text style={styles.previewTitle}>Agile Sprint Operations & Kanban</Text>
                    <Text style={styles.previewDesc}>
                      Task allocation, priority matrices, subtask checklists, and time tracking.
                    </Text>
                  </View>
                  <Badge label="Sprint Active" variant="primary" />
                </View>

                <View style={[styles.stageGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
                  <View style={styles.stageColumn}>
                    <Text style={styles.stageTitle}>IN PROGRESS (4)</Text>
                    <View style={styles.stageCard}>
                      <Text style={styles.stageCardTitle}>High-Throughput Neon DB Sharding</Text>
                      <Badge label="Urgent" variant="danger" size="sm" style={{ marginTop: 4 }} />
                    </View>
                  </View>

                  <View style={styles.stageColumn}>
                    <Text style={styles.stageTitle}>IN REVIEW (2)</Text>
                    <View style={styles.stageCard}>
                      <Text style={styles.stageCardTitle}>Cloudinary Enterprise Asset Webhooks</Text>
                      <Badge label="High" variant="warning" size="sm" style={{ marginTop: 4 }} />
                    </View>
                  </View>

                  <View style={styles.stageColumn}>
                    <Text style={styles.stageTitle}>DONE (18)</Text>
                    <View style={styles.stageCard}>
                      <Text style={styles.stageCardTitle}>Brevo Transactional SMTP Dispatcher</Text>
                      <Badge label="Completed" variant="success" size="sm" style={{ marginTop: 4 }} />
                    </View>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'workflows' && (
              <View>
                <View style={styles.previewHeader}>
                  <View>
                    <Text style={styles.previewTitle}>Autonomous Event-Driven Automation Engine</Text>
                    <Text style={styles.previewDesc}>
                      Triggers on CRM deal victories, automatically generates invoices, and dispatches team notifications.
                    </Text>
                  </View>
                  <Badge label="Autonomous Engine" variant="success" dot />
                </View>

                <View style={styles.workflowDemoBox}>
                  <View style={styles.workflowStep}>
                    <View style={styles.workflowDot} />
                    <Text style={styles.workflowStepTitle}>Trigger: Deal Stage changes to "Closed Won"</Text>
                    <Text style={styles.workflowStepDesc}>Monitors all high-value opportunity closures</Text>
                  </View>
                  <View style={styles.workflowConnector} />
                  <View style={styles.workflowStep}>
                    <View style={[styles.workflowDot, { backgroundColor: colors.primary }]} />
                    <Text style={styles.workflowStepTitle}>Action 1: Generate PDF Invoice & Dispatch via Brevo</Text>
                    <Text style={styles.workflowStepDesc}>Sends structured billing document to client finance email</Text>
                  </View>
                  <View style={styles.workflowConnector} />
                  <View style={styles.workflowStep}>
                    <View style={[styles.workflowDot, { backgroundColor: colors.success }]} />
                    <Text style={styles.workflowStepTitle}>Action 2: Provision Cloud Folder & Notify Executive Team</Text>
                    <Text style={styles.workflowStepDesc}>Creates dedicated Google Drive & Cloudinary tenant directories</Text>
                  </View>
                </View>
              </View>
            )}
          </Card>
        </View>

        {/* 8 Enterprise Application Suites Grid */}
        <View style={styles.gridSection}>
          <Text style={styles.sectionHeading}>Everything Your Enterprise Needs</Text>
          <Text style={styles.sectionSubheading}>
            Eight integrated operational suites built on a unified Postgres database with multi-tenant isolation.
          </Text>

          <View style={styles.cardsGrid}>
            {apps.map((app, idx) => {
              const Icon = app.icon;
              return (
                <View
                  key={idx}
                  style={[
                    styles.appCardWrapper,
                    { width: isDesktop ? '23.5%' : isTablet ? '48%' : '100%' },
                  ]}
                >
                  <Card style={styles.appCard} padding="lg">
                    <View style={[styles.appIconBox, { backgroundColor: `${app.color}14` }]}>
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

        {/* Transparent Enterprise Pricing */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionHeading}>Transparent, Predictable Pricing</Text>
          <Text style={styles.sectionSubheading}>
            All plans include SSL database encryption, multi-tenant isolation, and Brevo email integration.
          </Text>

          <View style={[styles.pricingRow, { flexDirection: isDesktop ? 'row' : 'column' }]}>
            {/* Starter */}
            <Card style={styles.pricingCard} padding="xl">
              <Text style={styles.planName}>Starter</Text>
              <Text style={styles.planPrice}>
                {formatAmount(49, { showDecimals: false })}
                <Text style={styles.planPeriod}> / month</Text>
              </Text>
              <Text style={styles.planDesc}>Ideal for growing startups and agile teams.</Text>
              <View style={styles.planFeatures}>
                <Text style={styles.planFeatureItem}>✓ Up to 5 Team Members</Text>
                <Text style={styles.planFeatureItem}>✓ Full CRM & Projects Hub</Text>
                <Text style={styles.planFeatureItem}>✓ Invoice Generation (50/mo)</Text>
                <Text style={styles.planFeatureItem}>✓ 10GB Cloud Storage</Text>
              </View>
              <Button
                title="Get Starter"
                onPress={() => onGoToAuth('register')}
                variant="secondary"
              />
            </Card>

            {/* Growth */}
            <Card style={[styles.pricingCard, styles.pricingCardFeatured]} padding="xl">
              <Badge label="MOST POPULAR" variant="primary" style={{ marginBottom: spacing.sm }} />
              <Text style={styles.planName}>Growth</Text>
              <Text style={styles.planPrice}>
                {formatAmount(149, { showDecimals: false })}
                <Text style={styles.planPeriod}> / month</Text>
              </Text>
              <Text style={styles.planDesc}>For scaling enterprises with custom automation needs.</Text>
              <View style={styles.planFeatures}>
                <Text style={styles.planFeatureItem}>✓ Up to 25 Team Members</Text>
                <Text style={styles.planFeatureItem}>✓ Unlimited CRM & Invoices</Text>
                <Text style={styles.planFeatureItem}>✓ Autonomous Workflow Builder</Text>
                <Text style={styles.planFeatureItem}>✓ HR & Support Ticket Desk</Text>
                <Text style={styles.planFeatureItem}>✓ 100GB Cloud Storage</Text>
              </View>
              <Button
                title="Start 14-Day Free Trial"
                onPress={() => onGoToAuth('register')}
                variant="primary"
              />
            </Card>

            {/* Enterprise */}
            <Card style={styles.pricingCard} padding="xl">
              <Text style={styles.planName}>Enterprise</Text>
              <Text style={styles.planPrice}>
                {formatAmount(399, { showDecimals: false })}
                <Text style={styles.planPeriod}> / month</Text>
              </Text>
              <Text style={styles.planDesc}>Dedicated infrastructure and bespoke integrations.</Text>
              <View style={styles.planFeatures}>
                <Text style={styles.planFeatureItem}>✓ Unlimited Team Members</Text>
                <Text style={styles.planFeatureItem}>✓ Multi-Tenant Isolation</Text>
                <Text style={styles.planFeatureItem}>✓ 99.99% SLA Guarantee</Text>
                <Text style={styles.planFeatureItem}>✓ Dedicated 24/7 Account Manager</Text>
                <Text style={styles.planFeatureItem}>✓ 1TB High-Speed Cloud</Text>
              </View>
              <Button
                title="Contact Sales"
                onPress={() => onGoToAuth('register')}
                variant="secondary"
              />
            </Card>
          </View>
        </View>

        {/* Public Contact & Inquiry Section */}
        <View style={styles.contactSection}>
          <Card style={styles.contactCard} padding="xl">
            <View style={[styles.contactRow, { flexDirection: isDesktop ? 'row' : 'column' }]}>
              <View
                style={[
                  styles.contactInfo,
                  {
                    marginRight: isDesktop ? spacing['2xl'] : 0,
                    marginBottom: isDesktop ? 0 : spacing.xl,
                  },
                ]}
              >
                <Badge
                  label="DIRECT EXECUTIVE INQUIRIES"
                  variant="primary"
                  style={{ marginBottom: spacing.sm }}
                />
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
                  placeholder="First Name & Last Name"
                  value={contactName}
                  onChangeText={setContactName}
                />
                <Input
                  label="Business Email *"
                  placeholder="Enter Your Email"
                  value={contactEmail}
                  onChangeText={setContactEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Input
                  label="Company / Organization"
                  placeholder="Enter Organization / Company Name"
                  value={contactCompany}
                  onChangeText={setContactCompany}
                />
                <Input
                  label="Inquiry Subject"
                  placeholder="Enter Inquiry Subject"
                  value={contactSubject}
                  onChangeText={setContactSubject}
                />
                <Input
                  label="Your Message *"
                  placeholder="Enter Details of Your Inquiry, Technical Requirements, or RFP..."
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
      </ScrollView>

      <CurrencyModal
        visible={currencyModalOpen}
        onClose={() => setCurrencyModalOpen(false)}
      />
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 36,
    height: 36,
    marginRight: spacing.sm,
  },
  brandInfo: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  brandTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    letterSpacing: 1.2,
  },
  brandTag: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    letterSpacing: 1.5,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  currencyTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.backgroundTertiary,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyTopFlag: {
    fontSize: 13,
    marginRight: 2,
  },
  currencyTopCode: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  currencyTopSymbol: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  currencyAutoTag: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radii.full,
    marginLeft: 2,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  currencyAutoTagText: {
    color: colors.success,
    fontSize: 8,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  navLink: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  navLinkText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  heroSection: {
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['4xl'],
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
    backgroundColor: colors.backgroundTertiary,
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minHeight: 240,
    ...shadows.card,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
    gap: spacing.sm,
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
    backgroundColor: colors.backgroundTertiary,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    backgroundColor: '#FFFFFF',
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
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
    backgroundColor: colors.backgroundTertiary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
  workflowDemoBox: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  workflowStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  workflowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.warning,
  },
  workflowStepTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  workflowStepDesc: {
    color: colors.textTertiary,
    fontSize: 11,
    fontFamily: typography.fontFamily,
    marginLeft: 8,
  },
  workflowConnector: {
    width: 2,
    height: 16,
    backgroundColor: colors.border,
    marginLeft: 4,
    marginVertical: 4,
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
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
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
    ...shadows.card,
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
    ...shadows.card,
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
    backgroundColor: '#FFFFFF',
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
    textAlign: 'center',
  },
  footerLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  footerLinkText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.medium,
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
