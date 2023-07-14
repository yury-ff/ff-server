const sendEmail = require("./sendEmail");

const origin = "https://ff-front-end.onrender.com";
const name = "test";
const verificationToken = "FakeToken";
const email = "camper7771@gmail.com";

const sendVerificationEmail = async () => {
  const verifyEmail = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`;

  const message = `<p>Please confirm your email by clicking on the following link : 
  <a href="${verifyEmail}">Verify Email</a> </p>`;

  return sendEmail({
    to: email,
    subject: "Email Confirmation",
    html: `<h4> Hello, ${name}</h4>
    ${message}
    `,
  });
};

sendVerificationEmail();
