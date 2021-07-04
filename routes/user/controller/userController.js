const bcrypt = require("bcryptjs");
const User = require("../model/User");

const jwt = require("jsonwebtoken");

async function signup(req, res, next) {
  
  const { username, email, password, firstName, lastName } = req.body;

  const { errorObj } = res.locals;

  if (Object.keys(errorObj).length > 0) {
    return res.status(500).json({ message: "failure", payload: errorObj });
  }

  try {
    let salt = await bcrypt.genSalt(12);
    let hashedPassword = await bcrypt.hash(password, salt);
    
    const createdUser = new User({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
    });

    let savedUser = await createdUser.save();
    res.json({ message: "success"});

    //if mongoDB has an error, it jumps to the catch block.
  } catch (e) {
    
    console.log(e);
    console.log(e.message);
    // res.status(500).json({ message: "error", error: e });

    //this "next" passes the error to errorController.  Look in app.js,
    //after app.all("*")--app.use(errorController) is the "next" or "last" function 
    //in app.js.  Then you can follow how the error is being handled in errorController.
    console.log('1');
    next(e);
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  const { errorObj } = res.locals;

  if (Object.keys(errorObj).length > 0) {
    return res.status(500).json({ message: "failure", payload: errorObj });
  }

  try {
    let foundUser = await User.findOne({ email: email });

    if (!foundUser) {
      res.status(400).json({
        message: "failure",
        payload: "Please check your email and password",
      });
    } else {
      //password = 1, foundUser.password = $2a$12$tauL3AEb5gvKdcQdDKNWLeIYv422jNq2aRsaNWF5J4TdcWEdhq4CO
      let comparedPassword = await bcrypt.compare(password, foundUser.password);

      if (!comparedPassword) {
        res.status(400).json({
          message: "failure",
          payload: "Please check your email and password",
        });
      } else {
        let jwtToken = jwt.sign(
          {
            email: foundUser.email,
            username: foundUser.username,
          },
          process.env.PRIVATE_JWT_KEY,
          {
            expiresIn: "1d",
          }
        );

        res.json({ message: "success", payload: jwtToken });
      }
    }
  } catch (e) {
    res.json({ message: "error", error: e });
  }
}

module.exports = { signup, login };
