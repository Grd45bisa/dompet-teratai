import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Loader2, Plus, X } from 'lucide-react';
import { categoriesApi, expensesApi, Category } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, parseCurrency } from '../../utils/formatCurrency';

const expenseSchema = z.object({
    category_id: z.string().min(1, 'Pilih kategori'),
    amount: z.string().min(1, 'Jumlah wajib diisi'),
    expense_date: z.string().min(1, 'Tanggal wajib diisi'),
    description: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface InitialData {
    category_id: string;
    amount: number;
    expense_date: string;
    description: string;
}

interface ExpenseFormProps {
    receiptUrl?: string | null;
    initialData?: InitialData;
    expenseId?: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export function ExpenseForm({
    receiptUrl,
    initialData,
    expenseId,
    onSuccess,
    onCancel
}: ExpenseFormProps) {
    const { user } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const isEditing = Boolean(expenseId);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            category_id: initialData?.category_id || '',
            amount: initialData?.amount ? formatCurrency(initialData.amount).replace('Rp', '').trim() : '',
            expense_date: initialData?.expense_date || format(new Date(), 'yyyy-MM-dd'),
            description: initialData?.description || '',
        },
    });

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            const result = await categoriesApi.getCategories();

            if (result.success && result.data) {
                setCategories(result.data as Category[]);
            }
        };

        if (user) {
            fetchCategories();
        }
    }, [user]);

    // Format amount on change
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^\d]/g, '');
        if (value) {
            const num = parseInt(value, 10);
            setValue('amount', formatCurrency(num).replace('Rp', '').trim());
        } else {
            setValue('amount', '');
        }
    };

    // Add new category
    const handleAddCategory = async () => {
        if (!newCategoryName.trim() || !user) return;

        const result = await categoriesApi.createCategory({
            name: newCategoryName.trim(),
            color: '#43A047',
        });

        if (result.success && result.data) {
            setCategories([...categories, result.data as Category]);
            setValue('category_id', result.data.id);
            setNewCategoryName('');
            setIsAddingCategory(false);
        }
    };

    const onSubmit = async (data: ExpenseFormData) => {
        if (!user) return;

        setIsLoading(true);

        try {
            const amount = parseCurrency(data.amount);

            // Validate amount
            if (amount <= 0) {
                alert('Jumlah harus lebih dari 0');
                setIsLoading(false);
                return;
            }

            // Validate date not future
            const expenseDate = new Date(data.expense_date);
            if (expenseDate > new Date()) {
                alert('Tanggal tidak boleh di masa depan');
                setIsLoading(false);
                return;
            }

            if (isEditing && expenseId) {
                // Update existing expense
                const result = await expensesApi.updateExpense(expenseId, {
                    category_id: data.category_id,
                    amount,
                    expense_date: data.expense_date,
                    description: data.description || undefined,
                });

                if (!result.success) throw new Error(result.error);
            } else {
                // Insert new expense
                const result = await expensesApi.createExpense({
                    category_id: data.category_id,
                    amount,
                    expense_date: data.expense_date,
                    description: data.description || undefined,
                    receipt_url: receiptUrl || undefined,
                });

                if (!result.success) throw new Error(result.error);
            }

            onSuccess();
        } catch (error) {
            console.error('Error saving expense:', error);
            alert('Gagal menyimpan pengeluaran. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="exp-form">
            {/* Receipt Preview */}
            {receiptUrl && !isEditing && (
                <div className="exp-form-receipt">
                    <img
                        src={receiptUrl}
                        alt="Receipt"
                        className="exp-form-receipt-img"
                    />
                </div>
            )}

            {/* Category */}
            <div className="exp-form-group">
                <label className="exp-form-label">
                    Kategori <span className="exp-form-required">*</span>
                </label>
                {!isAddingCategory ? (
                    <div className="exp-form-row">
                        <select
                            {...register('category_id')}
                            className={`exp-form-select ${errors.category_id ? 'exp-form-input-error' : ''}`}
                        >
                            <option value="">Pilih Kategori</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => setIsAddingCategory(true)}
                            className="exp-form-add-btn"
                        >
                            <Plus className="exp-form-icon" />
                        </button>
                    </div>
                ) : (
                    <div className="exp-form-row">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Nama kategori baru"
                            className="exp-form-input"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={handleAddCategory}
                            className="exp-form-confirm-btn"
                        >
                            <Plus className="exp-form-icon" />
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsAddingCategory(false);
                                setNewCategoryName('');
                            }}
                            className="exp-form-cancel-add-btn"
                        >
                            <X className="exp-form-icon" />
                        </button>
                    </div>
                )}
                {errors.category_id && (
                    <p className="exp-form-error">{errors.category_id.message}</p>
                )}
            </div>

            {/* Amount */}
            <div className="exp-form-group">
                <label className="exp-form-label">
                    Jumlah <span className="exp-form-required">*</span>
                </label>
                <div className="exp-form-amount-wrapper">
                    <span className="exp-form-amount-prefix">
                        Rp
                    </span>
                    <input
                        type="text"
                        inputMode="numeric"
                        {...register('amount')}
                        onChange={handleAmountChange}
                        placeholder="0"
                        className={`exp-form-input exp-form-amount-input ${errors.amount ? 'exp-form-input-error' : ''}`}
                    />
                </div>
                {errors.amount && (
                    <p className="exp-form-error">{errors.amount.message}</p>
                )}
            </div>

            {/* Date */}
            <div className="exp-form-group">
                <label className="exp-form-label">
                    Tanggal <span className="exp-form-required">*</span>
                </label>
                <input
                    type="date"
                    {...register('expense_date')}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    className={`exp-form-input ${errors.expense_date ? 'exp-form-input-error' : ''}`}
                />
                {errors.expense_date && (
                    <p className="exp-form-error">{errors.expense_date.message}</p>
                )}
            </div>

            {/* Description */}
            <div className="exp-form-group">
                <label className="exp-form-label">
                    Catatan <span className="exp-form-optional">(opsional)</span>
                </label>
                <textarea
                    {...register('description')}
                    rows={3}
                    placeholder="Contoh: Belanja sayur di pasar"
                    className="exp-form-textarea"
                />
            </div>

            {/* Buttons */}
            <div className="exp-form-actions">
                <button
                    type="button"
                    onClick={onCancel}
                    className="exp-form-btn-cancel"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="exp-form-btn-submit"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="exp-form-spinner" />
                            Menyimpan...
                        </>
                    ) : (
                        'Simpan'
                    )}
                </button>
            </div>
        </form>
    );
}

export default ExpenseForm;
