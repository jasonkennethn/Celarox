from rest_framework import serializers
from .models import Department, EmployeeProfile, LeaveRequest, Announcement
from apps.authentication.serializers import UserSerializer


class DepartmentSerializer(serializers.ModelSerializer):
    head_name = serializers.ReadOnlyField(source='head.full_name')
    employees_count = serializers.IntegerField(source='employees.count', read_only=True)

    class Meta:
        model = Department
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at')


class EmployeeProfileSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    department_name = serializers.ReadOnlyField(source='department.name')
    full_name = serializers.ReadOnlyField(source='user.full_name')
    email = serializers.ReadOnlyField(source='user.email')
    avatar_url = serializers.ReadOnlyField(source='user.avatar_url')

    class Meta:
        model = EmployeeProfile
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at')


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.user.full_name')
    department_name = serializers.ReadOnlyField(source='employee.department.name')
    reviewed_by_name = serializers.ReadOnlyField(source='reviewed_by.full_name')

    class Meta:
        model = LeaveRequest
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'reviewed_at', 'created_at')


class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.full_name')

    class Meta:
        model = Announcement
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at')
