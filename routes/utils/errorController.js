const ErrorMessageHandlerClass = require("./ErrorMessageHandlerClass");

function dispatchErrorDevelopment(error, req, res) {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
    });
  }
}
//function added for production which is very similar to development.
function dispatchErrorProduction(error, req, res) {
  if (req.originalUrl.startsWith("/api")) {
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }
    return res.status(error.statusCode).json({
      status: "Error",
      message:
        "Something went wrong, please contact support 123-999-8888 or email us at xxx@mail.com",
    });
  }
}

//IMPORTANT-Do not always assume the error message will come in an object, 
//they can come in any form, like a giant string to be parsed. 
//Look mat solution 2 to see another way of handling the error.  

//solution 1
function handleMongoDBDuplicate(err) {
  console.log(Object);
  console.log(Object.keys);
  console.log(Object.values);

  let errorMessageDuplicateKey = Object.keys(err.keyValue)[0];
  let errorMessageDuplicateValue = Object.values(err.keyValue)[0];
  console.log(errorMessageDuplicateKey);
  console.log(errorMessageDuplicateValue);
  //we have parse some data in here
  let message = `${errorMessageDuplicateKey} - ${errorMessageDuplicateValue} is taken please choose another one`;
  return new ErrorMessageHandlerClass(message, 400);
}


// //solution 2 using regex (regexr.com)
// function handleMongoDBDuplicate(err) {
//   // This is the string we need to handle below.
//   //'E11000 duplicate key error collection: backend-api.users index: email_1 dup key: { email: "hamster@mail.com" }'
//   //' email: "hamster@mail.com" '
//   //' email  hamster@gmail.com '
//   //email hamster@gmail.com
//   //[email, hamster@gmail.com]
//   let errorMessage = err.message;
//   let findOpeningBracket = errorMessage.match(/{/).index;
//   let findClosingBracket = errorMessage.match(/}/).index;
//   let foundDuplicateValueString = errorMessage.slice(
//     findOpeningBracket + 1,
//     findClosingBracket
//   );
//   let newErrorString = foundDuplicateValueString.replace(/:|\"/g, "");
//   let trimmedNewErrorString = newErrorString.trim();
//   let errorStringArray = trimmedNewErrorString.split(" ");
//   let message = `${errorStringArray[0]} - ${errorStringArray[1]} is taken please choose another one`;
//   return new ErrorMessageHandlerClass(message, 400);
// }


//Exporting a whole function. The error object comes from next(e) in userController/app.js
module.exports = (err, req, res, next) => {
  // console.log(err);
  // console.log(err.message);
  console.log("2");

  //if we don't have an error status code, it will default to 500.
  //same as error.status with setting a default
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  console.log("3");
  console.log(err);
  //using the spread operator to git rid of all the stuff we don't need in the original error
  let error = { ...err };
  console.log("4");
  console.log(error);
  console.log('4.5');
  //adding the mongodb message to our new error object
  error.message = err.message;
  console.log("5");
  console.log(error);
  console.log("6");
  //check the error code is 11000 or 11001, going top call the mongoDBDuplicate function to parse the data.
  if (error.code === 11000 || error.code === 11001) {
    error = handleMongoDBDuplicate(error);
  }
  console.log("7");
  
  //if we are in development environment, we are going to show all the error messages, if not then show less.
  if (process.env.NODE_ENV === "development") {
    dispatchErrorDevelopment(error, req, res);
  } else {
    dispatchErrorProduction(error, req, res);
  }
};



