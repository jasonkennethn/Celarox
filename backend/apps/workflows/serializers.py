from rest_framework import serializers
from .models import WorkflowRule, WorkflowAction, WorkflowExecutionLog


class WorkflowActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowAction
        fields = ('id', 'action_type', 'config', 'order')
        read_only_fields = ('id',)


class WorkflowExecutionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowExecutionLog
        fields = '__all__'
        read_only_fields = ('id', 'executed_at')


class WorkflowRuleSerializer(serializers.ModelSerializer):
    actions = WorkflowActionSerializer(many=True, required=False)
    executions_count = serializers.IntegerField(source='execution_logs.count', read_only=True)

    class Meta:
        model = WorkflowRule
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at')

    def create(self, validated_data):
        actions_data = validated_data.pop('actions', [])
        rule = WorkflowRule.objects.create(**validated_data)
        for act_data in actions_data:
            WorkflowAction.objects.create(rule=rule, **act_data)
        return rule

    def update(self, rule, validated_data):
        actions_data = validated_data.pop('actions', None)
        for attr, value in validated_data.items():
            setattr(rule, attr, value)
        rule.save()

        if actions_data is not None:
            rule.actions.all().delete()
            for act_data in actions_data:
                WorkflowAction.objects.create(rule=rule, **act_data)

        return rule
