var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var contractorSchema = new mongoose.Schema({
    username:String,
    password:String,
    email:String,
    contractorid:String,
    mobile:Number,
    experience:Number,
    budget:Number,
    no_project:Number,
    address:String,
    criteria:{type:String,default:null},
    dateOfJoin:{type:Date , default:Date.now},
    role:{type:String, default:"Contractor"},
    customer:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"customer"
    }],
    active_proj_cust:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"customer"
    }],
    projectStatus:{type:Boolean, default:false}
});

contractorSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("contractor", contractorSchema);