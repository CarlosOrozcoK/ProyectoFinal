import { Router } from "express";
import { check } from "express-validator";
import { guardarCategoria, getCategories, getCategoryById, eliminarCategoria, actualizarCategoria } from "./category.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";
import { existeCategoryById } from "../helpers/db-validator.js";

const router = Router();

router.post(
    "/",
    [
        validarJWT,
        tieneRole("ADMIN_ROLE"),
        check("id", "id invalid!").isMongoId(),
        validarCampos
    ],
    guardarCategoria
)

router.get("/", getCategories)

router.get(
    "/findCategory/:id",
    [
        validarJWT,
        tieneRole("ADMIN_ROLE", "CLIENT_ROLE"),
        check("id", "id invalid!").isMongoId(),
        check("id").custom(existeCategoryById),
        validarCampos
    ],
    getCategoryById
)

router.put(
    "/:id",
    [
        validarJWT,
        tieneRole("ADMIN_ROLE"),
        check("id", "id invalid!").isMongoId(),
        check("id").custom(existeCategoryById),
        validarCampos
    ],
    actualizarCategoria
)

router.delete(
    "/:id",
    [
        validarJWT,
        tieneRole("ADMIN_ROLE"),
        check("id", "id invalid!").isMongoId(),
        check("id").custom(existeCategoryById),
        validarCampos
    ],
    eliminarCategoria
)

export default router;