require('dotenv').config();
const app = require('./app');

// El puerto por defecto debe coincidir con el que documenta el README (:3000),
// con backend/.env.example y con el proxy de Vite (frontend/vite.config.js). Antes
// caía a 4000, lo que dejaba al frontend sin poder alcanzar la API cuando no existía
// un .env (clon limpio o CI).
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`BarberManager API escuchando en el puerto ${PORT}`);
});
