const express = require('express');
const librosController = require('./controllers/LibrosController');
const usersController = require('./controllers/usersController');
const authenticateJWT = require('./authMiddleware');
const router = express.Router();
//Rutas no protegidas

/**
 * @swagger
 * /get-token:
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

router.post('/get-token',async(req,res)=>{
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
router.post('/users',async(req,res)=>{
    usersController.create(req,res);
})

//Rutas protegidas
//Rutas para usuarios

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
router.get('/libros',authenticateJWT, async (req, res) => {
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

router.get('/libros/:id',authenticateJWT, async (req, res) => {
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
router.post('/libros',authenticateJWT, async (req, res) => {
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
router.put('/libros/:id',authenticateJWT, async (req, res) => {
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
router.delete('/libros/:id',authenticateJWT, async (req, res) => {
    librosController.remove(req, res);
})

module.exports= router;