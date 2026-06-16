import { useState } from 'react';
import {
  TrendingUp, FileText, BarChart2, ShoppingBag,
  CreditCard, Download, RefreshCw, Calendar,
  IndianRupee, Receipt, Package,
} from 'lucide-react';
import {
  useSalesSummary,
  useRevenueReport,
  useGSTReport,
  useTopItems,
  usePaymentReport,
  useDailySummary,
} from '../../hooks/useReports';
import { useExport } from '../../hooks/useExport';

const getISTDateString = (date: Date): string => {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate   = new Date(date.getTime() + istOffset);
  return istDate.toISOString().split('T')[0];
};

const getTodayIST  = () => getISTDateString(new Date());

const getPastIST   = (days: number) =>
  getISTDateString(new Date(Date.now() - days * 24 * 60 * 60 * 1000));

const getMonthStartIST = () => {
  const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;
};

const PRESETS = [
  {
    label:    'Today',
    getRange: () => ({ startDate: getTodayIST(),     endDate: getTodayIST()    }),
  },
  {
    label:    'Last 7 Days',
    getRange: () => ({ startDate: getPastIST(7),     endDate: getTodayIST()    }),
  },
  {
    label:    'This Month',
    getRange: () => ({ startDate: getMonthStartIST(), endDate: getTodayIST()   }),
  },
  {
    label:    'Last 3 Mo',
    getRange: () => ({ startDate: getPastIST(90),    endDate: getTodayIST()    }),
  },
];

function StatCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ElementType; label: string;
  value: string; sub?: string; color: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-zinc-400 text-sm">{label}</p>
        <div className={`p-2 rounded-xl ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-white font-bold text-2xl">{value}</p>
      {sub && <p className="text-zinc-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}


function ExportBtn({
  onClick, loading, label, icon: Icon, color,
}: {
  onClick: () => void; loading: boolean;
  label: string; icon: React.ElementType; color: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors disabled:opacity-50 ${color}`}
    >
      {loading
        ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        : <Icon className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}

const PM_COLORS: Record<string, string> = {
  cash:   'bg-green-500',
  upi:    'bg-blue-500',
  card:   'bg-purple-500',
  wallet: 'bg-orange-500',
};


export default function ReportsPage() {
  const [activePreset, setActivePreset] = useState(1);
  const [dateRange, setDateRange] = useState(PRESETS[1].getRange());
  const [customFrom, setCustomFrom] = useState('');
  const [customTo,   setCustomTo]   = useState('');
  const [exportErr,  setExportErr]  = useState<string | null>(null);

  const params = dateRange;

  
  const { data: salesData,   isLoading: salesLoading   } = useSalesSummary(params);
  const { data: revenueData, isLoading: revenueLoading  } = useRevenueReport(params);
  const { data: gstData,     isLoading: gstLoading      } = useGSTReport(params);
  const { data: topItems,    isLoading: topLoading      } = useTopItems({ ...params, limit: 10 });
  const { data: paymentData, isLoading: paymentLoading  } = usePaymentReport(params);
  const { data: dailyData                               } = useDailySummary();

    const {
    loading:             exportLoading,
    exportSalesExcel,
    exportGSTPDF,
    exportTopItemsExcel,
  } = useExport();

  
  const handlePreset = (idx: number) => {
    setActivePreset(idx);
    setDateRange(PRESETS[idx].getRange());
    setCustomFrom('');
    setCustomTo('');
  };

  
  const handleCustomApply = () => {
    if (!customFrom || !customTo) return;
    if (new Date(customFrom) > new Date(customTo)) return;
    setActivePreset(-1);
    setDateRange({ startDate: customFrom, endDate: customTo });
  };

  
  const handleExport = async (fn: () => Promise<void>, name: string) => {
    setExportErr(null);
    try {
      await fn();
    } catch {
      setExportErr(`${name} download failed. Check network.`);
      setTimeout(() => setExportErr(null), 4000);
    }
  };

  const fmt = (n?: number) =>
    n !== undefined ? `₹${n.toLocaleString('en-IN')}` : '—';

  return (
    <div className="max-w-6xl space-y-6">

      
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-white font-bold text-2xl">Reports & Analytics</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {dateRange.startDate} → {dateRange.endDate}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ExportBtn
            onClick={() => handleExport(() => exportSalesExcel(dateRange), 'Sales Excel')}
            loading={exportLoading === 'sales'}
            label="Sales Excel"
            icon={Download}
            color="bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
          />
          <ExportBtn
            onClick={() => handleExport(() => exportGSTPDF(dateRange), 'GST PDF')}
            loading={exportLoading === 'gst'}
            label="GST PDF"
            icon={FileText}
            color="bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
          />
          <ExportBtn
            onClick={() => handleExport(() => exportTopItemsExcel(dateRange), 'Top Items')}
            loading={exportLoading === 'topItems'}
            label="Top Items"
            icon={Package}
            color="bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
          />
        </div>
      </div>

      
      {exportErr && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
          ⚠️ {exportErr}
        </div>
      )}


      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
          <span className="text-zinc-400 text-sm font-semibold mr-1">Period:</span>

          
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => handlePreset(i)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                activePreset === i
                  ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              {p.label}
            </button>
          ))}

          
          <div className="flex items-center gap-2 ml-1 flex-wrap">
            <input
              type="date"
              value={customFrom}
              max={customTo || getTodayIST()}
              onChange={e => setCustomFrom(e.target.value)}
              className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
            />
            <span className="text-zinc-500 text-xs">to</span>
            <input
              type="date"
              value={customTo}
              min={customFrom}
              max={getTodayIST()}
              onChange={e => setCustomTo(e.target.value)}
              className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={handleCustomApply}
              disabled={!customFrom || !customTo}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                customFrom && customTo
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
              }`}
            >
              Apply
            </button>
          </div>
        </div>

        
        <p className="text-zinc-600 text-xs mt-2 ml-6">
          Showing data from{' '}
          <span className="text-zinc-400">{dateRange.startDate}</span>
          {' '}to{' '}
          <span className="text-zinc-400">{dateRange.endDate}</span>
        </p>
      </div>

      
      {dailyData && (
        <div className="bg-zinc-900 border border-blue-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <p className="text-white font-semibold text-sm">Today Live</p>
            <span className="text-zinc-500 text-xs">(auto refresh 30s)</span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: 'Total',     value: dailyData.totalOrders,     color: 'text-white'      },
              { label: 'Pending',   value: dailyData.pendingOrders,   color: 'text-yellow-400' },
              { label: 'Accepted',  value: dailyData.acceptedOrders,  color: 'text-blue-400'   },
              { label: 'Ready',     value: dailyData.readyOrders,     color: 'text-orange-400' },
              { label: 'Served',    value: dailyData.servedOrders,    color: 'text-green-400'  },
              { label: 'Cancelled', value: dailyData.cancelledOrders, color: 'text-red-400'    },
            ].map(item => (
              <div key={item.label} className="text-center bg-zinc-800/60 rounded-xl py-3">
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-800 flex gap-6">
            <div>
              <p className="text-zinc-400 text-xs">Today Revenue</p>
              <p className="text-green-400 font-bold text-lg">{fmt(dailyData.totalRevenue)}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-xs">Today Tax</p>
              <p className="text-orange-400 font-bold text-lg">{fmt(dailyData.totalTax)}</p>
            </div>
          </div>
        </div>
      )}

      
      {salesLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : salesData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Receipt}     label="Total Orders"    value={`${salesData.totalOrders}`}       color="bg-blue-500/10 text-blue-400"   />
          <StatCard icon={IndianRupee} label="Total Revenue"   value={fmt(salesData.totalRevenue)}      color="bg-green-500/10 text-green-400" />
          <StatCard icon={TrendingUp}  label="Avg Order Value" value={fmt(salesData.avgOrderValue)}     color="bg-orange-500/10 text-orange-400"/>
          <StatCard icon={FileText}    label="Total Tax"       value={fmt(salesData.totalTax)}          color="bg-purple-500/10 text-purple-400"/>
        </div>
      )}

      
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-orange-400" />
            <p className="text-white font-semibold">Day-wise Revenue</p>
          </div>
        </div>

        {revenueLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-5 h-5 text-zinc-600 animate-spin mx-auto" />
          </div>
        ) : !revenueData?.length ? (
          <div className="p-10 text-center">
            <BarChart2 className="w-10 h-10 text-zinc-800 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">No revenue data for this period</p>
            <p className="text-zinc-600 text-xs mt-1">
              Try selecting a different date range
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-800">
                <tr>
                  {['Date', 'Orders', 'Revenue', 'Tax'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-zinc-300 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {revenueData.map((row, i) => (
                  <tr key={row._id} className={`border-b border-zinc-800 ${i % 2 !== 0 ? 'bg-zinc-800/30' : ''}`}>
                    <td className="px-5 py-3 text-white">{row._id}</td>
                    <td className="px-5 py-3 text-zinc-400">{row.totalOrders}</td>
                    <td className="px-5 py-3 text-green-400 font-semibold">{fmt(row.totalRevenue)}</td>
                    <td className="px-5 py-3 text-orange-400">{fmt(row.totalTax)}</td>
                  </tr>
                ))}
                <tr className="bg-zinc-800 font-bold">
                  <td className="px-5 py-3 text-white">Total</td>
                  <td className="px-5 py-3 text-white">{revenueData.reduce((s, r) => s + r.totalOrders, 0)}</td>
                  <td className="px-5 py-3 text-green-400">{fmt(revenueData.reduce((s, r) => s + r.totalRevenue, 0))}</td>
                  <td className="px-5 py-3 text-orange-400">{fmt(revenueData.reduce((s, r) => s + r.totalTax, 0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <p className="text-white font-semibold">GST Summary</p>
            </div>
            <ExportBtn
              onClick={() => handleExport(() => exportGSTPDF(dateRange), 'GST PDF')}
              loading={exportLoading === 'gst'}
              label="PDF"
              icon={Download}
              color="bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
            />
          </div>

          {gstLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-5 h-5 text-zinc-600 animate-spin mx-auto" />
            </div>
          ) : gstData?.summary ? (
            <div className="p-5 space-y-1">
              {[
                { label: 'Taxable Amount', value: fmt(gstData.summary.totalTaxableAmount), color: 'text-white'      },
                { label: 'CGST (2.5%)',    value: fmt(gstData.summary.cgst),               color: 'text-blue-400'  },
                { label: 'SGST (2.5%)',    value: fmt(gstData.summary.sgst),               color: 'text-blue-400'  },
                { label: 'Total GST',      value: fmt(gstData.summary.totalGST),           color: 'text-orange-400 text-base font-bold' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-zinc-800 last:border-0">
                  <p className="text-zinc-400 text-sm">{row.label}</p>
                  <p className={`text-sm ${row.color}`}>{row.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500 text-sm">No GST data</div>
          )}
        </div>

        
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-green-400" />
            <p className="text-white font-semibold">Payment Modes</p>
          </div>

          {paymentLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-5 h-5 text-zinc-600 animate-spin mx-auto" />
            </div>
          ) : !paymentData?.length ? (
            <div className="p-8 text-center">
              <CreditCard className="w-10 h-10 text-zinc-800 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm">No payment data for this period</p>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {(() => {
                const total = paymentData.reduce((s, p) => s + p.totalAmount, 0);
                return paymentData.map(pm => {
                  const pct     = total > 0 ? Math.round((pm.totalAmount / total) * 100) : 0;
                  const barColor = PM_COLORS[pm._id?.toLowerCase()] ?? 'bg-zinc-500';
                  return (
                    <div key={pm._id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${barColor}`} />
                          <span className="text-zinc-300 text-sm capitalize font-medium">
                            {pm._id || 'Unknown'}
                          </span>
                          <span className="text-zinc-600 text-xs">({pm.count} txns)</span>
                        </div>
                        <span className="text-white font-semibold text-sm">{fmt(pm.totalAmount)}</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2">
                        <div
                          className={`${barColor} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-zinc-600 text-xs mt-0.5 text-right">{pct}%</p>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>

      
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-orange-400" />
            <p className="text-white font-semibold">Top Selling Items</p>
          </div>
          <ExportBtn
            onClick={() => handleExport(() => exportTopItemsExcel(dateRange), 'Top Items')}
            loading={exportLoading === 'topItems'}
            label="Excel"
            icon={Download}
            color="bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
          />
        </div>

        {topLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-5 h-5 text-zinc-600 animate-spin mx-auto" />
          </div>
        ) : !topItems?.length ? (
          <div className="p-10 text-center">
            <ShoppingBag className="w-10 h-10 text-zinc-800 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">No items sold in this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-800">
                <tr>
                  {['Rank', 'Item Name', 'Qty Sold', 'Revenue'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-zinc-300 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topItems.map((item, idx) => (
                  <tr key={item._id} className={`border-b border-zinc-800 ${idx % 2 !== 0 ? 'bg-zinc-800/30' : ''}`}>
                    <td className="px-5 py-3">
                      <span className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        idx === 1 ? 'bg-zinc-400/20 text-zinc-300'    :
                        idx === 2 ? 'bg-orange-700/20 text-orange-400' :
                        'bg-zinc-800 text-zinc-500'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-white font-medium">{item._id}</td>
                    <td className="px-5 py-3 text-zinc-400">{item.totalQuantity}</td>
                    <td className="px-5 py-3 text-green-400 font-semibold">{fmt(item.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
