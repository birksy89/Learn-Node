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

const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(
    `${__dirname}/../views/email/${filename}.pug`,
    options
  );
  const inlined = juice(html);
  return inlined;
};

exports.send = async options => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.fromString(html);

  const mailOptions = {
    from: "Andrew Birks <andrew@purplecs.com>",
    to: options.user.email,
    subject: options.subject,
    html: html,
    text: text
  };

  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
};

exports.sendToEmail = async options => {

  let html = `<h1>Hello!</h1>
  <ul>`;

  html += options.collections.map(data => {
    return `<li>${data.title}</li>`;
  }).join('');

  html += `</ul>`;

  const text = htmlToText.fromString(html);

  const mailOptions = {
    from: "Andrew Birks <andrew@purplecs.com>",
    to: options.email,
    subject: options.subject,
    html: html,
    text: text
  };

  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
};
