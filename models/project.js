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
    projectStart:{type:Boolean,default:false},
    planDate:[{
        day:{type:String},
        plan:{type:String},
        status:{type:Boolean,
            default:false},
        scheduleImage:{type:String}
    }],
    budget:[{
        type:{type:String},
        description:{type:String},
        value:{type:Number},
        budgetImage:{type:String}
    }],
    flags:{
        contractorComplete:{type:Boolean,default:false},
        customerComplete:{type:Boolean,default:false},
        contractorCancel:{type:Boolean,default:false},
        customerCancel:{type:Boolean,default:false},
        planFlag:{type:Boolean,default:false}
    }
});

projectSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("project",projectSchema);