export type ApiUser = { id: number; email: string; display_name: string };
export type ApiAccount = { id: number; name: string; account_type: string; currency: string; opening_balance: number };
export type ApiTransaction = { id: number; account_id: number; transaction_type: "expense" | "income"; amount: number; name: string; category: string; notes?: string; occurred_on: string };

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
  transactions: () => request<ApiTransaction[]>("/api/transactions"),
  createTransaction: (transaction: Omit<ApiTransaction, "id">) => request<ApiTransaction>("/api/transactions", { method: "POST", body: JSON.stringify(transaction) }),
  deleteTransaction: (id: string) => request<void>(`/api/transactions/${id}`, { method: "DELETE" })
};
