var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var adminSchema = new mongoose.Schema({
    username:String,
    password:String,
    contractorList:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"contractor"
    }],
    customerList:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"customer"
    }],
    projectList:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"project"
    }]
});

adminSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("admin", adminSchema);