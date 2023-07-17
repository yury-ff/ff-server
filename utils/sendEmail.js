require("dotenv").config({ path: "../.env" });
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  console.log("creating OAuth client");
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID_G,
    process.env.CLIENT_SECRET_G,
    "https://developers.google.com/oauthplayground"
  );
  console.log(oauth2Client);

  console.log("setting credentials");

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN_G,
  });

  console.log("creating access token");

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        console.log(err);
        reject();
      }
      resolve(token);
    });
  });
  console.log(accessToken);

  console.log("creating transporter");

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    // tls: {
    //   rejectUnauthorized: false,
    // },
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      accessToken,
      clientId: process.env.CLIENT_ID_G,
      clientSecret: process.env.CLIENT_SECRET_G,
      refreshToken: process.env.REFRESH_TOKEN_G,
    },
  });
  console.log("sending transport email");

  return transporter.sendMail({
    from: '"Yury R" <yury.r@forkedfinance.xyz>', // sender address
    to,
    subject,
    text,
    // html,
  });
};

module.exports = sendEmail;
