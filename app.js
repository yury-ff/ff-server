require("dotenv").config();
require("express-async-errors");
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
    origin: "https://forkedfinance.xyz",
    exposedHeaders: "*",
    credentials: true,
    allowedHeaders: "*",
  })
);

//  routers
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const balanceRouter = require("./routes/balanceRoutes");

// middleware

const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const transactionTracker = require("./utils/txs-tracker");

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
    await transactionTracker();
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
