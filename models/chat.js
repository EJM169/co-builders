var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var chatSchema = new mongoose.Schema({
    // customer:{
    //             type:mongoose.Schema.Types.ObjectId,
    //             ref:"customer", index: { sparse: true}},
    // contractor:{
    //             type:mongoose.Schema.Types.ObjectId,
    //             ref:"contractor", index: { sparse: true}},
    username:{type:String,value:"12345"},

    messages:[{
     username:String,   
     messages:String
    }]
});

chatSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("chat",chatSchema);
