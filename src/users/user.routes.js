import { Router } from "express";
import { check } from "express-validator";
import { getUsers, updateUser, updatePassword, updateStatus, deleteUser } from "./user.controller.js";
import { existeUsuarioById } from "../helpers/db-validator.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";

const router = Router();

router.get("/", getUsers);

router.put(
    "/edit/:id",
    [
        validarJWT,
        tieneRole("ADMIN_ROLE", "CLIENT_ROLE"),
        check("id", "Invalid ID format!").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    updateUser
);

router.put(
    "/password/:id",
    [
        validarJWT,
        tieneRole("ADMIN_ROLE"),
        check("id", "Invalid ID format!").isMongoId(),
        check("id").custom(existeUsuarioById),
        check("password", "Password is required!").notEmpty(),
        validarCampos
    ],
    updatePassword
);
router.put(
    "/status/:id",
    [
        validarJWT,
        tieneRole("ADMIN_ROLE", "CLIENT_ROLE"),
        check("id", "Invalid ID format!").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    updateStatus
);

router.delete(
    "/remove/:id",
    [
        validarJWT,
        tieneRole("ADMIN_ROLE", "CLIENT_ROLE"),
        check("id", "Invalid ID format!").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    deleteUser
); 

export default router;
