require("dotenv").config({ path: "../.env" });
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID_G,
    process.env.CLIENT_SECRET_G,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN_G,
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        console.log(err);
        reject();
      }
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,

    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      accessToken,
      clientId: process.env.CLIENT_ID_G,
      clientSecret: process.env.CLIENT_SECRET_G,
      refreshToken: process.env.REFRESH_TOKEN_G,
    },
  });

  return transporter.sendMail({
    from: '"Yury R" <yury.r@forkedfinance.xyz>', // sender address
    to,
    subject,
    html,
    auth: {
      user: "yury.r@forkedfinance.xyz",
    },
  });
};

module.exports = sendEmail;
