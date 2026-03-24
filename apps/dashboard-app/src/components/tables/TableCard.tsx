import { Users, QrCode, GitMerge, Pencil, Trash2, } from 'lucide-react';
import type { ITable } from '../../hooks/useTables';

interface Props {
  table: ITable;
  isSelectMode: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (table: ITable) => void;
  onDelete: (id: string) => void;
  onViewQR: (table: ITable) => void;
  onStatusChange: (id: string, status: string) => void;
}

const STATUS_STYLES = {
  available: 'bg-green-500/10 border-green-500/40 text-green-400',
  occupied:  'bg-red-500/10 border-red-500/40 text-red-400',
  reserved:  'bg-yellow-500/10 border-yellow-500/40 text-yellow-400',
  inactive:  'bg-zinc-500/10 border-zinc-500/40 text-zinc-400',
};

const STATUS_DOT = {
  available: 'bg-green-400',
  occupied:  'bg-red-400',
  reserved:  'bg-yellow-400',
  inactive:  'bg-zinc-500',
};

export default function TableCard({
  table, isSelectMode, isSelected,
  onSelect, onEdit, onDelete, onViewQR, onStatusChange
}: Props) {

  return (
    <div
      onClick={() => isSelectMode && onSelect(table._id)}
      className={`relative bg-zinc-900 border rounded-2xl p-5 transition-all cursor-pointer group
        ${isSelectMode
          ? isSelected
            ? 'border-orange-500 ring-2 ring-orange-500/30'
            : 'border-zinc-700 hover:border-orange-400'
          : 'border-zinc-800 hover:border-zinc-600'
        }
      `}
    >
      {/* Select Checkbox */}
      {isSelectMode && (
        <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center
          ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-zinc-600'}`}
        >
          {isSelected && <span className="text-white text-xs">✓</span>}
        </div>
      )}

      {/* Merged Badge */}
      {table.mergedWith?.length > 0 && (
        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 border border-purple-500/40 text-purple-400 text-xs rounded-full font-semibold">
            <GitMerge className="w-3 h-3" />
            Merged
          </span>
        </div>
      )}

      {/* Table Number */}
      <div className="text-center mb-4 mt-2">
        <div className="text-3xl font-black text-white">{table.tableNumber}</div>
        <div className="text-zinc-500 text-xs mt-1">{table.floor}</div>
      </div>

      {/* Status Badge */}
      <div className="flex justify-center mb-4">
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold capitalize ${STATUS_STYLES[table.status]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[table.status]}`} />
          {table.status}
        </span>
      </div>

      {/* Capacity */}
      <div className="flex items-center justify-center gap-1.5 text-zinc-500 text-sm mb-4">
        <Users className="w-4 h-4" />
        <span>{table.capacity} seats</span>
      </div>

      {/* Status Quick Change */}
      {!isSelectMode && (
        <select
          value={table.status}
          onChange={(e) => onStatusChange(table._id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-xs focus:outline-none focus:border-orange-500 mb-3"
        >
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="reserved">Reserved</option>
          <option value="inactive">Inactive</option>
        </select>
      )}

      {/* Action Buttons */}
      {!isSelectMode && (
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onViewQR(table); }}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-zinc-800 hover:bg-blue-500/20 hover:text-blue-400 text-zinc-400 rounded-lg text-xs transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            QR
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(table); }}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-zinc-800 hover:bg-orange-500/20 hover:text-orange-400 text-zinc-400 rounded-lg text-xs transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(table._id); }}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 rounded-lg text-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Del
          </button>
        </div>
      )}
    </div>
  );
}
