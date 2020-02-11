var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var customerSchema = new mongoose.Schema({
    username:String,
    password:String,
    email:String,
    mobile:Number,
    // address:String,
    location:String,
    budget:String,
    area:String,
    requirements:{type:String,default:null},
    reqselect:String,
    dateOfJoin:{type:Date , default:Date.now},
    role:{type:String,default:"Customer"},
    bedroomeq: String,
    hallreq: String,
    kitchenreq:String,
    bathRoomreq: String,
    prayerRoomreq: String,
    diningRoomreq: String,
    studyRoomreq: String,
    workAreareq: String,
    utilityRoomreq: String,
    carporchreq: String,
    additionalreq: {type:String,default:null},
    contractor:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"contractor"
    }],
    active_proj_cont:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"contractor"
    }],
    sendStatus:{type:Boolean, default:false}
});

customerSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("customer", customerSchema);