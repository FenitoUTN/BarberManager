require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`BarberManager API escuchando en el puerto ${PORT}`);
});
