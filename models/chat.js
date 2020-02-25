var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var chatSchema = new mongoose.Schema({
    customer:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"customer"},
    contractor:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"contractor"},
    // username:String,
    message:String
});

chatSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("chat",chatSchema);