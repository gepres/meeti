const Sequelize = require('sequelize');
const db = require('../database');
const slug = require('slug')

const Categorias = db.define('categorias', {
  id: {
    type: Sequelize.INTEGER, 
    primaryKey: true,
    autoIncrement: true
  },
  nombre:Sequelize.TEXT,
  slug:Sequelize.TEXT
},
  {
    timestamps:false
  }
)

module.exports = Categorias;