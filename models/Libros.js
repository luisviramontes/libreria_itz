//Instalamos Mongoose
//npm install mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Definimos el esquema de nuesto modelo de libros
const libroSchema = new Schema({
    titulo: String,
    autor: String,
    publicacion: Number
})

//Definimos el modelo del libro
const Libro = mongoose.model('Libro',libroSchema);
//Exportamos el moodelo
module.exports = Libro;