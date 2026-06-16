// apps/dashboard-app/src/components/expenses/ExpenseModal.tsx
import { useState, useMemo } from 'react';
import { X, Plus } from 'lucide-react';
import {
  useAddExpense,
  useUpdateExpense,
  useExpenseCategories,
  useAddCategory,
  type IExpense,
  type UpdateExpensePayload,
} from '../../hooks/useExpenses';

interface Props {
  expense: IExpense | null;
  onClose: () => void;
}

interface FormState {
  title: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: IExpense['paymentMethod'];
  note: string;
}

const PAYMENT_METHODS: IExpense['paymentMethod'][] = ['cash', 'bank', 'upi', 'card', 'other'];

const PAYMENT_COLORS: Record<string, string> = {
  cash:  'text-green-400 border-green-500/40 bg-green-500/10',
  bank:  'text-blue-400 border-blue-500/40 bg-blue-500/10',
  upi:   'text-purple-400 border-purple-500/40 bg-purple-500/10',
  card:  'text-orange-400 border-orange-500/40 bg-orange-500/10',
  other: 'text-zinc-400 border-zinc-500/40 bg-zinc-500/10',
};

const EMPTY: FormState = {
  title: '',
  amount: 0,
  category: '',
  date: new Date().toISOString().split('T')[0],
  paymentMethod: 'cash',
  note: '',
};

export default function ExpenseModal({ expense, onClose }: Props) {
  const isEdit = !!expense;
  const addMutation      = useAddExpense();
  const updateMutation   = useUpdateExpense();
  const addCatMutation   = useAddCategory();
  const { data: categories = [] } = useExpenseCategories();

  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const initial = useMemo<FormState>(() => {
    if (!expense) return EMPTY;
    return {
      title:         expense.title,
      amount:        expense.amount,
      category:      expense.category._id,
      date:          new Date(expense.date).toISOString().split('T')[0],
      paymentMethod: expense.paymentMethod,
      note:          expense.note ?? '',
    };
  }, [expense]);

  const [form, setForm] = useState<FormState>(initial);

  const set = (field: keyof FormState, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    const cat = await addCatMutation.mutateAsync({ name: newCatName.trim() });
    setForm(prev => ({ ...prev, category: cat._id }));
    setNewCatName('');
    setShowNewCat(false);
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (isEdit) {
    const payload: UpdateExpensePayload = { id: expense!._id, ...form };
    await updateMutation.mutateAsync(payload);
  } else {
    await addMutation.mutateAsync(form);
  }
  onClose();
};

  const loading = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">
              {isEdit ? 'Edit Expense' : 'Add Expense'}
            </h2>
            <p className="text-zinc-500 text-sm mt-0.5">
              {isEdit ? 'Update expense details' : 'Record a new expense entry'}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Expense Title *
            </label>
            <input
              required
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Gas Cylinder Refill"
              className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Amount (₹) *
              </label>
              <input
                required
                type="number"
                min={0}
                step={0.01}
                value={form.amount}
                onChange={e => set('amount', parseFloat(e.target.value))}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Date *
              </label>
              <input
                required
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Category *
              </label>
              <button
                type="button"
                onClick={() => setShowNewCat(p => !p)}
                className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300"
              >
                <Plus className="w-3 h-3" />
                New Category
              </button>
            </div>

            {/* New Category Input */}
            {showNewCat && (
              <div className="flex gap-2 mb-2">
                <input
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="Category name..."
                  className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={addCatMutation.isPending || !newCatName.trim()}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl"
                >
                  {addCatMutation.isPending ? '...' : 'Add'}
                </button>
              </div>
            )}

            <select
              required
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
            >
              <option value="" className="bg-zinc-900">Select category...</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id} className="bg-zinc-900">{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
              Payment Method *
            </label>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set('paymentMethod', m)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border capitalize transition-colors ${
                    form.paymentMethod === m
                      ? PAYMENT_COLORS[m]
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Note (Optional)
            </label>
            <textarea
              rows={2}
              value={form.note}
              onChange={e => set('note', e.target.value)}
              placeholder="Any additional details..."
              className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={loading || !form.title || !form.amount || !form.category}
            className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Expense' : 'Add Expense'}
          </button>
        </div>
      </div>
    </div>
  );
}
