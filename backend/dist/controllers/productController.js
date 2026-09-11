"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const getProducts = async (req, res) => {
    try {
        const products = await Product_1.default.find();
        res.status(200).json(products);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to get products"
        });
    }
};
exports.getProducts = getProducts;
const createProduct = async (req, res) => {
    try {
        console.log("Received by backend:", req.body);
        const product = await Product_1.default.create(req.body);
        res.status(201).json(product);
    }
    catch (error) {
        console.error("Create product error:", error);
        res.status(500).json({
            message: "Failed to create product",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const product = await Product_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        res.status(200).json(product);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to update product"
        });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const product = await Product_1.default.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        res.status(200).json({
            message: "Product deleted successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to delete product"
        });
    }
};
exports.deleteProduct = deleteProduct;
