import { useState } from 'react';
import { Pencil, Trash2, IndianRupee, StickyNote } from 'lucide-react';
import { useDeleteExpense, type IExpense } from '../../hooks/useExpenses';
import ExpenseModal from './ExpenseModal';

interface Props {
  expenses: IExpense[];
  totalAmount: number;
}

const PAYMENT_COLORS: Record<string, string> = {
  cash:  'bg-green-500/10 text-green-400 border-green-500/30',
  bank:  'bg-blue-500/10 text-blue-400 border-blue-500/30',
  upi:   'bg-purple-500/10 text-purple-400 border-purple-500/30',
  card:  'bg-orange-500/10 text-orange-400 border-orange-500/30',
  other: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
};

export default function ExpenseTable({ expenses, totalAmount }: Props) {
  const deleteMutation = useDeleteExpense();
  const [editExpense, setEditExpense] = useState<IExpense | null>(null);
  const [confirmId,   setConfirmId]   = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    setConfirmId(null);
  };

  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Title</th>
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Payment</th>
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Added By</th>
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(exp => (
              <tr key={exp._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">

                
                <td className="px-4 py-3">
                  <p className="text-white font-medium text-sm">{exp.title}</p>
                  {exp.note && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <StickyNote className="w-3 h-3 text-zinc-600" />
                      <p className="text-zinc-500 text-xs truncate max-w-[140px]">{exp.note}</p>
                    </div>
                  )}
                </td>

                
                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 font-medium">
                    {exp.category?.name}
                  </span>
                </td>

                
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-red-400 font-bold text-sm">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {exp.amount.toLocaleString('en-IN')}
                  </div>
                </td>

                
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border uppercase ${PAYMENT_COLORS[exp.paymentMethod]}`}>
                    {exp.paymentMethod}
                  </span>
                </td>

                
                <td className="px-4 py-3 text-zinc-400 text-sm whitespace-nowrap">
                  {new Date(exp.date).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </td>

                
                <td className="px-4 py-3 text-zinc-500 text-sm">
                  {exp.addedBy?.name ?? '—'}
                </td>

                
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditExpense(exp)}
                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {confirmId === exp._id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(exp._id)}
                          className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-xs rounded-lg font-semibold"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(exp._id)}
                        className="p-1.5 bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

          
          <tfoot>
            <tr className="border-t border-zinc-700 bg-zinc-800/40">
              <td colSpan={2} className="px-4 py-3 text-zinc-400 text-sm font-semibold">
                Total ({expenses.length} expenses)
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 text-red-400 font-bold text-base">
                  <IndianRupee className="w-4 h-4" />
                  {totalAmount.toLocaleString('en-IN')}
                </div>
              </td>
              <td colSpan={4} />
            </tr>
          </tfoot>
        </table>
      </div>

      {editExpense && (
        <ExpenseModal expense={editExpense} onClose={() => setEditExpense(null)} />
      )}
    </>
  );
}
