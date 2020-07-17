var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var projectSchema = new mongoose.Schema({
    username:{type:String,value:"12345"},
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
        planFlag:{type:Boolean,default:false},
        complete:{type:Boolean,default:false},
        scheduleStatus:{type:Boolean,default:false}
    }
});

projectSchema.plugin(passportLocalMongoose);
projectSchema.plugin(require('mongoose-beautiful-unique-validation'));
module.exports = mongoose.model("project",projectSchema);