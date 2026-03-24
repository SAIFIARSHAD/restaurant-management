import { useState, useMemo } from 'react';
import { X, Plus } from 'lucide-react';
import { useCreateRecipe, useUpdateRecipe, type Recipe, type PopulatedMenuItem } from '../../hooks/useRecipes';
import { useInventory } from '../../hooks/useInventory';
import IngredientRow from './IngredientRow';
import { useAuthStore } from '../../store/authStore';
import { convertToBaseUnit } from '../../utils/unitConversion';


interface MenuItemOption {
  _id: string;
  name: string;
  base_price?: number;
  price?: number;
}


interface IngredientForm {
  rawMaterial: string;
  quantity: number;
  unit: string;         
  selectedUnit: string; 
  cost: number;         
}

interface Props {
  recipe: Recipe | null;
  onClose: () => void;
}


const EMPTY_ING: IngredientForm = {
  rawMaterial: '',
  quantity: 0,
  unit: '',
  selectedUnit: '',
  cost: 0,
};

export default function RecipeModal({ recipe, onClose }: Props) {
  const createMutation = useCreateRecipe();
  const updateMutation = useUpdateRecipe();
  const { data: materials = [] } = useInventory();
  const isEdit = !!recipe;

  const [menuItems,   setMenuItems]   = useState<MenuItemOption[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);

  const initialMenuItem = useMemo(() => {
    if (!recipe) return '';
    if (typeof recipe.menuItem === 'string') return recipe.menuItem;
    return (recipe.menuItem as PopulatedMenuItem)._id;
  }, [recipe]);

  
  const initialIngredients = useMemo<IngredientForm[]>(() => {
    if (!recipe || recipe.ingredients.length === 0) return [{ ...EMPTY_ING }];
    return recipe.ingredients.map(i => {
      const rmId = typeof i.rawMaterial === 'string'
        ? i.rawMaterial
        : (i.rawMaterial as { _id: string })._id;
      return {
        rawMaterial: rmId,
        quantity: i.quantity,
        unit: i.unit,
        selectedUnit: i.unit, 
        cost: 0,
      };
    });
  }, [recipe]);

  const [menuItem,     setMenuItem]    = useState(initialMenuItem);
  const [ingredients,  setIngredients] = useState<IngredientForm[]>(initialIngredients);

  const { user } = useAuthStore();

  
  useMemo(() => {
    if (!user?.restaurant) return;
    import('../../api/axios').then(({ default: api }) => {
      setMenuLoading(true);
      api.get(`/menu/items/${user.restaurant}`)
        .then(({ data }) => {
          const items: MenuItemOption[] = Array.isArray(data)
            ? data
            : data?.items ?? data?.menuItems ?? data?.data ?? [];
          setMenuItems(items);
        })
        .catch((err) => console.error(' Menu items error:', err))
        .finally(() => setMenuLoading(false));
    });
  }, [user?.restaurant]);

  
  const handleFullChange = (index: number, updated: IngredientForm) => {
  setIngredients(prev => prev.map((ing, i) => i === index ? updated : ing));
};

  // legacy handler (fallback)
  const handleChange = (index: number, field: keyof IngredientForm, value: string | number) => {
    setIngredients(prev =>
      prev.map((ing, i) => i === index ? { ...ing, [field]: value } : ing)
    );
  };

  const handleAdd    = () => setIngredients(prev => [...prev, { ...EMPTY_ING }]);
  const handleRemove = (index: number) =>
    setIngredients(prev => prev.filter((_, i) => i !== index));

  
  const totalCost = ingredients.reduce((sum, ing) => sum + (ing.cost || 0), 0);

  const selectedItem = menuItems.find((m: MenuItemOption) => m._id === menuItem);
  const sellingPrice = selectedItem?.base_price || selectedItem?.price || 0;
  const profitMargin = sellingPrice > 0
    ? ((sellingPrice - totalCost) / sellingPrice * 100)
    : null;

  
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
             

  const validIngredients = ingredients
    .filter(i => i.rawMaterial && i.quantity > 0)
    .map(i => {
      const mat = materials.find(m => m._id === i.rawMaterial);
      const baseUnit = mat?.unit || i.unit;
      const converted = convertToBaseUnit(i.quantity, i.selectedUnit, baseUnit);
      console.log(`📊 ${mat?.name}: ${i.quantity}${i.selectedUnit} → ${converted}${baseUnit}`); // ✅
      return {
        rawMaterial: i.rawMaterial,
        quantity: converted,
        unit: baseUnit,
        cost: i.cost,
      };
    });

     if (isEdit) {
    await updateMutation.mutateAsync({ id: recipe!._id, ingredients: validIngredients });
  } else {
    await createMutation.mutateAsync({ menuItem, ingredients: validIngredients });
  }
  onClose();
};

  const editItemName = isEdit
    ? typeof recipe!.menuItem === 'string'
      ? ''
      : (recipe!.menuItem as PopulatedMenuItem).name
    : '';

  const loading = createMutation.isPending || updateMutation.isPending;
  const hasValidIngredients = ingredients.some(i => i.rawMaterial && i.quantity > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">
              {isEdit ? ' Edit Recipe' : ' Create Recipe'}
            </h2>
            <p className="text-zinc-500 text-sm mt-0.5">
            {isEdit
                ? `Update ingredients for ${editItemName}`
                : 'Define ingredients for the selected menu item'
            }
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">

          
          {!isEdit && (
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Menu Item *
              </label>
              <select
                required
                value={menuItem}
                onChange={(e) => setMenuItem(e.target.value)}
                disabled={menuLoading}
                className="mt-1.5 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 disabled:opacity-60"
              >
                <option value="" className="bg-zinc-900">
                  {menuLoading ? 'Loading...' : 'Select menu item...'}
                </option>
                {menuItems.map((item: MenuItemOption) => (
                  <option key={item._id} value={item._id} className="bg-zinc-900">
                    {item.name} — ₹{item.base_price || item.price || 0}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Ingredients *
              </label>
              <button
                type="button"
                onClick={handleAdd}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-semibold rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Ingredient
              </button>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-12 gap-2 mb-2 px-1">
              <div className="col-span-5 text-xs text-zinc-600 uppercase tracking-wider font-semibold">Raw Material</div>
              <div className="col-span-3 text-xs text-zinc-600 uppercase tracking-wider font-semibold">Quantity</div>
              <div className="col-span-2 text-xs text-zinc-600 uppercase tracking-wider font-semibold">Unit</div>
              <div className="col-span-1 text-xs text-zinc-600 uppercase tracking-wider font-semibold text-right">Cost</div>
              <div className="col-span-1"></div>
            </div>

            <div className="space-y-2">
              {ingredients.map((ing, index) => (
               <IngredientRow
                key={index}
                index={index}
                ingredient={ing}
                materials={materials}
                onChange={handleChange}         
                onFullChange={handleFullChange} 
                onRemove={handleRemove}
                canRemove={ingredients.length > 1}
                />
              ))}
            </div>
          </div>

          
          {totalCost > 0 && (
            <div className="p-4 bg-zinc-900/60 border border-zinc-700/40 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-sm">Recipe Cost:</span>
                <span className="text-orange-400 text-lg font-bold">₹{totalCost.toFixed(2)}</span>
              </div>
              {sellingPrice > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">Selling Price:</span>
                  <span className="text-white text-sm font-semibold">₹{sellingPrice}</span>
                </div>
              )}
              {profitMargin !== null && (
                <div className="flex items-center justify-between pt-1 border-t border-zinc-700/50">
                  <span className="text-zinc-400 text-sm">Profit Margin:</span>
                  <span className={`text-sm font-bold ${
                    profitMargin >= 60 ? 'text-green-400' :
                    profitMargin >= 30 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {profitMargin.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          )}
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
            disabled={loading || (!isEdit && !menuItem) || !hasValidIngredients}
            className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Recipe' : 'Create Recipe'}
          </button>
        </div>
      </div>
    </div>
  );
}
