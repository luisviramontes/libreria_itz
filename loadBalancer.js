// npm i http-proxy-middleware axios
const express = require('express');
const {createProxyMiddleware} = require('http-proxy-middleware');
const axios = require('axios');

const app = express();
const PORT = 8000;

//Lista de Microservicios con su puerto correspondiente
const services = {
    libros: 'http://localhost:3000',
    users: 'http://localhost:3001',
    documentacion:'http://localhost:3002',
    itz:'https://zacatecas.tecnm.mx/'
}
//Middleware para comprobar si el servicio está disponible
const checkServiceStatus= async (req,res,next)=>{
    //Extraer el primer segmento de la url
   // /localhost:8000/libros
    const serviceName = req.originalUrl.split('/')[1]; 
    console.log(req.originalUrl);
    console.log(req.originalUrl.split('/')[1]);
    const serviceUrl = services[serviceName];
    console.log(serviceUrl);
    if(!serviceUrl){
        return res.status(404).json({error:'MicroServicio no encontrado'});
    }
    try {
        await axios.get(serviceUrl); // Intenta hacer una solicitud al servicio
        next();//Si responde, continua el flujo del proxy
    } catch (error) {
        console.log(error);
        return res.status(503).json({error:'El servicio '+serviceName +" no está disponible por el momento"})       
    }
}

//Aplicamos el middleware en la verificación antes del proxy
app.use('/users',checkServiceStatus,createProxyMiddleware({
    target:services.users,
    changeOrigin:true
}))

app.use('/libros',checkServiceStatus,createProxyMiddleware({
    target:services.libros,
    changeOrigin:true
}))

app.use('/documentacion',checkServiceStatus,createProxyMiddleware({
    target: services.documentacion,
    changeOrigin:true,
    pathRewrite: {'^documentacion':''},
}))

app.use('/itz',checkServiceStatus,createProxyMiddleware({
    target: services.itz,
    changeOrigin:true
}))

app.listen(PORT, ()=>{
    console.log('LoadBalancer corriendo en el puerto: '+PORT);
})
