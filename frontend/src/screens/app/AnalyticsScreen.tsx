import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react-native';
import { colors, radii, spacing, typography } from '../../theme';
import { Card, Button, Badge } from '../../components/common';
import { useToast } from '../../context/ToastContext';

export const AnalyticsScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const toast = useToast();

  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');

  const metrics = [
    {
      title: 'Net ARR Growth',
      value: '$248,500',
      change: '+18.4%',
      trend: 'up',
      subtitle: 'vs prior 30-day baseline',
      icon: <DollarSign size={20} color={colors.primary} />,
    },
    {
      title: 'Sales Pipeline Velocity',
      value: '$1,420,000',
      change: '+24.1%',
      trend: 'up',
      subtitle: '8 active enterprise proposals',
      icon: <Target size={20} color={colors.warning} />,
    },
    {
      title: 'Invoice Collection Ratio',
      value: '96.2%',
      change: '+3.5%',
      trend: 'up',
      subtitle: '$148,200 settled this month',
      icon: <TrendingUp size={20} color={colors.success} />,
    },
    {
      title: 'SLA Support Resolution',
      value: '1.4 hrs',
      change: '-42%',
      trend: 'up',
      subtitle: 'Average time to ticket resolution',
      icon: <Activity size={20} color={colors.info} />,
    },
  ];

  const breakdownData = [
    { label: 'Cloud Infrastructure & SRE', amount: '$42,300', percent: '38%', color: colors.primary },
    { label: 'Enterprise Software Licenses', amount: '$31,500', percent: '28%', color: '#8B5CF6' },
    { label: 'Personnel & Payroll Operations', amount: '$24,200', percent: '22%', color: colors.info },
    { label: 'Marketing & Outbound Growth', amount: '$13,400', percent: '12%', color: colors.warning },
  ];

  const funnelStages = [
    { stage: 'Identified Inquiries & Leads', count: 412, pct: '100%' },
    { stage: 'Qualified Product Demonstrations', count: 184, pct: '44.6%' },
    { stage: 'Custom Solution Proposals Sent', count: 76, pct: '18.4%' },
    { stage: 'Commercial Negotiation / MSA', count: 38, pct: '9.2%' },
    { stage: 'Closed Won Enterprise Contracts', count: 26, pct: '6.3%' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Analytics & Intelligence</Text>
          <Text style={styles.subtitle}>
            Real-time telemetry, revenue attribution, and operational performance metrics.
          </Text>
        </View>

        {/* Timeframe selector */}
        <View style={styles.timeframeContainer}>
          {(['7D', '30D', '90D', '1Y'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTimeframe(t)}
              style={[styles.timeBtn, timeframe === t && styles.timeBtnActive]}
            >
              <Text style={[styles.timeBtnText, timeframe === t && styles.timeBtnTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* KPI Cards Grid */}
      <View style={styles.kpiGrid}>
        {metrics.map((m, idx) => (
          <Card
            key={idx}
            style={[
              styles.kpiCard,
              { width: isDesktop ? '23.5%' : isTablet ? '48%' : '100%' },
            ]}
            padding="base"
          >
            <View style={styles.kpiHeader}>
              <View style={styles.kpiIcon}>{m.icon}</View>
              <Badge
                label={m.change}
                variant={m.trend === 'up' ? 'success' : 'danger'}
                size="sm"
              />
            </View>
            <Text style={styles.kpiVal}>{m.value}</Text>
            <Text style={styles.kpiTitle}>{m.title}</Text>
            <Text style={styles.kpiSub}>{m.subtitle}</Text>
          </Card>
        ))}
      </View>

      {/* Deep Analytics Row */}
      <View style={[styles.analyticsRow, { flexDirection: isDesktop ? 'row' : 'column' }]}>
        {/* Deal Conversion Funnel */}
        <Card style={[styles.chartCard, { flex: 1.2 }]} padding="lg">
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Full-Funnel Sales Conversion</Text>
              <Text style={styles.sectionSub}>End-to-end deal progression through revenue pipeline</Text>
            </View>
            <Badge label="Active Cohort" variant="primary" size="sm" />
          </View>

          <View style={styles.funnelContainer}>
            {funnelStages.map((f, i) => (
              <View key={i} style={styles.funnelRow}>
                <View style={styles.funnelMeta}>
                  <Text style={styles.funnelStage}>{f.stage}</Text>
                  <Text style={styles.funnelCount}>
                    {f.count} deals <Text style={styles.funnelPct}>({f.pct})</Text>
                  </Text>
                </View>
                <View style={styles.funnelBarTrack}>
                  <View
                    style={[
                      styles.funnelBarFill,
                      {
                        width: f.pct as any,
                        backgroundColor:
                          i === funnelStages.length - 1
                            ? colors.success
                            : `rgba(99, 102, 241, ${1 - i * 0.18})`,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Expenditure Allocation */}
        <Card style={[styles.chartCard, { flex: 0.8 }]} padding="lg">
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Expenditure Breakdown</Text>
              <Text style={styles.sectionSub}>Departmental cost allocation</Text>
            </View>
          </View>

          <View style={styles.breakdownList}>
            {breakdownData.map((b, i) => (
              <View key={i} style={styles.breakdownItem}>
                <View style={styles.breakdownHeader}>
                  <View style={styles.breakdownLabelRow}>
                    <View style={[styles.colorDot, { backgroundColor: b.color }]} />
                    <Text style={styles.breakdownLabel}>{b.label}</Text>
                  </View>
                  <Text style={styles.breakdownAmount}>{b.amount}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: b.percent as any, backgroundColor: b.color },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* Strategic Intelligence Insights */}
      <Card style={styles.intelligenceCard} padding="lg">
        <View style={styles.intelHeader}>
          <View style={styles.intelIconBox}>
            <Sparkles size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.intelTitle}>Autonomous Operational Intelligence</Text>
            <Text style={styles.intelDesc}>
              System telemetry indicates that deal cycle length decreased by 22% following the implementation of automated Brevo invoice follow-ups and Dynamic Form onboarding triggers.
            </Text>
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
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
  timeframeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    padding: 3,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeBtn: {
    paddingVertical: 5,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
  },
  timeBtnActive: {
    backgroundColor: colors.primary,
  },
  timeBtnText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
  },
  timeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.weights.bold,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  kpiCard: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiVal: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  kpiTitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
  kpiSub: {
    color: colors.textTertiary,
    fontSize: 10,
    fontFamily: typography.fontFamily,
    marginTop: 4,
  },
  analyticsRow: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  chartCard: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  sectionSub: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
  funnelContainer: {
    gap: spacing.md,
  },
  funnelRow: {
    gap: 4,
  },
  funnelMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  funnelStage: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
  },
  funnelCount: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
  },
  funnelPct: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  funnelBarTrack: {
    height: 8,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  funnelBarFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  breakdownList: {
    gap: spacing.base,
  },
  breakdownItem: {
    gap: 6,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
  },
  breakdownLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
  },
  breakdownAmount: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  barTrack: {
    height: 6,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  intelligenceCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    marginBottom: spacing['2xl'],
  },
  intelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  intelIconBox: {
    width: 38,
    height: 38,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  intelTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    marginBottom: 4,
  },
  intelDesc: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    lineHeight: 18,
  },
});
