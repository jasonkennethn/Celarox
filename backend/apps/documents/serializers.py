from rest_framework import serializers
from .models import DocumentFolder, Document


class DocumentFolderSerializer(serializers.ModelSerializer):
    documents_count = serializers.IntegerField(source='documents.count', read_only=True)

    class Meta:
        model = DocumentFolder
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at')


class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.ReadOnlyField(source='uploaded_by.full_name')
    folder_name = serializers.ReadOnlyField(source='folder.name')

    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at')
