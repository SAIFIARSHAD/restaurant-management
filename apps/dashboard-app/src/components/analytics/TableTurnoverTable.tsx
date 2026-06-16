interface Props {
  data: {
    tableNumber: string;
    floor?:      string;
    totalOrders: number;
    totalRevenue: number;
  }[];
}

export const TableTurnoverTable = ({ data }: Props) => (
  <div className="overflow-auto max-h-64">
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left border-b border-gray-700/60">
          <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Table</th>
          <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Floor</th>
          <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
          <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr
            key={i}
            className="border-b border-gray-700/40 last:border-0
                       hover:bg-gray-800/40 transition-colors duration-150"
          >
            <td className="py-2.5 font-semibold text-gray-200">
              Table {row.tableNumber}
            </td>
            <td className="py-2.5 text-gray-400">
              {row.floor ?? '—'}
            </td>
            <td className="py-2.5 text-gray-300">
              {row.totalOrders}
            </td>
            <td className="py-2.5 font-semibold text-emerald-400">
              ₹{row.totalRevenue.toLocaleString('en-IN')}
            </td>
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan={4} className="py-8 text-center text-gray-600 text-xs">
              No data for selected period
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);