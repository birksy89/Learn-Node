const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const reviewSchema = new mongoose.Schema({

})


module.exports = mongoose.model("Review", reviewSchema);
