//importamos mongoose
var mongoose = require('mongoose');
var MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/libreria_itz_db';

mongoose.connect(MONGO_URL);
//Cuando la conexión fue correcta
mongoose.connection.on('connected',function(){
    console.log('Conectado a la base de datos: '+MONGO_URL);
})
//Cuando hay un error en la conexión
mongoose.connection.on('error',function(error){
    console.log('Error al contectar la base de datos: '+error);
})
//Cuando se decontectada de la base de datos
mongoose.connection.on('disconnected',function(){
    console.log('Desconectado de la base de datos');
})