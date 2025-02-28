const express = require('express');
require('../db');
const cors = require('cors');
const bodyParser = require('body-parser')
const rateLimit = require('express-rate-limit');
const librosController = require('../controllers/LibrosController');
const authenticateJWT = require('../authMiddleware');
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

//Rutas para libros
/**
 * @swagger
 * /libros:
 *  get:
 *      summary: Obtener todos los libros
 *      responses:
 *          200:
 *              description: Lista de libros
 */
app.get('/', authenticateJWT, async (req, res) => {
    librosController.list(req, res);
});

/**
 * @swagger
 * /libros/{id}:
 *  get:
 *      summary: Obtener un libro por su ID
 *      parameters:
 *          -   in: path
 *              name:   id
 *              required:   true
 *              description: ID del libro
 *              schema:
 *                  type:   string
 *      responses:
 *          200:
 *              description: Detalles del libro
 */

app.get('/:id',authenticateJWT, async (req, res) => {
    librosController.show(req, res);
})
/**
 * @swagger
 * /libros:
 *  post:
 *      summary:    Crear un nuevo libro
 *      consumes:
 *          -   application/json
 *      parameters:
 *          -   in: body
 *              required:   true
 *              name:   libros
 *              schema:
 *                  type:   object
 *                  properties:
 *                      titulo:
 *                          type:   string
 *                      autor:
 *                          type:   string
 *                      publicacion:
 *                          type:   integer
 *                  example:
 *                      titulo: "100 años de soledad"
 *                      autor:  "Gabriel Garcia Márquez"
 *                      publicacion:    1982
 *      responses:
 *          200:
 *              description: Libro creado con éxito
 */
app.post('/',authenticateJWT, async (req, res) => {
    librosController.create(req, res);
})

/**
 * @swagger
 * /libros/{id}:
 *  put:
 *      summary: Actualizar un libro por ID
 *      consumes:
 *          - application/json
 *      parameters:
 *          -   in: path
 *              name:   id
 *              required:   true
 *              description:    ID del libro
 *              schema:
 *                  type:   string
 *          -   in: body
 *              name: libro
 *              description: Datos a actualizar
 *              required:   true             
 *              schema:
 *                  type: object
 *                  properties:
 *                      titulo:
 *                          type:   string
 *                      autor:
 *                          type:   string
 *                      publicacion:
 *                          type:   integer
 *                  example:
 *                     titulo: "100 Años de Soledad"
 *                     autor: "Gabriel Garcia Márquez"
 *                     publicacion: 1982
 *      responses:
 *          200:
 *              description: Libro actualizado correctamente
 *          400:
 *              description: Datos inválidos en la solicitud
 *          404:
 *              description: Libro no encontrado
 *          500:
 *              description: Error interno del servidor
 *      
 */
app.put('/:id',authenticateJWT, async (req, res) => {
    librosController.update(req, res);
});

/**
 * @swagger
 * /libros/{id}:
 *  delete:
 *      summary:    Eliminar un libro por ID
 *      parameters:
 *          -   in: path
 *              name: id
 *              required:   true
 *              description:    ID del libro
 *              schema:
 *                  type: string
 *      responses:
 *          200:
 *              description: Libro eliminado con éxito
 *          404:
 *              description: Libro no encontrado
 */
app.delete('/:id',authenticateJWT, async (req, res) => {
    librosController.remove(req, res);
})

app.listen(PORT,()=>{
    console.log('MicroServicio de Libros corriendo en el puerto: '+PORT);
})
