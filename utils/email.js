const nodemailer = require('nodemailer');
const config = require('config');

const sendEmail = async (options) => {
  // 1 ) Create a transporter
  const transporter = nodemailer.createTransport({
    host: config.get('EMAIL_HOST'),
    port: config.get('EMAIL_PORT'),
    auth: {
      user: config.get('EMAIL_USERNAME'),
      pass: config.get('EMAIL_PASSWORD'),
    },
  });

  // 2) Define email options

  const mailOptions = {
    from: 'Tiago José <tiago_jvo@outlook.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Send the email

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
