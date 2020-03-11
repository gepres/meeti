const Comentarios = require('../../models/Comentarios')
const Meeti = require('../../models/Meeti')

module.exports = { 
  agregarComentario:async(req,res,next)=>{
    // obtener el comentario
    const {comentario} = req.body

    // crear comentarioen la db
    await Comentarios.create({
      mensaje:comentario,
      usuarioId:req.user.id,
      meetiId:req.params.id
    })

    // redirecionar al usuario en la misma pagina
    res.redirect('back');
    next()
  },
  eliminarComentario:async(req,res,next)=>{
    // tomar el id de l comentario
   const {comentarioId}  = req.body;
    // consultar el comentario
    const comentario = await Comentarios.findOne({
      where:{id:comentarioId}
    })
    // console.log(comentario);

    
    // verificar si existe el comentario
    if(!comentario){
      res.status(404).send('Acción no valida')
      return next()
    }

    // consultar el meeti al q pertenece el comentario
    const meeti = await Meeti.findOne({
      where:{
        id:comentario.meetiId
      }
    })

    // verificar que quien elimina el comentario
    if(comentario.usuarioId === req.user.id || meeti.usuarioId === req.user.id){
      await Comentarios.destroy({
        where:{
          id:comentario.id
        }
      })
      res.status(200).send('Eliminado correctamente')
      return next()
    }else{
      res.status(403).send('Acción no valida')
      return next()
    }
  }
}
