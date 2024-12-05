const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const URL_CONNECT = process.env.URL_CONNECT;
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Conexión a MongoDB
mongoose.connect(URL_CONNECT, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conexión a MongoDB establecida'))
.catch(err => console.error('Error de conexión a MongoDB:', err));

// Modelo de Actividad
const Actividad = mongoose.model('Actividad', {
  descripcion: String,
  fecha: { type: Date, default: Date.now },
  estado: { type: String, default: 'Activo' }
});

// Modelo de Log de Actividades
const LogActividad = mongoose.model('LogActividad', {
  accion: String,
  entidad: String,
  detalles: String,
  fecha: { type: Date, default: Date.now }
});

// Función para registrar log de actividades
async function registrarLog(accion, entidad, detalles) {
  const log = new LogActividad({
    accion,
    entidad,
    detalles
  });
  await log.save();
}

// Rutas CRUD
// Crear Actividad
app.post('/actividades', async (req, res) => {
  try {
    const actividad = new Actividad(req.body);
    await actividad.save();
    
    // Registrar log de creación
    await registrarLog('CREATE', 'Actividad', 
      `Nueva actividad creada: ${actividad._id}`);
    
    res.status(201).json(actividad);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
});

// Obtener Todas las Actividades
app.get('/actividades', async (req, res) => {
  try {
    const actividades = await Actividad.find();
    
    // Registrar log de lectura
    await registrarLog('READ', 'Actividad', 
      `Listado de actividades consultado`);
    
    res.json(actividades);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Actualizar Actividad
app.put('/actividades/:id', async (req, res) => {
  try {
    const actividad = await Actividad.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    
    // Registrar log de actualización
    await registrarLog('UPDATE', 'Actividad', 
      `Actividad actualizada: ${req.params.id}`);
    
    res.json(actividad);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
});

// Eliminar Actividad
app.delete('/actividades/:id', async (req, res) => {
  try {
    const actividad = await Actividad.findByIdAndDelete(req.params.id);
    
    // Registrar log de eliminación
    await registrarLog('DELETE', 'Actividad', 
      `Actividad eliminada: ${req.params.id}`);
    
    res.json({ mensaje: 'Actividad eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Obtener Logs de Actividades
app.get('/logs', async (req, res) => {
  try {
    const logs = await LogActividad.find().sort({ fecha: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});