import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from 'react-native';
import {
  FileText,
  UploadCloud,
  Folder,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Lock,
  Globe,
  HardDrive,
} from 'lucide-react-native';
import { colors, radii, spacing, typography } from '../../theme';
import { Card, Button, Badge, Modal, Input, EmptyState } from '../../components/common';
import { api } from '../../api/endpoints';
import { DocumentItem, DocumentFolder } from '../../types';
import { useToast } from '../../context/ToastContext';

export const DocumentsScreen: React.FC = () => {
  const toast = useToast();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Upload Modal
  const [uploadModal, setUploadModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docTags, setDocTags] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.documents.list();
      setDocuments(res.data);
    } catch (e) {
      console.warn('Docs error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUploadDoc = async () => {
    if (!docTitle.trim() || !docUrl.trim()) {
      toast.error('Required Fields', 'Please enter a document title and file URL.');
      return;
    }

    try {
      setSaving(true);
      // Create document entry
      const formData = new FormData();
      formData.append('title', docTitle.trim());
      formData.append('file_url', docUrl.trim());
      formData.append('tags', docTags.trim());

      const res = await api.documents.upload(formData);
      setDocuments((prev) => [res.data, ...prev]);
      toast.success('Document Registered', `Added ${docTitle} to storage.`);
      setUploadModal(false);
      setDocTitle('');
      setDocUrl('');
      setDocTags('');
    } catch (err: any) {
      toast.error('Upload Failed', err.response?.data?.error || 'Unable to save document.');
    } finally {
      setSaving(false);
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topNav}>
        <View style={styles.storageInfoRow}>
          <HardDrive size={18} color={colors.primary} />
          <Text style={styles.storageText}>
            Cloud Storage: <Text style={styles.storageBold}>Cloudinary ("Celarox Enterprise") & Google Drive</Text>
          </Text>
        </View>

        <Button
          title="Add Document"
          onPress={() => setUploadModal(true)}
          size="sm"
          variant="primary"
          icon={<Plus size={14} color="#FFFFFF" />}
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {filteredDocs.length === 0 ? (
          <EmptyState
            icon={<FileText size={28} color={colors.primary} />}
            title="No Documents Uploaded"
            description="Manage legal agreements, technical blueprints, and executive assets with bank-grade cloud storage."
            actionTitle="Register First Document"
            onAction={() => setUploadModal(true)}
          />
        ) : (
          filteredDocs.map((doc) => (
            <Card key={doc.id} style={styles.docCard} padding="base">
              <View style={styles.docLeft}>
                <View style={styles.docIcon}>
                  <FileText size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  <Text style={styles.docMeta}>
                    Version {doc.version} • {doc.tags || 'General'} • {new Date(doc.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => Linking.openURL(doc.file_url)}
                style={styles.openBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.openBtnText}>Open Asset</Text>
                <ExternalLink size={14} color={colors.primary} />
              </TouchableOpacity>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        visible={uploadModal}
        onClose={() => setUploadModal(false)}
        title="Add Enterprise Document"
        subtitle="Store asset in Cloudinary folder 'Celarox Enterprise' or link Google Drive file."
      >
        <Input
          label="Document Title *"
          placeholder="e.g. Master Services Agreement 2026"
          value={docTitle}
          onChangeText={setDocTitle}
        />
        <Input
          label="File or Cloudinary / Drive Asset URL *"
          placeholder="https://res.cloudinary.com/p5m9cgbu/raw/upload/..."
          value={docUrl}
          onChangeText={setDocUrl}
          autoCapitalize="none"
        />
        <Input
          label="Tags (comma separated)"
          placeholder="legal, compliance, tier-1"
          value={docTags}
          onChangeText={setDocTags}
        />
        <Button
          title={saving ? 'Saving...' : 'Register Asset'}
          onPress={handleUploadDoc}
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
  storageInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  storageText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
  },
  storageBold: {
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  docCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  docLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  docIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  docMeta: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.md,
  },
  openBtnText: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
});
