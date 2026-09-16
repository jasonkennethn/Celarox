"""
Apple-Grade PDF Invoice Generator for Celarox Enterprise
"""

import io
from decimal import Decimal
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors


def generate_invoice_pdf(invoice) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    brand_style = ParagraphStyle(
        'BrandStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a')
    )
    subtitle_style = ParagraphStyle(
        'SubtitleStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748b')
    )
    invoice_title_style = ParagraphStyle(
        'InvoiceTitleStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        alignment=2,  # Right align
        textColor=colors.HexColor('#0f172a')
    )
    meta_style = ParagraphStyle(
        'MetaStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        alignment=2,  # Right align
        textColor=colors.HexColor('#475569')
    )
    section_title = ParagraphStyle(
        'SectionTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#0f172a')
    )
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )
    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white
    )
    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#1e293b')
    )

    story = []

    # 1. Header with Brand & Invoice Info
    ws_name = invoice.workspace.name
    header_data = [
        [
            Paragraph(f"<b>CELAROX</b><br/><font size='10' color='#64748b'>{ws_name}</font>", brand_style),
            Paragraph(f"<b>INVOICE</b><br/><font size='9' color='#64748b'>#{invoice.invoice_number}</font><br/><font size='8' color='#64748b'>Date: {invoice.issue_date}<br/>Due: {invoice.due_date}</font>", invoice_title_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[300, 240])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 16))

    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceAfter=14))

    # 2. Bill To / Status Block
    client_title = invoice.client_name or (invoice.client.company_name if invoice.client else 'Valued Client')
    client_email = invoice.client_email or (invoice.client.email if invoice.client else '')
    client_address = invoice.client.billing_address if invoice.client else ''

    bill_to_text = f"<b>Billed To:</b><br/>{client_title}<br/>{client_email}<br/>{client_address}"
    status_color = '#10b981' if invoice.status == 'paid' else '#3b82f6' if invoice.status == 'sent' else '#f59e0b'
    status_text = f"<b>Status:</b> <font color='{status_color}'><b>{invoice.status.upper()}</b></font><br/><b>Currency:</b> {invoice.currency}"

    info_data = [
        [Paragraph(bill_to_text, body_style), Paragraph(status_text, meta_style)]
    ]
    info_table = Table(info_data, colWidths=[300, 240])
    info_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 18))

    # 3. Items Table
    table_rows = [
        [
            Paragraph("<b>Description</b>", table_header_style),
            Paragraph("<b>Qty</b>", table_header_style),
            Paragraph("<b>Unit Price</b>", table_header_style),
            Paragraph("<b>Amount</b>", table_header_style),
        ]
    ]

    for item in invoice.items.all():
        table_rows.append([
            Paragraph(item.description, table_cell_style),
            Paragraph(f"{item.quantity:g}", table_cell_style),
            Paragraph(f"{invoice.currency} {item.unit_price:,.2f}", table_cell_style),
            Paragraph(f"{invoice.currency} {item.total:,.2f}", table_cell_style),
        ])

    items_table = Table(table_rows, colWidths=[280, 60, 100, 100])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white]),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 16))

    # 4. Summary & Totals Table
    summary_data = [
        ["", "Subtotal:", f"{invoice.currency} {invoice.subtotal:,.2f}"],
        ["", f"Discount ({invoice.discount_rate:g}%):", f"- {invoice.currency} {invoice.discount_amount:,.2f}"],
        ["", f"Tax ({invoice.tax_rate:g}%):", f"+ {invoice.currency} {invoice.tax_amount:,.2f}"],
        ["", "Total Due:", f"{invoice.currency} {invoice.total_amount:,.2f}"],
        ["", "Amount Paid:", f"{invoice.currency} {invoice.amount_paid:,.2f}"],
    ]
    summary_table = Table(summary_data, colWidths=[280, 140, 120])
    summary_table.setStyle(TableStyle([
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (1, 3), (2, 3), 'Helvetica-Bold'),
        ('FONTSIZE', (1, 3), (2, 3), 11),
        ('TEXTCOLOR', (1, 3), (2, 3), colors.HexColor('#0f172a')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LINEABOVE', (1, 3), (2, 3), 1, colors.HexColor('#0f172a')),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 24))

    # 5. Terms & Notes
    if invoice.notes or invoice.terms:
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceAfter=10))
        if invoice.notes:
            story.append(Paragraph(f"<b>Notes:</b> {invoice.notes}", body_style))
            story.append(Spacer(1, 4))
        if invoice.terms:
            story.append(Paragraph(f"<b>Terms:</b> {invoice.terms}", subtitle_style))

    doc.build(story)
    buffer.seek(0)
    return buffer
