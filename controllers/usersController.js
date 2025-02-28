
//Funcion para autenticar usuarios NOSQL
var User = require('../models/Users');
//npm i jsonwebtoken
const jwt = require('jsonwebtoken');

exports.authenticate= async function(email,api_key){
    if(typeof email !== 'string' || typeof api_key !== 'string'){
        console.log('Intento de NoSql Inyection');
        return res.status(500).json({message:"Intento de Nosql Inyection"});
    }
    let user = await User.findOne({email,api_key});
    if(!user){
        return res.status(404).json({message:"Api Key No valida"});
    }
    if(user.saldo <= 0){
        return res.status(404).json({message:"Saldo insuficiente"});
    }

    //Si la autenticación fue ecorrecta, le generamos un token
    const token = jwt.sign({email,api_key},'tu-palabra-secreta',
        {expiresIn:"1h"});
    //
    return {token, message:"El token será valido por 1 hora"}
}
/*
exports.authenticate= async function(email,api_key){
    // Validar que los parámetros sean strings y tengan el formato correcto
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Validación básica de email
    const apiKeyRegex = /^[a-zA-Z0-9]+$/; // Solo letras y números

    if (!emailRegex.test(email) || !apiKeyRegex.test(api_key)) {
        console.log('Intento de NoSQL Injection');
        return { message: "Intento de NoSQL Injection" };
    }
    let user = await User.findOne({email,api_key});
    if(!user){
        return {message:"Api Key No valida"};
    }
    if(user.saldo <= 0){
        return {message:"Saldo insuficiente"};
    }

    //Si la autenticación fue ecorrecta, le generamos un token
    const token = jwt.sign({email,api_key},'tu-palabra-secreta',
        {expiresIn:"1h"});
    //
    return {token, message:"El token será valido por 1 hora"}
}
*/
exports.create = async function (req,res) {
    //Para que la api funcione y reciba el request desde el body o el query
    if(Object.keys(req.query).length > 0){
        request = req.query;
    }else if(Object.keys(req.body).length > 0){
        request= req.body;
    }
    //Validamos campos obligatorios
    if(!request.email || !request.password){
        return res.status(400).json({message:"Los campos de email y password son obligatorios"});
    }
    try {
        //Verificar si el correo electrónico ya existe en la base de datos
        const existingUser = await User.findOne({email:request.email});
        if(existingUser){
            return res.status(400).json({message:'El email ya se encuentra registrado'});
        }

        //Crear y guardar el nuevo usuario
        const user = new User(request);
        await user.save();
        return res.json({user,message:'Usuario guardado correctamente'});
        
    } catch (error) {
        return res.status(500).json({
            message:"Error al guadar el usuario",
            error: error.message
        })
        
    }
    
}

exports.updateUser = async function(req,res) {
    const token = req.header=("Authorization");
    console.log('token:'+token);
    const decodedToken = jwt.verify(token,'tu-palabra-secreta');
    console.log(decodedToken);
    //Obtener el usuario
    const user = await User.findOne({api_key:decodedToken.api_key})
    //Verificamos si el usuario existe
    if(!user){
        return res.status(404).json({message:"Usuario no encontrado"});
    }

    //Actualizar el saldo 
    user.saldo = user.saldo -1;
    await user.save();
    return {user, message:"Petición éxitosa"};
}


