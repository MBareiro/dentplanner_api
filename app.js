// Aplicacion principal

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");

// Crear una instancia de la aplicación Express
const app = express();

// Configuración
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Definir el puerto en el que se ejecutará el servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
