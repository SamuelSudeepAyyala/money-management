export type ApiUser = { id: number; email: string; display_name: string };
export type ApiAccount = { id: number; name: string; account_type: string; currency: string; opening_balance: number; is_archived?: boolean };
export type ApiTransaction = { id: number; account_id: number; transaction_type: "expense" | "income"; amount: number; name: string; category: string; notes?: string; occurred_on: string };
export type ApiBudget = { id: number; category: string; monthly_limit: number };
export type ApiLoan = { id: number; name: string; remaining_balance: number; minimum_payment: number; interest_rate: number; due_date?: string };
export type ApiLoanPayment = { id: number; loan_id: number; amount: number; principal_amount: number; interest_amount: number; paid_on: string; note?: string };
export type ApiRecurringBill = { id: number; name: string; amount: number; category: string; frequency: "weekly" | "monthly" | "yearly"; next_due: string };
export type ApiGoal = { id: number; name: string; target_amount: number; current_amount: number; target_date?: string };

export const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, { ...options, credentials: "include", headers: { "Content-Type": "application/json", ...options.headers } });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(body?.detail || "The request could not be completed.");
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

export const authApi = {
  me: () => request<ApiUser>("/api/me"),
  login: (email: string, password: string) => request<{ user: ApiUser }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, display_name: string) => request<{ user: ApiUser }>("/api/auth/register", { method: "POST", body: JSON.stringify({ email, password, display_name }) }),
  logout: () => request<void>("/api/auth/logout", { method: "POST" })
};

export const financeApi = {
  accounts: () => request<ApiAccount[]>("/api/accounts"),
  createAccount: (account: Omit<ApiAccount, "id">) => request<ApiAccount>("/api/accounts", { method: "POST", body: JSON.stringify(account) }),
  deleteAccount: (id: string) => request<void>(`/api/accounts/${id}`, { method: "DELETE" }),
  recurringBills: () => request<ApiRecurringBill[]>("/api/recurring-bills"),
  createRecurringBill: (bill: Omit<ApiRecurringBill, "id">) => request<ApiRecurringBill>("/api/recurring-bills", { method: "POST", body: JSON.stringify(bill) }),
  deleteRecurringBill: (id: string) => request<void>(`/api/recurring-bills/${id}`, { method: "DELETE" }),
  transactions: () => request<ApiTransaction[]>("/api/transactions"),
  createTransaction: (transaction: Omit<ApiTransaction, "id">) => request<ApiTransaction>("/api/transactions", { method: "POST", body: JSON.stringify(transaction) }),
  deleteTransaction: (id: string) => request<void>(`/api/transactions/${id}`, { method: "DELETE" })
  ,budgets: () => request<ApiBudget[]>("/api/budgets"),
  createBudget: (budget: Omit<ApiBudget, "id">) => request<ApiBudget>("/api/budgets", { method: "POST", body: JSON.stringify(budget) }),
  deleteBudget: (id: string) => request<void>(`/api/budgets/${id}`, { method: "DELETE" }),
  loans: () => request<ApiLoan[]>("/api/loans"),
  createLoan: (loan: Omit<ApiLoan, "id">) => request<ApiLoan>("/api/loans", { method: "POST", body: JSON.stringify(loan) }),
  deleteLoan: (id: string) => request<void>(`/api/loans/${id}`, { method: "DELETE" }),
  loanPayments: (loanId: string) => request<ApiLoanPayment[]>(`/api/loans/${loanId}/payments`),
  createLoanPayment: (loanId: string, payment: Omit<ApiLoanPayment, "id" | "loan_id">) => request<ApiLoanPayment>(`/api/loans/${loanId}/payments`, { method: "POST", body: JSON.stringify(payment) }),
  deleteLoanPayment: (loanId: string, paymentId: string) => request<void>(`/api/loans/${loanId}/payments/${paymentId}`, { method: "DELETE" }),
  goals: () => request<ApiGoal[]>("/api/goals"),
  createGoal: (goal: Omit<ApiGoal, "id">) => request<ApiGoal>("/api/goals", { method: "POST", body: JSON.stringify(goal) }),
  deleteGoal: (id: string) => request<void>(`/api/goals/${id}`, { method: "DELETE" })
};
