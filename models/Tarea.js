const mongoose = require("mongoose");

const TareaSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  titulo: {
    type: String,
    required: [true, "El título es obligatorio"],
    trim: true,
  },
  descripcion: {
    type: String,
    default: "",
  },
  estado: {
    type: String,
    enum: ["pendiente", "completada"],
    default: "pendiente",
  },
  creado_en: {
    type: Date,
    default: Date.now,
  },
});

// Exportamos el modelo para usarlo en nuestro archivo principal
module.exports = mongoose.model("Tarea", TareaSchema);
