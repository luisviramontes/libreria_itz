var Libros = require('../models/Libros');

//Definir el CRUD de operaciones para libros

//CREAR LIBROS
exports.create = async function (req, res) {
    console.log(req.body);
    console.log(req.query);
    try {
        var libro = new Libros(req.body);
        await libro.save();
        return res.json(libro);
    } catch (error) {
        return res.status(500).json({
            message: "Error al guardar el libro",
            error: error.message
        })
    }
}
//LISTAR TODOS LOS LIBROS
exports.list = async function (req, res) {
    await Libros.find().then(function (libros) {
        return res.json(libros)
    }).catch(error => {
        return res.status(500).json({
            message: "Error al obtener todos los libros",
            error: error
        })
    })
}
//ACTUALIZAR LIBROS 
exports.update = async function (req, res) {
    try {
        const libroAct = await Libros.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
        if (!libroAct) {
            return res.status(404).json({ error: "Libro no encontrado" });
        }
        return res.json(libroAct);
    } catch (error) {
        return res.status(500).json({
            message: "Error al actualizar el libro",
            error: error
        })
    }
}
//ELIMINAR UN LIBRO /{_id}
exports.remove = async function (req, res) {
    try {
        const libroElim = await Libros.findByIdAndDelete(req.params.id);
        if (!libroElim) {
            return res.status(404).json({ error: "LIbro no encontrado" });
        }
        return res.json({message:"Libro eliminado correctamente"});
    } catch (error) {
        return res.status(500).json({
            message: "Error al eliminar el libro",
            error: error
        })
    }
}
//MOSTRAR UN LIBRO POR SU _ID
exports.show = async function (req, res) {
    console.log(req.params);
    try {
        const libro = await Libros.findById(req.params.id);
        if (!libro) {
            return res.status(404).json({ error: "Libro no econtrado" });
        }
        return res.json(libro);
    } catch (error) {
        return res.status(500).json({
            message: "Error al mostrar el libro",
            error: error
        })
    }
}