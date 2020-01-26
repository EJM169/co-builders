var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var customerSchema = new mongoose.Schema({
    username:String,
    password:String,
    email:String,
    mobile:Number,
    // address:String,
    location:String,
    budget:String,
    area:String,
    requirements:{type:String,default:null},
    dateOfJoin:{type:Date , default:Date.now},
    role:{type:String,default:"Customer"},
});

customerSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("customer", customerSchema);