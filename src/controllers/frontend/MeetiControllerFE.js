const Meeti = require('../../models/Meeti')
const Grupos = require('../../models/Grupos')
const Categorias = require('../../models/Categorias')
const Usuarios = require('../../models/Usuarios')
const Comentarios = require('../../models/Comentarios')
const Sequelize = require('sequelize')
const Op = Sequelize.Op; 
const moment = require('moment') 
module.exports = { 
  mostrarMeeti:async(req,res)=>{
    const meeti = await Meeti.findOne({
      where:{
        slug:req.params.slug
      },
      include:[
        {
          model:Grupos,
        },
        {
          model:Usuarios,
          attributes:['id','nombre','imagen']
        }
      ]
    })

    // si no existe
    if(!meeti){
      res.redirect('/')
    }

     // Consultar por meeti's cercanos
     const ubicacion = Sequelize.literal(`ST_GeomFromText( 'POINT( ${meeti.ubicacion.coordinates[0]} ${meeti.ubicacion.coordinates[1]} )' )`);

     // ST_DistanceSphere = Retorna una linea en metros
     const distancia = Sequelize.fn('ST_DistanceSphere', Sequelize.col('ubicacion'), ubicacion);

    // encontrar meetis cercanos
    const cercanos = await Meeti.findAll({
      order:distancia, // los ordenas del mas cercano al lejano
      where:Sequelize.where(distancia,{ [Op.lte] : 2000}), // 2 km
      limit:3,
      include:[
        {
          model:Grupos,
        },
        {
          model:Usuarios,
          attributes:['id','nombre','imagen']
        }
      ]
    })


    // lo pudes de bajo del if por siacaso el meeti no existe no consultarlo
    const comentarios = await Comentarios.findAll({
      order:[
        ['fecha','ASC'],
      ],
      where:{
        meetiId:meeti.id
      },
      include:[
        {
          model:Usuarios,
          attributes:['id','nombre','imagen']
        }
      ]
    }) 


    // pasar el resultado asi la vista
    res.render('mostrar-meeti',{
      nombrePagina:meeti.titulo,
      meeti,
      comentarios,
      cercanos,
      moment
    })
  },
  confirmarAsistencia: async(req,res)=>{
        //  mensajes
    // console.log(req.body);

    const {accion} = req.body;
    if(accion == 'confirmar'){
      // agregar el usuario
      Meeti.update({'interesados': Sequelize.fn('array_append',Sequelize.col('interesados'),req.user.id)},
        {where:{'slug':req.params.slug}}
      );
      res.send('Has confirmado tu asistencia')
    }else{
      // cancelar la asistencia
      Meeti.update({'interesados': Sequelize.fn('array_remove',Sequelize.col('interesados'),req.user.id)},
        {where:{'slug':req.params.slug}}
      );
      res.send('Has cancelado tu asistencia')
    }
    
  },
  mostrarAsistentes:async(req,res)=>{
    const meeti = await Meeti.findOne({
      where:{
        slug:req.params.slug
      },
      attributes:['interesados']
    });
    // extraer interesados
    const {interesados} = meeti
    const asistentes = await Usuarios.findAll({
      where:{id:interesados},
      attributes:['nombre','imagen']
    })
    // console.log(asistentes);
    
    // crear la vista y pasar datos
    res.render('asistentes-meeti',{
      nombrePagina:'Listado de Asistentes de Meeti',
      asistentes
    })
  },
  mostrarCategoria:async(req,res,next) => {
    const categoria = await Categorias.findOne({
      where:{
      slug:req.params.categoria
      },
      attributes:['id','nombre']
    })
    const meetis = await Meeti.findAll({
      order:[
        ['fecha','ASC'],
        ['hora','ASC']
      ],
      include:[
        {
          model:Grupos,
          where:{categoriaId: categoria.id}
        },
        {
          model:Usuarios
        }
      ]
    })

    res.render('categoria',{
      nombrePagina:`Categoría: ${categoria.nombre}`,
      meetis,
      moment
    })
    
  },
}
 