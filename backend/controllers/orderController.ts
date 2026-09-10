import { Request, Response } from "express";
import Order from "../models/Order";
import Cart from "../models/Cart";

const createOrder = async (req: Request, res: Response) => {
  try {
    const cart = await Cart.findOne({
      user: req.user!.id,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    for (const item of cart.items) {
      const product = item.product as any;

      if (item.quantity > product.stock) {
        return res.status(400).json({
          message: `${product.name} has only ${product.stock} left`,
        });
      }
    }

    const items = cart.items.map((item) => {
      const product = item.product as any;

      return {
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const totalAmount = cart.items.reduce(
      (total, item) => {
        const product = item.product as any;
        return total + product.price * item.quantity;
      },
      0
    );

    const order = await Order.create({
      user: req.user!.id,
      items,
      totalAmount,
    });

    for (const item of cart.items) {
      const product = item.product as any;
      product.stock -= item.quantity;
      await product.save();
    }

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

const getOrders = async (req: Request, res: Response)=> {
  try {
    const orders = await Order.find({
      user: req.user!.id,
    }).populate("items.product");

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.status = status;

    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export {
  createOrder,
  getOrders,
  updateOrderStatus,
};