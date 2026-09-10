import mongoose, { Document, Types } from "mongoose";
import { IProduct } from "./Product";

interface ICartItem {
  product: Types.ObjectId | IProduct;
  quantity: number;
}

interface ICart extends Document {
  user: Types.ObjectId;
  items: ICartItem[];
}

const cartItemSchema = new mongoose.Schema<ICartItem>({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
});

const cartSchema = new mongoose.Schema<ICart>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

const Cart = mongoose.model<ICart>("Cart", cartSchema);

export default Cart;