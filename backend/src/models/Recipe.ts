import mongoose, { Document, Schema } from 'mongoose';

export interface IIngredient {
  rawMaterial: mongoose.Types.ObjectId;
  quantity: number;
  unit: 'kg' | 'g' | 'litre' | 'ml' | 'piece' | 'dozen' | 'packet';
}

export interface IRecipe extends Document {
  restaurant: mongoose.Types.ObjectId;
  menuItem: mongoose.Types.ObjectId;
  ingredients: IIngredient[];
  isActive: boolean;
}

const IngredientSchema = new Schema<IIngredient>({
  rawMaterial: {
    type: Schema.Types.ObjectId,
    ref: 'RawMaterial',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    enum: ['kg', 'g', 'litre', 'ml', 'piece', 'dozen', 'packet'],
    required: true
  }
});

const RecipeSchema = new Schema<IRecipe>(
  {
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    menuItem: {
      type: Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
      unique: true  // One MenuItem Only One recipe
    },
    ingredients: [IngredientSchema],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model<IRecipe>('Recipe', RecipeSchema);
