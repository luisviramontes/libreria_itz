const express = require('express');
require('../db');
const cors = require('cors');
const bodyParser = require('body-parser')
const rateLimit = require('express-rate-limit');
const usersController = require('../controllers/usersController');
const app = express();
const PORT = 3001;

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

/**
 * @swagger
 * /users/get-token:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Obtener un token de autenticación
 *     description: Autentica al usuario con su email y clave API para devolver un token.
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: false
 *         description: Email del usuario (puede ser enviado en query o body).
 *       - in: query
 *         name: api_key
 *         schema:
 *           type: string
 *         required: false
 *         description: Clave API del usuario (puede ser enviada en query o body).
 *       - in: body
 *         name: body
 *         description: Alternativa para enviar los parámetros email y api_key en el cuerpo de la solicitud.
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: "luis.vr@itz.edu.mx"
 *             api_key:
 *               type: string
 *               example: "apikey12345"
 *     responses:
 *       200:
 *         description: Token generado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIs..."
 *       404:
 *         description: Error de autenticación (email o api_key incorrectos)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Usuario no encontrado"
 */

app.post('/get-token',async(req,res)=>{
    if(Object.keys(req.query).length > 0){
      var  request = req.query;
    }else if(Object.keys(req.body).length > 0){
       var request= req.body;
    }
    const {email, api_key} = request;
    try {
        const result = await usersController.authenticate(email,api_key);
        res.json(result);
    } catch (error) {
        res.status(404).json({error: error.message})
    }
})

/**
 * @swagger
 * /users:
 *   post:
 *     tags:
 *       - Users
 *     summary: Crear un nuevo usuario
 *     description: Crea un nuevo usuario en la base de datos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Luis Viramontes"
 *               email:
 *                 type: string
 *                 example: "luis.vr@itz.edu.mx"
 *               password:
 *                 type: string
 *                 example: "qwerty12345"
 *     responses:
 *       201:
 *         description: Usuario creado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario creado correctamente"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60a63c8f7ae2c2c4a6d8e8b1"
 *                     name:
 *                       type: string
 *                       example: "Luis Viramontes"
 *                     email:
 *                       type: string
 *                       example: "luis.vr@itz.edu.mx"
 *                     api_key:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIs..."
 *       400:
 *         description: Error en los datos proporcionados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Faltan datos requeridos para crear el usuario"
 */
app.post('/',async(req,res)=>{
    console.log('Recibio petición desde el puerto 800');
    console.log(req.body);
    
    usersController.create(req,res);
})

app.get('/',async (req,res)=>{
    res.json({message:'Hola mundo desde Users'});
})
app.listen(PORT,()=>{
    console.log('Microservicio Users corriendo en el puerto:'+PORT);
})