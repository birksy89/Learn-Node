const passport = require("passport");
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const promisify = require("es6-promisify");

exports.login = passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: "Failed Login!",
  successRedirect: "/",
  successFlash: "You now are logged in!"
});

exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "You are now logged out");
  res.redirect("/");
};

exports.isLoggedIn = (req, res, next) => {
  //First check if the user is authenticated

  if (req.isAuthenticated()) {
    next(); // Carry on! They are logged in
    return;
  }

  req.flash("error", "You must be logged in to do that!");
  res.redirect("/login");
};

exports.forgot = async (req, res) => {
  // 1. See if user exists with email
  const user = await User.findOne({
    email: req.body.email
  });

  if (!user) {
    req.flash("error", "No account with that email exists.");
    return res.redirect("/login");
  }
  // 2. Set reset token and expiry on their account
  user.resetPasswordToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();
  // 3. Send them an email with the token
  const resetURL = `http://${req.headers.host}/account/reset/${
    user.resetPasswordToken
  }`;
  req.flash(
    "success",
    `You have been emailed a password reset link. ${resetURL}`
  );
  // 4. Redirect to login page
  res.redirect("/login");
};

exports.reset = async (req, res) => {
  //Take the token and check if someone has that token
  //And that the Expiry date, which was set to last for an hour - Is still ahead of "the now".
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() } // Check the date is still in the future - Greater than the current date
  });

  if (!user) {
    req.flash("error", "Password reset token is invalid, or has expired");
    return res.redirect("/login");
  }

  //If there is a user, show the password reset form
  res.render("reset", { title: "Reset your password" });
};

exports.confirmedPasswords = async (req, res, next) => {
  if (req.body.password === req.body["password-confirm"]) {
    next(); // Keep it going
    return;
  }

  req.flash("error", "Passwords do not match");
  res.redirect("back");
};
exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() } // Check the date is still in the future - Greater than the current date
  });

  if (!user) {
    req.flash("error", "Password reset token is invalid, or has expired");
    return res.redirect("/login");
  }

  // After all these Checks, finally update the users password
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);

  //Clear fields no longer needed
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  //Waiting for the above to save
  const updatedUser = await user.save();

  //Log the user in
  await req.login(updatedUser);

  req.flash(
    "success",
    "Nice! Password has been updated - You are now logged in"
  );
  res.redirect("/");
};
