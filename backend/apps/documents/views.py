from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import DocumentFolder, Document
from .serializers import DocumentFolderSerializer, DocumentSerializer
from apps.crm.views import get_user_workspace_id
from apps.integrations.cloudinary_service import upload_file_to_cloudinary, delete_file_from_cloudinary


class DocumentFolderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DocumentFolderSerializer

    def get_queryset(self):
        ws_id = get_user_workspace_id(self.request)
        if not ws_id:
            return DocumentFolder.objects.none()
        return DocumentFolder.objects.filter(workspace_id=ws_id)

    def perform_create(self, serializer):
        ws_id = get_user_workspace_id(self.request)
        serializer.save(workspace_id=ws_id)


class DocumentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DocumentSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        ws_id = get_user_workspace_id(self.request)
        if not ws_id:
            return Document.objects.none()
        folder_id = self.request.query_params.get('folder_id')
        storage = self.request.query_params.get('storage_provider')
        starred = self.request.query_params.get('starred')

        qs = Document.objects.filter(workspace_id=ws_id).select_related('folder', 'uploaded_by')
        if folder_id:
            qs = qs.filter(folder_id=folder_id)
        if storage:
            qs = qs.filter(storage_provider=storage)
        if starred in ('true', '1'):
            qs = qs.filter(is_starred=True)
        return qs

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload(self, request):
        ws_id = get_user_workspace_id(request)
        if not ws_id:
            return Response({'error': 'No active workspace.'}, status=status.HTTP_400_BAD_REQUEST)

        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'File is required.'}, status=status.HTTP_400_BAD_REQUEST)

        title = request.data.get('title') or file_obj.name
        folder_id = request.data.get('folder_id')
        file_type = request.data.get('file_type', 'other')

        # Detect file type if not specified
        ext = file_obj.name.split('.')[-1].lower() if '.' in file_obj.name else ''
        if ext in ('jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'):
            file_type = 'image'
        elif ext == 'pdf':
            file_type = 'pdf'
        elif ext in ('doc', 'docx', 'txt', 'rtf'):
            file_type = 'doc'
        elif ext in ('xls', 'xlsx', 'csv'):
            file_type = 'spreadsheet'

        # Upload to Cloudinary under folder "Celarox Enterprise"
        upload_result = upload_file_to_cloudinary(
            file_obj=file_obj,
            subfolder="documents"
        )

        if not upload_result.get('success'):
            return Response({'error': upload_result.get('error', 'Upload failed')}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        document = Document.objects.create(
            workspace_id=ws_id,
            folder_id=folder_id if folder_id else None,
            title=title,
            file_url=upload_result['url'],
            file_type=file_type,
            file_size=upload_result.get('bytes', file_obj.size),
            storage_provider='cloudinary',
            cloudinary_public_id=upload_result.get('public_id', ''),
            uploaded_by=request.user
        )

        return Response(DocumentSerializer(document).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def link_google_drive(self, request):
        ws_id = get_user_workspace_id(request)
        if not ws_id:
            return Response({'error': 'No active workspace.'}, status=status.HTTP_400_BAD_REQUEST)

        title = request.data.get('title')
        file_url = request.data.get('file_url')
        google_drive_id = request.data.get('google_drive_id', '')
        file_type = request.data.get('file_type', 'other')
        folder_id = request.data.get('folder_id')

        if not title or not file_url:
            return Response({'error': 'Title and File URL are required.'}, status=status.HTTP_400_BAD_REQUEST)

        document = Document.objects.create(
            workspace_id=ws_id,
            folder_id=folder_id if folder_id else None,
            title=title,
            file_url=file_url,
            file_type=file_type,
            storage_provider='google_drive',
            google_drive_id=google_drive_id,
            uploaded_by=request.user
        )

        return Response(DocumentSerializer(document).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def toggle_star(self, request, pk=None):
        doc = self.get_object()
        doc.is_starred = not doc.is_starred
        doc.save(update_fields=['is_starred'])
        return Response(DocumentSerializer(doc).data)
