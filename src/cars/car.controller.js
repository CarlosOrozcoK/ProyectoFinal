import Product from "../products/product.model.js";
import Car from "../cars/car.model.js";
import Factura from "../facturas/factura.model.js";

export const añadirProductoCarro = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "¡Producto no encontrado!"
            });
        }

        let car = await Car.findOne({ user: req.usuario.id });

        if (!car) {
            car = new Car({ user: req.usuario.id, products: [] });
        }

        const productIndex = car.products.findIndex(item => item.product.toString() === productId);

        if (productIndex > -1) {
            car.products[productIndex].quantity += quantity;
        } else {
            car.products.push({ product: productId, quantity });
        }

        await car.save();
        res.status(200).json({
            success: true,
            message: "¡Producto añadido al carrito!",
            car
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "¡Error al añadir producto al carrito!",
            error: error.message
        });
    }
};

export const getCar = async (req, res) => {
    try {
        const car = await Car.findOne({ user: req.usuario.id }).populate("products.product");

        if (!car) {
            return res.status(404).json({
                success: false,
                message: "¡Carrito no encontrado!"
            });
        }

        res.status(200).json({
            success: true,
            car
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "¡Error al obtener el carrito!",
            error: error.message
        });
    }
};

export const removerProductoCarro = async (req, res) => {
    try {
        const { productId } = req.params;

        let car = await Car.findOne({ user: req.usuario.id });

        if (!car) {
            return res.status(404).json({
                success: false,
                message: "¡Carrito no encontrado!"
            });
        }

        car.products = car.products.filter(item => item.product.toString() !== productId);
        await car.save();

        res.status(200).json({
            success: true,
            message: "¡Producto eliminado del carrito!",
            car
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "¡Error al eliminar el producto del carrito!",
            error: error.message
        });
    }
};

export const pagarCarro = async (req, res) => {
    try {
        let car = await Car.findOne({ user: req.usuario.id }).populate("products.product");

        if (!car || car.products.length === 0) {
            return res.status(400).json({
                success: false,
                message: "¡El carrito está vacío!"
            });
        }

        let total = 0;
        for (let item of car.products) {
            if (item.product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `¡No hay suficiente stock para el producto: ${item.product.name}!`
                });
            }
            total += item.product.price * item.quantity;
        }

        const factura = new Factura({
            user: req.usuario.id,
            products: car.products.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            })),
            total,
            status: 'Pagado'
        });

        await factura.save();

        for (let item of car.products) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity, sold: item.quantity }
            });
        }

        await Car.findOneAndDelete({ user: req.usuario.id });

        res.status(200).json({
            success: true,
            message: "¡Compra realizada con éxito!",
            factura
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "¡Error durante la compra!",
            error: error.message
        });
    }
};

export const history = async (req, res) => {
    try {
        const facturas = await Factura.find({ user: req.usuario.id }).populate("products.product");

        if (!facturas.length) {
            return res.status(404).json({
                success: false,
                message: "¡No se encontró historial de compras!"
            });
        }

        res.status(200).json({
            success: true,
            facturas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "¡Error al obtener el historial de compras!",
            error: error.message
        });
    }
};
