var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var contractorSchema = new mongoose.Schema({
    name:String,
    username:String,
    password:String,
    email:String,
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
    past_proj_cust:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"customer"
    }],
    pastproj:[{type:mongoose.Schema.Types.ObjectId,
        ref:"project"    }],
    projectStatus:{type:Boolean, default:false},
    feedback:[{
        projectid:{type:mongoose.Schema.Types.ObjectId,
            ref:"project"},
        customerid:{type:mongoose.Schema.Types.ObjectId,
            ref:"customer"},
        customerName:{type:String,default:null},
        headline:{type:String,default:null},
        review:{type:String,default:null}
    }],
    contractorProject:[{type:mongoose.Schema.Types.ObjectId,
        ref:"project"
    }],
    chat:[{type:mongoose.Schema.Types.ObjectId,
        ref:"chat"
    }]
});

contractorSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("contractor", contractorSchema);