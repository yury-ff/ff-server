const sendEmail = require("./sendEmail");
const { sendVerificationEmail } = require("../utils");

const origin = "https://https://forkedfinance.xyz";
const name = "test";
const verificationToken = "FakeToken";
const email = "camper7771@gmail.com";

const sendVerificationEmailTest = async () => {
  await sendVerificationEmail({ name: name, email: email });
  console.log("hey");
};

sendVerificationEmailTest();
