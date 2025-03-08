import Product from "../products/product.model.js";
import Car from "../cars/car.model.js";
import Factura from "../facturas/factura.model.js";

export const agregarProductoAlCarrito = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // Asegurar que el usuario está en la request
        if (!req.usuario || !req.usuario.id) {
            return res.status(401).json({ success: false, message: "¡Usuario no autenticado!" });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "¡Producto no encontrado!" });
        }

        // Verifica si el carrito ya existe
        let carrito = await Car.findOne({ usuario: req.usuario.id });

        if (!carrito) {
            // Si no existe, lo creamos con el usuario autenticado
            carrito = new Car({ usuario: req.usuario.id, products: [] });
        }

        const indiceProducto = carrito.products.findIndex(item => item.product.toString() === productId);

        if (indiceProducto !== -1) {
            carrito.products[indiceProducto].quantity += quantity;
        } else {
            carrito.products.push({ product: productId, quantity });
        }

        await carrito.save();
        res.status(200).json({ success: true, message: "¡Producto añadido al carrito!", carrito });
    } catch (error) {
        console.error("Error en agregarProductoAlCarrito:", error);
        res.status(500).json({ success: false, message: "¡Error al añadir el producto al carrito!", error: error.message });
    }
};

export const obtenerCarrito = async (req, res) => {
    try {
        const carrito = await Car.findOne({ user: req.usuario.id }).populate("products.product");

        if (!carrito || !Array.isArray(carrito.products)) {
            return res.status(404).json({ success: false, message: "¡Carrito no encontrado!" });
        }

        res.status(200).json({ success: true, carrito });
    } catch (error) {
        res.status(500).json({ success: false, message: "¡Error al obtener el carrito!", error: error.message });
    }
};

export const eliminarProductoDelCarrito = async (req, res) => {
    try {
        const { productId } = req.params;
        let carrito = await Car.findOne({ user: req.usuario.id });

        if (!carrito || !Array.isArray(carrito.products)) {
            return res.status(404).json({ success: false, message: "¡Carrito no encontrado!" });
        }

        carrito.products = carrito.products.filter(item => item.product.toString() !== productId);
        await carrito.save();

        res.status(200).json({ success: true, message: "¡Producto eliminado del carrito!", carrito });
    } catch (error) {
        res.status(500).json({ success: false, message: "¡Error al eliminar el producto del carrito!", error: error.message });
    }
};

export const procesarPago = async (req, res) => {
    try {
        let carrito = await Car.findOne({ user: req.usuario.id }).populate("products.product");

        if (!carrito || !Array.isArray(carrito.products) || carrito.products.length === 0) {
            return res.status(400).json({ success: false, message: "¡El carrito está vacío!" });
        }

        let total = 0;
        for (let item of carrito.products) {
            if (item.product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `¡No hay suficiente stock para ${item.product.name}!` });
            }
            total += item.product.price * item.quantity;
        }

        const factura = new Factura({
            user: req.usuario.id,
            products: carrito.products.map(item => ({ product: item.product._id, quantity: item.quantity, price: item.product.price })),
            total,
            status: 'Pagado'
        });

        await factura.save();

        for (let item of carrito.products) {
            await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity, sold: item.quantity } });
        }

        await Car.findOneAndDelete({ user: req.usuario.id });

        res.status(200).json({ success: true, message: "¡Compra realizada con éxito!", factura });
    } catch (error) {
        res.status(500).json({ success: false, message: "¡Error durante la compra!", error: error.message });
    }
};

export const obtenerHistorial = async (req, res) => {
    try {
        const facturas = await Factura.find({ user: req.usuario.id }).populate("products.product");

        if (!facturas || facturas.length === 0) {
            return res.status(404).json({ success: false, message: "¡No se encontró historial de compras!" });
        }

        res.status(200).json({ success: true, facturas });
    } catch (error) {
        res.status(500).json({ success: false, message: "¡Error al obtener el historial de compras!", error: error.message });
    }
};