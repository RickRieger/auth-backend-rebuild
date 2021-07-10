//This extends the Error class that comes from nodeJS
//The error class comes from node.  We are adding a class to this error class. 

class ErrorMessageHandlerClass extends Error {
  constructor(message, statusCode) {
    super(message, statusCode);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
  }
}
module.exports = ErrorMessageHandlerClass;