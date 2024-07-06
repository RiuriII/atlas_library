const nodemailer = require("nodemailer");

require("dotenv").config({
  path: "../../.env"
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Asynchronously sends an email notification using the provided sender's email, subject, text, and HTML content.
 *
 * @param {string} senderEmail - The email address of the sender
 * @param {string} subject - The subject of the email
 * @param {string} text - The plain text body of the email
 * @param {string} html - The HTML body of the email
 * @return {Promise} A Promise that resolves to the email information
 */
const sendEmailNotification = async (senderEmail, subject, text, html) => {
  try {
    const email = await transporter.sendMail({
      from: `"Atlas Library 📗" <${process.env.EMAIL_USER}>`, // sender address
      to: senderEmail, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: html // html body
    });

    return email;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  sendEmailNotification
};
