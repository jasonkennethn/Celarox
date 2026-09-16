import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone
from apps.workspaces.models import Workspace


class ClientBillingProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='client_billing_profiles')
    company_name = models.CharField(max_length=255)
    contact_name = models.CharField(max_length=150, blank=True, default='')
    email = models.EmailField()
    phone = models.CharField(max_length=64, blank=True, default='')
    billing_address = models.TextField(blank=True, default='')
    city = models.CharField(max_length=128, blank=True, default='')
    country = models.CharField(max_length=128, blank=True, default='')
    tax_id = models.CharField(max_length=64, blank=True, default='')
    currency = models.CharField(max_length=8, default='USD')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'celarox_client_billing_profiles'
        ordering = ['company_name']

    def __str__(self):
        return f"{self.company_name} ({self.email})"


class Invoice(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('partially_paid', 'Partially Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='invoices')
    client = models.ForeignKey(ClientBillingProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    client_name = models.CharField(max_length=255, blank=True, default='')
    client_email = models.EmailField(blank=True, default='')
    invoice_number = models.CharField(max_length=64, db_index=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='draft')
    issue_date = models.DateField(default=timezone.localdate)
    due_date = models.DateField()
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    currency = models.CharField(max_length=8, default='USD')
    notes = models.TextField(blank=True, default='Thank you for your business!')
    terms = models.TextField(blank=True, default='Payment is due within 30 days of invoice date.')
    pdf_url = models.URLField(max_length=1024, blank=True, default='')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'celarox_invoices'
        ordering = ['-issue_date', '-created_at']

    def calculate_totals(self):
        items = self.items.all()
        subtotal = sum((item.quantity * item.unit_price) for item in items)
        self.subtotal = Decimal(str(subtotal))

        discount_val = (self.subtotal * (self.discount_rate / Decimal('100.0')))
        self.discount_amount = Decimal(str(discount_val))

        after_discount = self.subtotal - self.discount_amount
        tax_val = (after_discount * (self.tax_rate / Decimal('100.0')))
        self.tax_amount = Decimal(str(tax_val))

        self.total_amount = after_discount + self.tax_amount

        if self.amount_paid >= self.total_amount and self.total_amount > 0:
            self.status = 'paid'
        elif self.amount_paid > 0 and self.amount_paid < self.total_amount:
            self.status = 'partially_paid'

        self.save()

    def __str__(self):
        return f"{self.invoice_number} - {self.client_name} ({self.total_amount} {self.currency})"


class InvoiceItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('1.00'))
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    class Meta:
        db_table = 'celarox_invoice_items'

    def save(self, *args, **kwargs):
        self.total = Decimal(str(self.quantity * self.unit_price))
        super().save(*args, **kwargs)


class PaymentTransaction(models.Model):
    PAYMENT_METHODS = (
        ('bank_transfer', 'Bank Transfer'),
        ('credit_card', 'Credit Card'),
        ('stripe', 'Stripe'),
        ('paypal', 'PayPal'),
        ('cash', 'Cash'),
        ('other', 'Other'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='payment_transactions')
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=32, choices=PAYMENT_METHODS, default='bank_transfer')
    payment_date = models.DateField(default=timezone.localdate)
    reference_number = models.CharField(max_length=128, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'celarox_payment_transactions'
        ordering = ['-payment_date']


class Expense(models.Model):
    CATEGORY_CHOICES = (
        ('software', 'Software & Tools'),
        ('payroll', 'Payroll & Contractors'),
        ('marketing', 'Marketing & Ads'),
        ('infrastructure', 'Hosting & Servers'),
        ('office', 'Office & Equipment'),
        ('travel', 'Travel & Meals'),
        ('legal', 'Legal & Professional'),
        ('other', 'Other Expenses'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES, default='software')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=8, default='USD')
    date = models.DateField(default=timezone.localdate)
    vendor = models.CharField(max_length=150, blank=True, default='')
    receipt_url = models.URLField(max_length=1024, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'celarox_expenses'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.currency} {self.amount}"
