"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getOrders = exports.createOrder = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const Cart_1 = __importDefault(require("../models/Cart"));
const createOrder = async (req, res) => {
    try {
        const cart = await Cart_1.default.findOne({
            user: req.user.id,
        }).populate("items.product");
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty",
            });
        }
        for (const item of cart.items) {
            const product = item.product;
            if (item.quantity > product.stock) {
                return res.status(400).json({
                    message: `${product.name} has only ${product.stock} left`,
                });
            }
        }
        const items = cart.items.map((item) => {
            const product = item.product;
            return {
                product: product._id,
                quantity: item.quantity,
                price: product.price,
            };
        });
        const totalAmount = cart.items.reduce((total, item) => {
            const product = item.product;
            return total + product.price * item.quantity;
        }, 0);
        const order = await Order_1.default.create({
            user: req.user.id,
            items,
            totalAmount,
        });
        for (const item of cart.items) {
            const product = item.product;
            product.stock -= item.quantity;
            await product.save();
        }
        cart.items = [];
        await cart.save();
        res.status(201).json(order);
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "Server error",
        });
    }
};
exports.createOrder = createOrder;
const getOrders = async (req, res) => {
    try {
        const orders = await Order_1.default.find({
            user: req.user.id,
        }).populate("items.product");
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "Server error",
        });
    }
};
exports.getOrders = getOrders;
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }
        order.status = status;
        await order.save();
        res.status(200).json(order);
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "Server error",
        });
    }
};
exports.updateOrderStatus = updateOrderStatus;
