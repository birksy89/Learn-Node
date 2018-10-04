const nodemailer = require("nodemailer");
const pug = require("pug");
const juice = require("juice");
const htmlToText = require("html-to-text");
const promisify = require("es6-promisify");

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// transport.sendMail({
//     from: 'Wes Bos <wesbos@gmail.com>',
//     to: 'andrew@purplecs.com',
//     subject: 'Just testing',
//     html: 'Hello <strong>Bold</strong> World',
//     text: 'Hello Normal World'
// })

exports.send = async options => {
  const mailOptions = {
    from: "Andrew Birks <andrew@purplecs.com>",
    to: options.user.email,
    subject: options.subject,
    html: "This will be filled in later",
    text: "This will be filled in later"
  };

  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
};
