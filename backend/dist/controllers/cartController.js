"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const Cart_1 = __importDefault(require("../models/Cart"));
const getCart = async (req, res) => {
    try {
        let cart = await Cart_1.default.findOne({ user: req.user.id }).populate("items.product");
        if (!cart) {
            cart = await Cart_1.default.create({
                user: req.user.id,
                items: [],
            });
        }
        res.status(200).json(cart);
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "Server error",
        });
    }
};
exports.getCart = getCart;
const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        let cart = await Cart_1.default.findOne({ user: req.user.id });
        if (!cart) {
            cart = await Cart_1.default.create({
                user: req.user.id,
                items: [{ product: productId, quantity: quantity || 1 }],
            });
        }
        else {
            const existingItem = cart.items.find((item) => item.product.toString() === productId);
            if (existingItem) {
                existingItem.quantity += quantity || 1;
            }
            else {
                cart.items.push({
                    product: productId,
                    quantity: quantity || 1,
                });
            }
            await cart.save();
        }
        cart = await cart.populate("items.product");
        res.status(200).json(cart);
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "Server error",
        });
    }
};
exports.addToCart = addToCart;
const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart_1.default.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        const item = cart.items.find((item) => item.product.toString() === req.params.productId);
        if (!item) {
            return res.status(404).json({ message: "Product not in cart" });
        }
        item.quantity = quantity;
        await cart.save();
        await cart.populate("items.product");
        res.status(200).json(cart);
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "Server error",
        });
    }
};
exports.updateCartItem = updateCartItem;
const removeFromCart = async (req, res) => {
    try {
        const cart = await Cart_1.default.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
        await cart.save();
        await cart.populate("items.product");
        res.status(200).json(cart);
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "Server error",
        });
    }
};
exports.removeFromCart = removeFromCart;
