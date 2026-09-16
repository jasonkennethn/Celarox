from rest_framework import serializers
from .models import DynamicForm, FormSubmission, SupportTicket, TicketMessage


class FormSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormSubmission
        fields = '__all__'
        read_only_fields = ('id', 'created_at')


class DynamicFormSerializer(serializers.ModelSerializer):
    submissions_count = serializers.IntegerField(source='submissions.count', read_only=True)

    class Meta:
        model = DynamicForm
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'slug', 'created_at', 'updated_at')


class TicketMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketMessage
        fields = '__all__'
        read_only_fields = ('id', 'created_at')


class SupportTicketSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    assigned_to_name = serializers.ReadOnlyField(source='assigned_to.full_name')

    class Meta:
        model = SupportTicket
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'ticket_number', 'created_at', 'updated_at')
