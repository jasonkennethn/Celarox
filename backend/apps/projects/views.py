from decimal import Decimal
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Project, TaskBoard, TaskColumn, Task, SubTask, TaskComment, TimeLog
from .serializers import (
    ProjectSerializer,
    TaskBoardSerializer,
    TaskColumnSerializer,
    TaskSerializer,
    SubTaskSerializer,
    TaskCommentSerializer,
    TimeLogSerializer
)
from apps.crm.views import get_user_workspace_id


def ensure_project_board_and_columns(project):
    board, _ = TaskBoard.objects.get_or_create(
        project=project,
        is_default=True,
        defaults={'name': 'Main Board'}
    )
    if not board.columns.exists():
        default_columns = [
            ('Backlog', 0, '#64748b'),
            ('To Do', 1, '#3b82f6'),
            ('In Progress', 2, '#f59e0b'),
            ('In Review', 3, '#8b5cf6'),
            ('Done', 4, '#10b981'),
        ]
        for name, order, color in default_columns:
            TaskColumn.objects.create(
                board=board,
                name=name,
                order=order,
                color=color
            )
    return board


class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        ws_id = get_user_workspace_id(self.request)
        if not ws_id:
            return Project.objects.none()
        return Project.objects.filter(workspace_id=ws_id).prefetch_related('tasks')

    def perform_create(self, serializer):
        ws_id = get_user_workspace_id(self.request)
        project = serializer.save(workspace_id=ws_id)
        ensure_project_board_and_columns(project)

    @action(detail=True, methods=['get'])
    def board(self, request, pk=None):
        project = self.get_object()
        board = ensure_project_board_and_columns(project)
        columns = board.columns.all().prefetch_related('tasks')

        # Load all tasks for this project
        tasks = Task.objects.filter(project=project).select_related('column', 'assigned_to').prefetch_related('subtasks')
        tasks_data = TaskSerializer(tasks, many=True).data

        columns_data = TaskColumnSerializer(columns, many=True).data

        return Response({
            'project': ProjectSerializer(project).data,
            'board': TaskBoardSerializer(board).data,
            'columns': columns_data,
            'tasks': tasks_data
        })


class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        ws_id = get_user_workspace_id(self.request)
        if not ws_id:
            return Task.objects.none()
        project_id = self.request.query_params.get('project_id')
        qs = Task.objects.filter(workspace_id=ws_id).select_related('column', 'assigned_to', 'project').prefetch_related('subtasks')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def perform_create(self, serializer):
        ws_id = get_user_workspace_id(self.request)
        project = serializer.validated_data.get('project')
        board = getattr(serializer.validated_data.get('column'), 'board', None)
        if not board:
            board = ensure_project_board_and_columns(project)
        column = serializer.validated_data.get('column')
        if not column:
            column = board.columns.first()

        serializer.save(
            workspace_id=ws_id,
            board=board,
            column=column
        )

    @action(detail=True, methods=['patch'])
    def update_column(self, request, pk=None):
        task = self.get_object()
        column_id = request.data.get('column_id')
        new_order = request.data.get('order')

        if column_id:
            column = TaskColumn.objects.filter(id=column_id).first()
            if column:
                task.column = column
                if column.name.lower() == 'done':
                    task.is_completed = True
                    task.completed_at = timezone.now()
                else:
                    task.is_completed = False
                    task.completed_at = None

        if new_order is not None:
            task.order = new_order

        task.save()
        return Response(TaskSerializer(task).data)

    @action(detail=True, methods=['post'])
    def toggle_complete(self, request, pk=None):
        task = self.get_object()
        task.is_completed = not task.is_completed
        if task.is_completed:
            task.completed_at = timezone.now()
            done_col = task.board.columns.filter(name__iexact='done').first()
            if done_col:
                task.column = done_col
        else:
            task.completed_at = None
            todo_col = task.board.columns.filter(name__iexact='to do').first() or task.board.columns.first()
            if todo_col:
                task.column = todo_col
        task.save()
        return Response(TaskSerializer(task).data)

    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        task = self.get_object()
        if request.method == 'GET':
            comments = task.comments.all().select_related('user')
            return Response(TaskCommentSerializer(comments, many=True).data)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Comment content cannot be blank.'}, status=status.HTTP_400_BAD_REQUEST)

        comment = TaskComment.objects.create(
            task=task,
            user=request.user,
            content=content
        )
        return Response(TaskCommentSerializer(comment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'])
    def time_logs(self, request, pk=None):
        task = self.get_object()
        ws_id = task.workspace_id

        if request.method == 'GET':
            logs = task.time_logs.all().select_related('user')
            return Response(TimeLogSerializer(logs, many=True).data)

        hours = request.data.get('hours_spent')
        desc = request.data.get('description', '')
        log = TimeLog.objects.create(
            workspace_id=ws_id,
            task=task,
            user=request.user,
            hours_spent=Decimal(str(hours or '0')),
            description=desc
        )
        task.actual_hours += Decimal(str(hours or '0'))
        task.save(update_fields=['actual_hours'])

        return Response(TimeLogSerializer(log).data, status=status.HTTP_201_CREATED)


class SubTaskViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SubTaskSerializer
    queryset = SubTask.objects.all()

    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        subtask = self.get_object()
        subtask.is_completed = not subtask.is_completed
        subtask.save()
        return Response(SubTaskSerializer(subtask).data)
