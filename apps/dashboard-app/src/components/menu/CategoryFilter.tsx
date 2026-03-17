import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Tag, X } from 'lucide-react';
import { useCategories } from '../../hooks/useMenuItems';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';

interface Props {
  selected: string;
  onChange: (id: string) => void;
}

const MAX_VISIBLE = 5;

export default function CategoryFilter({ selected, onChange }: Props) {
  const { data: categories = [] } = useCategories();
  const [showMore, setShowMore] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  //  Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/menu/categories/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted!');
    },
    onError: (error: unknown) => {
  const err = error as { response?: { data?: { message?: string } } };
  toast.error(err.response?.data?.message || 'Delete failed!');
},
  });

  const handleDelete = (id: string) => {
    if (confirm('Do you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  };

  const visibleCategories = categories.slice(0, MAX_VISIBLE);
  const hiddenCategories = categories.slice(MAX_VISIBLE);
  const hasMore = hiddenCategories.length > 0;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const CategoryButton = ({ cat }: { cat: { _id: string; name: string } }) => (
    <div className="relative group flex items-center">
      <button
        onClick={() => onChange(cat._id)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors pr-7 ${
          selected === cat._id
            ? 'bg-orange-500 text-white'
            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
        }`}
      >
        {cat.name}
      </button>
      <button
        onClick={() => handleDelete(cat._id)}
        title="Delete this category"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-500"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">

      <div className="flex items-center gap-1.5 text-zinc-400 text-sm mr-1">
        <Tag className="w-4 h-4" />
        <span>Categories:</span>
      </div>

      <button
        onClick={() => onChange('')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          selected === ''
            ? 'bg-orange-500 text-white'
            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
        }`}
      >
        All
      </button>

      {visibleCategories.map((cat) => (
        <CategoryButton key={cat._id} cat={cat} />
      ))}

      {hasMore && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowMore((prev) => !prev)}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showMore ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            +{hiddenCategories.length} More
            <ChevronDown className={`w-4 h-4 transition-transform ${showMore ? 'rotate-180' : ''}`} />
          </button>

          {showMore && (
            <div className="absolute top-11 left-0 z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl p-2 flex flex-col gap-1 min-w-[180px]">
              {hiddenCategories.map((cat) => (
                <div key={cat._id} className="relative group flex items-center">
                  <button
                    onClick={() => { onChange(cat._id); setShowMore(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors pr-8 ${
                      selected === cat._id ? 'bg-orange-500 text-white' : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {cat.name}
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
