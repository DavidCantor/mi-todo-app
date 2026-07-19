require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const Tarea = require('./models/Tarea');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


// ==========================================
// CONEXIÓN A MONGOOSE (BASE DE DATOS)
// ==========================================
// Usamos la variable exacta que tienes en tu archivo .env
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('¡Conexión exitosa a MongoDB Atlas!'))
    .catch(err => console.error('Error al conectar a la base de datos:', err));


// Servir el Frontend en la ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});



// ==========================================
// 1. LEER (READ) - Obtener todas las tareas de la DB
// ==========================================
app.get('/tareas', async (req, res) => {
    try {
        // .find() busca absolutamente todos los documentos en la colección de MongoDB
        const tareasDB = await Tarea.find();
        res.json(tareasDB);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las tareas" });
    }
});

// ==========================================
// 2. CREAR (CREATE) - Guardar nueva tarea en la DB
// ==========================================
app.post('/tareas', async (req, res) => {
    const { titulo, descripcion } = req.body;

    if (!titulo) {
        return res.status(400).json({ error: "El título es obligatorio" });
    }

    try {
        // Creamos una nueva instancia de nuestro modelo con los datos del body
        const nuevaTarea = new Tarea({
            titulo,
            descripcion
        });

        // .save() se encarga de enviarlo por internet a MongoDB Atlas y guardarlo
        await nuevaTarea.save();

        res.status(201).json(nuevaTarea);
    } catch (error) {
        res.status(500).json({ error: "Error al guardar la tarea en la base de datos" });
    }
});

// ==========================================
// 3. ACTUALIZAR (UPDATE) - Marcar como completada o pendiente
// ==========================================
// Usamos :id como parámetro dinámico para saber exactamente qué tarea modificar
app.patch('/tareas/:id', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body; // Recibimos el nuevo estado ('pendiente' o 'completada')

    // Validamos que el estado enviado sea correcto según nuestro modelo
    if (estado && !['pendiente', 'completada'].disable && !['pendiente', 'completada'].includes(estado)) {
        return res.status(400).json({ error: "Estado no válido" });
    }

    try {
        // Buscamos por ID y actualizamos solo el campo estado
        // { new: true } hace que Mongoose nos devuelva la tarea ya actualizada en lugar de la vieja
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

// ==========================================
// 4. ELIMINAR (DELETE) - Borrar una tarea definitivamente
// ==========================================
app.delete('/tareas/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminamos el documento directamente de MongoDB Atlas
        const tareaEliminada = await Tarea.findByIdAndDelete(id);

        if (!tareaEliminada) {
            return res.status(404).json({ error: "Tarea no encontrada" });
        }

        res.json({ mensaje: "Tarea eliminada correctamente", tarea: tareaEliminada });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar la tarea" });
    }
});






app.listen(PORT, () => {
    console.log(`Servidor de desarrollo corriendo en http://localhost:${PORT}`);
});