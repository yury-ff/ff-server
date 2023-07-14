require("dotenv").config({ path: "../.env" });
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  console.log("creating OAuth client");
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );
  console.log(oauth2Client);

  console.log("setting credentials");

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });
  console.log(oauth2Client);

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
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      accessToken,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  });
  console.log("sending transport email");

  return transporter.sendMail({
    from: '"Yury R" <yury.r@forkedfinance.xyz>', // sender address
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
