var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var projectSchema = new mongoose.Schema({
    customer:{type:mongoose.Schema.Types.ObjectId,
                ref:"customer"},
    contractor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"contractor"
    },
    overallPlan:String,
    contractorStatus:{type:Boolean,
                        default:false},
    customerStatus:{type:Boolean,
                        default:false},
    projectStart:{type:Boolean,
                    default:false},
    planDate:{
        day:Date,
        plan:String
    }
});

projectSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("project",projectSchema);