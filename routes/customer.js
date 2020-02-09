var express             = require("express"),
    router              = express.Router({mergeParams:true}),
    customerUser        = require("../models/customer"),
    contractorUser        = require("../models/contractor"),
    flash               = require("connect-flash"),
    passport            = require("passport"),
    LocalStrategy       = require("passport-local"),
    bCrypt              = require('bcrypt'),
    middleware          = require("../middleware");

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
            req.flash('success','Registration Successfull Welcome')
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
 var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
   }

   router.get("/customer-signup",function(req,res){
    res.render("customer-signup");
});
router.post("/customer-signup",passport.authenticate('customer-signup', {
    successRedirect: "/customer/dashboard",
    failureRedirect:"/customer-signup",
    failureFlash : true 
  }));

  router.post("/customer-login",passport.authenticate("customer-login", 
  {successRedirect:"/customer/dashboard", 
  failureRedirect:'/',
  failureFlash: true}),
   function(req,res){
}); 

router.get("/customer/dashboard",middleware.isCustomerLoggedIn,function(req,res){
    customerUser.findById(req.user,function(err,customer){
      if(err){
        console.log(err);
        req.flash('error','Error whil loading dashboard');
        res.redirect("/");
      }
        else{
          contractorUser.find( function(conterr,contractor){
            if(conterr){
              console.log(conterr);
              req.flash('error','Error whil loading contractor details');
              res.redirect("/")
            }
            else{
              res.render("customer-dash",{currentUser:customer,contractoreDetail:contractor});
            }
          });
        }      

    });
});

router.get("/customer/contractor/:id",middleware.isCustomerLoggedIn,function(req,res){
  customerUser.findById(req.user,function(err,customer){
    if(err){
      console.log(err);
      req.flash('error','Error whil loading details');
      res.redirect("/customer/dash");
    }
    else{
      contractorUser.findById(req.params.id,function(err,contractor){
        if(err){
          console.log("err");
          req.flash('error','Error while loading contractor details');
          res.redirect("/customer/dashboard");
        }
        else{
          res.render("cust_cont-details",{currentUser:customer,contractorDetail:contractor});
        }
      });
    }
  });
});

router.post("/customer/contractor/:id",middleware.isCustomerLoggedIn,function(req,res){
  customerUser.findById(req.user,function(err,customer){
    if(err){
      console.log(err);
      req.flash('error','Error while loading data please try again');
      res.redirect("/customer/dashboard");
    }
    else{
      contractorUser.findById(req.params.id,function(err,contractor){
        // console.log(contractor);
        if(err){
          console.log("err");
          req.flash('error','Error while loading contractor data please try again');
          res.redirect("/customer/dashboard");
        }
        else{
          contractor.customer.push(customer);
          contractor.save(function(err,data){
            if(err){
              console.log(err);
              req.flash('error','Error while saving and sending data please try again');
              res.redirect("/customer/dashboard");
            }
            else{
              req.flash('success','Successfully contacted the contractor');
              res.redirect("/customer/dashboard");
            }
          });
        }
      });
    }
  }); 
});
router.get("/customer/:id/profile",middleware.isCustomerLoggedIn,function(req,res){
  customerUser.findById(req.params.id,function(err,customer){
    if(err){
      console.log(err)
        req.flash('error','Error while loading profile please try again');
          res.redirect("/customer/dashoard");
    }
    else{
      res.render("customer-profile",{currentUser:customer});
    }
  });
});

router.get("/customer/:id/profile/edit",middleware.isCustomerLoggedIn,function(req,res){
  customerUser.findById(req.params.id,function(err,customer){
    if(err){
      console.log(err);
      req.flash('error','Error while loading the edit page. Please try again');
      res.redirect("/customer/:id/profile");
    }
    else{
      res.render("customer-profile-edit",{currentUser:customer});
    }
  });
});

router.put("/customer/:id/profile",function(req,res){
  customerUser.findByIdAndUpdate(req.params.id,req.body.customer, function(err,updateProfile){
    if(err){
      console.log(err);
      req.flash('error','error while updating profile. Please try again');
      res.redirect("/customer/"+req.params.id+"/profile");
    }
    else{
      req.flash('success','Profile Updation successful');
      res.redirect("/customer/"+req.params.id+"/profile"); 
    }
  });
});

//Nidhilesh editing

router.get("/customer/:id/project/",middleware.isCustomerLoggedIn,function(req,res){
  customerUser.findById(req.params.id,function(err,customer){
    if(err){
      console.log(err);
      req.flash('error','Error while loading the project page. Please try again');
      res.redirect("/customer/:id/profile");
    }
    else{
      res.render("customer-project",{currentUser:customer});
    }
  });
});

router.get("/customer/logout",function(req,res){
  req.logout();
  req.flash('success','Bye..');
  // req.session.destroy();
  res.redirect("/");
});

module.exports = router;