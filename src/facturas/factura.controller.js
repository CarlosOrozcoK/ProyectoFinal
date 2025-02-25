import Factura from "./factura.model.js";
import Product from "../products/product.model.js";

export const saveFactura = async (req, res) => {
    try {
        const { user, products } = req.body;

        if (!user || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ success: false, message: "Usuario y productos son requeridos!" });
        }

        let total = 0;
        const productDetails = await Promise.all(products.map(async item => {
            const product = await Product.findById(item.product);
            if (!product) throw new Error(`Producto con ID ${item.product} no encontrado!`);
            if (product.stock < item.quantity) throw new Error(`Stock insuficiente para el producto: ${product.name}`);

            product.stock -= item.quantity;
            product.sold += item.quantity;
            product.outOfStock = product.stock === 0;
            await product.save();

            total += product.price * item.quantity;
            return { product: product._id, quantity: item.quantity, price: product.price };
        }));

        const factura = await Factura.create({ user, products: productDetails, total, status: "Pendiente" });
        res.status(201).json({ success: true, message: "Factura creada con éxito!", factura });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al guardar factura!", error: error.message });
    }
};

export const getFacturas = async (req, res) => {
    try {
        const { limite = 10, desde = 0 } = req.query;
        const facturas = await Factura.find({ status: { $ne: "Cancelado" } })
            .skip(Number(desde)).limit(Number(limite))
            .populate("user", "name")
            .populate("products.product", "name price");

        res.status(200).json({ success: true, total: facturas.length, facturas });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al obtener facturas!", error: error.message });
    }
};

export const getFacturaById = async (req, res) => {
    try {
        const factura = await Factura.findById(req.params.id)
            .populate("user", "name")
            .populate("products.product", "name price");

        if (!factura) return res.status(404).json({ success: false, message: "Factura no encontrada!" });
        res.status(200).json({ success: true, factura });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al buscar factura!", error: error.message });
    }
};

export const updateFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const { products, status } = req.body;

        const factura = await Factura.findById(id);
        if (!factura) return res.status(404).json({ success: false, message: "Factura no encontrada!" });

        if (products) {
            await Promise.all(factura.products.map(async item => {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock += item.quantity;
                    product.sold -= item.quantity;
                    product.outOfStock = product.stock === 0;
                    await product.save();
                }
            }));

            let total = 0;
            factura.products = await Promise.all(products.map(async item => {
                const product = await Product.findById(item.product);
                if (!product) throw new Error(`Producto con ID ${item.product} no encontrado!`);
                if (product.stock < item.quantity) throw new Error(`Stock insuficiente para ${product.name}`);
                
                product.stock -= item.quantity;
                product.sold += item.quantity;
                product.outOfStock = product.stock === 0;
                await product.save();

                total += product.price * item.quantity;
                return { product: product._id, quantity: item.quantity, price: product.price };
            }));
            factura.total = total;
        }

        if (status) factura.status = status;
        await factura.save();
        res.status(200).json({ success: true, message: "Factura actualizada!", factura });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al actualizar factura!", error: error.message });
    }
};

export const updateEstadoFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ["Pendiente", "Pagado", "Cancelado"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Estado inválido! Valores permitidos: ${validStatuses.join(', ')}` });
        }

        const factura = await Factura.findById(id);
        if (!factura) return res.status(404).json({ success: false, message: "Factura no encontrada!" });

        factura.status = status;
        await factura.save();

        res.status(200).json({ success: true, message: "Estado actualizado!", factura });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al actualizar estado de factura!", error: error.message });
    }
};
