import { X, RefreshCw, Download } from 'lucide-react';
import type { ITable } from '../../hooks/useTables';
import {useRegenerateQR } from '../../hooks/useTables';

interface Props {
  table: ITable;
  onClose: () => void;
}

export default function QRModal({ table, onClose }: Props) {
  const regenerateMutation = useRegenerateQR();

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = table.qrCodeUrl;
    link.download = `QR-${table.tableNumber}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-white font-bold text-lg">
            QR Code — {table.tableNumber}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-5">

          {/* QR Image */}
          {table.qrCodeUrl ? (
            <div className="p-4 bg-white rounded-2xl">
              <img
                src={table.qrCodeUrl}
                alt={`QR ${table.tableNumber}`}
                className="w-48 h-48"
              />
            </div>
          ) : (
            <div className="w-48 h-48 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600">
              No QR
            </div>
          )}

          {/* Table Info */}
          <div className="text-center">
            <p className="text-white font-bold text-xl">{table.tableNumber}</p>
            <p className="text-zinc-500 text-sm">{table.floor} • {table.capacity} seats</p>
          </div>

          {/* QR Options */}
          <div className="w-full space-y-2">

            {/* Scan Options Info */}
            <p className="text-zinc-400 font-semibold text-xs uppercase mb-2">Customer can do after scanning:</p>
            <div className="flex items-center gap-2 text-zinc-300">
            <span className="text-green-400">✓</span> View table info
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
            <span className="text-green-400">✓</span> Place self-order
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
            <span className="text-green-400">✓</span> Call the waiter
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold"
            >
              <Download className="w-4 h-4" />
              Download QR
            </button>
            <button
              onClick={() => regenerateMutation.mutate(table._id)}
              disabled={regenerateMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 rounded-xl text-sm font-semibold"
            >
              <RefreshCw className={`w-4 h-4 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
              {regenerateMutation.isPending ? 'Regenerating...' : 'Regenerate QR'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
