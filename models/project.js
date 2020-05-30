var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var projectSchema = new mongoose.Schema({
    customer:{type:mongoose.Schema.Types.ObjectId,
                ref:"customer",
                index: { unique: true,sparse: true}
    },
    contractor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"contractor",
        index: {unique: true, sparse: true}
    },
    overallPlan:{type:String},
    contractorStatus:{type:Boolean,
                        default:false},
    customerStatus:{type:Boolean,
                        default:false},
    projectStart:{type:Boolean},
    planDate:[{
        day:{type:String},
        plan:{type:String},
        status:{type:Boolean,
            default:false} 
    }],
    budget:[{
        description:{type:String},
        value:{type:Number},
    }]
});

projectSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("project",projectSchema);