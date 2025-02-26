export const validarJWT = async (req, res, next) => {
    const token = req.header("x-token");

    if (!token) {
        return res.status(401).json({ msg: "There is no token in the request!" });
    }

    try {
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        const usuario = await Usuario.findById(uid);

        if (!usuario) {
            return res.status(401).json({ msg: "Usuario does not exist in the database!" });
        }

        if (!usuario.estado) {
            return res.status(401).json({ msg: "Token not valid - user inactive!" });
        }

        req.usuario = usuario; 
        console.log("Usuario autenticado:", req.usuario); 

        next();
    } catch (e) {
        console.error("Error en validarJWT:", e);
        res.status(401).json({ msg: "Token not valid!" });
    }
};
