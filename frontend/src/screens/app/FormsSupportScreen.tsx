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
  HelpCircle,
  FileCheck2,
  Plus,
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
} from 'lucide-react-native';
import { colors, radii, spacing, typography } from '../../theme';
import { Card, Button, Badge, Modal, Input, EmptyState } from '../../components/common';
import { api } from '../../api/endpoints';
import { DynamicForm, SupportTicket } from '../../types';
import { useToast } from '../../context/ToastContext';

export const FormsSupportScreen: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'tickets' | 'forms'>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [forms, setForms] = useState<DynamicForm[]>([]);
  const [loading, setLoading] = useState(false);

  // Ticket Modal
  const [ticketModal, setTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [savingTicket, setSavingTicket] = useState(false);

  // Form Modal
  const [formModal, setFormModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [savingForm, setSavingForm] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, formsRes] = await Promise.all([
        api.formsSupport.listTickets(),
        api.formsSupport.listForms(),
      ]);
      setTickets(ticketsRes.data);
      setForms(formsRes.data);
    } catch (e) {
      console.warn('Forms/Support fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTicket = async () => {
    if (!ticketSubject.trim() || !customerEmail.trim()) {
      toast.error('Required Fields', 'Please enter a ticket subject and customer email.');
      return;
    }

    try {
      setSavingTicket(true);
      const res = await api.formsSupport.createTicket({
        subject: ticketSubject.trim(),
        description: ticketDesc.trim(),
        customer_name: customerName.trim() || 'Client User',
        customer_email: customerEmail.trim(),
        priority: 'high',
        status: 'open',
      });
      setTickets((prev) => [res.data, ...prev]);
      toast.success('Ticket Opened', `Created #${res.data.ticket_number}`);
      setTicketModal(false);
      setTicketSubject('');
      setTicketDesc('');
    } catch (err: any) {
      toast.error('Error', err.response?.data?.error || 'Failed to create ticket.');
    } finally {
      setSavingTicket(false);
    }
  };

  const handleCreateForm = async () => {
    if (!formTitle.trim()) {
      toast.error('Title Required', 'Please enter a title for the dynamic form.');
      return;
    }

    try {
      setSavingForm(true);
      const slug = formSlug.trim() || formTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const res = await api.formsSupport.createForm({
        title: formTitle.trim(),
        slug,
        description: formDesc.trim(),
        schema: [
          { name: 'full_name', label: 'Your Name', type: 'text', required: true },
          { name: 'email', label: 'Email Address', type: 'email', required: true },
          { name: 'notes', label: 'Inquiry Details', type: 'textarea', required: false },
        ],
        is_published: true,
      });
      setForms((prev) => [res.data, ...prev]);
      toast.success('Form Published', `Accessible at /forms/${slug}`);
      setFormModal(false);
      setFormTitle('');
      setFormSlug('');
    } catch (err: any) {
      toast.error('Error', err.response?.data?.error || 'Failed to create form.');
    } finally {
      setSavingForm(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <View style={styles.tabPills}>
          <TouchableOpacity
            onPress={() => setActiveTab('tickets')}
            style={[styles.tabPill, activeTab === 'tickets' && styles.tabPillActive]}
          >
            <Text style={[styles.tabPillText, activeTab === 'tickets' && styles.tabPillTextActive]}>
              Support Tickets ({tickets.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('forms')}
            style={[styles.tabPill, activeTab === 'forms' && styles.tabPillActive]}
          >
            <Text style={[styles.tabPillText, activeTab === 'forms' && styles.tabPillTextActive]}>
              Dynamic Forms ({forms.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          {activeTab === 'tickets' ? (
            <Button
              title="Open Ticket"
              onPress={() => setTicketModal(true)}
              size="sm"
              variant="primary"
              icon={<Plus size={14} color="#FFFFFF" />}
            />
          ) : (
            <Button
              title="Build Form"
              onPress={() => setFormModal(true)}
              size="sm"
              variant="primary"
              icon={<Plus size={14} color="#FFFFFF" />}
            />
          )}
        </View>
      </View>

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {tickets.length === 0 ? (
            <EmptyState
              icon={<HelpCircle size={28} color={colors.primary} />}
              title="No Support Tickets"
              description="Customer inquiries and SLA issue tickets will appear in this centralized queue."
              actionTitle="Create Ticket"
              onAction={() => setTicketModal(true)}
            />
          ) : (
            tickets.map((t) => (
              <Card key={t.id} style={styles.ticketCard} padding="base">
                <View style={styles.ticketLeft}>
                  <View style={styles.ticketIcon}>
                    <MessageSquare size={18} color={colors.primary} />
                  </View>
                  <View>
                    <View style={styles.ticketTitleRow}>
                      <Text style={styles.ticketNum}>#{t.ticket_number}</Text>
                      <Text style={styles.ticketSubject}>{t.subject}</Text>
                    </View>
                    <Text style={styles.ticketSub}>
                      From: {t.customer_name} ({t.customer_email}) • {new Date(t.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.ticketRight}>
                  <Badge
                    label={t.status}
                    variant={t.status === 'resolved' ? 'success' : 'warning'}
                    size="sm"
                  />
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      )}

      {/* Forms Tab */}
      {activeTab === 'forms' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {forms.length === 0 ? (
            <EmptyState
              icon={<FileCheck2 size={28} color={colors.primary} />}
              title="No Dynamic Forms Built"
              description="Build customized lead capture, survey, and onboarding forms with zero coding."
              actionTitle="Build Dynamic Form"
              onAction={() => setFormModal(true)}
            />
          ) : (
            forms.map((f) => (
              <Card key={f.id} style={styles.ticketCard} padding="base">
                <View>
                  <Text style={styles.ticketSubject}>{f.title}</Text>
                  <Text style={styles.ticketSub}>
                    Slug: /{f.slug} • {f.submissions_count || 0} submissions
                  </Text>
                </View>
                <Badge
                  label={f.is_published ? 'Published' : 'Draft'}
                  variant={f.is_published ? 'success' : 'neutral'}
                  size="sm"
                />
              </Card>
            ))
          )}
        </ScrollView>
      )}

      {/* Create Ticket Modal */}
      <Modal
        visible={ticketModal}
        onClose={() => setTicketModal(false)}
        title="Open Support Ticket"
        subtitle="Log an incoming customer inquiry or platform issue."
      >
        <Input
          label="Subject *"
          placeholder="Enter Ticket Subject"
          value={ticketSubject}
          onChangeText={setTicketSubject}
        />
        <Input
          label="Customer Name"
          placeholder="First Name & Last Name"
          value={customerName}
          onChangeText={setCustomerName}
        />
        <Input
          label="Customer Email *"
          placeholder="Enter Customer Email"
          value={customerEmail}
          onChangeText={setCustomerEmail}
          keyboardType="email-address"
        />
        <Input
          label="Issue Description"
          placeholder="Enter Detailed Description of Issue or Inquiry..."
          value={ticketDesc}
          onChangeText={setTicketDesc}
          multiline
          numberOfLines={3}
          inputStyle={{ height: 70, textAlignVertical: 'top' }}
        />
        <Button
          title={savingTicket ? 'Opening...' : 'Create Ticket'}
          onPress={handleCreateTicket}
          loading={savingTicket}
          variant="primary"
          size="lg"
        />
      </Modal>

      {/* Create Form Modal */}
      <Modal
        visible={formModal}
        onClose={() => setFormModal(false)}
        title="Build Dynamic Web Form"
        subtitle="Generates public submission endpoint and schema."
      >
        <Input
          label="Form Title *"
          placeholder="Enter Web Form Title"
          value={formTitle}
          onChangeText={setFormTitle}
        />
        <Input
          label="Custom URL Slug (optional)"
          placeholder="Enter Custom URL Slug (e.g. client-onboarding)"
          value={formSlug}
          onChangeText={setFormSlug}
        />
        <Button
          title={savingForm ? 'Publishing...' : 'Publish Form'}
          onPress={handleCreateForm}
          loading={savingForm}
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
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  ticketCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  ticketLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ticketIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  ticketNum: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  ticketSubject: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  ticketSub: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
  ticketRight: {
    alignItems: 'flex-end',
  },
});
