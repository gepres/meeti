const Grupos = require('../models/Grupos')
const Meeti = require('../models/Meeti')
const { check,body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

module.exports = {  
  formNuevoMeeti:async (req,res) => {
    const grupos = await Grupos.findAll({where:{usuarioId:req.user.id}})
    res.render('nuevo-meeti',{
      nombrePagina: 'Crear Nuevo Meeti',
      grupos
    })
  },
  crearMeeti: async (req,res) => {
    // obtener los datos
    const meeti = req.body;
    // console.log(meeti);


    // asignar el usuario
    meeti.usuarioId = req.user.id;
    // alamacena la ubicación con un point
    // console.log(req.body.lat,req.body.lng);
    // console.log(parseFloat(req.body.lat),parseFloat(req.body.lng));
    
    
    const point = {
      type:'Point',
      coordinates:[parseFloat(req.body.lat),parseFloat(req.body.lng)],
    }
    // console.log(point);
    
    meeti.ubicacion = point;
    meeti.id = uuidv4()
    // cupo opcional
    if(req.body.cupo === ''){
      meeti.cupo = 0;
    }
    // almacenar en la base de datos
    try {
      await Meeti.create(meeti)
      req.flash('exito','Se ha creado el meeti Correctamente')
      res.redirect('/administracion');
    } catch (error) {
      // console.log(error);
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error',erroresSequelize);
        res.redirect('/nuevo-meeti');
      
    }
  },
  formEditarMeeti:async (req,res,next) => {
    const consultas = [];
    consultas.push(Grupos.findAll({where:{usuarioId:req.user.id}}))
    consultas.push(Meeti.findByPk(req.params.id))
    // retornar un promise
    const [grupos,meeti] = await Promise.all(consultas)
    if(!grupos || !meeti){
      req.flash('error','Operación no valida');
      res.redirect('/administracion');
      return next()
    }
    // mostrar la vista
    res.render('editar-meeti',{
      nombrePagina: `Editar Meeti: ${meeti.titulo}`,
      grupos,
      meeti
    })
  },
  editarMeeti:async (req,res,next)=>{
    const meeti = await Meeti.findOne({
      where:{
        id:req.params.id,
        usuarioId:req.user.id
      }
    })

    if(!meeti){
      req.flash('error','Operación no valida');
      res.redirect('/administracion');
      return next()
    }
    // asignar los valores
    const {grupoId,titulo,invitado,fecha,hora,cupo,descripcion,direccion,ciudad,estado,pais,lat,lng} = req.body
    meeti.grupoId = grupoId;
    meeti.titulo = titulo
    meeti.invitado = invitado
    meeti.fecha = fecha
    meeti.hora = hora
    meeti.cupo = cupo
    meeti.descripcion = descripcion
    meeti.direccion = direccion
    meeti.ciudad = ciudad
    meeti.estado = estado
    meeti.pais = pais

    // asignar point (ubicacion)
    const point = {
      type:'Point',
      coordinates:[parseFloat(lat),parseFloat(lng)],
    }
    meeti.ubicacion = point;

    // alamacenar en base de datos
    meeti.save()
    req.flash('exito','Cambios Guardados Correctamente');
    res.redirect('/administracion');
  },
  formEliminarMeeti:async(req,res,next)=> {
    const meeti = await Meeti.findOne({where:{id:req.params.id,usuarioId:req.user.id}})
    if(!meeti){
      req.flash('error','Operación no válida')
      res.redirect('/administracion')
      return next()
    }
    // ejecutar la vista
    res.render('eliminar-meeti',{
      nombrePagina: `Eliminar Meeti:${meeti.titulo}`
    })
  },
  eliminarMeeti:async(req,res,next)=>{ 
    await Meeti.destroy({where:{id:req.params.id}})
    req.flash('exito','Meeti Eliminado')
      res.redirect('/administracion')
  },
  sanitizarMeeti:[
    body('titulo').escape(),
    body('invitado').escape(),
    body('cupo').escape(),
    body('fecha').escape(),
    body('hora').escape(),
    body('direccion').escape(),
    body('ciudad').escape(),
    body('estado').escape(),
    body('pais').escape(),
    body('lat').escape(),
    body('lng').escape()
  ]
}