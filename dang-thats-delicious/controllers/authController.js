const passport = require("passport");

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
