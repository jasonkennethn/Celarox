from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch


class IntegrationContactTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch('apps.integrations.views.send_contact_inquiry_to_admin')
    def test_integrations_contact_endpoint(self, mock_send):
        mock_send.return_value = {'success': True}
        payload = {
            'name': 'Sarah Connor',
            'email': 'sarah@cyberdyne.com',
            'company': 'Cyberdyne Systems',
            'subject': 'Enterprise Migration Inquiry',
            'message': 'We would like to request an enterprise deployment demo.',
            'phone': '+1 555-0199'
        }
        response = self.client.post('/api/integrations/contact/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('success'))
        mock_send.assert_called_once()

    @patch('apps.integrations.views.send_contact_inquiry_to_admin')
    def test_root_public_contact_endpoint(self, mock_send):
        mock_send.return_value = {'success': True}
        payload = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'message': 'Inquiring about Celarox Enterprise pricing tiers.'
        }
        response = self.client.post('/api/public/contact/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('success'))

    def test_contact_missing_required_fields(self):
        payload = {
            'name': 'John Doe',
            # missing email and message
        }
        response = self.client.post('/api/integrations/contact/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
