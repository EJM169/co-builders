var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var customerSchema = new mongoose.Schema({
    username:String,
    password:String,
    email:String,
    mobile:Number,
    address:String,
    location:String,
    budget:String,
    area:String,
    requirements:{type:String,default:null},
    reqselect:String,
    dateOfJoin:{type:Date , default:Date.now},
    role:{type:String,default:"Customer"},
    bathRoomreq: String,
    prayerRoomreq:{type: Boolean, default: false },
    diningRoomreq: {type: Boolean, default: false },
    studyRoomreq: {type: Boolean, default: false },
    workAreareq: {type: Boolean, default: false },
    utilityRoomreq:{type: Boolean, default: false },
    carPorchreq: {type: Boolean, default: false },
    additionalreq: {type:String,default:null},
    contractor:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"contractor"
    }],
    active_proj_cont:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"contractor"
    }],
    past_proj_cont:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"contractor"
    }],
    projectStatus:{type:Boolean, default:false}
});

customerSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("customer", customerSchema);