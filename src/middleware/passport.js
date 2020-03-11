const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuarios = require('../models/Usuarios');

passport.use(new LocalStrategy({
    usernameField:'email',
    passwordField:'password'
  },
  async(email,password,next) => {
    // este codigo se ejecuta al llenar el formulario
    const usuario = await Usuarios.findOne({where:{email: email,activo:1}})

    // revisar si existe
    if(!usuario) return next(null,false,{
      message:'Ese usuario no existe o no lo ha confirmado'
    })

    // el usuario existe, comparar su password
    const vereficarPass = usuario.validarPassword(password,this.password)
    // si el password es incorrecto
    if(!vereficarPass) return next(null,false,{
      message:'Contraseña incorrecta'
    })

    // todo bien 
    return next(null,usuario)
  }
))

passport.serializeUser(function(usuario,cb) { cb(null,usuario)})
passport.deserializeUser(function (usuario,cb) {
  // const usuario = await Usuarios.findById(id)
  return cb(null,usuario)
})

module.exports = passport;