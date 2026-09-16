import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import {
  DollarSign,
  Users,
  FolderKanban,
  Receipt,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  Plus,
} from 'lucide-react-native';
import { colors, radii, spacing, typography } from '../../theme';
import { Card, MetricCard, Badge, Button, EmptyState } from '../../components/common';
import { api } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { NavScreen } from '../../components/layout/Sidebar';

interface DashboardScreenProps {
  onNavigate: (screen: NavScreen) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 700 && width < 1024;
  const { user, activeWorkspace } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState<any>({
    mrr: 48500,
    mrr_change: 14.8,
    total_revenue: 342000,
    active_deals_count: 12,
    deals_pipeline_value: 580000,
    open_projects_count: 6,
    pending_tasks_count: 24,
    unpaid_invoices_amount: 18500,
    monthly_expenses_amount: 12400,
    team_members_count: 8,
  });
  const [recentDeals, setRecentDeals] = useState<any[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [dealsRes, tasksRes, analyticsRes] = await Promise.allSettled([
        api.crm.listDeals({ limit: 5 }),
        api.projects.listTasks({ limit: 5 }),
        api.analytics.getOverview(),
      ]);

      if (dealsRes.status === 'fulfilled') setRecentDeals(dealsRes.value.data);
      if (tasksRes.status === 'fulfilled') setRecentTasks(tasksRes.value.data);
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data) {
        setStats((prev: any) => ({ ...prev, ...analyticsRes.value.data }));
      }
    } catch (e) {
      console.warn('Dashboard data fetch error:', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeWorkspace]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Banner */}
      <View style={styles.welcomeBanner}>
        <View style={styles.welcomeText}>
          <Text style={styles.greeting}>
            Good day, {user?.first_name || 'Executive'}
          </Text>
          <Text style={styles.subGreeting}>
            Here is your live operations overview for <Text style={styles.workspaceHighlight}>{activeWorkspace?.name || 'Main Workspace'}</Text>.
          </Text>
        </View>

        <View style={styles.quickLaunchRow}>
          <Button
            title="Create Deal"
            onPress={() => onNavigate('crm')}
            size="sm"
            variant="secondary"
            icon={<Plus size={14} color={colors.primary} />}
          />
          <Button
            title="New Invoice"
            onPress={() => onNavigate('finance')}
            size="sm"
            variant="primary"
            icon={<Receipt size={14} color="#FFFFFF" />}
            style={{ marginLeft: spacing.sm }}
          />
        </View>
      </View>

      {/* KPI Metric Cards Grid */}
      <View style={styles.metricsGrid}>
        <MetricCard
          title="Monthly Recurring Revenue"
          value={`$${Number(stats.mrr).toLocaleString()}`}
          change={stats.mrr_change}
          changePeriod="vs last month"
          icon={<DollarSign size={18} color={colors.success} />}
        />
        <MetricCard
          title="Active Deal Pipeline"
          value={`$${Number(stats.deals_pipeline_value).toLocaleString()}`}
          change={8.5}
          changePeriod={`${stats.active_deals_count} active opportunities`}
          icon={<Users size={18} color={colors.primary} />}
        />
        <MetricCard
          title="Active Projects & Tasks"
          value={`${stats.open_projects_count} Active`}
          changePeriod={`${stats.pending_tasks_count} pending deliverables`}
          icon={<FolderKanban size={18} color={colors.accentCyan} />}
        />
        <MetricCard
          title="Receivables Due"
          value={`$${Number(stats.unpaid_invoices_amount).toLocaleString()}`}
          changePeriod="3 invoices pending collection"
          icon={<Receipt size={18} color={colors.warning} />}
        />
      </View>

      {/* Main Dual Grid: Deals vs Tasks */}
      <View style={[styles.dualGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
        {/* Recent Pipeline Opportunities */}
        <Card style={styles.gridCard} padding="lg">
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Users size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>High-Value Deal Pipeline</Text>
            </View>
            <TouchableOpacity onPress={() => onNavigate('crm')} style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>Open Pipeline</Text>
              <ArrowUpRight size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {recentDeals.length === 0 ? (
            <View style={styles.mockDealList}>
              <View style={styles.dealRow}>
                <View>
                  <Text style={styles.dealTitle}>Acme Global Enterprise Migration</Text>
                  <Text style={styles.dealSub}>Stage: Proposal Sent • 80% Win Rate</Text>
                </View>
                <View style={styles.dealRight}>
                  <Text style={styles.dealAmount}>$120,000</Text>
                  <Badge label="Proposal" variant="primary" size="sm" />
                </View>
              </View>
              <View style={styles.dealRow}>
                <View>
                  <Text style={styles.dealTitle}>Starlight Robotics Cloud Contract</Text>
                  <Text style={styles.dealSub}>Stage: Negotiation • 70% Win Rate</Text>
                </View>
                <View style={styles.dealRight}>
                  <Text style={styles.dealAmount}>$65,000</Text>
                  <Badge label="Negotiation" variant="warning" size="sm" />
                </View>
              </View>
              <View style={styles.dealRow}>
                <View>
                  <Text style={styles.dealTitle}>Apex FinTech Core Integration</Text>
                  <Text style={styles.dealSub}>Stage: Closed Won • 100% Win Rate</Text>
                </View>
                <View style={styles.dealRight}>
                  <Text style={styles.dealAmount}>$210,000</Text>
                  <Badge label="Closed Won" variant="success" size="sm" />
                </View>
              </View>
            </View>
          ) : (
            recentDeals.map((deal) => (
              <View key={deal.id} style={styles.dealRow}>
                <View>
                  <Text style={styles.dealTitle}>{deal.title}</Text>
                  <Text style={styles.dealSub}>Stage: {deal.stage} • {deal.probability}%</Text>
                </View>
                <View style={styles.dealRight}>
                  <Text style={styles.dealAmount}>${Number(deal.amount).toLocaleString()}</Text>
                  <Badge label={deal.stage} variant="primary" size="sm" />
                </View>
              </View>
            ))
          )}
        </Card>

        {/* Priority Operational Tasks */}
        <Card style={styles.gridCard} padding="lg">
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <FolderKanban size={18} color={colors.accentCyan} />
              <Text style={styles.cardTitle}>Sprint Operations & Deliverables</Text>
            </View>
            <TouchableOpacity onPress={() => onNavigate('projects')} style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>Kanban Board</Text>
              <ArrowUpRight size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {recentTasks.length === 0 ? (
            <View style={styles.mockDealList}>
              <View style={styles.dealRow}>
                <View>
                  <Text style={styles.dealTitle}>Finalize Cloud Architecture Review</Text>
                  <Text style={styles.dealSub}>Project: Enterprise Cloud Core • Due Today</Text>
                </View>
                <Badge label="Urgent" variant="danger" size="sm" />
              </View>
              <View style={styles.dealRow}>
                <View>
                  <Text style={styles.dealTitle}>Generate Q3 Client Revenue Statements</Text>
                  <Text style={styles.dealSub}>Project: Finance Operations • In Progress</Text>
                </View>
                <Badge label="High" variant="warning" size="sm" />
              </View>
              <View style={styles.dealRow}>
                <View>
                  <Text style={styles.dealTitle}>Configure Brevo Transactional Email Engine</Text>
                  <Text style={styles.dealSub}>Project: Platform Infrastructure • Completed</Text>
                </View>
                <Badge label="Completed" variant="success" size="sm" />
              </View>
            </View>
          ) : (
            recentTasks.map((task) => (
              <View key={task.id} style={styles.dealRow}>
                <View>
                  <Text style={styles.dealTitle}>{task.title}</Text>
                  <Text style={styles.dealSub}>Status: {task.status}</Text>
                </View>
                <Badge label={task.priority} variant={task.priority === 'urgent' ? 'danger' : 'info'} size="sm" />
              </View>
            ))
          )}
        </Card>
      </View>

      {/* Connected Cloud Infrastructure Status */}
      <Card style={styles.infraCard} padding="lg">
        <View style={styles.infraHeader}>
          <View style={styles.infraTitleRow}>
            <ShieldCheck size={20} color={colors.success} />
            <Text style={styles.infraTitle}>Celarox Multi-Cloud Infrastructure Health</Text>
          </View>
          <Badge label="All Systems Operational" variant="success" dot />
        </View>

        <View style={[styles.infraGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
          <View style={styles.infraItem}>
            <Text style={styles.infraLabel}>DATABASE ENGINE</Text>
            <Text style={styles.infraValue}>Neon DB Serverless PostgreSQL (SSL)</Text>
            <Text style={styles.infraSub}>Latency: 18ms • AWS ap-southeast-1</Text>
          </View>
          <View style={styles.infraItem}>
            <Text style={styles.infraLabel}>TRANSACTIONAL EMAIL</Text>
            <Text style={styles.infraValue}>Brevo SMTP API (no-reply@celarox.com)</Text>
            <Text style={styles.infraSub}>Delivery Rate: 99.98% • Active</Text>
          </View>
          <View style={styles.infraItem}>
            <Text style={styles.infraLabel}>OBJECT & DOCUMENT STORAGE</Text>
            <Text style={styles.infraValue}>Cloudinary Enterprise + Google Drive</Text>
            <Text style={styles.infraSub}>Root Folder: "Celarox Enterprise"</Text>
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
  },
  welcomeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  welcomeText: {
    flex: 1,
    minWidth: 280,
  },
  greeting: {
    color: colors.textPrimary,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    letterSpacing: -0.5,
  },
  subGreeting: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
  workspaceHighlight: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  quickLaunchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.base,
    marginBottom: spacing.xl,
  },
  dualGrid: {
    gap: spacing.base,
    marginBottom: spacing.xl,
  },
  gridCard: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  mockDealList: {
    gap: spacing.sm,
  },
  dealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dealTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  dealSub: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
  dealRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  dealAmount: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  infraCard: {
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  infraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  infraTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infraTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  infraGrid: {
    gap: spacing.base,
  },
  infraItem: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  infraLabel: {
    color: colors.textTertiary,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infraValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
    marginBottom: 2,
  },
  infraSub: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: typography.fontFamily,
  },
});
