var express                 = require("express"),
    app                     = express(),
    http                    = require('http').Server(app),
    io                      = require('socket.io')(http),
    mongoose                = require("mongoose"),
    bodyParser              =require("body-parser"),
    passport                = require("passport"),
    methodOverride          = require("method-override"),
    flash                   = require("connect-flash"),
    bCrypt                  = require('bcrypt'),
    LocalStrategy           = require("passport-local"),
    contractorUser          = require("./models/contractor"),
    customerUser            = require("./models/customer"),
    project                 = require("./models/project"),
    // contractorRoute         = require("./routes/contractor")(io),
    // customerRoute           = require("./routes/customer")(io),
    adminRoute              = require("./routes/admin");
    
    const PORT = process.env.PORT || 1690    


mongoose.connect("mongodb://localhost:27017/construction");
// mongoose.set('useFindAndModify', false);
mongoose.set('useFindAndModify', false);

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use('/contractor/uploads',express.static('uploads'));
app.use('/customer/uploads',express.static('uploads'));
// app.use(express.static(__dirname+'uploads'));
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


// app.listen(1690,function(){
//     console.log("Runnning on 1690");
// });


// const io = require("socket.io")(server);


  
app.use(require("./routes/contractor")(io));
app.use(require("./routes/customer")(io));
app.use(adminRoute);

server=http.listen(PORT,function(){
    console.log("Runnning on 1690");
});

io.on('connection', socket =>{
    console.log("New chat")
});


app.get("/",function(req,res){
    req.logout();
    res.render("index");
});

