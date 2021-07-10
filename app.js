//brings in express which is a framework that
//makes it easier to write code for the node environment.
const express = require("express");
//bring in morgan -a helper that generates request logs.
const logger = require("morgan");
//"cross origin resource sharing"- makes it possible for our front end to communicate with our backend.
const cors = require("cors");
//Basic rate-limiting middleware for Express. Use to limit repeated requests to public APIs and/or endpoints such as password reset.
const rateLimit = require("express-rate-limit");
//call Express and assigns app variable to it
const app = express();
//Brings in the ErrorMessageHandlerClass in utils, will handle our 
//errors, parsing them into easier to understand code. Will be different for development and production runtime.
const ErrorMessageHandlerClass = require("./routes/utils/ErrorMessageHandlerClass");
const errorController = require("./routes/utils/errorController");
//defines the path for our routes and stores in a variable
const userRouter = require("./routes/user/userRouter");
//defines the path for using the twilio API
const twilioRouter = require("./routes/twilio/twilioRouter");
//Tell the app to use cors, as defined above
app.use(cors());
// console.log(process.env.NODE_ENV);

// if in development env, use logger(morgan)
if (process.env.NODE_ENV === "development") {
  app.use(logger("dev"));
}
//sets the request limit
const limiter = rateLimit({
  max: 20,
  windowMs: 1 * 60 * 1000, //this is in millie second
  message:
    "Too many requests from this IP, please try again or contact support",
});
//tells the app/api to use limiter
app.use("/api", limiter);
// is a built-in middleware function in Express. 
//It parses incoming requests with JSON payloads 
//and is based on body-parser.
app.use(express.json());
// parsing form data/incoming data
app.use(express.urlencoded({ extended: false }));
//delivers a path to userRouter for http requests
app.use("/api/user", userRouter);
//delivers a path to twilioRouter for http requests
app.use("/api/twilio", twilioRouter);

// console.log(Error);
//catches all requests, if they do not match the urls defined above!
//this is a wildcard that catches wrong url requests.
app.all("*", function (req, res, next) {
  next(
    new ErrorMessageHandlerClass(
      `Cannot find ${req.originalUrl} on this server! Check your URL`,
      404
    )
  );
});

//Tells app to use errorController in the event of an error via the next(e) in userController error catch block. 
app.use(errorController);
//makes this file accessible to other files
module.exports = app;