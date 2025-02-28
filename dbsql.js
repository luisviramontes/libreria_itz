//npm i sqlite3
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:'); // Creamos una base de datos en memoria

db.serialize(()=>{
    db.run(`CREATE TABLE users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
        )`);
    //Insertamos un usuario con una contraseña
    db.run(`INSERT INTO users (username,password) VALUES('admin','admin123')`);    
    db.run(`INSERT INTO users (username,password) VALUES('admin2','admin123')`);    
})
console.log('BASE DE DATOS SQL CREADA CORRECTAMENTE');
module.exports= db;