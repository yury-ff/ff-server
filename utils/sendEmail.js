const createTransporter = require("./nodemailerConfig");

const sendEmail = async ({ to, subject, html }) => {
  let emailTransporter = await createTransporter();

  return await emailTransporter.sendMail({
    from: '"Yury R" <yury.r@forkedfinance.xyz>', // sender address
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
