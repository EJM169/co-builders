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
    customerUser            = require("./models/customer"),
    contractorUser          = require("./models/contractor"),
    middleware              = require("./middleware/index"),
    middlewareContractor    = require("./middleware/contractor");
    

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
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
passport.serializeUser(customerUser.serializeUser());
passport.deserializeUser(customerUser.deserializeUser());
passport.serializeUser(contractorUser.serializeUser());
passport.deserializeUser(contractorUser.deserializeUser());

mongoose.connect("mongodb://localhost:27017/customer");
mongoose.connect("mongodb://localhost:27017/contractor");

//<-----------Passport configuration------------------->


var isValidPassword = function(user, password){
    return bCrypt.compareSync(password, user.password);
  }

  //<----------- Passport logic for customer begins--------------->

// passport login logic
passport.use("customer-login",new LocalStrategy(
    {    
        usernameField:'username',
        passReqToCallback : true
    }, function(req, username, password, done) { 
    // check in mongo if a user with username exists or not
    customerUser.findOne({$or:[{ 'username' : username},{'email':username }]}, 
      function(err, user) {
        // In case of any error, return using the done method
        if (err)
          return done(err);
        // Username does not exist, log error & redirect back
        if (!user){
          console.log('User Not Found with username '+username);
          return done(null, false, 
                req.flash('error', 'User Not found.')
                );                 
        }
        // User exists but wrong password, log the error 
        if (!isValidPassword(user, password)){
          console.log('Invalid Password');
          return done(null, false, 
              req.flash('error', 'Invalid Password')
              );
        }
        // User and password both match, return user from 
        // done method which will be treated like success
        req.flash('success','Welcome '+user.username);
        return done(null, user);
      }
    );}));

//Passport sign up logic

passport.use("customer-signup", new LocalStrategy({
    usernameField:'username',
    passReqToCallback : true
  },
  function(req, username,password, done) {
    findOrCreateUser = function(){
      // find a user in Mongo with provided username
      customerUser.findOne({'username':username},function(err, user) {
         
        // In case of any error return
        if (err){
          console.log('Error in SignUp: '+err);
          req.flash('error','Error while signup');
          return done(err);
        }
        // already exists
        if (user) {
            console.log('User already exists');
            return done(null, false, 
                 req.flash('error','User Already Exists')
                );
        }
        
        else {
          // if there is no user with that email
          // create the user
          var newUser = new customerUser();
          // set the user's local credentials
          newUser.username  =    username;
          newUser.password  =    createHash(password);
          newUser.email     =       req.param('email');
          newUser.mobile    =     req.param('mobile');

          // save the user
          newUser.save(function(err) {
            if (err){
              console.log('Error in Saving user: '+err);  
              req.flash('error','Error in creating a user');
              throw err;  
            }
            console.log('User Registration succesful');    
            req.flash('success','Registration Successful Welcome')
            return done(null, newUser);
          });
        }
      });
    };
     
    // Delay the execution of findOrCreateUser and execute 
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
  })
);

 //<----------- Passport logic for customer ends--------------->

  //<----------- Passport logic for contractor begins--------------->

// passport login logic
passport.use("contractor-login",new LocalStrategy(
    {    
        usernameField:'username',
        passReqToCallback : true
    }, function(req, username, password, done) { 
    // check in mongo if a user with username exists or not
    contractorUser.findOne({$or:[{ 'username' :  username},{'email':username }]}, 
      function(err, user) {
        // In case of any error, return using the done method
        if (err)
          return done(err);
        // Username does not exist, log error & redirect back
        if (!user){
          console.log('User Not Found with username '+username);
          return done(null, false, 
                req.flash('error', 'User Not found.')
                );                 
        }
        // User exists but wrong password, log the error 
        if (!isValidPassword(user,password)){
          console.log('Invalid Password');
          return done(null, false, 
              req.flash('error', 'Invalid Password')
              );
        }
        // User and password both match, return user from 
        // done method which will be treated like success
        req.flash('success','Welcome '+user.username);
        return done(null, user);
      }
    );}));

//Passport sign up logic

passport.use("contractor-signup", new LocalStrategy({
    usernameField:'username',
    passReqToCallback : true
  },
  function(req,username,password, done) {
    findOrCreateUser = function(){
      // find a user in Mongo with provided username
      contractorUser.findOne({'username':username},function(err, user) {
         
        // In case of any error return
        if (err){
          console.log('Error in SignUp: '+err);
          req.flash('error','Error while signup');
          return done(err);
        }
        // already exists
        if (user) {
            console.log('User already exists');
            return done(null, false, 
                 req.flash('error','User Already Exists')
                );
        }
        
        else {
          // if there is no user with that email
          // create the user
          var newUser = new contractorUser();
          // set the user's local credentials
          newUser.username      =    username;
          newUser.password      =    createHash(password);
          newUser.email         =       req.param('email');
          newUser.mobile        =     req.param('mobile');
          newUser.contractorid  =     req.param('conid');
          newUser.experience    =       req.param('experience');

          // save the user
          newUser.save(function(err) {
            if (err){
              console.log('Error in Saving user: '+err);  
              req.flash('error','Error in creating a user');
              throw err;  
            }
            console.log('User Registration succesful');    
            req.flash('success','Registration Successful Welcome')
            return done(null, newUser);
          });
        }
      });
    };
     
    // Delay the execution of findOrCreateUser and execute 
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
  })
);

// Generates hash using bCrypt
var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
   }




app.get("/",function(req,res){
    res.render("index");
});
app.get("/customer-signup",function(req,res){
    res.render("customer-signup");
});
app.post("/customer-signup",passport.authenticate('customer-signup', {
    successRedirect: "/customer/dashboard",
    failureRedirect:"/",
    failureFlash : true 
  }));

  app.post("/customer-login",passport.authenticate("customer-login", 
  {successRedirect:"/customer/dashboard", 
  failureRedirect:'/',
  failureFlash: true}),
   function(req,res){
}); 

app.get("/customer/dashboard",middleware.isCustomerLoggedIn,function(req,res){
    customerUser.findById(req.params.id,function(err,customer){
        if(err){
            console.log(err);
            req.flash('error','Error whil loading dashboard');
            res.redirect("/");
        } else {
            console.log("DASHBOARD");
            res.render("customer-dash",{currentUser:req.user});
        }

    });
});
app.get("/contractor-signup",function(req,res){
    res.render("contractor-signup");
});

app.post("/contractor-signup",passport.authenticate('contractor-signup', {
    successRedirect: "/contractor/dashboard",
    failureRedirect:"/",
    failureFlash : true 
  }));

  app.post("/contractor-login",passport.authenticate("contractor-login", 
  {successRedirect:"/contractor/dashboard", 
  failureRedirect:'/',
  failureFlash: true}),
   function(req,res){
}); 

app.get("/contractor/dashboard",function(req,res){
    contractorUser.findById(req.params.id,function(err,customer){
        if(err){
            console.log(err);
            req.flash('error','Error whil loading dashboard');
            res.redirect("/");
        } else {
            console.log("DASHBOARD");
            console.log(req.user);
            res.render("contractor-dash",{currentUser:req.user});
        }

    });
});
app.get("/logout",function(req,res){
    req.logout();
    req.flash('success','Bye..');
    // req.session.destroy();
    res.redirect("/");
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