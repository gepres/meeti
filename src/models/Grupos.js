const Sequelize = require('sequelize');
const db = require('../database');
// const { v4: uuidv4 } = require('uuid'); // hay problema con postgres asi que mejor lo pones en el controlador
const Categorias = require('./Categorias')
const Usuarios = require('./Usuarios')

const Grupos = db.define('grupos', {
  id: {
    type: Sequelize.UUID, 
    primaryKey: true,
    allowNull:false
  },
  nombre:{
    type:Sequelize.TEXT,
    allowNull:false,
    validate:{
      notEmpty:{
        msg:'El grupo debe tener un nombre'
      }
    }
  },
  descripcion:{
    type:Sequelize.TEXT,
    allowNull:false,
    validate:{
      notEmpty:{
        msg:'Coloca una descripción'
      }
    }
  },
  url:Sequelize.TEXT,
  imagen:Sequelize.TEXT
})

Grupos.belongsTo(Categorias);
Grupos.belongsTo(Usuarios);

module.exports = Grupos;