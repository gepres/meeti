const Grupos = require('../models/Grupos')
const Meeti = require('../models/Meeti')
const moment = require('moment')
const Sequelize = require('sequelize')
// const sequelize = new Sequelize('meeti', 'postgres', '123456',{host: '127.0.0.1',port:'5432',dialect: 'postgres',});
const db = require('../database');
const Op = Sequelize.Op; 

module.exports = { 
  panelAdministracion:async (req,res) => {
    
    // consultas
    
    const meetiAsistir = await db.query(`SELECT * from meetis WHERE(case when position('${req.user.id}' in array_to_string(interesados,',')) > 0 then true else false end) AND fecha >= '${moment(new Date()).format("YYYY-MM-DD")}'`);
    const consultas = []
    consultas.push(Grupos.findAll({where:{usuarioId:req.user.id}}))
    consultas.push(Meeti.findAll({
      where:{
        usuarioId:req.user.id,
        fecha:{[Op.gte] : moment(new Date()).format("YYYY-MM-DD")}
      },
      order:[
        ['fecha','ASC']
      ]
    }))
    consultas.push(Meeti.findAll({where:{usuarioId:req.user.id,
      fecha:{[Op.lt] : moment(new Date()).format("YYYY-MM-DD")}
    }}))

    // array destructuring
    const [grupos, meeti,meetiPrevius] = await Promise.all(consultas)

    res.render('administracion',{
      nombrePagina: 'Panel de Administración',
      grupos,
      meeti,
      meetiAsistir,
      meetiPrevius,
      moment
    })
  }
}