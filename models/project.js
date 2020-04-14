var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var projectSchema = new mongoose.Schema({
    customer:{type:mongoose.Schema.Types.ObjectId,
                ref:"customer",
                unique: true 
    },
    contractor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"contractor",
        unique: true 
    },
    overallPlan:{type:String, sparse:true},
    contractorStatus:{type:Boolean,
                        default:false,
                        sparse:true},
    customerStatus:{type:Boolean,
                        default:false,
                        sparse:true},
    projectStart:{type:Boolean,
                    default:false,
                    sparse:true},
    planDate:{
        day:Date,
        plan:{type:String,
            sparse:true} 
    }
});

projectSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("project",projectSchema);