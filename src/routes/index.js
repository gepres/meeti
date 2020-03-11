const express = require('express');
const router = express.Router();
// controladores
const homeController = require('../controllers/HomeController')
const usuariosController = require('../controllers/UsuariosController')
const authController = require('../controllers/AuthController')
const adminController = require('../controllers/AdminController')
const gruposController = require('../controllers/GruposController')
const meetiController = require('../controllers/MeetiController')

const meetiControllerFE = require('../controllers/frontend/MeetiControllerFE')
const usuariosControllerFE = require('../controllers/frontend/UsuariosControllerFE')
const gruposControllerFE = require('../controllers/frontend/GruposControllerFE')
const ComentariosControllerFE = require('../controllers/frontend/ComentariosControllerFE')
const BusquedaControllerFE = require('../controllers/frontend/BusquedaControllerFE')

/* AREA PUBLICA */

// home
router.get('/',homeController.home)

// muestra un meeti
router.get('/meeti/:slug',meetiControllerFE.mostrarMeeti)

// Confirma asistencia a meeti
router.post('/confirmar-asistencia/:slug',meetiControllerFE.confirmarAsistencia)

// muestra asistente al meeti
router.get('/asistentes/:slug',meetiControllerFE.mostrarAsistentes)

// agregar comentarios en el meeti
router.post('/meeti/:id',ComentariosControllerFE.agregarComentario)

// eliminar comentarios en el meeti
router.post('/eliminar-comentario',ComentariosControllerFE.eliminarComentario)

// muestra perfiles en el front end
router.get('/usuarios/:id',usuariosControllerFE.mostrarUsuario)

// muestra los grupos
router.get('/grupos/:id',gruposControllerFE.mostrarGrupo)

// muestra los meeti por categorias
router.get('/categoria/:categoria',meetiControllerFE.mostrarCategoria)

// Añade la busqueda
router.get('/busqueda', BusquedaControllerFE.resultadoBusqueda)

// Crear cuenta
router.get('/crear-cuenta', usuariosController.formCrearCuenta)
router.post('/crear-cuenta',usuariosController.validarCuenta,usuariosController.crearNuevaCuenta)
router.get('/confirmar-cuenta/:correo',usuariosController.confirmarCuenta)

// Iniciar Session
router.get('/iniciar-sesion',usuariosController.formIniciarSesion)
router.post('/iniciar-sesion',authController.autenticarUsuario)

// cerrar sesion
router.get('/cerrar-sesion',authController.UsuarioAtenticado, authController.cerrarSesion)


/* AREA PRIVADA */

// panel de administracion
router.get('/administracion', authController.UsuarioAtenticado, adminController.panelAdministracion)

// nuevos grupos
router.get('/nuevo-grupo',authController.UsuarioAtenticado, gruposController.formNuevoGrupo)
router.post('/nuevo-grupo',
authController.UsuarioAtenticado,
gruposController.subirImagen, 
gruposController.validarGrupo,
gruposController.crearGrupo)

// editar grupos
router.get('/editar-grupo/:id',authController.UsuarioAtenticado,gruposController.formEditarGrupos)
router.post('/editar-grupo/:id',authController.UsuarioAtenticado,gruposController.validarGrupo,gruposController.editarGrupo)
// editar imagen del grupo
router.get('/imagen-grupo/:id',authController.UsuarioAtenticado,gruposController.formEditarImagen)
router.post('/imagen-grupo/:id',authController.UsuarioAtenticado,gruposController.subirImagen,gruposController.editarimagen)
// eliminar grupos
router.get('/eliminar-grupo/:id',authController.UsuarioAtenticado,gruposController.formEliminarGrupo)
router.post('/eliminar-grupo/:id',authController.UsuarioAtenticado,gruposController.eliminarGrupo)

// nuevos meeti's
router.get('/nuevo-meeti',authController.UsuarioAtenticado, meetiController.formNuevoMeeti)
router.post('/nuevo-meeti',authController.UsuarioAtenticado,meetiController.sanitizarMeeti, meetiController.crearMeeti)

// editar meeti
router.get('/editar-meeti/:id',authController.UsuarioAtenticado, meetiController.formEditarMeeti)
router.post('/editar-meeti/:id',authController.UsuarioAtenticado, meetiController.editarMeeti)

// eliminar meeti
router.get('/eliminar-meeti/:id',authController.UsuarioAtenticado, meetiController.formEliminarMeeti)
router.post('/eliminar-meeti/:id',authController.UsuarioAtenticado, meetiController.eliminarMeeti)

//editar información de perfil
router.get('/editar-perfil',authController.UsuarioAtenticado,usuariosController.formEditarPerfil)
router.post('/editar-perfil',authController.UsuarioAtenticado,usuariosController.validarPerfil,usuariosController.editarPerfil)

// modificar password
router.get('/cambiar-password',authController.UsuarioAtenticado,usuariosController.formCambiarPassword)
router.post('/cambiar-password',authController.UsuarioAtenticado,usuariosController.cambiarPassword)

// Imagenes de perfil
router.get('/imagen-perfil',authController.UsuarioAtenticado,usuariosController.formImagenPerfil)
router.post('/imagen-perfil',authController.UsuarioAtenticado,usuariosController.subirImagen, usuariosController.imagenPerfil)

module.exports = router; 