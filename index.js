const express = require('express');
require('./db');
const cors = require('cors');
const bodyParser = require('body-parser')
const routes = require('./routes');
//Importar configuración de Swagger
const {swaggerUi,swaggerSpec,optionsV2}=require('./swagger');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = 3000;

//Agregamos el Middleware para parsear las solicitudes JSON
app.use(express.json());
//Agregamos el middleware para datos de formularios www-form-urlencoded
app.use(bodyParser.urlencoded({extended:true}));
//Habilitar los CORS
app.use(cors());
//LIMITAR LAS CONEXIONES POR TIEMPO DETERMINADO
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, //Limitar a 1 minuto
    max: 10, //LImitamos el número de solcitudes por el tiempo definido
    message: 'Has realizado el limite permito de solcitudes, por favor espera 1 minuto'
});
app.use(limiter);

//Limitar el tamaño de las solicitudes entrantes al servidor
app.use(bodyParser.json({limit:'1mb'}));
//Importamos nuestras rutas
app.use(routes);
//Configuramos Swagger UI
app.use('/documentacion',swaggerUi.serve,swaggerUi.setup(swaggerSpec,optionsV2));
//Iniciar el servidor
app.listen(PORT, () => {
    console.log('Servidor Corriendo en el puerto:' + PORT);
})