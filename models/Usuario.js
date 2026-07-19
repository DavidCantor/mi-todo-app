const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    creado_en: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);