// NPM run start, if you look in the package.json, it will tell you this is the first file that gets a runtime.  "dotenv" below is Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env. Storing configuration in the environment separate from code is based on The Twelve-Factor App methodology. As early as possible in your application, require and configure dotenv.
require("dotenv").config();
// brings in mongoose which is the driver for mongodb
const mongoose = require("mongoose");
//establishes when called upon as the entry point
//for requests to the app/server
const app = require("./app");
//est. what port our server is on/listening
const port = 8080;
//starts the server and defines the schema type
mongoose
   //First, make sure we are connected to the database.
  .connect(process.env.MONGO_DB, {
    //below two lines are the option flags. With out there will be errors
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  //Then turn the server on.
  .then(() => {
    app.listen(port, () => {
      console.log(`Server connected on ${port}`);
      console.log("MongoDB Connected");
    });
  })
  .catch((e) => {
    console.log(e);
  });
