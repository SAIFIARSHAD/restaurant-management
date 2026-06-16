import { useState } from 'react';
import { Pencil, Trash2, ChefHat } from 'lucide-react';
import RecipeModal from './RecipeModal';
import { useDeleteRecipe, type Recipe, type PopulatedMenuItem, type PopulatedRawMaterial,type RecipeIngredient, } from '../../hooks/useRecipes';

interface Props {
  recipes: Recipe[];
}

export default function RecipeTable({ recipes }: Props) {
  const deleteMutation = useDeleteRecipe();
  const [editItem, setEditItem] = useState<Recipe | null>(null);

  
  const getMenuItemName = (menuItem: Recipe['menuItem']) => {
  if (typeof menuItem === 'string') return '—';
  return (menuItem as PopulatedMenuItem).name || '—'; 
};

  const getMenuItemPrice = (menuItem: Recipe['menuItem']) => {
  if (typeof menuItem === 'string') return 0;
  return (menuItem as PopulatedMenuItem).price || 0; 
};

  const getRecipeCost = (ingredients: Recipe['ingredients']) => {
    return ingredients.reduce((sum, ing) => {
      if (typeof ing.rawMaterial === 'string') return sum;
      const mat = ing.rawMaterial as PopulatedRawMaterial;
      return sum + (mat.unitCost || 0) * ing.quantity;
    }, 0);
  };

  const getMaterialName = (rawMaterial: RecipeIngredient['rawMaterial']) => {
  if (typeof rawMaterial === 'string') return 'Unknown';
  return (rawMaterial as PopulatedRawMaterial).name || 'Unknown'; 
};

  const handleDelete = async (id: string) => {
    if (confirm('Delete this recipe?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <>
      <div className="space-y-3">
        {recipes.map((recipe) => {
          const itemName   = getMenuItemName(recipe.menuItem);
          const itemPrice  = getMenuItemPrice(recipe.menuItem);
          const recipeCost = getRecipeCost(recipe.ingredients);
          const margin     = itemPrice > 0
            ? ((itemPrice - recipeCost) / itemPrice * 100)
            : null;

          return (
            <div
              key={recipe._id}
              className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <ChefHat className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{itemName}</h3>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                
                <div className="flex items-center gap-3 flex-wrap justify-end">

                  
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Recipe Cost</p>
                    <p className="text-orange-400 font-bold text-sm">
                      ₹{recipeCost.toFixed(2)}
                    </p>
                  </div>

                  {/* Selling Price */}
                  {itemPrice > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">Selling Price</p>
                      <p className="text-white font-bold text-sm">₹{itemPrice}</p>
                    </div>
                  )}

                  {/* Margin Badge */}
                  {margin !== null && (
                    <span className={`px-2.5 py-1 rounded-xl border text-xs font-bold ${
                      margin >= 60 ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                      margin >= 30 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                                    'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                      {margin.toFixed(1)}% margin
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditItem(recipe)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-orange-500/20 hover:text-orange-400 text-zinc-400 transition-colors"
                      title="Edit Recipe"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(recipe._id)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 transition-colors"
                      title="Delete Recipe"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Ingredient Pills */}
              <div className="flex flex-wrap gap-2">
                {recipe.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-zinc-800/80 border border-zinc-700/50 text-zinc-300 text-xs rounded-full"
                  >
                    {getMaterialName(ing.rawMaterial)} — {ing.quantity} {ing.unit}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {editItem && (
        <RecipeModal recipe={editItem} onClose={() => setEditItem(null)} />
      )}
    </>
  );
}
