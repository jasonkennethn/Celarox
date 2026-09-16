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
  Linking,
} from 'react-native';
import {
  Receipt,
  DollarSign,
  Plus,
  Search,
  Download,
  Send,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingDown,
} from 'lucide-react-native';
import { colors, radii, spacing, typography } from '../../theme';
import { Card, Button, Badge, Modal, Input, EmptyState } from '../../components/common';
import { api } from '../../api/endpoints';
import { Invoice, ClientBillingProfile, Expense, InvoiceStatus } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useCurrency } from '../../context/CurrencyContext';

export const FinanceScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const toast = useToast();
  const { formatAmount, currentCurrency } = useCurrency();

  const [activeTab, setActiveTab] = useState<'invoices' | 'expenses' | 'clients'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<ClientBillingProfile[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Invoice Modal
  const [createInvoiceModal, setCreateInvoiceModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [dueDate, setDueDate] = useState('2026-10-15');
  const [taxRate, setTaxRate] = useState('0');
  const [discountRate, setDiscountRate] = useState('0');
  const [items, setItems] = useState<Array<{ description: string; quantity: number; unit_price: number }>>([
    { description: 'Enterprise Platform License - Q3', quantity: 1, unit_price: 15000 },
  ]);
  const [savingInvoice, setSavingInvoice] = useState(false);

  // Expense Modal
  const [createExpenseModal, setCreateExpenseModal] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('software');
  const [savingExpense, setSavingExpense] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, clientRes, expRes] = await Promise.all([
        api.finance.listInvoices(),
        api.finance.listProfiles(),
        api.finance.listExpenses(),
      ]);
      setInvoices(invRes.data);
      setClients(clientRes.data);
      setExpenses(expRes.data);
    } catch (e) {
      console.warn('Finance data load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addItemRow = () => {
    setItems((prev) => [...prev, { description: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItemRow = (idx: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const updateItemRow = (idx: number, field: string, val: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, it) => acc + (it.quantity * it.unit_price), 0);
  };

  const subtotal = calculateSubtotal();
  const taxAmount = (subtotal * (parseFloat(taxRate) || 0)) / 100;
  const discountAmount = (subtotal * (parseFloat(discountRate) || 0)) / 100;
  const calculatedTotal = subtotal - discountAmount + taxAmount;

  const handleCreateInvoice = async () => {
    if (!clientName.trim() || !clientEmail.trim()) {
      toast.error('Client Required', 'Please provide client name and billing email.');
      return;
    }

    try {
      setSavingInvoice(true);
      const payload: any = {
        client_name: clientName.trim(),
        client_email: clientEmail.trim(),
        due_date: dueDate,
        tax_rate: parseFloat(taxRate) || 0,
        discount_rate: parseFloat(discountRate) || 0,
        currency: 'USD',
        items: items.map((it) => ({
          description: it.description || 'Standard Service Item',
          quantity: it.quantity,
          unit_price: it.unit_price,
        })),
      };

      const res = await api.finance.createInvoice(payload);
      setInvoices((prev) => [res.data, ...prev]);
      toast.success('Invoice Generated', `Created invoice #${res.data.invoice_number}`);
      setCreateInvoiceModal(false);
    } catch (err: any) {
      toast.error('Invoice Creation Failed', err.response?.data?.error || 'Server error.');
    } finally {
      setSavingInvoice(false);
    }
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      toast.info('Sending Invoice', `Dispatching to ${invoice.client_email} via Brevo...`);
      await api.finance.sendInvoiceEmail(invoice.id);
      toast.success('Invoice Sent', `Electronic invoice and PDF emailed to ${invoice.client_email}`);
      loadData();
    } catch (err: any) {
      toast.error('Failed to send invoice', err.response?.data?.error || 'Email error.');
    }
  };

  const handleDownloadPdf = (invoice: Invoice) => {
    const pdfUrl = api.finance.getPdfUrl(invoice.id);
    Linking.openURL(pdfUrl).catch(() => {
      toast.error('PDF Error', 'Unable to open PDF link.');
    });
  };

  const handleCreateExpense = async () => {
    if (!expenseTitle.trim() || !expenseAmount.trim()) {
      toast.error('Required Fields', 'Please enter an expense title and amount.');
      return;
    }

    try {
      setSavingExpense(true);
      const res = await api.finance.createExpense({
        title: expenseTitle.trim(),
        amount: parseFloat(expenseAmount) || 0,
        category: expenseCategory,
        currency: 'USD',
      });
      setExpenses((prev) => [res.data, ...prev]);
      toast.success('Expense Recorded', `Saved ${expenseTitle}`);
      setCreateExpenseModal(false);
      setExpenseTitle('');
      setExpenseAmount('');
    } catch (err: any) {
      toast.error('Expense Error', err.response?.data?.error || 'Server error.');
    } finally {
      setSavingExpense(false);
    }
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return <Badge label="Paid" variant="success" size="sm" />;
      case 'sent':
        return <Badge label="Sent" variant="info" size="sm" />;
      case 'overdue':
        return <Badge label="Overdue" variant="danger" size="sm" />;
      case 'partially_paid':
        return <Badge label="Partial" variant="warning" size="sm" />;
      default:
        return <Badge label="Draft" variant="neutral" size="sm" />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <View style={styles.tabPills}>
          <TouchableOpacity
            onPress={() => setActiveTab('invoices')}
            style={[styles.tabPill, activeTab === 'invoices' && styles.tabPillActive]}
          >
            <Text style={[styles.tabPillText, activeTab === 'invoices' && styles.tabPillTextActive]}>
              Invoices ({invoices.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('expenses')}
            style={[styles.tabPill, activeTab === 'expenses' && styles.tabPillActive]}
          >
            <Text style={[styles.tabPillText, activeTab === 'expenses' && styles.tabPillTextActive]}>
              Expenses ({expenses.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('clients')}
            style={[styles.tabPill, activeTab === 'clients' && styles.tabPillActive]}
          >
            <Text style={[styles.tabPillText, activeTab === 'clients' && styles.tabPillTextActive]}>
              Billing Profiles ({clients.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <Button
            title="Log Expense"
            onPress={() => setCreateExpenseModal(true)}
            size="sm"
            variant="secondary"
            icon={<TrendingDown size={14} color={colors.danger} />}
          />
          <Button
            title="Create Invoice"
            onPress={() => setCreateInvoiceModal(true)}
            size="sm"
            variant="primary"
            icon={<Plus size={14} color="#FFFFFF" />}
          />
        </View>
      </View>

      {/* Invoice List View */}
      {activeTab === 'invoices' && (
        <ScrollView
          style={styles.contentScroll}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {invoices.length === 0 ? (
            <EmptyState
              icon={<Receipt size={28} color={colors.primary} />}
              title="No Invoices Created Yet"
              description="Create pixel-perfect Apple-grade PDF invoices, email clients automatically via Brevo, and track payments."
              actionTitle="Create First Invoice"
              onAction={() => setCreateInvoiceModal(true)}
            />
          ) : (
            invoices.map((inv) => (
              <Card key={inv.id} style={styles.invoiceCard} padding="base">
                <View style={styles.invoiceCardLeft}>
                  <View style={styles.invoiceIconBox}>
                    <Receipt size={20} color={colors.primary} />
                  </View>
                  <View>
                    <View style={styles.invoiceTitleRow}>
                      <Text style={styles.invoiceNumber}>{inv.invoice_number}</Text>
                      {getStatusBadge(inv.status)}
                    </View>
                    <Text style={styles.invoiceClient}>{inv.client_name} ({inv.client_email})</Text>
                    <Text style={styles.invoiceDates}>
                      Issued: {inv.issue_date} • Due: {inv.due_date}
                    </Text>
                  </View>
                </View>

                <View style={styles.invoiceCardRight}>
                  <Text style={styles.invoiceTotal}>
                    {formatAmount(inv.total_amount)}
                  </Text>
                  <View style={styles.invoiceActionBtns}>
                    <TouchableOpacity
                      onPress={() => handleDownloadPdf(inv)}
                      style={styles.iconBtn}
                      activeOpacity={0.7}
                    >
                      <Download size={15} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleSendInvoice(inv)}
                      style={[styles.iconBtn, styles.sendBtn]}
                      activeOpacity={0.7}
                    >
                      <Send size={15} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
          {expenses.length === 0 ? (
            <EmptyState
              icon={<DollarSign size={28} color={colors.danger} />}
              title="No Expenses Logged"
              description="Record recurring software licenses, vendor contracts, and payroll costs."
              actionTitle="Record Expense"
              onAction={() => setCreateExpenseModal(true)}
            />
          ) : (
            expenses.map((exp) => (
              <Card key={exp.id} style={styles.invoiceCard} padding="base">
                <View>
                  <Text style={styles.invoiceNumber}>{exp.title}</Text>
                  <Text style={styles.invoiceClient}>Category: {exp.category} • Date: {exp.date}</Text>
                </View>
                <Text style={[styles.invoiceTotal, { color: colors.danger }]}>
                  -{formatAmount(exp.amount)}
                </Text>
              </Card>
            ))
          )}
        </ScrollView>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
          {clients.length === 0 ? (
            <EmptyState
              icon={<FileText size={28} color={colors.primary} />}
              title="No Client Billing Profiles"
              description="Save company tax IDs, billing addresses, and payment currencies."
              actionTitle="Add Profile"
              onAction={() => toast.info('Billing Profiles', 'Auto-created upon invoice generation.')}
            />
          ) : (
            clients.map((cp) => (
              <Card key={cp.id} style={styles.invoiceCard} padding="base">
                <View>
                  <Text style={styles.invoiceNumber}>{cp.company_name}</Text>
                  <Text style={styles.invoiceClient}>{cp.email} • {cp.city}, {cp.country}</Text>
                </View>
                <Badge label={cp.currency} variant="info" size="sm" />
              </Card>
            ))
          )}
        </ScrollView>
      )}

      {/* Create Invoice Modal */}
      <Modal
        visible={createInvoiceModal}
        onClose={() => setCreateInvoiceModal(false)}
        title="Create Professional Invoice"
        subtitle="Generate itemized Apple-grade PDF invoice."
        maxWidth={680}
      >
        <View style={styles.modalGrid}>
          <View style={styles.inputCol}>
            <Input
              label="Client Company Name *"
              placeholder="Vertex Autonomous Corp"
              value={clientName}
              onChangeText={setClientName}
            />
          </View>
          <View style={styles.inputCol}>
            <Input
              label="Billing Email Address *"
              placeholder="billing@vertex.com"
              value={clientEmail}
              onChangeText={setClientEmail}
              keyboardType="email-address"
            />
          </View>
        </View>

        <Input
          label="Payment Due Date (YYYY-MM-DD)"
          placeholder="2026-10-15"
          value={dueDate}
          onChangeText={setDueDate}
        />

        {/* Line Items Builder */}
        <Text style={styles.lineItemHeading}>ITEMIZED DELIVERABLES</Text>
        {items.map((it, idx) => (
          <View key={idx} style={styles.lineItemRow}>
            <View style={{ flex: 3, marginRight: spacing.sm }}>
              <Input
                placeholder="Description"
                value={it.description}
                onChangeText={(val) => updateItemRow(idx, 'description', val)}
              />
            </View>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Input
                placeholder="Qty"
                value={String(it.quantity)}
                keyboardType="numeric"
                onChangeText={(val) => updateItemRow(idx, 'quantity', parseFloat(val) || 1)}
              />
            </View>
            <View style={{ flex: 1.5, marginRight: spacing.sm }}>
              <Input
                placeholder="Unit Price"
                value={String(it.unit_price)}
                keyboardType="numeric"
                onChangeText={(val) => updateItemRow(idx, 'unit_price', parseFloat(val) || 0)}
              />
            </View>
            <TouchableOpacity onPress={() => removeItemRow(idx)} style={styles.deleteRowBtn}>
              <Trash2 size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ))}

        <Button
          title="+ Add Line Item"
          onPress={addItemRow}
          variant="secondary"
          size="sm"
          style={{ marginBottom: spacing.lg }}
        />

        {/* Totals Summary */}
        <View style={styles.totalsBox}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal:</Text>
            <Text style={styles.totalsVal}>{formatAmount(subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Total Due:</Text>
            <Text style={[styles.totalsVal, { color: colors.success, fontWeight: '700' }]}>
              {formatAmount(calculatedTotal)}
            </Text>
          </View>
        </View>

        <Button
          title={savingInvoice ? 'Generating Invoice...' : 'Generate & Save Invoice'}
          onPress={handleCreateInvoice}
          loading={savingInvoice}
          variant="primary"
          size="lg"
        />
      </Modal>

      {/* Expense Modal */}
      <Modal
        visible={createExpenseModal}
        onClose={() => setCreateExpenseModal(false)}
        title="Record Business Expense"
        subtitle="Track organization expenditures and vendor invoices."
      >
        <Input
          label="Expense Title *"
          placeholder="e.g. AWS Cloud Cluster & SRE Subscriptions"
          value={expenseTitle}
          onChangeText={setExpenseTitle}
        />
        <Input
          label="Amount ($ USD) *"
          placeholder="2400"
          value={expenseAmount}
          onChangeText={setExpenseAmount}
          keyboardType="numeric"
        />
        <Button
          title={savingExpense ? 'Recording...' : 'Save Expense'}
          onPress={handleCreateExpense}
          loading={savingExpense}
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
  contentScroll: {
    flex: 1,
    padding: spacing.xl,
  },
  invoiceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  invoiceCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  invoiceIconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  invoiceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  invoiceNumber: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  invoiceClient: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
  invoiceDates: {
    color: colors.textTertiary,
    fontSize: 10,
    fontFamily: typography.fontFamily,
    marginTop: 1,
  },
  invoiceCardRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  invoiceTotal: {
    color: colors.textPrimary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  invoiceActionBtns: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconBtn: {
    padding: 6,
    borderRadius: radii.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  sendBtn: {
    backgroundColor: colors.primaryLight,
  },
  modalGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputCol: {
    flex: 1,
  },
  lineItemHeading: {
    color: colors.textTertiary,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  lineItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  deleteRowBtn: {
    padding: spacing.xs,
    marginBottom: spacing.base,
  },
  totalsBox: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  totalsLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
  },
  totalsVal: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.semibold,
  },
});
