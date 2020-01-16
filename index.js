var express                 = require("express"),
    app                     = express(),
    mongoose                = require("mongoose"),
    bodyParser              =require("body-parser"),
    passportLocalMongoose   = require("passport-local-mongoose"),
    passport                = require("passport"),
    methodOverride          = require("method-override"),
    flash                   = require("connect-flash"),
    bCrypt                  = require('bcrypt'),
    LocalStrategy           = require("passport-local"),
    // customerUser            = require("./models/customer"),
    contractorUser          = require("./models/contractor"),
    // customerRoute           = require("./routes/customer"),
    contractorRoute         = require("./routes/contractor");
    
// mongoose.connect("mongodb://localhost:27017/customer");
mongoose.connect("mongodb://localhost:27017/contractor");

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
app.use(express.static(__dirname + '/routes'));
app.use(methodOverride("_method"));
app.use(require("express-session")({
    secret:"This is a secret so Shush",
    resave:false,
    saveUninitialized:false
}));
app.use(flash()); 
app.use(function(req,res,next){
    res.locals.currentUser  = req.user;
    res.locals.error        = req.flash("error");
    res.locals.success      = req.flash("success");
    next();
});
app.use(passport.initialize());
app.use(passport.session());
// passport.serializeUser(customerUser.serializeUser());
// passport.deserializeUser(customerUser.deserializeUser());
passport.serializeUser(contractorUser.serializeUser());
passport.deserializeUser(contractorUser.deserializeUser());



// app.use(customerRoute);
app.use(contractorRoute);


app.get("/",function(req,res){
    res.render("index");
});


// function isContractorLoggedIn(req,res,next){
//         if(req.isAuthenticated()){
//             console.log("Middleware");
//             return next();
//         }
//         console.log("Middleware error");
//         req.flash("error","Hi Contractor Please Login First")
//         res.redirect("/");
//     } 
app.listen(1690,function(){
    console.log("Runnning on 1690");
});