import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {
  Settings,
  Building,
  Users,
  ShieldCheck,
  Key,
  Cloud,
  Mail,
  HardDrive,
  Database,
  Plus,
  Trash2,
  CheckCircle2,
  LogOut,
} from 'lucide-react-native';
import { colors, radii, spacing, typography } from '../../theme';
import { Card, Button, Badge, Modal, Input } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/endpoints';
import { WorkspaceMember } from '../../types';

export const SettingsScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const { user, currentWorkspace, logout } = useAuth();
  const toast = useToast();

  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Invite Modal
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [inviting, setInviting] = useState(false);

  const loadMembers = async () => {
    if (!currentWorkspace) return;
    try {
      setLoadingMembers(true);
      const res = await api.workspaces.listMembers(currentWorkspace.id);
      setMembers(res.data);
    } catch (e) {
      console.warn('Members error:', e);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [currentWorkspace]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !currentWorkspace) {
      toast.error('Email Required', 'Please provide a valid user email address.');
      return;
    }

    try {
      setInviting(true);
      const res = await api.workspaces.inviteMember(currentWorkspace.id, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setMembers((prev) => [res.data, ...prev]);
      toast.success('Invitation Dispatched', `Invited ${inviteEmail} as ${inviteRole}.`);
      setInviteModal(false);
      setInviteEmail('');
    } catch (err: any) {
      toast.error('Invitation Failed', err.response?.data?.error || 'Unable to invite user.');
    } finally {
      setInviting(false);
    }
  };

  const integrations = [
    {
      name: 'Brevo (Sendinblue) Transactional Mail',
      desc: 'System emails (no-reply@celarox.com) & Client Inquiries (hello@celarox.com)',
      status: 'Connected',
      icon: <Mail size={20} color={colors.primary} />,
    },
    {
      name: 'Neon DB Serverless PostgreSQL',
      desc: 'High-availability encrypted enterprise storage (Singapore AWS Cluster)',
      status: 'Active',
      icon: <Database size={20} color={colors.success} />,
    },
    {
      name: 'Cloudinary Enterprise CDN',
      desc: 'Document assets stored strictly under "Celarox Enterprise" folder',
      status: 'Active',
      icon: <Cloud size={20} color={colors.info} />,
    },
    {
      name: 'Google Workspace & OAuth 2.0',
      desc: 'Single Sign-On and Google Drive asset synchronization',
      status: 'Configured',
      icon: <HardDrive size={20} color={colors.warning} />,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Workspace Info Card */}
      <Card style={styles.sectionCard} padding="lg">
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.orgIcon}>
              <Building size={22} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.cardTitle}>{currentWorkspace?.name || 'Celarox Enterprise Workspace'}</Text>
              <Text style={styles.cardSub}>
                Domain: {currentWorkspace?.domain || 'celarox.com'} • Tier: <Text style={{ color: colors.primary, fontWeight: '700' }}>{currentWorkspace?.plan_tier?.toUpperCase() || 'ENTERPRISE'}</Text>
              </Text>
            </View>
          </View>
          <Badge label="Active Workspace" variant="success" size="sm" />
        </View>
      </Card>

      {/* Team & Members */}
      <Card style={styles.sectionCard} padding="lg">
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.cardTitle}>Team Members & Permissions</Text>
            <Text style={styles.cardSub}>Manage member roles, administrative privileges, and team access.</Text>
          </View>
          <Button
            title="Invite Member"
            onPress={() => setInviteModal(true)}
            size="sm"
            variant="primary"
            icon={<Plus size={14} color="#FFFFFF" />}
          />
        </View>

        <View style={styles.memberList}>
          {members.map((m) => (
            <View key={m.id} style={styles.memberRow}>
              <View style={styles.memberLeft}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.avatarText}>{m.user_email ? m.user_email[0].toUpperCase() : 'U'}</Text>
                </View>
                <View>
                  <Text style={styles.memberName}>{m.user_name || m.user_email}</Text>
                  <Text style={styles.memberEmail}>{m.user_email}</Text>
                </View>
              </View>
              <Badge label={m.role.toUpperCase()} variant={m.role === 'owner' ? 'primary' : 'neutral'} size="sm" />
            </View>
          ))}
        </View>
      </Card>

      {/* Production Cloud Infrastructure */}
      <Card style={styles.sectionCard} padding="lg">
        <Text style={styles.cardTitle}>Connected Production Infrastructure</Text>
        <Text style={styles.cardSub}>Active enterprise cloud services, databases, and transactional APIs.</Text>

        <View style={styles.integrationsGrid}>
          {integrations.map((item, idx) => (
            <View key={idx} style={styles.integrationItem}>
              <View style={styles.intIconBox}>{item.icon}</View>
              <View style={{ flex: 1 }}>
                <View style={styles.intTitleRow}>
                  <Text style={styles.intTitle}>{item.name}</Text>
                  <Badge label={item.status} variant="success" size="sm" />
                </View>
                <Text style={styles.intDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Account Security & Sign Out */}
      <Card style={styles.sectionCard} padding="lg">
        <Text style={styles.cardTitle}>Account & Session</Text>
        <Text style={styles.cardSub}>Authenticated as {user?.email} ({user?.full_name})</Text>

        <View style={styles.actionRow}>
          <Button
            title="Sign Out of Session"
            onPress={logout}
            variant="danger"
            size="md"
            icon={<LogOut size={16} color="#FFFFFF" />}
          />
        </View>
      </Card>

      {/* Invite Member Modal */}
      <Modal
        visible={inviteModal}
        onClose={() => setInviteModal(false)}
        title="Invite Team Member"
        subtitle="Grant access to this Celarox Enterprise workspace."
      >
        <Input
          label="Work Email *"
          placeholder="colleague@enterprise.com"
          value={inviteEmail}
          onChangeText={setInviteEmail}
          keyboardType="email-address"
        />
        <Button
          title={inviting ? 'Sending Invite...' : 'Send Invitation'}
          onPress={handleInvite}
          loading={inviting}
          variant="primary"
          size="lg"
        />
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  sectionCard: {
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  orgIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  cardSub: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  memberList: {
    gap: spacing.sm,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  memberName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  memberEmail: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
  },
  integrationsGrid: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  integrationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  intIconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  intTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  intTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  intDesc: {
    color: colors.textTertiary,
    fontSize: 11,
    fontFamily: typography.fontFamily,
  },
  actionRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
  },
});
