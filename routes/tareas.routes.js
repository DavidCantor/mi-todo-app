// routes/tareas.routes.js
const express = require('express');
const router = express.Router();
const Tarea = require('../models/Tarea'); // Importamos el modelo subiendo un nivel de carpeta

// 1. LEER TODAS LAS TAREAS (GET)
router.get('/', async (req, res) => {
    try {
        const tareas = await Tarea.find().sort({ creado_en: -1 });
        res.json(tareas);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las tareas" });
    }
});

// 2. CREAR UNA TAREA (POST)
router.post('/', async (req, res) => {
    const { titulo, descripcion } = req.body;
    try {
        const nuevaTarea = new Tarea({ titulo, descripcion });
        await nuevaTarea.save();
        res.status(201).json(nuevaTarea);
    } catch (error) {
        res.status(400).json({ error: "Error al crear la tarea. El título es obligatorio." });
    }
});

// 3. ACTUALIZAR ESTADO (PATCH)
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (estado && !['pendiente', 'completada'].includes(estado)) {
        return res.status(400).json({ error: "Estado no válido" });
    }

    try {
        const tareaActualizada = await Tarea.findByIdAndUpdate(
            id, 
            { estado }, 
            { new: true }
        );

        if (!tareaActualizada) {
            return res.status(404).json({ error: "Tarea no encontrada" });
        }

        res.json(tareaActualizada);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar la tarea" });
    }
});

// 4. ELIMINAR TAREA (DELETE)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const tareaEliminada = await Tarea.findByIdAndDelete(id);

        if (!tareaEliminada) {
            return res.status(404).json({ error: "Tarea no encontrada" });
        }

        res.json({ mensaje: "Tarea eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar la tarea" });
    }
});

// Exportamos el router para que index.js pueda usarlo
module.exports = router;