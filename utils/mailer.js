const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

// Handlebars-Template-Engine für Nodemailer einrichten
transporter.use('compile', hbs({
    viewEngine: {
        extname: '.hbs',
        layoutsDir: path.join(__dirname, '../views/layouts'),
        defaultLayout: false,
        partialsDir: path.join(__dirname, '../views/emails'),
        helpers: {
            toFixed: function (number, digits) {
                return number.toFixed(digits);
            },
        }
    },
    viewPath: path.join(__dirname, '../views/emails'),
    extName: '.hbs'
}));

const sendEmail = (to, subject, template, context) => {
    const mailOptions = {
        from: 'f.m.p.berger@posteo.de',
        to,
        subject,
        template, // Name der Vorlage (ohne .hbs)
        context // Kontextdaten für die Vorlage
    };

    return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
