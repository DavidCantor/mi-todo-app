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
// 3. ACTUALIZAR (UPDATE) - Modificar una tarea por ID
// ==========================================
app.put('/tareas/:id', async (req, res) => {
    // Obtenemos el ID desde la URL (lo convierte a número porque llega como texto)
    const idTarea = parseInt(req.params.id);
    const { titulo, descripcion, estado } = req.body;

    // Buscamos la tarea en nuestra "base de datos"
    const tarea = await Tarea.findById(idTarea);

    // Si no existe, devolvemos un error 404 (Not Found)
    if (!tarea) {
        return res.status(404).json({ error: "Tarea no encontrada" });
    }

    // Actualizamos solo los campos que el cliente nos envíe
    if (titulo !== undefined) tarea.titulo = titulo;
    if (descripcion !== undefined) tarea.descripcion = descripcion;
    if (estado !== undefined) tarea.estado = estado;

    // Respondemos con la tarea ya modificada
    res.json({ mensaje: "Tarea actualizada con éxito", tarea });
});
// ==========================================
// 4. BORRAR (DELETE) - Eliminar una tarea por ID
// ==========================================
app.delete('/tareas/:id', async (req, res) => {
    const idTarea = parseInt(req.params.id);

    // Buscamos si la tarea existe antes de intentar borrarla
    const tarea = await Tarea.findById(idTarea);

    if (!tarea) {
        return res.status(404).json({ error: "Tarea no encontrada" });
    }

    // Eliminamos la tarea de la base de datos
    await Tarea.findByIdAndDelete(idTarea);

    // Respondemos con un mensaje de éxito
    res.json({ mensaje: `Tarea con ID ${idTarea} eliminada correctamente` });
});






app.listen(PORT, () => {
    console.log(`Servidor de desarrollo corriendo en http://localhost:${PORT}`);
});