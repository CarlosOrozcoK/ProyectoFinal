import { Router } from "express";
import { check } from "express-validator";
import { agregarProductoAlCarrito, obtenerCarrito, eliminarProductoDelCarrito, procesarPago, obtenerHistorial } from "./car.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";

const router = Router();

router.post(
    "/carrito",
    [
        validarJWT,
        tieneRole("CLIENT_ROLE"),
        check("productId", "¡El ID del producto no es válido!").isMongoId(),
        check("quantity", "¡La cantidad debe ser un número mayor que 0!").isInt({ gt: 0 }),
        validarCampos
    ],
    agregarProductoAlCarrito
);

router.get("/", validarJWT, obtenerCarrito);

router.delete(
    "/:productId",
    [
        validarJWT,
        tieneRole("CLIENT_ROLE"),
        check("productId", "¡El ID del producto no es válido!").isMongoId(),
        validarCampos
    ],
    eliminarProductoDelCarrito
);

router.post(
    "/pagar",
    [
        validarJWT,
        tieneRole("CLIENT_ROLE"),
        validarCampos
    ],
    procesarPago
);

router.get("/historial", validarJWT, obtenerHistorial);

export default router;