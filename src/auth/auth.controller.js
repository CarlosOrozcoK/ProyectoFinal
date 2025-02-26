import Usuario from '../users/user.model.js';
import { hash as hashPassword, verify as verifyPassword } from 'argon2';
import { generarJWT } from '../helpers/generate-jwt.js';

export const login = async (req, res) => {
    try {
        const { email, password, username } = req.body;
        const searchEmail = email?.toLowerCase() || null;
        const searchUsername = username?.toLowerCase() || null;

        const user = await Usuario.findOne({
            $or: [{ email: searchEmail }, { username: searchUsername }]
        });

        if (!user) {
            return res.status(400).json({ msg: 'Credenciales incorrectas - correo no encontrado!' });
        }

        if (!user.estado) {
            return res.status(400).json({ msg: 'El usuario está inactivo!' });
        }

        const isPasswordValid = await verifyPassword(user.password, password);
        if (!isPasswordValid) {
            return res.status(400).json({ msg: 'Contraseña incorrecta!' });
        }

        const token = await generarJWT(user.id);

        return res.status(200).json({
            msg: 'Login completado!',
            userDetails: {
                username: user.username,
                token
            }
        });
    } catch (error) {
        console.error(' Error en login:', error);
        return res.status(500).json({
            message: 'Internal server error!',
            error: error.message
        });
    }
};

export const register = async (req, res) => {
    try {
        const { name, surname, username, email, phone, password, role } = req.body;

        const hashedPassword = await hashPassword(password);
        const newUser = await Usuario.create({
            name,
            surname,
            username,
            email,
            phone,
            password: hashedPassword,
            role
        });

        return res.status(201).json({
            message: 'Usuario registrado!',
            userDetails: { email: newUser.email }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error al crear el usuario!',
            error: error.message
        });
    }
};
