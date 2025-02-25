import { response, request } from "express";
import Product from "./product.model.js";

export const saveProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({ success: true, message: "Product saved successfully!", product });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error saving product!", error: error.message });
    }
};

export const getProducts = async (req = request, res = response) => {
    try {
        const { limite = 10, desde = 0 } = req.query;
        const query = { estado: true };
        
        const [total, products] = await Promise.all([
            Product.countDocuments(query),
            Product.find(query).skip(Number(desde)).limit(Number(limite))
        ]);

        res.status(200).json({ success: true, total, products });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error getting products!", error: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found!" });
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error getting product!", error: error.message });
    }
};

export const getProductByName = async (req, res) => {
    try {
        const product = await Product.findOne({ name: req.params.name });
        if (!product) return res.status(404).json({ success: false, message: "Product not found!" });
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error getting product!", error: error.message });
    }
};

export const updateProduct = async (req, res = response) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ success: false, message: "Product not found!" });
        res.status(200).json({ success: true, message: "Product updated!", product });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating product!", error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const route = req.originalUrl;
        const product = await Product.findById(id);

        if (!product || !product.estado) return res.status(404).json({ success: false, message: "Product not found or inactive!" });

        if (route.includes("/sell")) {
            if (product.stock <= 0) return res.status(400).json({ success: false, message: "Product is out of stock!" });
            
            product.stock -= 1;
            product.sold += 1;
            product.outOfStock = product.stock === 0;
            await product.save();
            return res.status(200).json({ success: true, message: "Product sold successfully!", product });
        }
        
        product.estado = false;
        await product.save();
        res.status(200).json({ success: true, message: "Product deleted successfully!", product });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error processing the request!", error: error.message });
    }
};
