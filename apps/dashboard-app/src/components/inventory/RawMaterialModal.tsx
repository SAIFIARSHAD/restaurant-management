import { useState, useMemo, useRef, useEffect } from 'react';
import { X, ChevronDown, Store, Building2, Check } from 'lucide-react';
import {
  useAddMaterial,
  useUpdateMaterial,
  type RawMaterial,
} from '../../hooks/useInventory';
import { useVendors } from '../../hooks/useVendors';

interface Props {
  item: RawMaterial | null;
  onClose: () => void;
}

const UNITS: RawMaterial['unit'][] = ['kg', 'g', 'litre', 'ml', 'piece', 'dozen', 'packet'];
const LOCAL_MARKET = 'Other / Local Market';

export default function RawMaterialModal({ item, onClose }: Props) {
  const addMutation    = useAddMaterial();
  const updateMutation = useUpdateMaterial();
  const { data: vendors = [] } = useVendors();
  const isEdit = !!item;

  const initialForm = useMemo(() => ({
    name:             item?.name             ?? '',
    unit:             item?.unit             ?? 'kg' as RawMaterial['unit'],
    currentStock:     item?.currentStock     ?? 0,
    minThreshold:     item?.minThreshold     ?? 0,
    unitCost:         item?.unitCost         ?? 0,
    supplier:         item?.supplier         ?? '',
    lastPurchaseDate: item?.lastPurchaseDate
      ? new Date(item.lastPurchaseDate).toISOString().split('T')[0]
      : '',
  }), [item]);

  const [form, setForm]               = useState(initialForm);
  const [supplierSearch, setSupplierSearch] = useState(item?.supplier ?? '');
  const [dropdownOpen, setDropdownOpen]     = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filter vendors based on search input
  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const selectSupplier = (name: string) => {
    setForm(prev => ({ ...prev, supplier: name }));
    setSupplierSearch(name);
    setDropdownOpen(false);
  };

  const set = (field: string, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      lastPurchaseDate: form.lastPurchaseDate || undefined,
      supplier: form.supplier || undefined,
    };
    if (isEdit) {
      await updateMutation.mutateAsync({ id: item!._id, payload });
    } else {
      await addMutation.mutateAsync(payload);
    }
    onClose();
  };

  const loading = addMutation.isPending || updateMutation.isPending;
  const isSupplierValid = !!form.supplier;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">
              {isEdit ? 'Edit Raw Material' : 'Add Raw Material'}
            </h2>
            <p className="text-zinc-500 text-sm mt-0.5">
              {isEdit ? 'Update material details' : 'Add a new item to your inventory'}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">

          
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Material Name *
            </label>
            <input
              required
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Paneer, Tomato, Rice"
              className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

         
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Unit *</label>
              <select
                value={form.unit}
                onChange={e => set('unit', e.target.value)}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
              >
                {UNITS.map(u => (
                  <option key={u} value={u} className="bg-zinc-900">{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Unit Cost (₹) *
              </label>
              <input
                required
                type="number"
                min={0}
                step={0.01}
                value={form.unitCost}
                onChange={e => set('unitCost', parseFloat(e.target.value))}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Current Stock *
              </label>
              <input
                required
                type="number"
                min={0}
                step={0.1}
                value={form.currentStock}
                onChange={e => set('currentStock', parseFloat(e.target.value))}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Min Threshold *
              </label>
              <input
                required
                type="number"
                min={0}
                step={0.1}
                value={form.minThreshold}
                onChange={e => set('minThreshold', parseFloat(e.target.value))}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          
          <div ref={dropdownRef}>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Supplier *
            </label>

            
            {form.supplier && !dropdownOpen && (
              <div className="mt-1.5 flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-orange-500/50 rounded-xl">
                {form.supplier === LOCAL_MARKET
                  ? <Store className="w-4 h-4 text-yellow-400 shrink-0" />
                  : <Building2 className="w-4 h-4 text-orange-400 shrink-0" />
                }
                <span className="text-white text-sm font-medium flex-1">{form.supplier}</span>
                <button
                  type="button"
                  onClick={() => {
                    setForm(prev => ({ ...prev, supplier: '' }));
                    setSupplierSearch('');
                    setDropdownOpen(true);
                  }}
                  className="text-zinc-500 hover:text-white text-xs"
                >
                  Change
                </button>
              </div>
            )}

            
            {(!form.supplier || dropdownOpen) && (
              <div className="relative mt-1.5">
                <input
                  type="text"
                  value={supplierSearch}
                  onChange={e => {
                    setSupplierSearch(e.target.value);
                    setForm(prev => ({ ...prev, supplier: '' }));
                    setDropdownOpen(true);
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder="Type to search vendors..."
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 pr-10"
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />

                
                {dropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">

                    {/* Registered vendors */}
                    {filteredVendors.length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 text-xs text-zinc-600 uppercase font-semibold tracking-wider border-b border-zinc-800">
                          Registered Vendors
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                          {filteredVendors.map(v => (
                            <button
                              key={v._id}
                              type="button"
                              onClick={() => selectSupplier(v.name)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800 transition-colors text-left"
                            >
                              <Building2 className="w-4 h-4 text-orange-400 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{v.name}</p>
                                {v.contactPerson && (
                                  <p className="text-zinc-500 text-xs truncate">{v.contactPerson} • {v.phone}</p>
                                )}
                              </div>
                              {form.supplier === v.name && (
                                <Check className="w-4 h-4 text-orange-400 shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    
                    {filteredVendors.length === 0 && supplierSearch && (
                      <div className="px-4 py-3 text-zinc-500 text-sm text-center">
                        No vendors found for "{supplierSearch}"
                      </div>
                    )}

                    
                    <div className="border-t border-zinc-800" />

                    
                    <button
                      type="button"
                      onClick={() => selectSupplier(LOCAL_MARKET)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800 transition-colors text-left"
                    >
                      <Store className="w-4 h-4 text-yellow-400 shrink-0" />
                      <div className="flex-1">
                        <p className="text-yellow-400 text-sm font-semibold">Other / Local Market</p>
                        <p className="text-zinc-500 text-xs">No registered vendor</p>
                      </div>
                      {form.supplier === LOCAL_MARKET && (
                        <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            
            {!isSupplierValid && (
              <p className="text-xs text-zinc-600 mt-1">
                Select a registered vendor or choose "Other / Local Market"
              </p>
            )}
          </div>

          {/* Last Purchase Date */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Last Purchase Date (Optional)
            </label>
            <input
              type="date"
              value={form.lastPurchaseDate}
              onChange={e => set('lastPurchaseDate', e.target.value)}
              className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-semibold text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={loading || !isSupplierValid}
            className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Material' : 'Add Material'}
          </button>
        </div>
      </div>
    </div>
  );
}
