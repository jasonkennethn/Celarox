from rest_framework import serializers
from .models import Project, TaskBoard, TaskColumn, Task, SubTask, TaskComment, TimeLog
from apps.authentication.serializers import UserSerializer


class SubTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubTask
        fields = '__all__'
        read_only_fields = ('id', 'created_at')


class TaskCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.full_name')
    user_avatar = serializers.ReadOnlyField(source='user.avatar_url')

    class Meta:
        model = TaskComment
        fields = '__all__'
        read_only_fields = ('id', 'created_at')


class TimeLogSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.full_name')

    class Meta:
        model = TimeLog
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at')


class TaskSerializer(serializers.ModelSerializer):
    subtasks = SubTaskSerializer(many=True, read_only=True)
    assigned_to_name = serializers.ReadOnlyField(source='assigned_to.full_name')
    assigned_to_avatar = serializers.ReadOnlyField(source='assigned_to.avatar_url')
    project_name = serializers.ReadOnlyField(source='project.name')
    column_name = serializers.ReadOnlyField(source='column.name')
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'board', 'order', 'is_completed', 'completed_at', 'created_at', 'updated_at')


class TaskColumnSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)
    tasks_count = serializers.IntegerField(source='tasks.count', read_only=True)

    class Meta:
        model = TaskColumn
        fields = '__all__'
        read_only_fields = ('id',)


class TaskBoardSerializer(serializers.ModelSerializer):
    columns = TaskColumnSerializer(many=True, read_only=True)

    class Meta:
        model = TaskBoard
        fields = '__all__'
        read_only_fields = ('id', 'created_at')


class ProjectSerializer(serializers.ModelSerializer):
    lead_name = serializers.ReadOnlyField(source='lead.full_name')
    tasks_count = serializers.IntegerField(source='tasks.count', read_only=True)
    completed_tasks_count = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at')

    def get_completed_tasks_count(self, obj):
        return obj.tasks.filter(is_completed=True).count()

    def get_progress_percentage(self, obj):
        total = obj.tasks.count()
        if total == 0:
            return 0
        completed = obj.tasks.filter(is_completed=True).count()
        return int((completed / total) * 100)
