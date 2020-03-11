const Sequelize = require('sequelize');

const db = new Sequelize(process.env.DB_NOMBRE, process.env.DB_USER, process.env.DB_PASS, {
  host:process.env.DB_HOST,
  port:process.env.DB_PORT,
  dialect: 'postgres',
  pool:{
    max:5,
    min:0,
    acquire:3000,
    idle:10000
  },
  logging:false
  // define:{
  //   timestamps:false
  // }
});

db.sync().then(() => console.log('La conexión de la DB se ha establecido con éxito.')).catch(err => {console.error('No se puede conectar a la DB:', err)})

// db.authenticate().then(() => {
//     console.log('La conexión de la DB se ha establecido con éxito.');
//   }).catch(err => {
//     console.error('No se puede conectar a la DB:', err);
//   });

module.exports = db;