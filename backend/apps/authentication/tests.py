from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.authentication.models import User
from apps.workspaces.models import Workspace, WorkspaceMembership


class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_registration_and_workspace_creation(self):
        payload = {
            'email': 'founder@celarox.com',
            'password': 'SecurePassword123!',
            'first_name': 'Jason',
            'last_name': 'Kenneth',
            'workspace_name': 'Celarox Global'
        }
        response = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])

        user = User.objects.get(email='founder@celarox.com')
        self.assertEqual(user.first_name, 'Jason')
        self.assertEqual(user.full_name, 'Jason Kenneth')

        workspace = Workspace.objects.filter(name='Celarox Global').first()
        self.assertIsNotNone(workspace)
        membership = WorkspaceMembership.objects.filter(workspace=workspace, user=user).first()
        self.assertEqual(membership.role, 'owner')

    def test_login_flow(self):
        User.objects.create_user(
            email='test@celarox.com',
            password='MyPassword123!',
            first_name='Test',
            last_name='User'
        )
        payload = {
            'email': 'test@celarox.com',
            'password': 'MyPassword123!'
        }
        response = self.client.post('/api/auth/login/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)

    def test_invalid_login(self):
        payload = {
            'email': 'nonexistent@celarox.com',
            'password': 'WrongPassword'
        }
        response = self.client.post('/api/auth/login/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
