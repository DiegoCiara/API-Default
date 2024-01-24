import path from 'path';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import { host, port, user, pass } from '@config/confirm.json';

const confirm = nodemailer.createTransport({
  service: 'gmail',
  host,
  port,
  secure: true,
  auth: {
    user,
    pass,
  },
  tls: {
    rejectUnauthorized: false,
  }
}); 

confirm.use(
  'compile',
  hbs({
    viewEngine: {
      defaultLayout: undefined,
      partialsDir: path.resolve('./src/resources/mail/'),
    },
    viewPath: path.resolve('./src/resources/mail/'), // resolve parte sempre da raiz absoluta do projeto.
    extName: '.html',
  })
);

export default confirm;
