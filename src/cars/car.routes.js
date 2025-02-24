import { Router } from "express";
import { check } from "express-validator";
import { añadirProductoCarro, getCar, removerProductoCarro, pagarCarro, history } from "./car.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";

const router = Router();

router.post(
    "/car",
    [
        validarJWT,
        tieneRole("CLIENT_ROLE"),
        check("productId", "Product ID is invalid!").isMongoId(),
        check("quantity", "Quantity must be a number").isInt({ gt: 0 }),
        validarCampos
    ],
    añadirProductoCarro
);

router.get("/", validarJWT, getCar);

router.delete(
    "/:productId",
    [
        validarJWT,
        tieneRole("CLIENT_ROLE"),
        check("productId", "Product ID is invalid!").isMongoId(),
        validarCampos
    ],
    removerProductoCarro
);

router.post(
    "/pagarCarro",
    [
        validarJWT,
        tieneRole("CLIENT_ROLE"),
        validarCampos
    ],
    pagarCarro
);

router.get("/history", validarJWT, history);

export default router;