const jwt= require('jsonwebtoken');
var Users = require('./models/Users');

const authenticateJWT = async (req,res,next) => {
    const token = req.header('Authorization');
    console.log('TOKEN DE SEGURIDAD:'+token);
    if(!token){
        //return res.status(401).json({error:'Acceso no autorizado'});
        return res.json({message:'Hola mundo desde Middelware de Users'});
    }
        try {
            const user = await jwt.verify(token,'tu-palabra-secreta');
            console.log(user.api_key);
            const usuario = await Users.findOne({api_key:user.api_key});
            if(!usuario){
                return res.status(401).json({error:'Usuario no valido'});
            }
            if(usuario.saldo <= 0){
                return res.status(401).json({error:'Saldo insuficiente'});
            }
            req.user = user;
            next();        
        } catch (error) {
            return res.status(400).json({error:error.message});
        }
}
module.exports = authenticateJWT;
    
