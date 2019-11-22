var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var customerSchema = new mongoose.Schema({
    username:String,
    password:String,
    email:String,
    mobile:Number,
});

customerSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("customer", customerSchema);