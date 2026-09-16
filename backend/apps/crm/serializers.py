from rest_framework import serializers
from .models import Company, Contact, Pipeline, DealStage, Deal, CRMActivity
from apps.authentication.serializers import UserSerializer


class CompanySerializer(serializers.ModelSerializer):
    deals_count = serializers.IntegerField(source='deals.count', read_only=True)

    class Meta:
        model = Company
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at')


class ContactSerializer(serializers.ModelSerializer):
    company_name = serializers.ReadOnlyField(source='company.name')
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Contact
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at')


class DealStageSerializer(serializers.ModelSerializer):
    deals_count = serializers.IntegerField(source='deals.count', read_only=True)
    total_value = serializers.SerializerMethodField()

    class Meta:
        model = DealStage
        fields = '__all__'
        read_only_fields = ('id',)

    def get_total_value(self, obj):
        deals = obj.deals.filter(status='open')
        return sum(d.value for d in deals)


class DealSerializer(serializers.ModelSerializer):
    stage_name = serializers.ReadOnlyField(source='stage.name')
    stage_color = serializers.ReadOnlyField(source='stage.color')
    company_name = serializers.ReadOnlyField(source='company.name')
    contact_name = serializers.ReadOnlyField(source='contact.full_name')
    assigned_to_name = serializers.ReadOnlyField(source='assigned_to.full_name')

    class Meta:
        model = Deal
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at')


class PipelineSerializer(serializers.ModelSerializer):
    stages = DealStageSerializer(many=True, read_only=True)

    class Meta:
        model = Pipeline
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at')


class CRMActivitySerializer(serializers.ModelSerializer):
    performed_by_name = serializers.ReadOnlyField(source='performed_by.full_name')

    class Meta:
        model = CRMActivity
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at')
