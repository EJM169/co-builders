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
    contractorUser          = require("./models/contractor"),
    customerUser            = require("./models/customer"),
    project                 = require("./models/project"),
    contractorRoute         = require("./routes/contractor"),
    customerRoute           = require("./routes/customer"),
    adminRoute              = require("./routes/admin");
    
    const PORT = process.env.PORT || 1690    


mongoose.connect("mongodb://localhost:27017/construction");
// mongoose.set('useFindAndModify', false);
mongoose.set('useFindAndModify', false);

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

// passport.serializeUser(contractorUser.serializeUser());
// passport.deserializeUser(contractorUser.deserializeUser());
passport.serializeUser(function(user, done) { 
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    if(user!=null)
      done(null,user);
  });
  
app.use(contractorRoute);
app.use(customerRoute);
app.use(adminRoute);

app.get("/",function(req,res){
    req.logout();
    res.render("index");
});


// app.listen(1690,function(){
//     console.log("Runnning on 1690");
// });

server=app.listen(PORT);
const io = require("socket.io")(server);
