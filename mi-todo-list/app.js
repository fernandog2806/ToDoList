const express = require('express')
const app = express()

//Configuracion de EJS
app.set('view engine', 'ejs')

//Servir archivos estaticos
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('index');

});

app.listen(3000, () =>
console.log('Servidor corriendo en LOCAL HOST 3000'))