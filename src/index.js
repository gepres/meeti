if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = require('./app');

// Start the server
app.listen(app.get('port'), () => {
  console.log('Server en el puerto', app.get('port'));
  console.log('Environment', process.env.NODE_ENV);
});