const Usuarios = require('../models/Usuarios')
const { check,body, validationResult } = require('express-validator');
const enviarEmail = require('../handlers/email')
const multer = require('multer')
const shortid = require('shortid')
const fs = require('fs')

const configuracionMulter = {
  limits:{fileSize:2000000},
  storage:fileStorage = multer.diskStorage({
    destination:(req,file,next) => {
      next(null, __dirname + '/../public/uploads/perfiles/')
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



module.exports = { 
  formCrearCuenta: (req,res) => {
   res.render('crear-cuenta',{
     nombrePagina: ' Crea tu cuenta'
   })
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
  crearNuevaCuenta: async (req,res,next) => {
    const usuario = req.body;
    // leer los errores de express
    const erroresExpress = validationResult(req)
    if (!erroresExpress.isEmpty()) {
      // si hay errores
      var errExp = erroresExpress.errors.map(err => err.msg);
      req.flash('error', errExp);
      res.redirect('/crear-cuenta');
      return;
    }
    try {
      await Usuarios.create(usuario)

      // url de confirmacion
      const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`

      // enviar email de confirmacion
      await enviarEmail.enviarEmail({
        usuario,
        url,
        subject : 'Confirma tu cuenta de Meeti',
        archivo: 'confirmar-cuenta'
      })

      req.flash('exito','Hemos enviado un Correo, confirma tu cuenta.')
      res.redirect('/iniciar-sesion');
    } catch (error) {
      // console.log(error.message);

      // extraer el message de los errores
      // const erroresSequelize = error.map(err => err.message);

      // extraer unicamente el msg de los errores
      // const errExp = erroresExpress.map(err => err.msg);

      //unirlos
      // const listaErrores = [...erroresSequelize];

      // hago este mensaje directo porque no me capta el mensaje de email unique
      req.flash('error', 'El correo ya existe');
      res.redirect('/crear-cuenta');
    }
  },
  // iniciar-sesion
  formIniciarSesion:(req,res)=> {
    res.render('iniciar-sesion',{
      nombrePagina: 'Iniciar Sesión'
    })
  },
  confirmarCuenta:async (req,res,next) => {
    // verificar q el usuario existe
    const usuarios = await Usuarios.findOne({where:{email: req.params.correo}})
    // console.log(req.params.correo);  
    // sino existe redirrecionar
    if(!usuarios){
      req.flash('error', 'No existe esta cuenta')
      res.redirect('/crear-cuenta')
      return next()
    }
    // si existe, confirmar suscripción y redireccionar
    // console.log(usuarios.activo);
    usuarios.activo = 1;
    await usuarios.save();
    req.flash('exito','La cuenta se a confirmado, ya puede iniciar sesión.')
    res.redirect('/iniciar-sesion')
  },
  // mostrar el formulario para editar el perfil
  formEditarPerfil:async(req,res) => {
    const usuario = await Usuarios.findByPk(req.user.id)
    res.render('editar-perfil',{
      nombrePagina:'Editar Perfil',
      usuario
    })
  },
  editarPerfil:async(req,res)=>{
    const usuario = await Usuarios.findByPk(req.user.id);
    const erroresExpress = validationResult(req)
    if (!erroresExpress.isEmpty()) {
      // si hay errores
      var errExp = erroresExpress.errors.map(err => err.msg);
      req.flash('error', errExp);
      res.redirect('/administracion');
      return;
    }
    // leer datos de form
    const {nombre,descripcion,email} = req.body;
    // asignar los valores
    usuario.nombre = nombre
    usuario.descripcion = descripcion
    usuario.email = email
    // guardar en la BD
    await usuario.save()
    req.flash('exito','Cambios Guardados Corretamente')
    res.redirect('/administracion')
  },
  formCambiarPassword:(req,res) => {
    res.render('cambiar-password',{
      nombrePagina:'Cambiar Contraseña'
    })
  },
  cambiarPassword:async(req,res,next)=> {
    const usuario = await Usuarios.findByPk(req.user.id)
    // verificar el password anterior sea correcto
    if(!usuario.validarPassword(req.body.anterior)){
      req.flash('error','La Contraseña actual es incorrecta')
      res.redirect('/administracion')
      return next()
    }
    // si el password es correcto, hashear el nuevo
    const hash = usuario.hashPassword(req.body.nuevo);
    // console.log(hash);
    
    // asignar el password al usuario
    usuario.password = hash
    // guardar en la base de datos
    await usuario.save()
    // redirecinar
    req.logout();
    req.flash('exito','La Contraseña se a modificado correctamente,Vuelve a iniciar sesión')
    res.redirect('/iniciar-sesion')
  },
  formImagenPerfil:async(req,res)=>{
    const usuario = await Usuarios.findByPk(req.user.id);
    // mostrar la vista
    res.render('imagen-perfil',{
      nombrePagina:'Subir Imagen Perfil',
      usuario
    })
  },
  imagenPerfil:async(req,res)=>{
    const usuario = await Usuarios.findByPk(req.user.id);

    // si hay imagen anterior y nueva
    if(req.file && usuario.imagen){
      const imagenAnteriorPath = __dirname + `/../public/uploads/perfiles/${grupo.imagen}`;
      fs.unlink(imagenAnteriorPath,(error) => {
        if(error) {
          console.log(error);
        }
        return;
      })
    }
    // si hay una imagen nueva , la guardamos
    if(req.file){
      usuario.imagen = req.file.filename;
    }

    // guardar en la DB
    await usuario.save()
    req.flash('exito','Cambios almacenados Correctamente')
    res.redirect('/administracion')
  },
  validarCuenta:[
    body('password').escape(),
    body('confirmar').escape(),
    body('email').escape(),
    check('email', 'El email es olbigatorio').isEmail(),
    check('password', 'La contraseña es olbigatoria').not().isEmpty(),
    check('confirmar', 'La contraseña confirmada no puede ir vacio').not().isEmpty(),
    check('confirmar', 'La contraseña es diferente').custom((value, { req }) => value == req.body.password)
  ],
  validarPerfil:[
    body('nombre').escape(),
    check('nombre', 'el nombre es olbigatorio').not().isEmpty(),
    check('email', 'El email es olbigatorio').isEmail()
  ]
}