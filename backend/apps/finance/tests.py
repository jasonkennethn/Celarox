from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.authentication.models import User
from apps.workspaces.models import Workspace, WorkspaceMembership
from apps.finance.models import Invoice, InvoiceItem, Expense
from apps.finance.pdf_generator import generate_invoice_pdf


class FinanceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='finance_user@celarox.com', password='Password123!')
        self.workspace = Workspace.objects.create(name='Finance Workspace', owner=self.user)
        self.membership = WorkspaceMembership.objects.create(
            workspace=self.workspace,
            user=self.user,
            role='owner'
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.client.credentials(HTTP_X_WORKSPACE_ID=str(self.workspace.id))

    def test_invoice_creation_calculations_and_payment(self):
        invoice_payload = {
            'invoice_number': 'INV-2026-001',
            'client_name': 'Globex Corp',
            'client_email': 'billing@globex.com',
            'issue_date': '2026-09-16',
            'due_date': '2026-10-16',
            'tax_rate': '10.00',
            'discount_rate': '5.00',
            'items': [
                {'description': 'Platform Subscription', 'quantity': 1, 'unit_price': '1000.00'},
                {'description': 'Implementation Consulting', 'quantity': 10, 'unit_price': '150.00'}
            ]
        }
        res = self.client.post('/api/finance/invoices/', invoice_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        invoice_id = res.data['id']
        invoice = Invoice.objects.get(id=invoice_id)
        # Subtotal: 1000 + 1500 = 2500
        self.assertEqual(invoice.subtotal, Decimal('2500.00'))
        # Discount 5%: 125.00 => after discount: 2375.00
        self.assertEqual(invoice.discount_amount, Decimal('125.00'))
        # Tax 10%: 237.50 => total: 2612.50
        self.assertEqual(invoice.tax_amount, Decimal('237.50'))
        self.assertEqual(invoice.total_amount, Decimal('2612.50'))

        # Test PDF generation
        pdf_buffer = generate_invoice_pdf(invoice)
        self.assertGreater(pdf_buffer.getbuffer().nbytes, 1000)

        # Record payment
        pay_res = self.client.post(f'/api/finance/invoices/{invoice_id}/record_payment/', {
            'amount': '2612.50',
            'payment_method': 'bank_transfer',
            'reference_number': 'TX-998822'
        }, format='json')
        self.assertEqual(pay_res.status_code, status.HTTP_200_OK)
        invoice.refresh_from_db()
        self.assertEqual(invoice.status, 'paid')
        self.assertEqual(invoice.amount_paid, Decimal('2612.50'))
