import { Router } from "express";
import { check } from "express-validator";
import { saveFactura, getFacturas, getFacturaById, updateFactura, updateEstadoFactura } from "./factura.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";
import { existeFacturaById } from "../helpers/db-validator.js";

const router = Router();

router.get("/", getFacturas);

router.put(
    "/updateFactura/:id",
    [
        validarJWT,
        tieneRole("ADMIN_ROLE"),
        check("id", "id invalid!").isMongoId(),
        check("id").custom(existeFacturaById),
        validarCampos
    ],
    updateFactura
);

export default router;
