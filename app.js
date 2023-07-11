require("dotenv").config();
require("express-async-errors");
const ethers = require("ethers");
let cors = require("cors");

// express

const express = require("express");
const app = express();
// rest of the packages
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");

const mongoSanitize = require("express-mongo-sanitize");

// database
const connectDB = require("./db/connect");

//cors
app.use(
  cors({
    origin: "https://ff-front-end.onrender.com",
    // origin: "http://localhost:3000",

    exposedHeaders: "*",
    credentials: true,
    allowedHeaders: "*",
  })
);

// app.use(function (req, res, next) {
//   res.header(
//     "Access-Control-Allow-Origin",
//     "https://ff-front-end.onrender.com"
//   ); // update to match the domain you will make the request from
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

//  routers
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const balanceRouter = require("./routes/balanceRoutes");

// middleware

const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const { transactionTracker } = require("./middleware/txs-tracker");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(helmet());

app.use(xss());
app.use(mongoSanitize());

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

app.use(express.static("./public"));
app.use(fileUpload());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/balances", balanceRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 4000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    transactionTracker();
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
