const Meeti = require('../../models/Meeti')
const Grupos = require('../../models/Grupos')
const Usuarios = require('../../models/Usuarios')
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
const moment = require('moment')

module.exports = {
  resultadoBusqueda: async (req, res) => {

    // leer datos de la url 
    
    const {
      categoria,
      titulo,
      estado,
      pais
    } = req.query;

    let query
    // si la categoria esta vacia
    if ( categoria === '') {
      query =''    
    } else {
      query = `where : {
        categoriaId : { [Op.eq] :  ${categoria} }
      }`
    }

    // console.log(req.query);
    console.log(query);
    
    // filtrar los meetis por los terminos de busqueda
    const meetis = await Meeti.findAll({
      where: {
        titulo : { [Op.iLike] :  '%' + titulo + '%' },
        estado: {
          [Op.iLike]: '%' + estado + '%'
        },
        pais: {
          [Op.iLike]: '%' + pais + '%'
        }
      },
      include: [{
          model: Grupos,
          query
          // where:{
          //   categoriaId : { [Op.eq] :  categoria}
          // }
        },
        {
          model: Usuarios,
          attributes: ['id', 'nombre', 'imagen']
        }
      ]
    });

    // console.log(meetis);
    
    // pasar los resultados a la vista
    res.render('busqueda', {
      nombrePagina: 'Resultados Búsqueda',
      meetis,
      moment
    })
  }
}