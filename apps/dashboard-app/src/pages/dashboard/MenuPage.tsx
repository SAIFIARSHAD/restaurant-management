import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import CategoryFilter from '../../components/menu/CategoryFilter';
import MenuItemCard from '../../components/menu/MenuItemCard';
import MenuItemModal from '../../components/menu/MenuItemModal';
import {
  type MenuItem,
  useMenuItems,
  useAddMenuItem,
  useEditMenuItem,
  useDeleteMenuItem,
  useToggleAvailability,
} from '../../hooks/useMenuItems';

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);

  const { data: items = [], isLoading } = useMenuItems(selectedCategory);
  const addMutation = useAddMenuItem();
  const editMutation = useEditMenuItem();
  const deleteMutation = useDeleteMenuItem();
  const toggleMutation = useToggleAvailability();

  // Search filter
  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (formData: FormData) => {
    if (editItem) {
      editMutation.mutate(
        { id: editItem._id, formData },
        { onSuccess: () => { setModalOpen(false); setEditItem(null); } }
      );
    } else {
      addMutation.mutate(formData, {
        onSuccess: () => setModalOpen(false),
      });
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditItem(item);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this item?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
  const newStatus = !currentStatus; 
  toggleMutation.mutate({ id, isAvailable: newStatus });
};

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Menu Management</h1>
        <button
          onClick={() => { setEditItem(null); setModalOpen(true); }}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search menu items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Category Filter */}
      <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />

      {/* Items Count */}
      <p className="text-zinc-500 text-sm">{filtered.length} items found</p>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-zinc-500 text-lg">No menu items found</p>
          <p className="text-zinc-600 text-sm mt-1">Add your first item!</p>
        </div>
      )}

      {/* Items Grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <MenuItemCard
            key={`${item._id}-${item.isAvailable}`}
              //key={item._id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <MenuItemModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        onSubmit={handleSubmit}
        editItem={editItem}
        isLoading={addMutation.isPending || editMutation.isPending}
      />
    </div>
  );
}