var mongoose = require('mongoose');
//Definimos el esquemaq del usuario

const generateApiKey= ()=>{
    const characters = "AQWERTYUIOPASDFGHJKLÑZXCVBNMqwertyuiopasdfghjklñzxcvbnm0123456789";
    let apiKey = '';
    for (let index = 0; index < 15; index++) {        
        apiKey += 
        characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return apiKey;
}

const UserSchema = new mongoose.Schema({
    email: {type:String, unique:true, required:true},
    password: {type:String, required:true},
    api_key: { type:String, require:true, unique:true ,default: generateApiKey},
    saldo:  {type:Number, default: 5}
});

/*
UserSchema.pre('save',function(next){
    if(!this.api_key){
        this.api_key = generateApiKey();
    }
    next();
})
*/
    
//Definimos el modelo
const User = mongoose.model('User',UserSchema);
//Exportamos el modelo
module.exports = User;