const jwt = require('jsonwebtoken');
const JWT_SECRET = 'davsan2523'; // Debe ser exactamente la misma clave de antes

module.exports = function (req, res, next) {
    // 1. Obtener el token que viene en la cabecera (Header) de la petición
    const token = req.header('Authorization');

    // 2. Si no hay token, bloquear el acceso de inmediato
    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token de seguridad.' });
    }

    try {
        // El token suele venir como "Bearer XXXXXXX", así que limpiamos el texto si es necesario
        const tokenLimpio = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

        // 3. Verificar si el token es válido y no ha expirado
        const cifrado = jwt.verify(tokenLimpio, JWT_SECRET);

        // 4. Inyectar el ID del usuario dentro del objeto de la petición (req)
        // Gracias a esto, tus rutas de tareas sabrán exactamente quién está operando
        req.usuarioId = cifrado.idUsuario;

        // 5. Todo está en orden, dar luz verde para continuar a la ruta original
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token no válido o expirado.' });
    }
};