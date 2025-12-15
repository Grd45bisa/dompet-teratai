// User Profile
export interface Profile {
    id: string;
    full_name: string;
    business_type: string;
    onboarding_completed: boolean;
    dark_mode: boolean;
    created_at: string;
    updated_at: string;
}

// Expense Category
export interface Category {
    id: string;
    user_id: string | null;  // null for default categories
    name: string;
    color: string;
    is_default: boolean;
    created_at: string;
}

// Expense Record
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

// Form Types
export interface ExpenseFormData {
    category_id: string;
    amount: number;
    description?: string;
    expense_date: string;
    receipt_url?: string;
}

export interface ProfileFormData {
    full_name: string;
    business_type: string;
}

export interface CategoryFormData {
    name: string;
    color: string;
}

// Auth Types
export interface AuthState {
    user: Profile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

// API Response Types
export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
}

// Dashboard Stats
export interface DashboardStats {
    totalExpenses: number;
    monthlyExpenses: number;
    weeklyExpenses: number;
    topCategories: {
        category: Category;
        total: number;
    }[];
    recentExpenses: Expense[];
}

// Chart Data Types
export interface ChartDataPoint {
    name: string;
    value: number;
    color?: string;
}

export interface MonthlyChartData {
    month: string;
    total: number;
}
