import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  TextInput,
  RefreshControl,
} from 'react-native';
import {
  Users,
  Building,
  Plus,
  Search,
  DollarSign,
  ChevronRight,
  TrendingUp,
  Mail,
  Phone,
  Filter,
} from 'lucide-react-native';
import { colors, radii, spacing, typography } from '../../theme';
import { Card, Button, Badge, Modal, Input, EmptyState } from '../../components/common';
import { api } from '../../api/endpoints';
import { Deal, Contact, Account, DealStage } from '../../types';
import { useToast } from '../../context/ToastContext';

export const CrmScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'pipeline' | 'contacts' | 'accounts'>('pipeline');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [dealTitle, setDealTitle] = useState('');
  const [dealAmount, setDealAmount] = useState('');
  const [dealStage, setDealStage] = useState<DealStage>('lead');
  const [dealProb, setDealProb] = useState('50');
  const [dealNotes, setDealNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dealsRes, contactsRes, accountsRes] = await Promise.all([
        api.crm.listDeals(),
        api.crm.listContacts(),
        api.crm.listAccounts(),
      ]);
      setDeals(dealsRes.data);
      setContacts(contactsRes.data);
      setAccounts(accountsRes.data);
    } catch (e) {
      console.warn('CRM data fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDeal = async () => {
    if (!dealTitle.trim() || !dealAmount.trim()) {
      toast.error('Required Fields', 'Please enter a deal title and amount.');
      return;
    }

    try {
      setSaving(true);
      const res = await api.crm.createDeal({
        title: dealTitle.trim(),
        amount: parseFloat(dealAmount) || 0,
        stage: dealStage,
        probability: parseInt(dealProb, 10) || 50,
        notes: dealNotes.trim(),
      });
      setDeals((prev) => [res.data, ...prev]);
      toast.success('Deal Created', `Added ${dealTitle} to your pipeline.`);
      setCreateModalVisible(false);
      setDealTitle('');
      setDealAmount('');
      setDealNotes('');
    } catch (err: any) {
      toast.error('Failed to create deal', err.response?.data?.error || 'Server error.');
    } finally {
      setSaving(false);
    }
  };

  const stages: Array<{ key: DealStage; label: string; color: string }> = [
    { key: 'lead', label: 'Lead Inbound', color: colors.info },
    { key: 'qualified', label: 'Qualified', color: colors.primary },
    { key: 'proposal', label: 'Proposal Sent', color: colors.accentPurple },
    { key: 'negotiation', label: 'Negotiation', color: colors.warning },
    { key: 'closed_won', label: 'Closed Won', color: colors.success },
    { key: 'closed_lost', label: 'Closed Lost', color: colors.danger },
  ];

  const filteredDeals = deals.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Top Header & Subnav */}
      <View style={styles.topNav}>
        <View style={styles.tabPills}>
          <TouchableOpacity
            onPress={() => setActiveTab('pipeline')}
            style={[styles.tabPill, activeTab === 'pipeline' && styles.tabPillActive]}
          >
            <Text style={[styles.tabPillText, activeTab === 'pipeline' && styles.tabPillTextActive]}>
              Deal Pipeline ({deals.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('contacts')}
            style={[styles.tabPill, activeTab === 'contacts' && styles.tabPillActive]}
          >
            <Text style={[styles.tabPillText, activeTab === 'contacts' && styles.tabPillTextActive]}>
              Contacts ({contacts.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('accounts')}
            style={[styles.tabPill, activeTab === 'accounts' && styles.tabPillActive]}
          >
            <Text style={[styles.tabPillText, activeTab === 'accounts' && styles.tabPillTextActive]}>
              Accounts ({accounts.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.searchBox}>
            <Search size={14} color={colors.textTertiary} />
            <TextInput
              placeholder="Search CRM..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>
          <Button
            title="Create Deal"
            onPress={() => setCreateModalVisible(true)}
            size="sm"
            variant="primary"
            icon={<Plus size={14} color="#FFFFFF" />}
          />
        </View>
      </View>

      {/* Main Content Area */}
      {activeTab === 'pipeline' && (
        <ScrollView
          horizontal={isDesktop}
          style={styles.pipelineScroll}
          contentContainerStyle={styles.pipelineContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary} />}
        >
          {stages.map((stg) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === stg.key);
            const totalStageValue = stageDeals.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

            return (
              <View key={stg.key} style={[styles.column, { width: isDesktop ? 290 : '100%' }]}>
                <View style={styles.columnHeader}>
                  <View style={styles.columnTitleRow}>
                    <View style={[styles.stageDot, { backgroundColor: stg.color }]} />
                    <Text style={styles.columnTitle}>{stg.label}</Text>
                    <Badge label={String(stageDeals.length)} variant="neutral" size="sm" />
                  </View>
                  <Text style={styles.columnTotal}>${totalStageValue.toLocaleString()}</Text>
                </View>

                <View style={styles.dealCardsContainer}>
                  {stageDeals.length === 0 ? (
                    <View style={styles.emptyColumn}>
                      <Text style={styles.emptyColumnText}>No deals in this stage</Text>
                    </View>
                  ) : (
                    stageDeals.map((deal) => (
                      <Card key={deal.id} style={styles.dealCard} padding="md">
                        <Text style={styles.dealCardTitle}>{deal.title}</Text>
                        <Text style={styles.dealCardAmount}>${Number(deal.amount).toLocaleString()} USD</Text>
                        {deal.contact_name ? (
                          <Text style={styles.dealCardContact}>Contact: {deal.contact_name}</Text>
                        ) : null}
                        <View style={styles.dealCardFooter}>
                          <Badge label={`${deal.probability}% Prob`} variant="primary" size="sm" />
                          <Text style={styles.dealCardDate}>
                            {new Date(deal.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                      </Card>
                    ))
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Contacts List Tab */}
      {activeTab === 'contacts' && (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          {contacts.length === 0 ? (
            <EmptyState
              icon={<Users size={28} color={colors.primary} />}
              title="No Contacts Registered"
              description="Keep all your customer leads and client stakeholder records organized in one directory."
              actionTitle="Add New Contact"
              onAction={() => toast.info('New Contact', 'Create contact via workspace API')}
            />
          ) : (
            contacts.map((c) => (
              <Card key={c.id} style={styles.listItem} padding="md">
                <View style={styles.listItemLeft}>
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactAvatarText}>{c.first_name[0] || 'C'}</Text>
                  </View>
                  <View>
                    <Text style={styles.listItemTitle}>{c.full_name || `${c.first_name} ${c.last_name}`}</Text>
                    <Text style={styles.listItemSub}>{c.email} {c.phone ? `• ${c.phone}` : ''}</Text>
                  </View>
                </View>
                <Badge label={c.status} variant="info" size="sm" />
              </Card>
            ))
          )}
        </ScrollView>
      )}

      {/* Accounts List Tab */}
      {activeTab === 'accounts' && (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          {accounts.length === 0 ? (
            <EmptyState
              icon={<Building size={28} color={colors.primary} />}
              title="No Corporate Accounts"
              description="Store company profiles, revenue sizes, and organizational structures."
              actionTitle="Add Account"
              onAction={() => toast.info('New Account', 'Add account via workspace API')}
            />
          ) : (
            accounts.map((acc) => (
              <Card key={acc.id} style={styles.listItem} padding="md">
                <View>
                  <Text style={styles.listItemTitle}>{acc.name}</Text>
                  <Text style={styles.listItemSub}>{acc.industry || 'Technology'} • {acc.city || 'Global'}</Text>
                </View>
                <Badge label="Active Account" variant="success" size="sm" />
              </Card>
            ))
          )}
        </ScrollView>
      )}

      {/* Create Deal Modal */}
      <Modal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        title="Create New Opportunity"
        subtitle="Add a new potential client contract or deal into your visual pipeline."
      >
        <Input
          label="Deal Title *"
          placeholder="e.g. Enterprise Cloud Modernization"
          value={dealTitle}
          onChangeText={setDealTitle}
        />
        <Input
          label="Value Amount ($ USD) *"
          placeholder="50000"
          value={dealAmount}
          onChangeText={setDealAmount}
          keyboardType="numeric"
        />
        <Input
          label="Win Probability (0-100%)"
          placeholder="60"
          value={dealProb}
          onChangeText={setDealProb}
          keyboardType="numeric"
        />
        <Input
          label="Strategic Notes"
          placeholder="Client is reviewing procurement schedule by end of quarter..."
          value={dealNotes}
          onChangeText={setDealNotes}
          multiline
          numberOfLines={3}
          inputStyle={{ height: 70, textAlignVertical: 'top' }}
        />

        <Button
          title={saving ? 'Saving...' : 'Add to Pipeline'}
          onPress={handleCreateDeal}
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
    flexWrap: 'wrap',
    gap: spacing.md,
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    height: 34,
    width: 180,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginLeft: 6,
  },
  pipelineScroll: {
    flex: 1,
  },
  pipelineContent: {
    padding: spacing.xl,
    gap: spacing.md,
    flexDirection: 'row',
  },
  column: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    minHeight: 500,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  columnTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  columnTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  columnTotal: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  dealCardsContainer: {
    gap: spacing.sm,
  },
  dealCard: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  dealCardTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
    marginBottom: 4,
  },
  dealCardAmount: {
    color: colors.success,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.xs,
  },
  dealCardContact: {
    color: colors.textTertiary,
    fontSize: 11,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.sm,
  },
  dealCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  dealCardDate: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: typography.fontFamily,
  },
  emptyColumn: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyColumnText: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
  },
  tabContent: {
    flex: 1,
    padding: spacing.xl,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactAvatarText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  listItemTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  listItemSub: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
});
