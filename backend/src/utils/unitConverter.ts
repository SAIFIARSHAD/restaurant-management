// All units are convert into base units
// Weight base: g | Volume base: ml | Count base: piece

export const convertToBase = (quantity: number, unit: string): number => {
  switch (unit) {
    case 'kg':     return quantity * 1000;
    case 'g':      return quantity;
    case 'litre':  return quantity * 1000;
    case 'ml':     return quantity;
    case 'dozen':  return quantity * 12;
    case 'piece':  return quantity;
    case 'packet': return quantity;
    default:       return quantity;
  }
};

export const convertFromBase = (quantity: number, unit: string): number => {
  switch (unit) {
    case 'kg':     return quantity / 1000;
    case 'g':      return quantity;
    case 'litre':  return quantity / 1000;
    case 'ml':     return quantity;
    case 'dozen':  return quantity / 12;
    case 'piece':  return quantity;
    case 'packet': return quantity;
    default:       return quantity;
  }
};

// Main function — Use in orderController
export const calculateDeduction = (
  recipeQty: number,
  recipeUnit: string,
  stockUnit: string,
  orderQty: number
): number => {

  
  if (recipeUnit === stockUnit) {
    return recipeQty * orderQty;
  }

  // Different unit 
  const recipeInBase = convertToBase(recipeQty, recipeUnit);
  const totalBase = recipeInBase * orderQty;
  return convertFromBase(totalBase, stockUnit);
};
