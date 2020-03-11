const Categiorias = require('../models/Categorias')
const Meeti = require('../models/Meeti')
const Grupos = require('../models/Grupos')
const Usuarios = require('../models/Usuarios')
const moment = require('moment')
const Sequelize = require('sequelize')
const Op = Sequelize.Op; 
module.exports = { 
  home:async(req,res) => {
    // promise para consultas
    const consultas = []
    consultas.push(Categiorias.findAll({}))
    consultas.push(Meeti.findAll({
      attributes:['slug','titulo','fecha','hora'],
      limit:3,
      where:{
        fecha:{[Op.gte] : moment(new Date()).format("YYYY-MM-DD")}
      },
      order:[
        ['fecha','ASC']
      ],
      include:[
        {
          model:Grupos,
          attributes:['imagen']
        },
        {
          model:Usuarios,
          attributes:['nombre','imagen']
        }
      ] 
    }))

    // extraer y pasar a la vista
    const [categorias,meetis] = await Promise.all(consultas)
    // console.log(meetis)
    res.render('home',{
      nombrePagina:'Inicio',
      categorias,
      meetis,
      moment
    })
  }
}