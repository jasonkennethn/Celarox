from rest_framework import serializers
from .models import ClientBillingProfile, Invoice, InvoiceItem, PaymentTransaction, Expense


class ClientBillingProfileSerializer(serializers.ModelSerializer):
    invoices_count = serializers.IntegerField(source='invoices.count', read_only=True)

    class Meta:
        model = ClientBillingProfile
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at')


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ('id', 'description', 'quantity', 'unit_price', 'total')
        read_only_fields = ('id', 'total')


class PaymentTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTransaction
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at')


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, required=False)
    payments = PaymentTransactionSerializer(many=True, read_only=True)
    client_company = serializers.ReadOnlyField(source='client.company_name')

    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = (
            'id', 'workspace', 'subtotal', 'tax_amount', 'discount_amount',
            'total_amount', 'amount_paid', 'created_at', 'updated_at'
        )

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        invoice = Invoice.objects.create(**validated_data)
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        invoice.calculate_totals()
        return invoice

    def update(self, invoice, validated_data):
        items_data = validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(invoice, attr, value)
        invoice.save()

        if items_data is not None:
            invoice.items.all().delete()
            for item_data in items_data:
                InvoiceItem.objects.create(invoice=invoice, **item_data)
            invoice.calculate_totals()

        return invoice


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at')
