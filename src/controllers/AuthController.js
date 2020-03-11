const passport = require('passport')

module.exports = { 
  autenticarUsuario:passport.authenticate('local',{
    successRedirect:'/administracion',
    failureRedirect:'/iniciar-sesion',
    failureFlash:true,
    badRequestMessage:'Ambos campos son obligatorios'
  }),
  // revisa si el usuario esta autenticado
  UsuarioAtenticado:(req,res,next) => {
    // si eL usuario esta autenticado
    if(req.isAuthenticated()){
      return next();
    }
    // sino esta autenticado
    return res.redirect('/iniciar-sesion')
  },
  cerrarSesion:(req,res,next)=>{
    req.logout()
    req.flash('exito','Cerraste Sesión Correctamente')
    res.redirect('iniciar-sesion')
    next()
  }
}