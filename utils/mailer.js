const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

const sendEmail = (to, subject, html) => {
    const mailOptions = {
        from: 'f.m.p.berger@posteo.de',
        to,
        subject,
        html
    };

    return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;