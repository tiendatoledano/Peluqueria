const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Archivos de datos (se crean automáticamente)
const CAROUSEL_FILE = path.join(__dirname, 'data', 'carousel.json');
const APPOINTMENTS_FILE = path.join(__dirname, 'data', 'appointments.json');

// Crear directorio data si no existe
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Datos iniciales por defecto
const defaultCarousel = [
    { image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1000&q=80', name: 'Corte Moderno', description: 'Transformación completa' },
    { image: 'https://images.unsplash.com/photo-1581403341632-a0d8e7bf2a5a?w=1000&q=80', name: 'Coloración Profesional', description: 'Técnica balayage' },
    { image: 'https://images.unsplash.com/photo-1595475888562-57441d9b298a?w=1000&q=80', name: 'Peinado para Boda', description: 'Elegante recogido' }
];

// Funciones de ayuda para leer/escribir archivos
function readJSON(file, defaultData) {
    try {
        if (fs.existsSync(file)) {
            return JSON.parse(fs.readFileSync(file, 'utf8'));
        }
    } catch (e) {
        console.error(`Error leyendo ${file}:`, e);
    }
    fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
    return defaultData;
}

function writeJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// API Carrusel
app.get('/api/carousel', (req, res) => {
    const data = readJSON(CAROUSEL_FILE, defaultCarousel);
    res.json(data);
});

app.post('/api/carousel', (req, res) => {
    const data = readJSON(CAROUSEL_FILE, defaultCarousel);
    data.push(req.body);
    writeJSON(CAROUSEL_FILE, data);
    res.json({ success: true, data });
});

app.delete('/api/carousel/:index', (req, res) => {
    const data = readJSON(CAROUSEL_FILE, defaultCarousel);
    const index = parseInt(req.params.index);
    if (index >= 0 && index < data.length) {
        data.splice(index, 1);
        writeJSON(CAROUSEL_FILE, data);
        res.json({ success: true, data });
    } else {
        res.status(400).json({ error: 'Índice inválido' });
    }
});

// API Turnos
app.get('/api/appointments', (req, res) => {
    const data = readJSON(APPOINTMENTS_FILE, []);
    res.json(data);
});

app.post('/api/appointments', (req, res) => {
    const data = readJSON(APPOINTMENTS_FILE, []);
    const appointment = { ...req.body, timestamp: new Date().toISOString() };
    data.push(appointment);
    writeJSON(APPOINTMENTS_FILE, data);
    res.json({ success: true, data });
});

app.delete('/api/appointments/:index', (req, res) => {
    const data = readJSON(APPOINTMENTS_FILE, []);
    const index = parseInt(req.params.index);
    if (index >= 0 && index < data.length) {
        data.splice(index, 1);
        writeJSON(APPOINTMENTS_FILE, data);
        res.json({ success: true, data });
    } else {
        res.status(400).json({ error: 'Índice inválido' });
    }
});

// Rutas principales
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🔐 Admin: http://localhost:${PORT}/admin`);
    console.log(`📁 Datos guardados en: ${path.join(__dirname, 'data')}`);
});