import mongoose, { Document } from "mongoose";

export interface IProduct extends Document{
  name: string;
  price: number;
  category: string;
  image?: string;
  stock: number;
}

const productSchema = new mongoose.Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },

  category: {
    type: String,
    required: true,
    trim: true,
  },

  image: {
    type: String,
  },

  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
});

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;