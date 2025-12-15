/**
 * API Client for Expense Tracker Backend
 * Handles all HTTP requests to the backend server
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3100/api';

// Storage keys
const TOKEN_KEY = 'expense_tracker_token';
const USER_KEY = 'expense_tracker_user';

// Get stored token
export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

// Set token
export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

// Clear token
export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

// Generic fetch wrapper
async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || `Request failed with status ${response.status}`,
            };
        }

        return data;
    } catch (error) {
        console.error('API request failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

// ============================================
// Auth API
// ============================================

export const authApi = {
    /**
     * Login with Google credential
     */
    async loginWithGoogle(credential: string) {
        const result = await fetchApi<{ user: User; token: string }>('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ credential }),
        });

        if (result.success && result.data) {
            setToken(result.data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(result.data.user));
        }

        return result;
    },

    /**
     * Get current user profile
     */
    async getProfile() {
        return fetchApi<User>('/auth/me');
    },

    /**
     * Update user profile
     */
    async updateProfile(data: Partial<User>) {
        return fetchApi<User>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete user account and all data
     */
    async deleteAccount() {
        const result = await fetchApi<{ message: string }>('/auth/account', {
            method: 'DELETE',
        });

        if (result.success) {
            clearToken();
        }

        return result;
    },

    /**
     * Logout - clear local storage
     */
    logout() {
        clearToken();
    },
};

// ============================================
// Expenses API
// ============================================

export interface ExpenseFilters {
    from?: string;
    to?: string;
    category_id?: string;
    limit?: number;
    offset?: number;
}

export const expensesApi = {
    /**
     * Get expenses with optional filters
     */
    async getExpenses(filters: ExpenseFilters = {}) {
        const params = new URLSearchParams();
        if (filters.from) params.append('from', filters.from);
        if (filters.to) params.append('to', filters.to);
        if (filters.category_id) params.append('category_id', filters.category_id);
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.offset) params.append('offset', filters.offset.toString());

        const query = params.toString();
        return fetchApi<Expense[]>(`/expenses${query ? `?${query}` : ''}`);
    },

    /**
     * Create new expense
     */
    async createExpense(data: CreateExpenseData) {
        return fetchApi<Expense>('/expenses', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Update expense
     */
    async updateExpense(id: string, data: Partial<CreateExpenseData>) {
        return fetchApi<Expense>(`/expenses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete expense
     */
    async deleteExpense(id: string) {
        return fetchApi<{ id: string }>(`/expenses/${id}`, {
            method: 'DELETE',
        });
    },
};

// ============================================
// Categories API
// ============================================

export const categoriesApi = {
    /**
     * Get all categories (default + user's custom)
     */
    async getCategories() {
        return fetchApi<Category[]>('/categories');
    },

    /**
     * Create new category
     */
    async createCategory(data: { name: string; color: string }) {
        return fetchApi<Category>('/categories', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Update category
     */
    async updateCategory(id: string, data: { name?: string; color?: string }) {
        return fetchApi<Category>(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete category
     */
    async deleteCategory(id: string) {
        return fetchApi<{ id: string }>(`/categories/${id}`, {
            method: 'DELETE',
        });
    },
};

// ============================================
// AI API
// ============================================

export interface AIReceiptResult {
    toko: string;
    total: number;
    kategori: string;
    category_id: string;
    tanggal: string;
    alamat: string;
    catatan: string;
    confidence: number;
}

export const aiApi = {
    /**
     * Analyze receipt image using AI OCR via n8n webhook
     */
    async analyzeReceipt(image: string, filename?: string) {
        return fetchApi<AIReceiptResult>('/ai/analyze-receipt', {
            method: 'POST',
            body: JSON.stringify({ image, filename }),
        });
    },

    /**
     * Save AI-extracted expense to database
     */
    async saveExpense(data: {
        category_id: string;
        amount: number;
        expense_date: string;
        description?: string;
        receipt_url?: string;
        attachment_type?: 'image' | 'pdf';
        attachment_data?: string;
    }) {
        return fetchApi<Expense>('/ai/save-expense', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};

// ============================================
// Types (matching backend)
// ============================================

export interface User {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    business_type: string | null;
    occupation: string | null;
    monthly_budget: number;
    onboarding_completed: boolean;
    dark_mode: boolean;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    user_id: string | null;
    name: string;
    color: string;
    is_default: boolean;
    created_at: string;
}

export interface Expense {
    id: string;
    user_id: string;
    category_id: string | null;
    category?: Category;
    amount: number;
    description: string | null;
    expense_date: string;
    receipt_url: string | null;
    attachment_type: 'image' | 'pdf' | null;
    attachment_data: string | null;
    ai_processed: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateExpenseData {
    category_id: string;
    amount: number;
    description?: string;
    expense_date: string;
    receipt_url?: string;
    attachment_type?: 'image' | 'pdf';
    attachment_data?: string;
}

export default {
    auth: authApi,
    expenses: expensesApi,
    categories: categoriesApi,
    ai: aiApi,
};
