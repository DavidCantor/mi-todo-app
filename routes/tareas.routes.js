// routes/tareas.routes.js
const express = require('express');
const router = express.Router();
const Tarea = require('../models/Tarea'); 

// 1. Corregimos la ruta de importación para subir un nivel
const authGuard = require('../middleware/auth');

// ==========================================
// 1. LEER TAREAS DE UN USUARIO (GET)
// ==========================================
router.get('/', authGuard, async (req, res) => {
    try {
        // Buscamos SOLO las tareas cuyo campo 'usuario' coincida con el ID del token (req.usuarioId)
        const tareas = await Tarea.find({ usuario: req.usuarioId }).sort({ creado_en: -1 });
        res.json(tareas);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las tareas" });
    }
});

// ==========================================
// 2. CREAR UNA TAREA ASOCIADA AL USUARIO (POST)
// ==========================================
router.post('/', authGuard, async (req, res) => {
    const { titulo, descripcion } = req.body;
    try {
        // Forzamos a que la nueva tarea guarde el id del usuario autenticado
        const nuevaTarea = new Tarea({ 
            usuario: req.usuarioId, 
            titulo, 
            descripcion 
        });
        await nuevaTarea.save();
        res.status(201).json(nuevaTarea);
    } catch (error) {
        res.status(400).json({ error: "Error al crear la tarea. El título es obligatorio." });
    }
});

// ==========================================
// 3. ACTUALIZAR ESTADO DE FORMA SEGURA (PATCH)
// ==========================================
router.patch('/:id', authGuard, async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (estado && !['pendiente', 'completada'].includes(estado)) {
        return res.status(400).json({ error: "Estado no válido" });
    }

    try {
        // Buscamos por el ID de la tarea Y nos aseguramos de que pertenezca al usuario logueado
        const tareaActualizada = await Tarea.findOneAndUpdate(
            { _id: id, usuario: req.usuarioId }, 
            { estado }, 
            { new: true }
        );

        if (!tareaActualizada) {
            // Si no existe o no le pertenece al usuario, respondemos con 404 por seguridad
            return res.status(404).json({ error: "Tarea no encontrada o no tienes permisos" });
        }

        res.json(tareaActualizada);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar la tarea" });
    }
});

// ==========================================
// 4. ELIMINAR TAREA DE FORMA SEGURA (DELETE)
// ==========================================
router.delete('/:id', authGuard, async (req, res) => {
    const { id } = req.params;
    try {
        // Eliminamos asegurándonos de que el dueño sea quien lo solicita
        const tareaEliminada = await Tarea.findOneAndDelete({ _id: id, usuario: req.usuarioId });

        if (!tareaEliminada) {
            return res.status(404).json({ error: "Tarea no encontrada o no tienes permisos" });
        }

        res.json({ mensaje: "Tarea eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar la tarea" });
    }
});

module.exports = router;