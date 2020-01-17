var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var contractorSchema = new mongoose.Schema({
    username:String,
    password:String,
    email:String,
    contractorid:String,
    mobile:Number,
    experience:Number,
    role:{type:String, default:"Contractor"}
});

contractorSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("contractor", contractorSchema);