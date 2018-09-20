const mongoose = require("mongoose");

exports.loginForm = (req, res, next) => {
  res.render("login", { title: "Login" });
};
