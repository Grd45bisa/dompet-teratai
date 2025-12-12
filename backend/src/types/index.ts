// User type from Google OAuth + database
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

// Category type
export interface Category {
    id: string;
    user_id: string | null;
    name: string;
    color: string;
    is_default: boolean;
    created_at: string;
}

// Expense type
export interface Expense {
    id: string;
    user_id: string;
    category_id: string | null;
    category?: Category;
    amount: number;
    description: string | null;
    expense_date: string;
    receipt_url: string | null;
    ai_processed: boolean;
    created_at: string;
    updated_at: string;
}

// Request types
export interface CreateExpenseRequest {
    category_id: string;
    amount: number;
    description?: string;
    expense_date: string;
    receipt_url?: string;
}

export interface UpdateExpenseRequest {
    category_id?: string;
    amount?: number;
    description?: string;
    expense_date?: string;
    receipt_url?: string;
}

export interface UpdateProfileRequest {
    full_name?: string;
    avatar_url?: string;
    business_type?: string;
    occupation?: string;
    monthly_budget?: number;
    onboarding_completed?: boolean;
    dark_mode?: boolean;
}

export interface CreateCategoryRequest {
    name: string;
    color: string;
}

// Express request with user
import { Request } from 'express';

export interface AuthRequest extends Request {
    user?: User;
}

// API Response
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}
