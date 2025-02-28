const express = require('express');
const {swaggerUi,swaggerSpec,optionsV2}=require('../swagger');
const app = express();
const PORT = 3002;
const cors = require('cors');
app.use(cors());

//Configuramos Swagger UI
app.use('/',swaggerUi.serve,swaggerUi.setup(swaggerSpec,optionsV2));

app.listen(PORT,() =>{
    console.log('MicroServicio de Documentacion corriendo en el puerto:'+PORT);
})