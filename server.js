const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Aumentar límite para imágenes base64
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const FILES = {
    appointments: path.join(DATA_DIR, 'appointments.json'),
    services: path.join(DATA_DIR, 'services.json')
};

const defaultServices = [
    { name: 'Peinado con moñitos', price: 25, img: 'https://a.top4top.io/p_3577x7oka5.jpg', description: 'Peinado completo, moñitos, trenzas y decoraciones.' },
    { name: 'Coloración', price: 50, img: 'https://images.unsplash.com/photo-1552902865-b72f031c5c3f?w=500&q=80', description: 'Técnicas avanzadas de coloración profesional.' },
    { name: 'Tratamientos Capilares', price: 35, img: 'https://images.unsplash.com/photo-1593705114312-a0ee03a3f7c2?w=500&q=80', description: 'Restauración y vitalidad capilar.' },
    { name: 'Peinados para Eventos', price: 40, img: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500&q=80', description: 'Looks elegantes para ocasiones especiales.' },
    { name: 'Extensiones Capilares', price: 120, img: 'https://g.top4top.io/p_3577h407a0.jpg', description: 'Añade longitud y volumen natural.' },
    { name: 'Maquillaje Profesional', price: 45, img: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=500&q=80', description: 'Realza tu belleza con técnicas profesionales.' }
];

function readJSON(file, defaultData = []) {
    try { if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch (e) { console.error(`Error:`, e); }
    fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
    return defaultData;
}

function writeJSON(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2)); }

// API Servicios
app.get('/api/services', (_, res) => res.json(readJSON(FILES.services, defaultServices)));

app.post('/api/services', (req, res) => {
    const data = readJSON(FILES.services, defaultServices);
    data.push(req.body);
    writeJSON(FILES.services, data);
    res.json({ success: true, data });
});

app.delete('/api/services/:index', (req, res) => {
    const data = readJSON(FILES.services, defaultServices);
    const i = parseInt(req.params.index);
    if (i >= 0 && i < data.length) { data.splice(i, 1); writeJSON(FILES.services, data); res.json({ success: true }); }
    else res.status(400).json({ error: 'Índice inválido' });
});

// API Turnos
app.get('/api/appointments', (_, res) => res.json(readJSON(FILES.appointments, [])));

app.post('/api/appointments', (req, res) => {
    const data = readJSON(FILES.appointments, []);
    data.push({ ...req.body, timestamp: new Date().toISOString() });
    writeJSON(FILES.appointments, data);
    res.json({ success: true, data });
});

app.delete('/api/appointments/:index', (req, res) => {
    const data = readJSON(FILES.appointments, []);
    const i = parseInt(req.params.index);
    if (i >= 0 && i < data.length) { data.splice(i, 1); writeJSON(FILES.appointments, data); res.json({ success: true }); }
    else res.status(400).json({ error: 'Índice inválido' });
});

// API Carrusel (usa imágenes de servicios)
app.get('/api/carousel', (req, res) => {
    const services = readJSON(FILES.services, defaultServices);
    const carouselImages = services
        .filter(s => s.img)
        .map(s => ({ image: s.img, name: s.name, description: s.description }));
    res.json(carouselImages);
});

app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin', (_, res) => res.sendFile(path.join(__dirname, 'admin.html')));

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🔐 Admin: http://localhost:${PORT}/admin`);
    console.log(`📁 Datos: ${DATA_DIR}`);
});