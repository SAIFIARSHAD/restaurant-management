import { useState } from 'react';
import {
  Plus, Search, IndianRupee, TrendingDown, TrendingUp,
  PieChart, RefreshCw, ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
  useExpenses,
  useExpenseCategories,
  useMonthlyReport,
  useProfitReport,
} from '../../hooks/useExpenses';
import ExpenseTable  from '../../components/expenses/ExpenseTable';
import ExpenseModal  from '../../components/expenses/ExpenseModal';

const PAYMENT_METHODS = ['cash', 'bank', 'upi', 'card', 'other'];

const CATEGORY_COLORS = [
  'bg-blue-500/20 text-blue-400',
  'bg-orange-500/20 text-orange-400',
  'bg-green-500/20 text-green-400',
  'bg-purple-500/20 text-purple-400',
  'bg-yellow-500/20 text-yellow-400',
  'bg-red-500/20 text-red-400',
];

export default function ExpensePage() {
  const now = new Date();
  const [showModal,       setShowModal]       = useState(false);
  const [search,          setSearch]          = useState('');
  const [categoryFilter,  setCategoryFilter]  = useState('');
  const [paymentFilter,   setPaymentFilter]   = useState('');
  const [startDate,       setStartDate]       = useState('');
  const [endDate,         setEndDate]         = useState('');
  const [reportMonth,     setReportMonth]     = useState(now.getMonth() + 1);
  const [reportYear,      setReportYear]      = useState(now.getFullYear());
  const [activeTab,       setActiveTab]       = useState<'expenses' | 'report'>('expenses');

  const { data: categories = [] } = useExpenseCategories();

  const { data: expenseData, isLoading, refetch } = useExpenses({
    category:      categoryFilter || undefined,
    startDate:     startDate      || undefined,
    endDate:       endDate        || undefined,
    paymentMethod: paymentFilter  || undefined,
  });

  const { data: monthlyReport } = useMonthlyReport(reportMonth, reportYear);
  const { data: profitReport  } = useProfitReport(reportMonth, reportYear);

  const expenses    = expenseData?.expenses    ?? [];
  const totalAmount = expenseData?.totalAmount ?? 0;

  const filtered = expenses.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleReset = () => {
    setSearch('');
    setCategoryFilter('');
    setPaymentFilter('');
    setStartDate('');
    setEndDate('');
  };

  const prevMonth = () => {
    if (reportMonth === 1) { setReportMonth(12); setReportYear(y => y - 1); }
    else setReportMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (reportMonth === 12) { setReportMonth(1); setReportYear(y => y + 1); }
    else setReportMonth(m => m + 1);
  };

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Expense Management</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Track expenses, categories and monthly profit reports
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border bg-red-500/10 border-red-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Expenses</span>
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex items-center gap-1 text-2xl font-bold text-red-400">
            <IndianRupee className="w-5 h-5" />
            {totalAmount.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-5 rounded-2xl border bg-blue-500/10 border-blue-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Entries</span>
            <PieChart className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400">{expenses.length}</p>
        </div>

        <div className="p-5 rounded-2xl border bg-green-500/10 border-green-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Monthly Revenue</span>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex items-center gap-1 text-2xl font-bold text-green-400">
            <IndianRupee className="w-5 h-5" />
            {(profitReport?.totalRevenue ?? 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${
          (profitReport?.profit ?? 0) >= 0
            ? 'bg-orange-500/10 border-orange-500/20'
            : 'bg-red-500/10 border-red-500/20'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Net Profit</span>
            <TrendingUp className={`w-5 h-5 ${(profitReport?.profit ?? 0) >= 0 ? 'text-orange-400' : 'text-red-400'}`} />
          </div>
          <div className={`flex items-center gap-1 text-2xl font-bold ${
            (profitReport?.profit ?? 0) >= 0 ? 'text-orange-400' : 'text-red-400'
          }`}>
            <IndianRupee className="w-5 h-5" />
            {Math.abs(profitReport?.profit ?? 0).toLocaleString('en-IN')}
          </div>
          {profitReport && (
            <p className="text-xs text-zinc-500 mt-1">Margin: {profitReport.profitMargin}</p>
          )}
        </div>
      </div>

      
      <div className="flex border-b border-zinc-800">
        {(['expenses', 'report'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-semibold capitalize transition-colors ${
              activeTab === tab
                ? 'text-orange-400 border-b-2 border-orange-500'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab === 'expenses' ? 'All Expenses' : 'Monthly Report'}
          </button>
        ))}
      </div>

      
      {activeTab === 'expenses' && (
        <div className="space-y-4">

          
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex flex-wrap gap-3 items-end">

              
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by title or category..."
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              
              <div>
                <label className="text-xs text-zinc-500 uppercase font-semibold mb-1 block">Category</label>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              
              <div>
                <label className="text-xs text-zinc-500 uppercase font-semibold mb-1 block">Payment</label>
                <select
                  value={paymentFilter}
                  onChange={e => setPaymentFilter(e.target.value)}
                  className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 capitalize"
                >
                  <option value="">All Methods</option>
                  {PAYMENT_METHODS.map(m => (
                    <option key={m} value={m} className="capitalize">{m}</option>
                  ))}
                </select>
              </div>

              
              <div>
                <label className="text-xs text-zinc-500 uppercase font-semibold mb-1 block">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase font-semibold mb-1 block">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                onClick={handleReset}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-xl text-sm font-semibold"
              >
                Reset
              </button>
              <button
                onClick={() => refetch()}
                className="p-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-xl"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          
          {isLoading && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-zinc-900 rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto bg-zinc-900/50 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-zinc-700">
                <TrendingDown className="w-10 h-10 text-zinc-600" />
              </div>
              <p className="text-zinc-400 text-lg font-semibold">No expenses found</p>
              <p className="text-zinc-600 text-sm mt-1">
                {search || categoryFilter || paymentFilter
                  ? 'Try changing your filters'
                  : 'No expenses recorded yet'}
              </p>
              {!search && !categoryFilter && !paymentFilter && (
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-5 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm"
                >
                  + Add First Expense
                </button>
              )}
            </div>
          )}

          
          {!isLoading && filtered.length > 0 && (
            <ExpenseTable expenses={filtered} totalAmount={totalAmount} />
          )}
        </div>
      )}

      
      {activeTab === 'report' && (
        <div className="space-y-5">

          
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4">
            <button
              onClick={prevMonth}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center">
              <p className="text-white font-bold text-lg">
                {MONTH_NAMES[reportMonth - 1]} {reportYear}
              </p>
              <p className="text-zinc-500 text-sm">Monthly Expense Report</p>
            </div>
            <button
              onClick={nextMonth}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Profit Summary */}
          {profitReport && (
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-center">
                <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-2">Revenue</p>
                <div className="flex items-center justify-center gap-1 text-xl font-bold text-green-400">
                  <IndianRupee className="w-4 h-4" />
                  {profitReport.totalRevenue.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-2">Expenses</p>
                <div className="flex items-center justify-center gap-1 text-xl font-bold text-red-400">
                  <IndianRupee className="w-4 h-4" />
                  {profitReport.totalExpense.toLocaleString('en-IN')}
                </div>
              </div>
              <div className={`p-4 rounded-2xl border text-center ${
                profitReport.profit >= 0
                  ? 'bg-orange-500/10 border-orange-500/20'
                  : 'bg-red-500/10 border-red-500/20'
              }`}>
                <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-2">Net Profit</p>
                <div className={`flex items-center justify-center gap-1 text-xl font-bold ${
                  profitReport.profit >= 0 ? 'text-orange-400' : 'text-red-400'
                }`}>
                  <IndianRupee className="w-4 h-4" />
                  {Math.abs(profitReport.profit).toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-zinc-500 mt-1">{profitReport.profitMargin} margin</p>
              </div>
            </div>
          )}

          
          {monthlyReport && monthlyReport.data.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800">
                <h3 className="text-white font-semibold">Expense by Category</h3>
                <p className="text-zinc-500 text-sm">
                  Grand Total: ₹{monthlyReport.grandTotal.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-4 space-y-3">
                {monthlyReport.data.map((item, i) => {
                  const pct = monthlyReport.grandTotal > 0
                    ? (item.totalAmount / monthlyReport.grandTotal * 100).toFixed(1)
                    : '0';
                  return (
                    <div key={item._id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`}>
                            {item.category.name}
                          </span>
                          <span className="text-zinc-500 text-xs">{item.count} entries</span>
                        </div>
                        <div className="flex items-center gap-1 text-white font-semibold text-sm">
                          <IndianRupee className="w-3.5 h-3.5 text-zinc-400" />
                          {item.totalAmount.toLocaleString('en-IN')}
                          <span className="text-zinc-500 text-xs ml-1">({pct}%)</span>
                        </div>
                      </div>
                      
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          
          {monthlyReport && monthlyReport.data.length === 0 && (
            <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <PieChart className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400 font-semibold">No expenses for this month</p>
              <p className="text-zinc-600 text-sm mt-1">
                {MONTH_NAMES[reportMonth - 1]} {reportYear} has no recorded expenses
              </p>
            </div>
          )}
        </div>
      )}

      
      {showModal && (
        <ExpenseModal expense={null} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
