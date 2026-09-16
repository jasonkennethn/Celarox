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
  Briefcase,
  Users,
  Calendar,
  Megaphone,
  Plus,
  CheckCircle2,
  XCircle,
  Building,
} from 'lucide-react-native';
import { colors, radii, spacing, typography } from '../../theme';
import { Card, Button, Badge, Modal, Input, EmptyState } from '../../components/common';
import { api } from '../../api/endpoints';
import { EmployeeProfile, Department, LeaveRequest, Announcement } from '../../types';
import { useToast } from '../../context/ToastContext';

export const HrScreen: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'employees' | 'departments' | 'leaves' | 'announcements'>('employees');
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  // Leave Modal
  const [leaveModal, setLeaveModal] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveStart, setLeaveStart] = useState('2026-10-01');
  const [leaveEnd, setLeaveEnd] = useState('2026-10-05');
  const [savingLeave, setSavingLeave] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [empRes, deptRes, leaveRes, annRes] = await Promise.all([
        api.hr.listEmployees(),
        api.hr.listDepartments(),
        api.hr.listLeaves(),
        api.hr.listAnnouncements(),
      ]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
      setLeaves(leaveRes.data);
      setAnnouncements(annRes.data);
    } catch (e) {
      console.warn('HR fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyLeave = async () => {
    try {
      setSavingLeave(true);
      if (employees.length === 0) {
        toast.error('Profile Required', 'Please set up an employee profile first.');
        return;
      }
      const res = await api.hr.applyLeave({
        employee: employees[0].id,
        leave_type: 'vacation',
        start_date: leaveStart,
        end_date: leaveEnd,
        reason: leaveReason.trim() || 'Annual Leave',
      });
      setLeaves((prev) => [res.data, ...prev]);
      toast.success('Leave Request Submitted', 'Sent to HR for approval.');
      setLeaveModal(false);
      setLeaveReason('');
    } catch (err: any) {
      toast.error('Error', err.response?.data?.error || 'Failed to submit leave.');
    } finally {
      setSavingLeave(false);
    }
  };

  const handleReviewLeave = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.hr.reviewLeave(id, { status });
      toast.success('Review Recorded', `Leave request has been marked ${status}.`);
      loadData();
    } catch (err: any) {
      toast.error('Failed to review leave', err.response?.data?.error || 'Error.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation */}
      <View style={styles.topNav}>
        <View style={styles.tabPills}>
          <TouchableOpacity
            onPress={() => setActiveTab('employees')}
            style={[styles.tabPill, activeTab === 'employees' && styles.tabPillActive]}
          >
            <Text style={[styles.tabPillText, activeTab === 'employees' && styles.tabPillTextActive]}>
              Team Directory ({employees.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('departments')}
            style={[styles.tabPill, activeTab === 'departments' && styles.tabPillActive]}
          >
            <Text style={[styles.tabPillText, activeTab === 'departments' && styles.tabPillTextActive]}>
              Departments ({departments.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('leaves')}
            style={[styles.tabPill, activeTab === 'leaves' && styles.tabPillActive]}
          >
            <Text style={[styles.tabPillText, activeTab === 'leaves' && styles.tabPillTextActive]}>
              Leave Approvals ({leaves.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('announcements')}
            style={[styles.tabPill, activeTab === 'announcements' && styles.tabPillActive]}
          >
            <Text style={[styles.tabPillText, activeTab === 'announcements' && styles.tabPillTextActive]}>
              Notices ({announcements.length})
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Apply for Leave"
          onPress={() => setLeaveModal(true)}
          size="sm"
          variant="primary"
          icon={<Calendar size={14} color="#FFFFFF" />}
        />
      </View>

      {/* Employees Directory */}
      {activeTab === 'employees' && (
        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {employees.length === 0 ? (
            <EmptyState
              icon={<Users size={28} color={colors.primary} />}
              title="No Employee Profiles"
              description="Maintain department hierarchies, job titles, and employee records in one place."
              actionTitle="Add Employee"
              onAction={() => toast.info('Add Employee', 'Add team members via Workspace Settings.')}
            />
          ) : (
            employees.map((emp) => (
              <Card key={emp.id} style={styles.hrCard} padding="base">
                <View style={styles.hrLeft}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{emp.full_name ? emp.full_name[0] : 'E'}</Text>
                  </View>
                  <View>
                    <Text style={styles.empName}>{emp.full_name || emp.email}</Text>
                    <Text style={styles.empSub}>
                      {emp.job_title} • {emp.department_name || 'Engineering'}
                    </Text>
                  </View>
                </View>
                <Badge label={emp.employment_type} variant="info" size="sm" />
              </Card>
            ))
          )}
        </ScrollView>
      )}

      {/* Departments */}
      {activeTab === 'departments' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {departments.length === 0 ? (
            <EmptyState
              icon={<Building size={28} color={colors.primary} />}
              title="No Departments Configured"
              description="Organize your workforce into functional units like Engineering, Sales, and Operations."
              actionTitle="Configure Department"
              onAction={() => toast.info('Department', 'Auto-created on employee import')}
            />
          ) : (
            departments.map((dept) => (
              <Card key={dept.id} style={styles.hrCard} padding="base">
                <View>
                  <Text style={styles.empName}>{dept.name}</Text>
                  <Text style={styles.empSub}>{dept.description || 'Enterprise Operational Department'}</Text>
                </View>
                <Badge label={`${dept.employees_count || 0} Members`} variant="primary" size="sm" />
              </Card>
            ))
          )}
        </ScrollView>
      )}

      {/* Leaves Tab */}
      {activeTab === 'leaves' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {leaves.length === 0 ? (
            <EmptyState
              icon={<Calendar size={28} color={colors.primary} />}
              title="No Pending Leave Requests"
              description="Staff leave and PTO requests will appear here for executive approval."
            />
          ) : (
            leaves.map((lv) => (
              <Card key={lv.id} style={styles.hrCard} padding="base">
                <View>
                  <Text style={styles.empName}>{lv.employee_name || 'Staff Member'} ({lv.leave_type})</Text>
                  <Text style={styles.empSub}>
                    {lv.start_date} to {lv.end_date} • {lv.reason || 'Vacation'}
                  </Text>
                </View>

                {lv.status === 'pending' ? (
                  <View style={styles.actionBtns}>
                    <TouchableOpacity
                      onPress={() => handleReviewLeave(lv.id, 'approved')}
                      style={[styles.iconActionBtn, styles.approveBtn]}
                    >
                      <CheckCircle2 size={16} color={colors.success} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleReviewLeave(lv.id, 'rejected')}
                      style={[styles.iconActionBtn, styles.rejectBtn]}
                    >
                      <XCircle size={16} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Badge
                    label={lv.status}
                    variant={lv.status === 'approved' ? 'success' : 'danger'}
                    size="sm"
                  />
                )}
              </Card>
            ))
          )}
        </ScrollView>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {announcements.length === 0 ? (
            <EmptyState
              icon={<Megaphone size={28} color={colors.primary} />}
              title="No Company Notices"
              description="Broadcast executive company announcements to all staff across the workspace."
            />
          ) : (
            announcements.map((ann) => (
              <Card key={ann.id} style={styles.annCard} padding="base">
                <View style={styles.annHeader}>
                  <Text style={styles.annTitle}>{ann.title}</Text>
                  <Badge label={ann.priority} variant={ann.priority === 'urgent' ? 'danger' : 'primary'} size="sm" />
                </View>
                <Text style={styles.annContent}>{ann.content}</Text>
                <Text style={styles.annDate}>{new Date(ann.created_at).toLocaleDateString()}</Text>
              </Card>
            ))
          )}
        </ScrollView>
      )}

      {/* Apply Leave Modal */}
      <Modal
        visible={leaveModal}
        onClose={() => setLeaveModal(false)}
        title="Submit Leave Request"
        subtitle="Request PTO or medical leave."
      >
        <Input
          label="Start Date (YYYY-MM-DD) *"
          placeholder="2026-10-01"
          value={leaveStart}
          onChangeText={setLeaveStart}
        />
        <Input
          label="End Date (YYYY-MM-DD) *"
          placeholder="2026-10-05"
          value={leaveEnd}
          onChangeText={setLeaveEnd}
        />
        <Input
          label="Reason for Leave"
          placeholder="e.g. Annual Vacation & Family Commitment"
          value={leaveReason}
          onChangeText={setLeaveReason}
        />
        <Button
          title={savingLeave ? 'Submitting...' : 'Submit Request'}
          onPress={handleApplyLeave}
          loading={savingLeave}
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
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  hrCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  hrLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  empName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  empSub: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
  actionBtns: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconActionBtn: {
    padding: 6,
    borderRadius: radii.sm,
  },
  approveBtn: {
    backgroundColor: colors.successLight,
  },
  rejectBtn: {
    backgroundColor: colors.dangerLight,
  },
  annCard: {
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  annHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  annTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  annContent: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  annDate: {
    color: colors.textTertiary,
    fontSize: 10,
    fontFamily: typography.fontFamily,
  },
});
