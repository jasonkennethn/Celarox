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
  FolderKanban,
  CheckSquare,
  Plus,
  Search,
  Clock,
  User,
  Calendar,
  AlertCircle,
} from 'lucide-react-native';
import { colors, radii, spacing, typography } from '../../theme';
import { Card, Button, Badge, Modal, Input, EmptyState } from '../../components/common';
import { api } from '../../api/endpoints';
import { Project, Task, TaskStatus, TaskPriority } from '../../types';
import { useToast } from '../../context/ToastContext';

export const ProjectsScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'tasks' | 'projects'>('tasks');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Task Modal
  const [createTaskModal, setCreateTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  // Project Modal
  const [createProjectModal, setCreateProjectModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectBudget, setProjectBudget] = useState('');
  const [savingProject, setSavingProject] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projRes, tasksRes] = await Promise.all([
        api.projects.list(),
        api.projects.listTasks(),
      ]);
      setProjects(projRes.data);
      setTasks(tasksRes.data);
      if (projRes.data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projRes.data[0].id);
      }
    } catch (e) {
      console.warn('Projects fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTask = async () => {
    if (!taskTitle.trim() || !selectedProjectId) {
      toast.error('Required Fields', 'Please select a project and enter a task title.');
      return;
    }

    try {
      setSavingTask(true);
      const res = await api.projects.createTask({
        project: selectedProjectId,
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        priority: taskPriority,
        status: 'todo',
      });
      setTasks((prev) => [res.data, ...prev]);
      toast.success('Task Created', `Added task "${taskTitle}"`);
      setCreateTaskModal(false);
      setTaskTitle('');
      setTaskDescription('');
    } catch (err: any) {
      toast.error('Task Creation Error', err.response?.data?.error || 'Failed to create task.');
    } finally {
      setSavingTask(false);
    }
  };

  const handleCreateProject = async () => {
    if (!projectTitle.trim()) {
      toast.error('Title Required', 'Please enter a project title.');
      return;
    }

    try {
      setSavingProject(true);
      const res = await api.projects.create({
        title: projectTitle.trim(),
        budget: parseFloat(projectBudget) || 0,
        status: 'active',
      });
      setProjects((prev) => [res.data, ...prev]);
      setSelectedProjectId(res.data.id);
      toast.success('Project Created', `Started project "${projectTitle}"`);
      setCreateProjectModal(false);
      setProjectTitle('');
      setProjectBudget('');
    } catch (err: any) {
      toast.error('Error', err.response?.data?.error || 'Failed to create project.');
    } finally {
      setSavingProject(false);
    }
  };

  const taskColumns: Array<{ key: TaskStatus; label: string; color: string }> = [
    { key: 'todo', label: 'To Do', color: colors.textTertiary },
    { key: 'in_progress', label: 'In Progress', color: colors.primary },
    { key: 'review', label: 'In Review', color: colors.warning },
    { key: 'done', label: 'Completed', color: colors.success },
  ];

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Top Bar Navigation */}
      <View style={styles.topNav}>
        <View style={styles.tabPills}>
          <TouchableOpacity
            onPress={() => setActiveTab('tasks')}
            style={[styles.tabPill, activeTab === 'tasks' && styles.tabPillActive]}
          >
            <Text style={[styles.tabPillText, activeTab === 'tasks' && styles.tabPillTextActive]}>
              Task Kanban ({tasks.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('projects')}
            style={[styles.tabPill, activeTab === 'projects' && styles.tabPillActive]}
          >
            <Text style={[styles.tabPillText, activeTab === 'projects' && styles.tabPillTextActive]}>
              Project Portfolio ({projects.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.searchBox}>
            <Search size={14} color={colors.textTertiary} />
            <TextInput
              placeholder="Search tasks..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>
          <Button
            title="New Project"
            onPress={() => setCreateProjectModal(true)}
            size="sm"
            variant="secondary"
          />
          <Button
            title="New Task"
            onPress={() => setCreateTaskModal(true)}
            size="sm"
            variant="primary"
            icon={<Plus size={14} color="#FFFFFF" />}
          />
        </View>
      </View>

      {/* Task Kanban View */}
      {activeTab === 'tasks' && (
        <ScrollView
          horizontal={isDesktop}
          style={styles.kanbanScroll}
          contentContainerStyle={styles.kanbanContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary} />}
        >
          {taskColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);

            return (
              <View key={col.key} style={[styles.column, { width: isDesktop ? 300 : '100%' }]}>
                <View style={styles.columnHeader}>
                  <View style={styles.columnTitleRow}>
                    <View style={[styles.colDot, { backgroundColor: col.color }]} />
                    <Text style={styles.columnTitle}>{col.label}</Text>
                    <Badge label={String(colTasks.length)} variant="neutral" size="sm" />
                  </View>
                </View>

                <View style={styles.tasksContainer}>
                  {colTasks.length === 0 ? (
                    <View style={styles.emptyCol}>
                      <Text style={styles.emptyColText}>No tasks in this lane</Text>
                    </View>
                  ) : (
                    colTasks.map((t) => (
                      <Card key={t.id} style={styles.taskCard} padding="md">
                        <View style={styles.taskCardHeader}>
                          <Text style={styles.taskProjectTag}>{t.project_title || 'General'}</Text>
                          <Badge
                            label={t.priority}
                            variant={
                              t.priority === 'urgent'
                                ? 'danger'
                                : t.priority === 'high'
                                ? 'warning'
                                : 'info'
                            }
                            size="sm"
                          />
                        </View>
                        <Text style={styles.taskTitle}>{t.title}</Text>
                        {t.description ? (
                          <Text style={styles.taskDesc} numberOfLines={2}>
                            {t.description}
                          </Text>
                        ) : null}
                      </Card>
                    ))
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Projects Portfolio View */}
      {activeTab === 'projects' && (
        <ScrollView style={styles.projectsList} showsVerticalScrollIndicator={false}>
          {projects.length === 0 ? (
            <EmptyState
              icon={<FolderKanban size={28} color={colors.primary} />}
              title="No Projects Created"
              description="Start a new enterprise project to manage deliverables, budgets, and team capacity."
              actionTitle="Create First Project"
              onAction={() => setCreateProjectModal(true)}
            />
          ) : (
            projects.map((proj) => (
              <Card key={proj.id} style={styles.projectCard} padding="lg">
                <View style={styles.projectCardTop}>
                  <View>
                    <Text style={styles.projectTitle}>{proj.title}</Text>
                    <Text style={styles.projectBudget}>
                      Budget: ${Number(proj.budget).toLocaleString()} {proj.currency}
                    </Text>
                  </View>
                  <Badge label={proj.status} variant="success" />
                </View>

                <View style={styles.progressBarWrapper}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${proj.progress_percentage || 25}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {proj.completed_tasks_count || 0} of {proj.tasks_count || 0} tasks completed ({proj.progress_percentage || 0}%)
                </Text>
              </Card>
            ))
          )}
        </ScrollView>
      )}

      {/* Create Task Modal */}
      <Modal
        visible={createTaskModal}
        onClose={() => setCreateTaskModal(false)}
        title="Create Operational Task"
        subtitle="Assign deliverables to sprint backlogs."
      >
        <Input
          label="Task Title *"
          placeholder="e.g. Audit Neon DB SSL Pool Configuration"
          value={taskTitle}
          onChangeText={setTaskTitle}
        />
        <Input
          label="Task Description"
          placeholder="Include technical specs, test criteria, and dependencies..."
          value={taskDescription}
          onChangeText={setTaskDescription}
          multiline
          numberOfLines={3}
          inputStyle={{ height: 70, textAlignVertical: 'top' }}
        />

        <Button
          title={savingTask ? 'Creating...' : 'Create Task'}
          onPress={handleCreateTask}
          loading={savingTask}
          variant="primary"
          size="lg"
        />
      </Modal>

      {/* Create Project Modal */}
      <Modal
        visible={createProjectModal}
        onClose={() => setCreateProjectModal(false)}
        title="New Enterprise Project"
        subtitle="Initialize project workspace."
      >
        <Input
          label="Project Title *"
          placeholder="e.g. Platform Scalability & SRE 2026"
          value={projectTitle}
          onChangeText={setProjectTitle}
        />
        <Input
          label="Total Budget ($ USD)"
          placeholder="75000"
          value={projectBudget}
          onChangeText={setProjectBudget}
          keyboardType="numeric"
        />
        <Button
          title={savingProject ? 'Saving...' : 'Create Project'}
          onPress={handleCreateProject}
          loading={savingProject}
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
  kanbanScroll: {
    flex: 1,
  },
  kanbanContent: {
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
  colDot: {
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
  tasksContainer: {
    gap: spacing.sm,
  },
  taskCard: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  taskProjectTag: {
    color: colors.textTertiary,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    letterSpacing: 0.5,
  },
  taskTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
    marginBottom: 4,
  },
  taskDesc: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: typography.fontFamily,
    lineHeight: 16,
  },
  emptyCol: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyColText: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
  },
  projectsList: {
    flex: 1,
    padding: spacing.xl,
  },
  projectCard: {
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  projectCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  projectTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  projectBudget: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
  progressBarWrapper: {
    height: 6,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: radii.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
  },
  progressText: {
    color: colors.textTertiary,
    fontSize: 11,
    fontFamily: typography.fontFamily,
  },
});
