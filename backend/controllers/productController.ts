import { Request, Response } from "express";

import Product from "../models/Product";

const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await Product.find();

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get products"
        });
    }
};

const createProduct = async (req: Request, res: Response) => {
    try {
        console.log("Received by backend:", req.body);

        const product = await Product.create(req.body);

        res.status(201).json(product);
    } catch (error) {
        console.error("Create product error:", error);

        res.status(500).json({
            message: "Failed to create product",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

const updateProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({
            message: "Failed to update product"
        });
    }
};

const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete product"
        });
    }
};

export {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
};