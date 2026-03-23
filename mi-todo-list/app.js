const express = require('express');
const path = require('path'); // Mueve el require arriba
const app = express();

// 1. Configuración de EJS y rutas de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {

    res.render('index');
});

// app.listen(3000, () => {
//     console.log('Servidor corriendo en http://localhost:3000');
// });

if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));
}

module.exports = app; 
