require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

//RUTAS
const tareasRoutes = require('./routes/tareas.routes'); // Importamos las nuevas rutas

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Servir el archivo index.html



// Conexión estricta a MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("Error crítico: MONGODB_URI no está configurada en las variables de entorno.");
    process.exit(1);
}
mongoose.connect(MONGODB_URI)
    .then(() => console.log("🌱 Conexión exitosa a MongoDB Atlas"))
    .catch(err => console.error("❌ Error al conectar a la base de datos:", err));

    
// Vinculamos las rutas bajo el prefijo '/tareas'
// Esto significa que si en tareas.routes.js pusiste router.get('/'), Express lo mapea automáticamente como /tareas
app.use('/tareas', tareasRoutes);

// Inicializar el servidor de escucha
app.listen(PORT, () => {
    console.log(`🚀 Servidor de desarrollo corriendo en http://localhost:${PORT}`);
});