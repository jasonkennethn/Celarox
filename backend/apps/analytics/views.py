from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.crm.views import get_user_workspace_id
from apps.crm.models import Deal, CRMActivity, Contact, Company
from apps.projects.models import Project, Task
from apps.finance.models import Invoice, Expense
from apps.documents.models import Document
from apps.hr.models import EmployeeProfile, LeaveRequest
from apps.workspaces.models import WorkspaceMembership


class DashboardOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ws_id = get_user_workspace_id(request)
        if not ws_id:
            return Response({'error': 'No active workspace.'}, status=400)

        # 1. CRM Metrics
        deals = Deal.objects.filter(workspace_id=ws_id)
        open_deals = deals.filter(status='open')
        won_deals = deals.filter(status='won')
        pipeline_value = sum(d.value for d in open_deals)
        won_value = sum(d.value for d in won_deals)
        total_contacts = Contact.objects.filter(workspace_id=ws_id).count()
        total_companies = Company.objects.filter(workspace_id=ws_id).count()

        # 2. Finance Metrics
        invoices = Invoice.objects.filter(workspace_id=ws_id)
        total_invoiced = sum(i.total_amount for i in invoices)
        total_received = sum(i.amount_paid for i in invoices)
        outstanding = sum((i.total_amount - i.amount_paid) for i in invoices if i.status != 'paid')
        expenses = Expense.objects.filter(workspace_id=ws_id)
        total_expenses = sum(e.amount for e in expenses)
        net_income = total_received - total_expenses

        # 3. Project & Task Metrics
        projects = Project.objects.filter(workspace_id=ws_id)
        active_projects_count = projects.filter(status='active').count()
        tasks = Task.objects.filter(workspace_id=ws_id)
        total_tasks = tasks.count()
        completed_tasks = tasks.filter(is_completed=True).count()
        task_velocity = int((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 100

        # 4. HR & Team Metrics
        members_count = WorkspaceMembership.objects.filter(workspace_id=ws_id, is_active=True).count()
        pending_leaves = LeaveRequest.objects.filter(workspace_id=ws_id, status='pending').count()

        # 5. Documents
        docs_count = Document.objects.filter(workspace_id=ws_id).count()
        storage_bytes = sum(d.file_size for d in Document.objects.filter(workspace_id=ws_id))

        # 6. Business Health Score (0 - 100)
        # Factor A: Cash flow health (up to 40 pts)
        cash_score = 35 if net_income >= 0 else 15
        # Factor B: Project Velocity (up to 30 pts)
        proj_score = int(task_velocity * 0.3)
        # Factor C: Growth Pipeline (up to 30 pts)
        growth_score = 30 if pipeline_value > 0 or won_value > 0 else 20
        health_score = min(100, cash_score + proj_score + growth_score)

        # 7. Recent Activities
        recent_activities = CRMActivity.objects.filter(workspace_id=ws_id).select_related('performed_by')[:10]
        activity_stream = [
            {
                'id': str(a.id),
                'title': a.title,
                'type': a.activity_type,
                'performed_by': a.performed_by.full_name if a.performed_by else 'System',
                'created_at': a.created_at
            }
            for a in recent_activities
        ]

        # 8. Monthly Revenue Chart (Mocked last 6 months trend with real totals)
        now = timezone.now()
        months_data = []
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        for i in range(5, -1, -1):
            target_date = now - timedelta(days=i * 30)
            m_name = month_names[target_date.month - 1]
            base_val = float(total_received) if i == 0 else max(1200.0, float(total_received) * (1 - (i * 0.12)))
            months_data.append({
                'month': m_name,
                'revenue': round(base_val, 2),
                'expenses': round(base_val * 0.45, 2)
            })

        return Response({
            'kpis': {
                'pipeline_value': pipeline_value,
                'won_value': won_value,
                'total_invoiced': total_invoiced,
                'total_received': total_received,
                'outstanding': outstanding,
                'total_expenses': total_expenses,
                'net_income': net_income,
                'active_projects': active_projects_count,
                'task_completion_rate': task_velocity,
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'team_members': members_count,
                'pending_leaves': pending_leaves,
                'documents_count': docs_count,
                'storage_bytes': storage_bytes,
                'total_contacts': total_contacts,
                'total_companies': total_companies,
                'health_score': health_score
            },
            'revenue_chart': months_data,
            'recent_activities': activity_stream
        })
