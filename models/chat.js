var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var chatSchema = new mongoose.Schema({
    customer:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"customer", index: { sparse: true}},
    contractor:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"contractor", index: { sparse: true}},
    // sender:String,
    // messages:String
    // messages:[{
    //     messages:String,
        
    // }]
});

chatSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("chat",chatSchema);
