const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Una clave secreta para firmar tus tokens (En producción esto debe ir en una variable de entorno)
const JWT_SECRET = process.env.JWT_SECRET;

// ==========================================
// 1. REGISTRO DE USUARIOS (POST /api/auth/registro)
// ==========================================
router.post('/registro', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Validar si el usuario ya existe
        let usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
        }

        // Encriptar la contraseña (Hacerle un Hash)
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);

        // Crear y guardar el nuevo usuario
        const nuevoUsuario = new Usuario({
            nombre,
            email,
            password: passwordEncriptada
        });

        await nuevoUsuario.save();

        res.status(201).json({ mensaje: 'Usuario registrado con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un error en el servidor al registrar al usuario.' });
    }
});

// ==========================================
// 2. INICIO DE SESIÓN / LOGIN (POST /api/auth/login)
// ==========================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar si el usuario existe
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ error: 'Credenciales inválidas (Correo o contraseña incorrectos).' });
        }

        // Comparar la contraseña ingresada con la contraseña encriptada de la BD
        const contraseñaCorrecta = await bcrypt.compare(password, usuario.password);
        if (!contraseñaCorrecta) {
            return res.status(400).json({ error: 'Credenciales inválidas (Correo o contraseña incorrectos).' });
        }

        // Si todo está bien, creamos el Token (JWT)
        // Guardamos el ID del usuario dentro del token para saber quién es después
        const token = jwt.sign(
            { idUsuario: usuario._id }, 
            JWT_SECRET, 
            { expiresIn: '24h' } // El token expira en un día
        );

        // Devolvemos el token y los datos básicos del usuario
        res.json({
            mensaje: 'Login exitoso',
            token,
            usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un error en el servidor al iniciar sesión.' });
    }
});

module.exports = router;