import { useRef, useState, useEffect } from 'react';
import { X, Upload, Check } from 'lucide-react';
import { type MenuItem, useCategories, useAddCategory } from '../../hooks/useMenuItems';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  editItem?: MenuItem | null;
  isLoading?: boolean;
}

const getInitialForm = (item: MenuItem | null | undefined) => ({
  name: item?.name ?? '',
  price: item ? String(item.price) : '',
  category: item?.category?._id ?? '',
  description: item?.description ?? '',
  isVeg: item?.isVeg ?? true,
  isAvailable: item?.isAvailable ?? true,
});

export default function MenuItemModal({ isOpen, onClose, onSubmit, editItem, isLoading }: Props) {
  const { data: categories = [] } = useCategories();
  const addCategoryMutation = useAddCategory(); // ✅ Hook se direct use karo
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(() => getInitialForm(editItem));
  const [preview, setPreview] = useState<string | null>(editItem?.image ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    setForm(getInitialForm(editItem));
    setPreview(editItem?.image ?? null);
    setFile(null);
    setShowNewCategory(false);
    setNewCategoryName('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editItem, isOpen]);

  
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    addCategoryMutation.mutate(newCategoryName.trim(), {
      onSuccess: (data) => {
        const newId = data?.data?._id || data?._id;
        if (newId) setForm((f) => ({ ...f, category: newId }));
        setNewCategoryName('');
        setShowNewCategory(false);
      },
    });
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('price', form.price);
    fd.append('category', form.category);
    fd.append('description', form.description);
    fd.append('isVeg', String(form.isVeg));
    fd.append('isAvailable', String(form.isAvailable));
    if (file) fd.append('image', file);
    onSubmit(fd);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 relative">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg">
            {editItem ? 'Edit Menu Item' : 'Add Menu Item'}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Image Upload */}
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full h-32 rounded-xl border-2 border-dashed border-zinc-700 hover:border-orange-500 flex items-center justify-center cursor-pointer overflow-hidden transition-colors"
          >
            {preview ? (
              <img src={preview} className="w-full h-full object-cover" alt="preview" />
            ) : (
              <div className="flex flex-col items-center text-zinc-500">
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-xs">Upload Image</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />

          {/* Name */}
          <input
            type="text"
            placeholder="Item Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />

          {/* Price + Category */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Price (₹)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />

            {/* Category Dropdown OR Inline Create */}
            {!showNewCategory ? (
              <select
                value={form.category}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setShowNewCategory(true);
                  } else {
                    setForm({ ...form, category: e.target.value });
                  }
                }}
                required
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
                <option value="__new__">+ Create New Category</option>
              </select>
            ) : (
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()} 
                  autoFocus
                  className="flex-1 bg-zinc-800 border border-orange-500 rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none min-w-0"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim() || addCategoryMutation.isPending}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-2.5 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewCategory(false); setNewCategoryName(''); }}
                  className="bg-zinc-700 hover:bg-zinc-600 text-white px-2.5 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-orange-500 resize-none"
          />

          {/* Veg + Available */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isVeg}
                onChange={(e) => setForm({ ...form, isVeg: e.target.checked })}
                className="accent-green-500"
              />
              <span className="text-zinc-300 text-sm">Veg</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                className="accent-orange-500"
              />
              <span className="text-zinc-300 text-sm">Available</span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : editItem ? 'Update Item' : 'Add Item'}
          </button>
        </form>
      </div>
    </div>
  );
}
