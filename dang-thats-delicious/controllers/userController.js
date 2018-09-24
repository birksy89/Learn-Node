const mongoose = require("mongoose");
const User = mongoose.model("User");
const promisify = require("es6-promisify");

exports.loginForm = (req, res, next) => {
  res.render("login", { title: "Login" });
};

exports.registerForm = (req, res, next) => {
  res.render("register", { title: "Register" });
};

exports.validateRegister = (req, res, next) => {
  // - https://github.com/express-validator/express-validator
  //Sanitize name
  req.sanitizeBody("name");
  req.checkBody("name", "You must supply a name!").notEmpty();
  req.checkBody("email", "You must supply an Email!").isEmail();
  req.sanitizeBody("email").normalizeEmail({
    removes_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody("password", "Password cannot be blank!").notEmpty();
  req
    .checkBody("password-confirm", "Password Confirm cannot be blank!")
    .notEmpty();
  req
    .checkBody("password-confirm", "Oops! Your passwords do not match")
    .equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash("error", errors.map(err => err.msg));

    // Dont' clear form
    res.render("register", {
      title: "Errors!",
      body: req.body,
      flashes: req.flash()
    });
    return false; //stop the fn from running
  }

  next(); //there were no errors
};

exports.register = async (req, res, next) => {
  const user = new User({
    email: req.body.email,
    name: req.body.name
  });

  const register = promisify(User.register, User);
  await register(user, req.body.password);

  next(); // pass to authController.login
};
