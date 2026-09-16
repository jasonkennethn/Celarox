from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.authentication.models import User
from apps.workspaces.models import Workspace, WorkspaceMembership
from apps.crm.models import Company, Contact, Pipeline, DealStage, Deal
from apps.crm.views import ensure_default_pipeline


class CRMTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='crm_user@celarox.com', password='Password123!')
        self.workspace = Workspace.objects.create(name='Acme Corp', owner=self.user)
        self.membership = WorkspaceMembership.objects.create(
            workspace=self.workspace,
            user=self.user,
            role='owner'
        )
        self.pipeline = ensure_default_pipeline(self.workspace.id)

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.client.credentials(HTTP_X_WORKSPACE_ID=str(self.workspace.id))

    def test_crm_pipeline_board_and_deal_flow(self):
        # Create company
        company_res = self.client.post('/api/crm/companies/', {
            'name': 'Tech Enterprises',
            'industry': 'SaaS',
            'email': 'contact@techenterprises.com'
        }, format='json')
        self.assertEqual(company_res.status_code, status.HTTP_201_CREATED)
        company_id = company_res.data['id']

        # Create contact
        contact_res = self.client.post('/api/crm/contacts/', {
            'first_name': 'Sarah',
            'last_name': 'Connor',
            'email': 'sarah@techenterprises.com',
            'company': company_id
        }, format='json')
        self.assertEqual(contact_res.status_code, status.HTTP_201_CREATED)
        contact_id = contact_res.data['id']

        # Create deal
        stage = self.pipeline.stages.first()
        deal_res = self.client.post('/api/crm/deals/', {
            'name': 'Enterprise License Deal',
            'value': '25000.00',
            'pipeline': str(self.pipeline.id),
            'stage': str(stage.id),
            'company': company_id,
            'contact': contact_id
        }, format='json')
        self.assertEqual(deal_res.status_code, status.HTTP_201_CREATED)
        deal_id = deal_res.data['id']

        # Move deal to another stage
        won_stage = self.pipeline.stages.filter(name__icontains='won').first()
        update_res = self.client.patch(f'/api/crm/deals/{deal_id}/update_stage/', {
            'stage_id': str(won_stage.id)
        }, format='json')
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        self.assertEqual(update_res.data['status'], 'won')
