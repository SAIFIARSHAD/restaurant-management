// apps/dashboard-app/src/components/vendors/VendorModal.tsx
import { useState, useMemo } from 'react';
import { X, Plus } from 'lucide-react';
import { useCreateVendor, useUpdateVendor, type IVendor, type UpdateVendorPayload } from '../../hooks/useVendors';
import { useInventory } from '../../hooks/useInventory';

interface Props {
  vendor: IVendor | null;
  onClose: () => void;
}

interface FormState {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  materials: string[];
}

const EMPTY: FormState = {
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  materials: [],
};

export default function VendorModal({ vendor, onClose }: Props) {
  const isEdit = !!vendor;
  const createMutation = useCreateVendor();
  const updateMutation = useUpdateVendor();
  const { data: materials = [] } = useInventory();

  const initial = useMemo<FormState>(() => {
    if (!vendor) return EMPTY;
    return {
      name:          vendor.name,
      contactPerson: vendor.contactPerson ?? '',
      phone:         vendor.phone,
      email:         vendor.email ?? '',
      address:       vendor.address ?? '',
      materials:     vendor.materials.map(m => m._id),
    };
  }, [vendor]);

  const [form, setForm] = useState<FormState>(initial);

  const set = (field: keyof FormState, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const toggleMaterial = (id: string) =>
    setForm(prev => ({
      ...prev,
      materials: prev.materials.includes(id)
        ? prev.materials.filter(m => m !== id)
        : [...prev.materials, id],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      const payload: UpdateVendorPayload = { id: vendor!._id, ...form };
        await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(form);
    }
    onClose();
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">
              {isEdit ? 'Edit Vendor' : 'Add Vendor'}
            </h2>
            <p className="text-zinc-500 text-sm mt-0.5">
              {isEdit ? 'Update vendor details' : 'Add a new supplier to your vendor list'}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Vendor Name *
            </label>
            <input
              required
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Arjun Traders"
              className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Contact Person */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Contact Person
            </label>
            <input
              value={form.contactPerson}
              onChange={e => set('contactPerson', e.target.value)}
              placeholder="e.g. Arjun Kumar"
              className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Phone *
              </label>
              <input
                required
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="98XXXXXXXX"
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="vendor@email.com"
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Address
            </label>
            <textarea
              rows={2}
              value={form.address}
              onChange={e => set('address', e.target.value)}
              placeholder="Shop address..."
              className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          {/* Materials (multi-select chips) */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
              Supplies These Materials
            </label>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
              {materials.map(m => {
                const selected = form.materials.includes(m._id);
                return (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => toggleMaterial(m._id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                      selected
                        ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    {selected && <Plus className="w-3 h-3 inline mr-1 rotate-0" />}
                    {m.name}
                  </button>
                );
              })}
              {materials.length === 0 && (
                <p className="text-zinc-600 text-xs">No raw materials found in inventory</p>
              )}
            </div>
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
            disabled={loading || !form.name || !form.phone}
            className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Vendor' : 'Add Vendor'}
          </button>
        </div>
      </div>
    </div>
  );
}
