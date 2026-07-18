const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let tareas = [
    {
        id: 1,
        titulo: "Aprender los fundamentos de Express",
        descripcion: "Comprender cómo funcionan las rutas y los métodos HTTP",
        estado: "completada",
        creado_en: new Date()
    }
];
app.get('/tareas', (req, res) => {
    res.json(tareas);
});

app.post('/tareas', (req, res) => {
    // Extraemos el título y descripción que vienen del cliente
    const { titulo, descripcion } = req.body;

    // Validación simple
    if (!titulo) {
        return res.status(400).json({ error: "El título es obligatorio" });
    }
    // Creamos el nuevo objeto de la tarea
    const nuevaTarea = {
        id: tareas.length + 1, // Un ID incremental simple
        titulo: titulo,
        descripcion: descripcion || "",
        estado: "pendiente", // Toda tarea nueva inicia pendiente
        creado_en: new Date()
    };
    tareas.push(nuevaTarea);

    // Respondemos con la tarea creada y un estado 201 Created
    res.status(201).json(nuevaTarea);
});

// ==========================================
// 3. ACTUALIZAR (UPDATE) - Modificar una tarea por ID
// ==========================================
app.put('/tareas/:id', (req, res) => {
    // Obtenemos el ID desde la URL (lo convierte a número porque llega como texto)
    const idTarea = parseInt(req.params.id);
    const { titulo, descripcion, estado } = req.body;

    // Buscamos la tarea en nuestra "base de datos"
    const tarea = tareas.find(t => t.id === idTarea);

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
app.delete('/tareas/:id', (req, res) => {
    const idTarea = parseInt(req.params.id);

    // Buscamos si la tarea existe antes de intentar borrarla
    const existe = tareas.some(t => t.id === idTarea);
    
    if (!existe) {
        return res.status(404).json({ error: "Tarea no encontrada" });
    }

    // Filtramos el arreglo para dejar por fuera la tarea que tiene ese ID
    tareas = tareas.filter(t => t.id !== idTarea);

    // Respondemos con un mensaje de éxito
    res.json({ mensaje: `Tarea con ID ${idTarea} eliminada correctamente` });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});




app.listen(PORT, () => {
    console.log(`Servidor de desarrollo corriendo en http://localhost:${PORT}`);
});