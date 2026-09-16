from decimal import Decimal
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Company, Contact, Pipeline, DealStage, Deal, CRMActivity
from .serializers import (
    CompanySerializer,
    ContactSerializer,
    PipelineSerializer,
    DealStageSerializer,
    DealSerializer,
    CRMActivitySerializer
)
from apps.workspaces.models import WorkspaceMembership


def get_user_workspace_id(request):
    ws_id = request.headers.get('x-workspace-id') or request.query_params.get('workspace_id')
    if ws_id:
        return ws_id
    membership = WorkspaceMembership.objects.filter(user=request.user, is_active=True).first()
    return membership.workspace_id if membership else None


def ensure_default_pipeline(workspace_id):
    pipeline, created = Pipeline.objects.get_or_create(
        workspace_id=workspace_id,
        is_default=True,
        defaults={'name': 'Sales Pipeline'}
    )
    if created or not pipeline.stages.exists():
        default_stages = [
            ('Lead In', 0, '#64748b', 10),
            ('Contact Made', 1, '#3b82f6', 30),
            ('Meeting Scheduled', 2, '#8b5cf6', 50),
            ('Proposal Sent', 3, '#f59e0b', 75),
            ('Closed Won', 4, '#10b981', 100),
            ('Closed Lost', 5, '#ef4444', 0),
        ]
        for name, order, color, prob in default_stages:
            DealStage.objects.create(
                pipeline=pipeline,
                name=name,
                order=order,
                color=color,
                win_probability=prob
            )
    return pipeline


class CompanyViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CompanySerializer

    def get_queryset(self):
        ws_id = get_user_workspace_id(self.request)
        if not ws_id:
            return Company.objects.none()
        return Company.objects.filter(workspace_id=ws_id)

    def perform_create(self, serializer):
        ws_id = get_user_workspace_id(self.request)
        serializer.save(workspace_id=ws_id)


class ContactViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ContactSerializer

    def get_queryset(self):
        ws_id = get_user_workspace_id(self.request)
        if not ws_id:
            return Contact.objects.none()
        return Contact.objects.filter(workspace_id=ws_id)

    def perform_create(self, serializer):
        ws_id = get_user_workspace_id(self.request)
        serializer.save(workspace_id=ws_id)


class PipelineViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PipelineSerializer

    def get_queryset(self):
        ws_id = get_user_workspace_id(self.request)
        if not ws_id:
            return Pipeline.objects.none()
        ensure_default_pipeline(ws_id)
        return Pipeline.objects.filter(workspace_id=ws_id).prefetch_related('stages', 'stages__deals')

    @action(detail=False, methods=['get'])
    def board(self, request):
        ws_id = get_user_workspace_id(request)
        if not ws_id:
            return Response({'error': 'No active workspace.'}, status=status.HTTP_400_BAD_REQUEST)
        pipeline = ensure_default_pipeline(ws_id)
        serializer = PipelineSerializer(pipeline)

        # Get all active deals in pipeline
        deals = Deal.objects.filter(workspace_id=ws_id, pipeline=pipeline).select_related('stage', 'company', 'contact', 'assigned_to')
        deals_data = DealSerializer(deals, many=True).data

        # Calculate pipeline totals
        total_open_value = sum(d.value for d in deals if d.status == 'open')
        won_deals = [d for d in deals if d.status == 'won']
        total_won_value = sum(d.value for d in won_deals)

        return Response({
            'pipeline': serializer.data,
            'deals': deals_data,
            'summary': {
                'total_deals': len(deals),
                'open_value': total_open_value,
                'won_value': total_won_value,
                'won_count': len(won_deals)
            }
        })


class DealViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DealSerializer

    def get_queryset(self):
        ws_id = get_user_workspace_id(self.request)
        if not ws_id:
            return Deal.objects.none()
        return Deal.objects.filter(workspace_id=ws_id).select_related('stage', 'company', 'contact', 'assigned_to')

    def perform_create(self, serializer):
        ws_id = get_user_workspace_id(self.request)
        pipeline_id = serializer.validated_data.get('pipeline')
        if not pipeline_id:
            pipeline = ensure_default_pipeline(ws_id)
            stage = pipeline.stages.first()
            deal = serializer.save(workspace_id=ws_id, pipeline=pipeline, stage=stage)
        else:
            deal = serializer.save(workspace_id=ws_id)

        CRMActivity.objects.create(
            workspace_id=ws_id,
            deal=deal,
            activity_type='note',
            title=f"Deal '{deal.name}' created",
            performed_by=self.request.user
        )

    @action(detail=True, methods=['patch'])
    def update_stage(self, request, pk=None):
        deal = self.get_object()
        stage_id = request.data.get('stage_id')
        new_status = request.data.get('status')

        if stage_id:
            stage = DealStage.objects.filter(id=stage_id).first()
            if stage:
                old_stage_name = deal.stage.name if deal.stage else 'None'
                deal.stage = stage
                if stage.name.lower() == 'closed won':
                    deal.status = 'won'
                elif stage.name.lower() == 'closed lost':
                    deal.status = 'lost'
                elif new_status:
                    deal.status = new_status
                deal.save()

                CRMActivity.objects.create(
                    workspace=deal.workspace,
                    deal=deal,
                    activity_type='stage_change',
                    title=f"Stage moved from {old_stage_name} to {stage.name}",
                    performed_by=request.user
                )

        if new_status and new_status in ('open', 'won', 'lost'):
            deal.status = new_status
            deal.save()

        return Response(DealSerializer(deal).data)


class CRMActivityViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CRMActivitySerializer

    def get_queryset(self):
        ws_id = get_user_workspace_id(self.request)
        if not ws_id:
            return CRMActivity.objects.none()
        deal_id = self.request.query_params.get('deal_id')
        contact_id = self.request.query_params.get('contact_id')

        qs = CRMActivity.objects.filter(workspace_id=ws_id)
        if deal_id:
            qs = qs.filter(deal_id=deal_id)
        if contact_id:
            qs = qs.filter(contact_id=contact_id)
        return qs

    def perform_create(self, serializer):
        ws_id = get_user_workspace_id(self.request)
        serializer.save(workspace_id=ws_id, performed_by=self.request.user)
