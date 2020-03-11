const express = require('express')
const path = require('path')
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const passport = require('./middleware/passport')

// Initializations
const app = express()
require('./database');

// modelos
require('./models/Usuarios')
require('./models/Categorias')
require('./models/Comentarios')
require('./models/Grupos')
require('./models/Meeti')

// settings
app.set('port', process.env.PORT || 3000);


// static files & views engine || en handlebars se puede poner al ultimo pero  ejs antes de routes
app.set('view engine','ejs');
app.use(express.static(__dirname + '/public'));
app.use(expressLayouts)
app.set('views', path.join(__dirname, 'views'))




// MIDDLEWARES
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true})) // false para desavilitar en nextte ollect || true para q lea los enctype="multipart/form-data" para imagen
app.use(cookieParser())
app.use(session({
  secret: process.env.SECRET_KEY,
  key:process.env.SECRET_KEY,
  resave:false,
  saveUninitialized:false
}))
// agregar flash messages
app.use(flash())
// middleware (usuario logueo,flash messages,fecha actual)
app.use((req,res,next) => {
  res.locals.usuario = {...req.session.passport} || null;
  res.locals.mensajes = req.flash()
  const fecha = new Date();
  res.locals.year = fecha.getFullYear()
  next()
})
app.use(passport.initialize());
app.use(passport.session());
 

// routes
app.use('/',require('./routes'));


module.exports = app;
