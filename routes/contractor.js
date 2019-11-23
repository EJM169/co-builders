var express             = require("express"),
    router              = express.Router({mergeParams:true}),
    contractorUser      = require("../models/contractor"),
    flash               = require("connect-flash"),
    passport            = require("passport"),
    LocalStrategy       = require("passport-local"),
    bCrypt              = require('bcrypt'),
    middleware          = require("../middleware");

//<-----------Passport configuration------------------->


var isValidPassword = function(user, password){
    return bCrypt.compareSync(password, user.password);
  }

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
                 req.flash('error','Account Already Exists')
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

   router.get("/contractor-signup",function(req,res){
    res.render("contractor-signup");
});

router.post("/contractor-signup",passport.authenticate('contractor-signup', {
    successRedirect: "/contractor/dashboard",
    failureRedirect:"/contractor-signup",
    failureFlash : true 
  }));

  router.post("/contractor-login",passport.authenticate("contractor-login", 
  {successRedirect:"/contractor/dashboard", 
  failureRedirect:'/',
  failureFlash: true}),
   function(req,res){
}); 

router.get("/contractor/dashboard",function(req,res){
    contractorUser.findById(req.params.id,function(err,contractor){
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
router.get("/contractor/logout",function(req,res){
    req.logout();
    req.flash('success','Bye..');
    // req.session.destroy();
    res.redirect("/");
});

module.exports = router;