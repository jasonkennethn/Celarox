import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Zap,
  Play,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Sliders,
} from 'lucide-react-native';
import { colors, radii, spacing, typography } from '../../theme';
import { Card, Button, Badge, Modal, Input, EmptyState } from '../../components/common';
import { api } from '../../api/endpoints';
import { WorkflowRule, WorkflowExecutionLog } from '../../types';
import { useToast } from '../../context/ToastContext';

export const WorkflowsScreen: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'rules' | 'logs'>('rules');
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [logs, setLogs] = useState<WorkflowExecutionLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [createModal, setCreateModal] = useState(false);
  const [ruleTitle, setRuleTitle] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('deal.won');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesRes, logsRes] = await Promise.all([
        api.workflows.listRules(),
        api.workflows.listLogs(),
      ]);
      setRules(rulesRes.data);
      setLogs(logsRes.data);
    } catch (e) {
      console.warn('Workflows fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRule = async () => {
    if (!ruleTitle.trim()) {
      toast.error('Title Required', 'Please enter a name for this automation rule.');
      return;
    }

    try {
      setSaving(true);
      const res = await api.workflows.createRule({
        title: ruleTitle.trim(),
        trigger_event: triggerEvent,
        conditions: {},
        is_active: true,
        actions: [
          {
            action_type: 'send_email',
            config: { template: 'deal_celebration', recipient: 'hello@celarox.com' },
            order: 1,
          },
        ],
      });
      setRules((prev) => [res.data, ...prev]);
      toast.success('Automation Rule Created', `Active rule: "${ruleTitle}"`);
      setCreateModal(false);
      setRuleTitle('');
    } catch (err: any) {
      toast.error('Error', err.response?.data?.error || 'Failed to create automation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <View style={styles.tabPills}>
          <TouchableOpacity
            onPress={() => setActiveTab('rules')}
            style={[styles.tabPill, activeTab === 'rules' && styles.tabPillActive]}
          >
            <Text style={[styles.tabPillText, activeTab === 'rules' && styles.tabPillTextActive]}>
              Automation Rules ({rules.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('logs')}
            style={[styles.tabPill, activeTab === 'logs' && styles.tabPillActive]}
          >
            <Text style={[styles.tabPillText, activeTab === 'logs' && styles.tabPillTextActive]}>
              Execution Logs ({logs.length})
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          title="New Workflow"
          onPress={() => setCreateModal(true)}
          size="sm"
          variant="primary"
          icon={<Plus size={14} color="#FFFFFF" />}
        />
      </View>

      {/* Rules List */}
      {activeTab === 'rules' && (
        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {rules.length === 0 ? (
            <EmptyState
              icon={<Zap size={28} color={colors.warning} />}
              title="No Automations Configured"
              description="Eliminate manual busywork. Trigger automated Brevo emails, task creations, and deal updates automatically."
              actionTitle="Create First Automation"
              onAction={() => setCreateModal(true)}
            />
          ) : (
            rules.map((rule) => (
              <Card key={rule.id} style={styles.ruleCard} padding="base">
                <View style={styles.ruleLeft}>
                  <View style={styles.ruleIcon}>
                    <Zap size={20} color={colors.warning} />
                  </View>
                  <View>
                    <Text style={styles.ruleTitle}>{rule.title}</Text>
                    <Text style={styles.ruleTrigger}>Trigger: {rule.trigger_event}</Text>
                  </View>
                </View>

                <View style={styles.ruleRight}>
                  <Badge
                    label={rule.is_active ? 'Active' : 'Paused'}
                    variant={rule.is_active ? 'success' : 'neutral'}
                    size="sm"
                  />
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {logs.length === 0 ? (
            <EmptyState
              icon={<Clock size={28} color={colors.primary} />}
              title="No Executions Recorded Yet"
              description="Audit logs will record every automated event trigger and action dispatch in real time."
            />
          ) : (
            logs.map((log) => (
              <Card key={log.id} style={styles.ruleCard} padding="base">
                <View>
                  <Text style={styles.ruleTitle}>{log.rule_title || log.triggered_by_event}</Text>
                  <Text style={styles.ruleTrigger}>
                    Event: {log.triggered_by_event} • {new Date(log.executed_at).toLocaleString()}
                  </Text>
                </View>
                <Badge
                  label={log.status}
                  variant={log.status === 'success' ? 'success' : 'danger'}
                  size="sm"
                />
              </Card>
            ))
          )}
        </ScrollView>
      )}

      {/* Create Workflow Modal */}
      <Modal
        visible={createModal}
        onClose={() => setCreateModal(false)}
        title="Create Autonomous Workflow"
        subtitle="Define triggers and automatic downstream actions."
      >
        <Input
          label="Automation Name *"
          placeholder="Enter Automation Workflow Name"
          value={ruleTitle}
          onChangeText={setRuleTitle}
        />
        <Input
          label="Trigger Event (e.g. deal.won, invoice.paid, task.completed)"
          placeholder="Enter Trigger Event (e.g. deal.won, invoice.paid)"
          value={triggerEvent}
          onChangeText={setTriggerEvent}
        />
        <Button
          title={saving ? 'Activating...' : 'Deploy Automation'}
          onPress={handleCreateRule}
          loading={saving}
          variant="primary"
          size="lg"
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  tabPills: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  tabPill: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
  },
  tabPillActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  tabPillText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
  },
  tabPillTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  ruleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  ruleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ruleIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  ruleTrigger: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
  ruleRight: {
    alignItems: 'flex-end',
  },
});
