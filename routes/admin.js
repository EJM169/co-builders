var express             = require("express"),
    async               = require("async"),
    router              = express.Router({mergeParams:true}),
    contractorUser      = require("../models/contractor"),
    customerUser        = require("../models/customer"),
    projectC            = require("../models/project"),
    flash               = require("connect-flash"),
    passport            = require("passport"),
    LocalStrategy       = require("passport-local"),
    bCrypt              = require('bcrypt'),
    middleware          = require("../middleware");


    router.get("/panel/169/admin",function(req,res){
        res.render("admin");
    });

module.exports = router;
