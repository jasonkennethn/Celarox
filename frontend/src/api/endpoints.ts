import apiClient from './client';
import {
  User, Workspace, WorkspaceMember, Deal, Contact, Account,
  Project, Task, ClientBillingProfile, Invoice, PaymentTransaction, Expense,
  DocumentItem, DocumentFolder, WorkflowRule, WorkflowExecutionLog,
  Department, EmployeeProfile, LeaveRequest, Announcement,
  DynamicForm, FormSubmission, SupportTicket, TicketMessage, DashboardStats
} from '../types';

export const api = {
  // Authentication
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post<{ user: User; tokens: { access: string; refresh: string } }>('/auth/login/', credentials),
    register: (data: { email: string; password: string; first_name: string; last_name: string; company_name?: string }) =>
      apiClient.post<{ user: User; tokens: { access: string; refresh: string }; workspace: Workspace }>('/auth/register/', data),
    googleLogin: (token: string) =>
      apiClient.post<{ user: User; tokens: { access: string; refresh: string } }>('/auth/google/', { token }),
    getProfile: () =>
      apiClient.get<User>('/auth/me/'),
    updateProfile: (data: Partial<User>) =>
      apiClient.patch<User>('/auth/me/', data),
    requestPasswordReset: (email: string) =>
      apiClient.post('/auth/password-reset/', { email }),
    confirmPasswordReset: (data: { token: string; new_password: string }) =>
      apiClient.post('/auth/password-reset/confirm/', data),
  },

  // Workspaces
  workspaces: {
    list: () => apiClient.get<Workspace[]>('/workspaces/'),
    create: (data: Partial<Workspace>) => apiClient.post<Workspace>('/workspaces/', data),
    get: (id: string) => apiClient.get<Workspace>(`/workspaces/${id}/`),
    update: (id: string, data: Partial<Workspace>) => apiClient.patch<Workspace>(`/workspaces/${id}/`, data),
    listMembers: (id: string) => apiClient.get<WorkspaceMember[]>(`/workspaces/${id}/members/`),
    inviteMember: (id: string, data: { email: string; role: string }) =>
      apiClient.post<WorkspaceMember>(`/workspaces/${id}/members/`, data),
    getStats: (id: string) => apiClient.get<any>(`/workspaces/${id}/stats/`),
  },

  // CRM & Pipelines
  crm: {
    listDeals: (params?: Record<string, any>) => apiClient.get<Deal[]>('/crm/deals/', { params }),
    createDeal: (data: Partial<Deal>) => apiClient.post<Deal>('/crm/deals/', data),
    updateDeal: (id: string, data: Partial<Deal>) => apiClient.patch<Deal>(`/crm/deals/${id}/`, data),
    deleteDeal: (id: string) => apiClient.delete(`/crm/deals/${id}/`),
    listContacts: (params?: Record<string, any>) => apiClient.get<Contact[]>('/crm/contacts/', { params }),
    createContact: (data: Partial<Contact>) => apiClient.post<Contact>('/crm/contacts/', data),
    listAccounts: (params?: Record<string, any>) => apiClient.get<Account[]>('/crm/accounts/', { params }),
    createAccount: (data: Partial<Account>) => apiClient.post<Account>('/crm/accounts/', data),
  },

  // Operations & Projects
  projects: {
    list: (params?: Record<string, any>) => apiClient.get<Project[]>('/projects/projects/', { params }),
    create: (data: Partial<Project>) => apiClient.post<Project>('/projects/projects/', data),
    get: (id: string) => apiClient.get<Project>(`/projects/projects/${id}/`),
    update: (id: string, data: Partial<Project>) => apiClient.patch<Project>(`/projects/projects/${id}/`, data),
    delete: (id: string) => apiClient.delete(`/projects/projects/${id}/`),
    listTasks: (params?: Record<string, any>) => apiClient.get<Task[]>('/projects/tasks/', { params }),
    createTask: (data: Partial<Task>) => apiClient.post<Task>('/projects/tasks/', data),
    updateTask: (id: string, data: Partial<Task>) => apiClient.patch<Task>(`/projects/tasks/${id}/`, data),
    deleteTask: (id: string) => apiClient.delete(`/projects/tasks/${id}/`),
  },

  // Finance & Invoicing
  finance: {
    listInvoices: (params?: Record<string, any>) => apiClient.get<Invoice[]>('/finance/invoices/', { params }),
    createInvoice: (data: Partial<Invoice>) => apiClient.post<Invoice>('/finance/invoices/', data),
    getInvoice: (id: string) => apiClient.get<Invoice>(`/finance/invoices/${id}/`),
    updateInvoice: (id: string, data: Partial<Invoice>) => apiClient.patch<Invoice>(`/finance/invoices/${id}/`, data),
    sendInvoiceEmail: (id: string) => apiClient.post(`/finance/invoices/${id}/send_email/`),
    getPdfUrl: (id: string) => `${apiClient.defaults.baseURL}/finance/invoices/${id}/pdf/`,
    listProfiles: () => apiClient.get<ClientBillingProfile[]>('/finance/clients/'),
    createProfile: (data: Partial<ClientBillingProfile>) => apiClient.post<ClientBillingProfile>('/finance/clients/', data),
    listExpenses: (params?: Record<string, any>) => apiClient.get<Expense[]>('/finance/expenses/', { params }),
    createExpense: (data: Partial<Expense>) => apiClient.post<Expense>('/finance/expenses/', data),
    listPayments: (params?: Record<string, any>) => apiClient.get<PaymentTransaction[]>('/finance/payments/', { params }),
    createPayment: (data: Partial<PaymentTransaction>) => apiClient.post<PaymentTransaction>('/finance/payments/', data),
  },

  // Documents & Storage
  documents: {
    list: (params?: Record<string, any>) => apiClient.get<DocumentItem[]>('/documents/files/', { params }),
    upload: (formData: FormData) =>
      apiClient.post<DocumentItem>('/documents/files/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    createFolder: (name: string) => apiClient.post<DocumentFolder>('/documents/folders/', { name }),
    delete: (id: string) => apiClient.delete(`/documents/files/${id}/`),
  },

  // Workflows & Automations
  workflows: {
    listRules: () => apiClient.get<WorkflowRule[]>('/workflows/rules/'),
    createRule: (data: Partial<WorkflowRule>) => apiClient.post<WorkflowRule>('/workflows/rules/', data),
    updateRule: (id: string, data: Partial<WorkflowRule>) => apiClient.patch<WorkflowRule>(`/workflows/rules/${id}/`, data),
    deleteRule: (id: string) => apiClient.delete(`/workflows/rules/${id}/`),
    listLogs: (params?: Record<string, any>) => apiClient.get<WorkflowExecutionLog[]>('/workflows/logs/', { params }),
  },

  // HR & Team Operations
  hr: {
    listEmployees: () => apiClient.get<EmployeeProfile[]>('/hr/employees/'),
    createEmployee: (data: Partial<EmployeeProfile>) => apiClient.post<EmployeeProfile>('/hr/employees/', data),
    listDepartments: () => apiClient.get<Department[]>('/hr/departments/'),
    createDepartment: (data: Partial<Department>) => apiClient.post<Department>('/hr/departments/', data),
    listLeaves: () => apiClient.get<LeaveRequest[]>('/hr/leaves/'),
    applyLeave: (data: Partial<LeaveRequest>) => apiClient.post<LeaveRequest>('/hr/leaves/', data),
    reviewLeave: (id: string, data: { status: 'approved' | 'rejected'; notes?: string }) =>
      apiClient.post<LeaveRequest>(`/hr/leaves/${id}/review/`, data),
    listAnnouncements: () => apiClient.get<Announcement[]>('/hr/announcements/'),
    createAnnouncement: (data: Partial<Announcement>) => apiClient.post<Announcement>('/hr/announcements/', data),
  },

  // Forms & Support Desk
  formsSupport: {
    listForms: () => apiClient.get<DynamicForm[]>('/forms/forms/'),
    createForm: (data: Partial<DynamicForm>) => apiClient.post<DynamicForm>('/forms/forms/', data),
    getForm: (slug: string) => apiClient.get<DynamicForm>(`/forms/forms/${slug}/`),
    submitForm: (slug: string, data: Record<string, any>) =>
      apiClient.post(`/forms/forms/${slug}/submit/`, { data }),
    listSubmissions: (formId: string) => apiClient.get<FormSubmission[]>(`/forms/forms/${formId}/submissions/`),
    listTickets: (params?: Record<string, any>) => apiClient.get<SupportTicket[]>('/forms/tickets/', { params }),
    createTicket: (data: Partial<SupportTicket>) => apiClient.post<SupportTicket>('/forms/tickets/', data),
    getTicket: (id: string) => apiClient.get<SupportTicket>(`/forms/tickets/${id}/`),
    addTicketMessage: (ticketId: string, data: { message: string; is_internal_note?: boolean }) =>
      apiClient.post<TicketMessage>(`/forms/tickets/${ticketId}/messages/`, data),
  },

  // Executive Analytics & Metrics
  analytics: {
    getOverview: () => apiClient.get<DashboardStats>('/analytics/overview/'),
  },

  // Public Contact Inquiries (Brevo Email Integration)
  public: {
    submitContact: (data: {
      name: string;
      email: string;
      company?: string;
      subject: string;
      message: string;
      phone?: string;
    }) => apiClient.post('/integrations/contact/', data),
  },
};
