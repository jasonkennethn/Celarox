// Core Auth & Identity
export type UserRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer' | 'guest';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo_url?: string;
  industry?: string;
  company_size?: string;
  plan: 'starter' | 'growth' | 'enterprise';
  plan_tier?: string;
  role?: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface WorkspaceMember {
  id: string;
  user?: User;
  user_email?: string;
  user_name?: string;
  workspace: string;
  role: UserRole;
  joined_at: string;
}

// CRM Module
export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Deal {
  id: string;
  title: string;
  workspace: string;
  stage: DealStage;
  amount: number | string;
  currency: string;
  expected_close_date?: string;
  contact?: string;
  contact_name?: string;
  account?: string;
  account_name?: string;
  probability: number;
  assigned_to?: string;
  assigned_to_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  job_title?: string;
  account?: string;
  account_name?: string;
  status: 'lead' | 'prospect' | 'customer' | 'partner' | 'churned';
  notes?: string;
  created_at: string;
}

export interface Account {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  annual_revenue?: number | string;
  employees_count?: number;
  city?: string;
  country?: string;
  created_at: string;
}

// Projects & Operations
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  start_date?: string;
  due_date?: string;
  budget: number | string;
  currency: string;
  owner?: string;
  owner_name?: string;
  tasks_count?: number;
  completed_tasks_count?: number;
  progress_percentage?: number;
  created_at: string;
}

export interface Task {
  id: string;
  project: string;
  project_title?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to?: string;
  assigned_to_name?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  order: number;
  created_at: string;
  subtasks?: SubTask[];
}

export interface SubTask {
  id: string;
  task: string;
  title: string;
  is_completed: boolean;
  order: number;
}

export interface TimeLog {
  id: string;
  task: string;
  user: string;
  user_name?: string;
  hours: number;
  date: string;
  notes?: string;
}

// Finance & Invoicing
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';

export interface ClientBillingProfile {
  id: string;
  company_name: string;
  contact_name?: string;
  email: string;
  phone?: string;
  billing_address?: string;
  city?: string;
  country?: string;
  tax_id?: string;
  currency: string;
  created_at: string;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total?: number;
}

export interface Invoice {
  id: string;
  client?: string;
  client_name: string;
  client_email: string;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  subtotal: number | string;
  tax_rate: number | string;
  tax_amount: number | string;
  discount_rate: number | string;
  discount_amount: number | string;
  total_amount: number | string;
  amount_paid: number | string;
  currency: string;
  notes?: string;
  terms?: string;
  pdf_url?: string;
  items?: InvoiceItem[];
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  invoice: string;
  amount: number | string;
  payment_method: string;
  payment_date: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number | string;
  currency: string;
  date: string;
  vendor?: string;
  receipt_url?: string;
  notes?: string;
  created_at: string;
}

// Documents & Knowledge Cloud
export interface DocumentFolder {
  id: string;
  name: string;
  parent?: string;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  folder?: string;
  folder_name?: string;
  file_url: string;
  cloudinary_public_id?: string;
  google_drive_file_id?: string;
  file_size?: number;
  mime_type?: string;
  tags?: string;
  is_public: boolean;
  version: number;
  uploaded_by?: string;
  uploaded_by_name?: string;
  created_at: string;
  updated_at: string;
}

// Workflows & Automations
export interface WorkflowRule {
  id: string;
  title: string;
  trigger_event: string;
  conditions: Record<string, any>;
  is_active: boolean;
  actions?: WorkflowAction[];
  executions_count?: number;
  created_at: string;
}

export interface WorkflowAction {
  id?: string;
  action_type: string;
  config: Record<string, any>;
  order: number;
}

export interface WorkflowExecutionLog {
  id: string;
  rule: string;
  rule_title?: string;
  status: 'success' | 'failed' | 'skipped';
  triggered_by_event: string;
  event_payload: Record<string, any>;
  actions_executed: any[];
  error_message?: string;
  executed_at: string;
}

// HR & Team
export interface Department {
  id: string;
  name: string;
  description?: string;
  head?: string;
  head_name?: string;
  employees_count?: number;
  created_at: string;
}

export interface EmployeeProfile {
  id: string;
  user: string;
  user_details?: User;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  department?: string;
  department_name?: string;
  job_title: string;
  employee_id: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern';
  hire_date: string;
  salary?: number | string;
  emergency_contact?: string;
  created_at: string;
}

export interface LeaveRequest {
  id: string;
  employee: string;
  employee_name?: string;
  department_name?: string;
  leave_type: 'vacation' | 'sick' | 'personal' | 'unpaid' | 'maternity';
  start_date: string;
  end_date: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reviewed_by?: string;
  reviewed_by_name?: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author?: string;
  author_name?: string;
  priority: 'normal' | 'important' | 'urgent';
  created_at: string;
}

// Forms & Support
export interface DynamicForm {
  id: string;
  title: string;
  slug: string;
  description?: string;
  schema: Array<{
    name: string;
    label: string;
    type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox';
    required: boolean;
    options?: string[];
  }>;
  is_published: boolean;
  submissions_count?: number;
  created_at: string;
}

export interface FormSubmission {
  id: string;
  form: string;
  data: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  customer_name: string;
  customer_email: string;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  assigned_to_name?: string;
  created_at: string;
  updated_at: string;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticket: string;
  sender_user?: string;
  sender_name?: string;
  sender_email?: string;
  is_internal_note: boolean;
  message: string;
  created_at: string;
}

// Dashboard & Analytics
export interface DashboardStats {
  mrr: number;
  mrr_change: number;
  total_revenue: number;
  active_deals_count: number;
  deals_pipeline_value: number;
  open_projects_count: number;
  pending_tasks_count: number;
  unpaid_invoices_amount: number;
  monthly_expenses_amount: number;
  team_members_count: number;
  open_tickets_count: number;
}
