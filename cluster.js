const os = require('os');
const http = require('http');
// npm i cluster http-proxy 
const cluster = require('cluster');
const { createProxyServer } = require('http-proxy');
const { cpuUsage } = require('process');

//Obtener el número de CPUs dispoibles en el sistema
const numCPUs = os.cpus().length;
const MAX_PODS = 10;// Limitamos el número máximo de PODS a 10
const MIN_PODS = 1;// Limitamos el número máximo de PODS a 10
let numPods = Math.min(4, numCPUs);//Iniciamos con 4 pods o el número de CPUs disponibles(Seleccionar la que sea menor);
const PORT = 8000; //Puerto en el que el balanceador de carga escuchará las peticiones

//Verificar el servidor actual es el Server Maestro
if (cluster.isMaster) {
    console.log('Servidor Maestro iniciado en el puerto:' + PORT);
    //Arreglo para almacenar los pods activos    
    const pods = [];

    for (let i = 0; i < numPods; i++) {
        const pod = cluster.fork(); //Creamos un nuevo pod
        pods.push(pod);//Lo almacenamos en la lista de pods
    }

    //ïndice para el balanceo de carga (Round-robin)
    let podSeleccionado = 0;
    //Instancia del proxy para redirijor el trafico a los pods
    const proxy = createProxyServer();

    //Creamos el servidor que actará cómo Balanceador de Carga
    const server = http.createServer((req, res) => {
        if (pods.length === 0) {
            res.writeHead(503, { 'Content-type': 'text/plain' });
            res.end('No hay pods disponibles');
            return;
        }

        //Selecionar un pod en orden (round-robin)
        const pod = pods[podSeleccionado % pods.length];
        podSeleccionado++;

        //Construir la URL del destino del pod
        const target = "http://localhost:" + pod.port;
        console.log('Redirigiendo peticion' + req.url + " al pod en el puerto:" + pod.port);

        proxy.web(req, res, { target }, (err) => {
            res.writeHead(500, { 'content-type': 'text/plain' });
            res.end('Error en el Balanceador de carga');
            console.error('Error al redirigir petición a ' + target, err);
        })
    })
    //Iniciar el servidor en el puerto definido
    server.listen(PORT, () => {
        console.log('Balanceador de carga escuchando en el puerto: ' + PORT);
    })
    //Manejar errores en los pods o pods muertos
    cluster.on('exit', (pod) => {
        const newPod = cluster.fork();
        pods[pods.indexOf(pod)] = newPod; // Reemplazamos el pod(que fallo) por el pod nuevo
    })

    //Capturar información de los pods, cómo su puerto y uso de CPU/Memoria
    cluster.on('online', (pod) => {
        pod.on('message', (message) => {
            if (message.port) {
                pod.port = message.port
            }
            if (message.stats) {
                console.log('Pod ' + pod.process.pid + " CPU:" + message.stats.cpu + "| Memoria:" + message.stats.memory);

            }
        })
    })
    //Monitorear el Servidor Master cada 5 segundos
    setInterval(() => {
        const memoryUsage = process.memoryUsage().rss / 1024 / 1024; // Obteter el uso de memoria en MB
        const cpuUsage = os.loadavg()[0] / numCPUs * 100; // Obtenemos la carga de CPU en %
        console.log('Servidor Maestro:' + process.pid + " CPU: " + cpuUsage.toFixed(2) + "% | Memory:" + memoryUsage.toFixed(2) + " MB");
        //Si el uso del CPU supera el 50% y no se ha alcanzado el máximo
        // de pods, creamos un nuevo pod
        if (cpuUsage > 50 && pods.length < MAX_PODS) {
            const newPod = cluster.fork();
            pods.push(newPod);
            numPods++;
            console.log('El uso del CPU está al 50%, creado un nuevo Pod...');
        }

    }, 5000)
} else {
    // Código que van a ejecutar los PODS
    const express = require('express');
    require('./db');
    const cors = require('cors');
    const bodyParser = require('body-parser')
    const routes = require('./routes');
    //Importar configuración de Swagger
    const { swaggerUi, swaggerSpec, optionsV2 } = require('./swagger');
    const rateLimit = require('express-rate-limit');
    const app = express();
    const podPORT = 3000 + cluster.worker.id;

    //Agregamos el Middleware para parsear las solicitudes JSON
    app.use(express.json());
    //Agregamos el middleware para datos de formularios www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: true }));
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
    app.use(bodyParser.json({ limit: '1mb' }));
    //Importamos nuestras rutas
    app.use(routes);
    //Configuramos Swagger UI
    app.use('/documentacion', swaggerUi.serve, swaggerUi.setup(swaggerSpec, optionsV2));
    
    //Ruta principal para verificar que POD maneja la peticion
    app.get('/',(req,res)=>{
        res.send('Pod:'+process.pid+" escuchando en el puerto: "+podPORT);
    })
    
    //Iniciar el servidor en el puerto asignado
    const server = app.listen(podPORT, ()=>{
        console.log('Pod escuchando en el puerto:'+podPORT);
        process.send({port:podPORT});//Enviamos el puerto al Master
    })

    setInterval(()=>{
        const memoryUsage = process.memoryUsage().rss  / 1024 / 1024; // Obteter el uso de memoria en MB
        const cpuUsage = os.loadavg()[0] / numCPUs * 100; // Obtenemos la carga de CPU en %
        process.send({stats:{cpu: cpuUsage.toFixed(2), memory:memoryUsage.toFixed(2)}})
    },5000)
}