const Categorias = require('../models/Categorias')
const Grupos = require('../models/Grupos')
const { v4: uuidv4 } = require('uuid');
const { check,body, validationResult } = require('express-validator');
const multer = require('multer')
const shortid = require('shortid')
// const fs = require('fs')
const cloudinary = require('cloudinary')
const fs = require('fs-extra');


const configuracionMulter = {
  limits:{fileSize:2000000},
  storage:fileStorage = multer.diskStorage({
    destination:(req,file,next) => {
      next(null, __dirname + '/../public/uploads/grupos/')
    },
    filename: (req,file,next) => {
      const extension = file.mimetype.split('/')[1];
      next(null,`${shortid.generate()}.${extension}`)
    }
  }),
  fileFilter(req,file,next){
    // console.log(file);
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
      // el callback se ejecuta como tue o false | true cuando la imagen se acepta
      next(null,true)
    }else{
      next(new Error('Ese formato no es valido'),false)
    }
  }
}
const upload = multer(configuracionMulter).single('imagen');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

module.exports = { 
  formNuevoGrupo: async(req,res) => {
    const categorias = await Categorias.findAll();
    // console.log(categorias);

    res.render('nuevo-grupo',{
      nombrePagina: 'Crea un nuevo grupo',
      categorias
    })
  },
  crearGrupo: async(req,res) => {
    const grupo = req.body;
    // almacena el usuario autentico con el creador del grupo
    grupo.usuarioId = req.user.id
    grupo.id = uuidv4()
    const result = await cloudinary.v2.uploader.upload(req.file.path,{
      folder: 'meeti/grupos'
    });
    // leer la imagen
    if(req.file){
      grupo.imagen = result.url;
      grupo.public_id = result.public_id
    }
    
    // grupo.categoriaId = req.body.categoria
    const erroresExpress = validationResult(req)
    if (!erroresExpress.isEmpty()) {
      // si hay errores
      var errExp = erroresExpress.errors.map(err => err.msg);
      req.flash('error', errExp);
      res.redirect('/nuevo-grupo');
      return;
    }
    try {
      // almacenar en la base de datos
      await fs.unlink(req.file.path)
      await Grupos.create(grupo)
      req.flash('exito','Se ha creado el Grupo Correctamente')
      res.redirect('/administracion')
    } catch (error) {
      // console.log(error);
      // console.log(error.parent.code);
      // if(error.parent.code === '23505'){
      //   req.logout()
      //   req.flash('error','Sucedio un error, vuelva a intentarlo')
      //   res.redirect('/iniciar-sesion')
      //   return;
      // }
      // const erroresSequelize = error.erro.map(err => err.message);
      req.flash('error',error);
      res.redirect('/nuevo-grupo')
    }
  },
  subirImagen:(req,res,next) => {
    upload(req,res, function(error){
      if(error){
        // console.log(error);
        if(error instanceof multer.MulterError){
          if(error.code === 'LIMIT_FILE_SIZE'){
            req.flash('error','El archivo es muy grande')
          }else{
            req.flash('error', error.message)
          }
        }else if(error.hasOwnProperty('message')){
         req.flash('error', error.message)
        }
        res.redirect('back')
        return;
      }else{
        next()
      }
    })
  },
  formEditarGrupos:async(req,res,next) => {
    // const grupo = await Grupos.findByPk(req.params.id)
    // const categorias = await Categorias.findAll();
    const autenticate = await Grupos.findOne({where:{id:req.params.id,usuarioId:req.user.id}})
    if(!autenticate){
      req.flash('error','Operación no valida')
      res.redirect('/administracion')
      return next()
    }

    const consultas = [];
    consultas.push(Grupos.findByPk(req.params.id))
    consultas.push(await Categorias.findAll())
    // promise con await | para q se ejecuten al mismo tiempo
   const [grupo,categorias] = await Promise.all(consultas)

    res.render('editar-grupo',{
      nombrePagina:`Editar Grupo: ${grupo.nombre}`,
      grupo,
      categorias
    })
    
  },
  editarGrupo:async (req,res,next) => {
    const grupo = await Grupos.findOne({where:{id:req.params.id,usuarioId:req.user.id}})
    // si no exite el grupo o no es el dueño
    const erroresExpress = validationResult(req)
    if (!erroresExpress.isEmpty()) {
      // si hay errores
      var errExp = erroresExpress.errors.map(err => err.msg);
      req.flash('error', errExp);
      res.redirect('/administracion');
      return;
    }

    if(!grupo){
      req.flash('error','Operación no válida')
      res.redirect('/administracion')
      return next()
    }
    // todo bien
    // console.log(req.body);
    const {nombre,descripcion,categoriaId,url} = req.body;
    // asignar los valores
    grupo.nombre= nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId =categoriaId;
    grupo.url = url;
    // guardamos en la base de datos
    await grupo.save()
    req.flash('exito','Cambios almacenados Correctamente')
    res.redirect('/administracion')
  },
  formEditarImagen:async(req,res)=>{
    const grupo = await Grupos.findByPk(req.params.id)
    // console.log(grupo);
    res.render('imagen-grupo',{
      nombrePagina: `Editar Imagen Grupo: ${grupo.nombre}`,
      grupo
    })
    
  },
  editarimagen:async(req,res,next) => {
    const grupo = await Grupos.findOne({where:{id:req.params.id,usuarioId:req.user.id}})
    if(!grupo){
      req.flash('error','Operación no válida')
      res.redirect('/administracion')
      return next()
    }
    const result = await cloudinary.v2.uploader.upload(req.file.path,{
      folder: 'meeti/grupos'
    });
    // verificar que el archivo sea nuevo
    // if(req.file){
    //   console.log(req.file.filename);
    // }

    // revisar que exista un archivo anterior
    // if(grupo.imagen){
    //   console.log(grupo.imagen)
    // }


    // si hay imagen anterior y nueva
    if(req.file && grupo.imagen){
      await cloudinary.v2.uploader.destroy(grupo.public_id)
    }
    // si hay una imagen nueva , la guardamos
    if(req.file){
      grupo.imagen = result.url;
      grupo.public_id = result.public_id
    }

    // guardar en la DB
    await grupo.save()
    await fs.unlink(req.file.path)
    req.flash('exito','Cambios almacenados Correctamente')
    res.redirect('/administracion')
  },
  formEliminarGrupo:async(req,res,next) => {
    const grupo = await Grupos.findOne({where:{id:req.params.id,usuarioId:req.user.id}})
    if(!grupo){
      req.flash('error','Operación no válida')
      res.redirect('/administracion')
      return next()
    }
    // ejecutar la vista
    res.render('eliminar-grupo',{
      nombrePagina: `Eliminar Grupo:${grupo.nombre}`
    })
  },
  eliminarGrupo:async (req,res,next) => {
    const grupo = await Grupos.findOne({where:{id:req.params.id,usuarioId:req.user.id}})
    if(!grupo){
      req.flash('error','Operación no válida')
      res.redirect('/administracion')
      return next()
    }
    // console.log(grupo.imagen);
    // si hay una imagen eliminarla
    if(grupo.imagen){
      await cloudinary.v2.uploader.destroy(grupo.public_id)
    }
    // eliminar el grupo
    await Grupos.destroy({where:{
      id:req.params.id
    }})

    // redirecionar al usuario
    req.flash('exito','Grupo Eliminado')
    res.redirect('/administracion')
  },
  validarGrupo:[
    body('nombre').escape(),
    body('categoriaId').escape(),
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('descripcion', 'La descripción es obligatoria').not().isEmpty(),
    check('categoriaId', 'La categoria es obligatoria').not().isEmpty(),
    // check('imagen', 'La imagen es obligatoria').not().isEmpty(),
  ]
}