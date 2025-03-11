import Product from "../products/product.model.js";
import Car from "../cars/car.model.js";
import Factura from "../facturas/factura.model.js";

export const agregarProductoAlCarrito = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!req.usuario || !req.usuario.id) {
            return res.status(401).json({ success: false, message: "¡Usuario no autenticado!" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "¡Producto no encontrado!" });
        }

        let carrito = await Car.findOne({ usuario: req.usuario.id });

        if (!carrito) {
            carrito = new Car({ usuario: req.usuario.id, products: [] });
        }

        if (!Array.isArray(carrito.products)) {
            carrito.products = [];
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
        res.status(500).json({ success: false, message: "¡Error al añadir el producto al carrito!", error: error.message });
    }
};
export const obtenerCarrito = async (req, res) => {
    try {
        if (!req.usuario || !req.usuario.id) {
            return res.status(401).json({ success: false, message: "¡Usuario no autenticado!" });
        }

        const carrito = await Car.findOne({ usuario: req.usuario.id })
            .populate({
                path: "productos.producto",
                select: "name price stock",
            });

        if (!carrito) {
            return res.status(404).json({ success: false, message: "¡Carrito no encontrado!" });
        }

        if (!Array.isArray(carrito.productos)) {
            carrito.productos = [];
        }

        res.status(200).json({ success: true, carrito });
    } catch (error) {
        console.error("Error en obtenerCarrito:", error);
        res.status(500).json({ success: false, message: "¡Error al obtener el carrito!", error: error.message });
    }
};


export const eliminarProductoDelCarrito = async (req, res) => {
    try {
        const { productId } = req.params;
        let carrito = await Car.findOne({ usuario: req.usuario.id });

        if (!carrito) {
            return res.status(404).json({ success: false, message: "¡Carrito no encontrado!" });
        }

        if (!Array.isArray(carrito.products)) {
            carrito.products = [];
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
        if (!req.usuario || !req.usuario.id) {
            return res.status(401).json({ success: false, message: "¡Usuario no autenticado!" });
        }

        let carrito = await Car.findOne({ usuario: req.usuario.id })
            .populate("productos.producto");

        if (!carrito || !Array.isArray(carrito.productos) || carrito.productos.length === 0) {
            return res.status(400).json({ success: false, message: "¡El carrito está vacío!" });
        }

        let total = 0;
        for (let item of carrito.productos) {
            if (item.producto.stock < item.cantidad) {
                return res.status(400).json({ success: false, message: `¡No hay suficiente stock para ${item.producto.name}!` });
            }
            total += item.producto.price * item.cantidad;
        }

        const factura = new Factura({
            user: req.usuario.id,  // ✅ Cambiado a 'user' para coincidir con el modelo
            products: carrito.productos.map(item => ({  // ✅ Cambiado 'productos' a 'products'
                product: item.producto._id,  // ✅ Cambiado 'producto' a 'product'
                quantity: item.cantidad,  // ✅ Cambiado 'cantidad' a 'quantity'
                price: item.producto.price  // ✅ Cambiado 'precio' a 'price'
            })),
            total,
            status: 'Pagado'  
        });

        await factura.save();

        for (let item of carrito.productos) {
            await Product.findByIdAndUpdate(item.producto._id, { 
                $inc: { stock: -item.cantidad } 
            });
        }

        await Car.findOneAndDelete({ usuario: req.usuario.id });

        res.status(200).json({ success: true, message: "¡Compra realizada con éxito!", factura });
    } catch (error) {
        console.error("Error en procesarPago:", error);
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
