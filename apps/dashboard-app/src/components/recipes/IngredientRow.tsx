import { Trash2 } from 'lucide-react';
import { SUB_UNITS, calcIngredientCost } from '../../utils/unitConversion';

interface RawMaterial {
  _id: string;
  name: string;
  unit: string;
  unitCost: number;
}

interface IngredientForm {
  rawMaterial: string;
  quantity: number;
  unit: string;
  selectedUnit: string;
  cost: number;
}

interface Props {
  index: number;
  ingredient: IngredientForm;
  materials: RawMaterial[];
  onChange: (index: number, field: keyof IngredientForm, value: string | number) => void;
  onFullChange: (index: number, updated: IngredientForm) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export default function IngredientRow({
  index, ingredient, materials, onFullChange, onRemove, canRemove,
}: Props) {

  const material = materials.find(m => m._id === ingredient.rawMaterial);
  const baseUnit = material?.unit || 'kg';
  const availableUnits = SUB_UNITS[baseUnit] || [baseUnit];

  
  const handleMaterialChange = (materialId: string) => {
    const selected = materials.find(m => m._id === materialId);
    const base = selected?.unit || 'kg';
    onFullChange(index, {
      rawMaterial: materialId,
      unit: base,
      selectedUnit: base,
      quantity: 0,
      cost: 0,
    });
  };


  const handleQtyChange = (qty: number) => {
    const cost = material
      ? calcIngredientCost(qty, ingredient.selectedUnit, material.unit, material.unitCost)
      : 0;
    onFullChange(index, { ...ingredient, quantity: qty, cost });
  };

  
  const handleUnitChange = (newUnit: string) => {
    const cost = material
      ? calcIngredientCost(ingredient.quantity, newUnit, material.unit, material.unitCost)
      : 0;
    onFullChange(index, { ...ingredient, selectedUnit: newUnit, cost });
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-center">

      
      <div className="col-span-5">
        <select
          value={ingredient.rawMaterial}
          onChange={(e) => handleMaterialChange(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
        >
          <option value="">Select ingredient...</option>
          {materials.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name} ({m.unit})
            </option>
          ))}
        </select>
      </div>

      
      <div className="col-span-3">
        <input
          type="number"
          min={0.01}
          step={0.01}
          value={ingredient.quantity || ''}
          onChange={(e) => handleQtyChange(parseFloat(e.target.value) || 0)}
          placeholder="Qty"
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
        />
      </div>

      
      <div className="col-span-2">
        <select
          value={ingredient.selectedUnit || baseUnit}
          onChange={(e) => handleUnitChange(e.target.value)}
          disabled={!ingredient.rawMaterial}
          className="w-full px-2 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 disabled:opacity-40"
        >
          {availableUnits.map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>

      
      <div className="col-span-1 text-right">
        {ingredient.cost > 0 ? (
          <span className="text-xs text-green-400 font-semibold">₹{ingredient.cost}</span>
        ) : (
          <span className="text-zinc-700 text-xs">—</span>
        )}
      </div>

      
      <div className="col-span-1 flex justify-center">
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-500 disabled:opacity-30 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
