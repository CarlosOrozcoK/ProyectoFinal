import mongoose from "mongoose";
import Product from "../products/product.model.js";
import Category from "../categories/category.model.js";

export const guardarCategoria = async (req, res) => {
    try {
        const data = req.body;

        let productIds = [];

        if (data.productos && Array.isArray(data.productos) && data.productos.length > 0) {
            const products = await Product.find({ name: { $in: data.productos } });

            if (products.length !== data.productos.length) {
                return res.status(404).json({
                    success: false,
                    message: '¡Uno o más productos no fueron encontrados!'
                });
            }

            productIds = products.map(product => product._id);
        }

        const category = new Category({
            ...data,
            productos: productIds
        });

        await category.save();

        res.status(200).json({
            success: true,
            message: '¡Categoría creada exitosamente!'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: '¡Error al guardar la categoría!'
        });
    }
};

export const getCategories = async (req, res) => {
    const { limite = 10, desde = 0 } = req.query;
    const query = { status: true };

    try {
        const categories = await Category.find(query)
            .skip(Number(desde))
            .limit(Number(limite))
            .populate('productos', 'name');

        const total = await Category.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            categories
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: '¡Error al obtener las categorías!'
        });
    }
};

export const getCategoryById = async (req, res) => {
    const { id } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '¡Formato de ID inválido!'
            });
        }

        const category = await Category.findById(id).populate('productos', 'name');

        if (!category) {
            return res.status(404).json({
                success: false,
                message: '¡Categoría no encontrada!'
            });
        }

        res.status(200).json({
            success: true,
            category
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: '¡Error al buscar la categoría!'
        });
    }
};

export const actualizarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const existingCategory = await Category.findById(id);
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: '¡Categoría no encontrada!'
            });
        }

        let productIds = existingCategory.productos;
        if (data.productos && Array.isArray(data.productos)) {
            const products = await Product.find({ name: { $in: data.productos } });

            if (products.length !== data.productos.length) {
                return res.status(404).json({
                    success: false,
                    message: '¡Uno o más productos no fueron encontrados!'
                });
            }

            productIds = products.map(product => product._id);
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            {
                ...data,
                productos: productIds
            },
            { new: true }
        ).populate('productos', 'name');

        res.status(200).json({
            success: true,
            message: '¡Categoría actualizada exitosamente!'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: '¡Error al actualizar la categoría!'
        });
    }
};

export const eliminarCategoria = async (req, res) => {
    const { id } = req.params;

    try {
        const categoryToDelete = await Category.findById(id);
        if (!categoryToDelete || !categoryToDelete.status) {
            return res.status(404).json({
                success: false,
                message: '¡Categoría no encontrada o ya eliminada!'
            });
        }

        let defaultCategory = await Category.findOne({ name: 'Sin Categoría' });

        if (!defaultCategory) {
            defaultCategory = new Category({
                name: 'Sin Categoría',
                description: 'Categoría para productos sin clasificación',
                productos: [],
                status: true
            });
            await defaultCategory.save();
        }

        const productsToMove = categoryToDelete.productos;
        defaultCategory.productos.push(...productsToMove);
        await defaultCategory.save();

        await Category.findByIdAndUpdate(id, { status: false });

        res.status(200).json({
            success: true,
            message: '¡Categoría eliminada exitosamente! Todos los productos se movieron a la categoría por defecto.'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: '¡Error al eliminar la categoría!'
        });
    }
};
