from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.authentication.models import User
from apps.workspaces.models import Workspace, WorkspaceMembership
from apps.forms_support.models import DynamicForm, FormSubmission


class FormsAndSupportTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='form_admin@celarox.com', password='Password123!')
        self.workspace = Workspace.objects.create(name='Marketing Workspace', owner=self.user)
        self.membership = WorkspaceMembership.objects.create(
            workspace=self.workspace,
            user=self.user,
            role='owner'
        )

        self.client = APIClient()

    def test_public_contact_inquiry(self):
        payload = {
            'name': 'Elon Musk',
            'email': 'elon@x.com',
            'company': 'X Corp',
            'subject': 'Enterprise Deployment Inquiry',
            'message': 'We need a full Celarox deployment for our operations team.',
            'phone': '+1 555-0199'
        }
        res = self.client.post('/api/forms/public/contact/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['success'])

    def test_dynamic_form_public_submission(self):
        form = DynamicForm.objects.create(
            workspace=self.workspace,
            title='Partner Registration Form',
            slug='partner-reg-2026',
            fields_schema=[
                {'name': 'partner_name', 'label': 'Partner Name', 'type': 'text', 'required': True},
                {'name': 'email', 'label': 'Business Email', 'type': 'email', 'required': True}
            ]
        )

        submit_payload = {
            'email': 'partner@partnerdomain.com',
            'name': 'Acme Partner',
            'data': {
                'partner_name': 'Acme Partner',
                'email': 'partner@partnerdomain.com',
                'tier': 'Gold'
            }
        }
        res = self.client.post(f'/api/forms/public/forms/{form.slug}/', submit_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FormSubmission.objects.filter(form=form).count(), 1)
