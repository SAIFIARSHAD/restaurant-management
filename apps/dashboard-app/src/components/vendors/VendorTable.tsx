import { useState } from 'react';
import { Pencil, Trash2, Phone, Mail, MapPin, Package } from 'lucide-react';
import { useDeleteVendor, type IVendor } from '../../hooks/useVendors';
import VendorModal from './VendorModal';

interface Props {
  vendors: IVendor[];
}

export default function VendorTable({ vendors }: Props) {
  const deleteMutation = useDeleteVendor();
  const [editVendor, setEditVendor] = useState<IVendor | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

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
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Vendor</th>
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Contact</th>
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Address</th>
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Materials</th>
              <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase font-semibold tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(vendor => (
              <tr key={vendor._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">

                {/* Vendor Name and Contact Person */}
                <td className="px-4 py-3">
                  <p className="text-white font-semibold text-sm">{vendor.name}</p>
                  {vendor.contactPerson && (
                    <p className="text-zinc-500 text-xs mt-0.5">{vendor.contactPerson}</p>
                  )}
                </td>

                
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-zinc-300 text-sm">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                    {vendor.phone}
                  </div>
                  {vendor.email && (
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs mt-1">
                      <Mail className="w-3 h-3" />
                      {vendor.email}
                    </div>
                  )}
                </td>

                
                <td className="px-4 py-3">
                  {vendor.address ? (
                    <div className="flex items-start gap-1.5 text-zinc-400 text-sm max-w-[160px]">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                      <span className="truncate">{vendor.address}</span>
                    </div>
                  ) : (
                    <span className="text-zinc-600 text-xs">—</span>
                  )}
                </td>

                
                <td className="px-4 py-3">
                  {vendor.materials.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {vendor.materials.slice(0, 3).map(m => (
                        <span
                          key={m._id}
                          className="flex items-center gap-1 px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded-md text-xs text-zinc-300"
                        >
                          <Package className="w-2.5 h-2.5 text-zinc-500" />
                          {m.name}
                        </span>
                      ))}
                      {vendor.materials.length > 3 && (
                        <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded-md text-xs text-zinc-500">
                          +{vendor.materials.length - 3} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-zinc-600 text-xs">No materials</span>
                  )}
                </td>

                
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditVendor(vendor)}
                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {confirmId === vendor._id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(vendor._id)}
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
                        onClick={() => setConfirmId(vendor._id)}
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
        </table>
      </div>

     
      {editVendor && (
        <VendorModal vendor={editVendor} onClose={() => setEditVendor(null)} />
      )}
    </>
  );
}
