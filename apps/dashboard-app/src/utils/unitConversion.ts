export const SUB_UNITS: Record<string, string[]> = {
  kg:     ['kg', 'g'],
  g:      ['g'],
  litre:  ['litre', 'ml'],
  ml:     ['ml'],
  dozen:  ['dozen', 'piece'],
  piece:  ['piece'],
  packet: ['packet'],
};


export const convertToBaseUnit = (
  qty: number,
  fromUnit: string,
  toUnit: string
): number => {
  if (fromUnit === toUnit) return qty;
  if (fromUnit === 'g'     && toUnit === 'kg')    return qty / 1000;
  if (fromUnit === 'ml'    && toUnit === 'litre') return qty / 1000;
  if (fromUnit === 'piece' && toUnit === 'dozen') return qty / 12;
 
  if (fromUnit === 'kg'    && toUnit === 'g')     return qty * 1000;
  if (fromUnit === 'litre' && toUnit === 'ml')    return qty * 1000;
  if (fromUnit === 'dozen' && toUnit === 'piece') return qty * 12;
  return qty;
};

export const calcIngredientCost = (
  qty: number,
  selectedUnit: string,
  baseUnit: string,
  unitCost: number
): number => {
  const qtyInBase = convertToBaseUnit(qty, selectedUnit, baseUnit);
  return parseFloat((qtyInBase * unitCost).toFixed(2));
};
