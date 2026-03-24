import { useState } from 'react';
import { Plus, Search, ChefHat, BookOpen, TrendingUp } from 'lucide-react';
import RecipeTable  from '../../components/recipes/RecipeTable';
import RecipeModal  from '../../components/recipes/RecipeModal';
import { useRecipes, type Recipe } from '../../hooks/useRecipes';
import type { PopulatedMenuItem } from '../../hooks/useRecipes';

export default function RecipesPage() {
  const { data: recipes = [], isLoading } = useRecipes();
  const [showModal, setShowModal] = useState(false);
  const [search,    setSearch]    = useState('');

 const filtered = recipes.filter((r: Recipe) => {
  if (!r.menuItem) return false; 
  const name = typeof r.menuItem === 'string'
    ? r.menuItem
    : (r.menuItem as PopulatedMenuItem)?.name ?? ''; 
  return name.toLowerCase().includes(search.toLowerCase());
});

  const totalRecipes     = recipes.length;
  const totalIngredients = recipes.reduce((sum, r) => sum + r.ingredients.length, 0);
  const avgIngredients   = totalRecipes > 0
    ? (totalIngredients / totalRecipes).toFixed(1) : '0';

  const STATS = [
    { label: 'Total Recipes',         value: totalRecipes,     icon: BookOpen,   color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Total Ingredients Used', value: totalIngredients, icon: ChefHat,    color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    { label: 'Avg Ingredients/Recipe', value: avgIngredients,   icon: TrendingUp, color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20' },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Recipe Management</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Define ingredients and cost for each menu item
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Recipe
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`p-5 rounded-2xl border ${s.bg}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {s.label}
                </span>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recipe by menu item name..."
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto bg-zinc-900/50 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-zinc-700">
            <ChefHat className="w-10 h-10 text-zinc-600" />
          </div>
          <p className="text-zinc-400 text-lg font-semibold">No recipes found</p>
          <p className="text-zinc-600 text-sm mt-1">
            {search ? `No results for "${search}"` : 'No recipes have been created yet'}
          </p>
          {!search && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-5 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm"
            >
              + Create First Recipe
            </button>
          )}
        </div>
      )}

      
      {!isLoading && filtered.length > 0 && (
        <RecipeTable recipes={filtered} />
      )}

     
      {showModal && (
        <RecipeModal recipe={null} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
