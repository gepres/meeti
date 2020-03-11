const nodemailer = require('nodemailer');
const emailConfig = require('../middleware/email')
const fs = require('fs') // permite acceder a los archivo y contenidos
const util = require('util')
const ejs = require('ejs')

let transport = nodemailer.createTransport({
  host:emailConfig.host,
  port:emailConfig.port,
  auth:{
    user:emailConfig.user,
    pass:emailConfig.pass
  }
})

exports.enviarEmail = async (opciones) => {
  // console.log(opciones);

  // leer el archivo para el email
  const archivo = __dirname + `/../views/emails/${opciones.archivo}.ejs`

  // compilar
  const compilado = ejs.compile(fs.readFileSync(archivo,'utf8'))
  
  // crear el html
  const html = compilado({url:opciones.url})

  // configurar las opciones de email
  const opcionesEmail = {
    from: 'Meeti <noreply@meeti.com>',
    to: opciones.usuario.email,
    subject:opciones.subject,
    html
  }

  // enviar email
  const sendEmail = util.promisify(transport.sendMail, transport)
  return sendEmail.call(transport,opcionesEmail)
}