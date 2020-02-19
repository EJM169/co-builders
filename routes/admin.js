var express             = require("express"),
    async               = require("async"),
    router              = express.Router({mergeParams:true}),
    contractorUser      = require("../models/contractor"),
    customerUser        = require("../models/customer"),
    projectC            = require("../models/project"),
    admin               = require("../models/admin"),
    flash               = require("connect-flash"),
    passport            = require("passport"),
    LocalStrategy       = require("passport-local"),
    bCrypt              = require('bcrypt'),
    middleware          = require("../middleware");

    var isValidPassword = function(user, password){
        return bCrypt.compareSync(password, user.password);
      }
      passport.use("admin-login",new LocalStrategy(
        {    
            usernameField:'username',
            passReqToCallback : true
        }, function(req, username, password, done) { 
        // check in mongo if a user with username exists or not
        admin.findOne({'username' : username}, 
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
        

    router.get("/panel/169/admin",function(req,res){
        res.render("admin");
    });
    
    router.post("/panel/169/admin",passport.authenticate('admin-login', {
        successRedirect: "/panel/169/admin/dashboard",
        failureRedirect:"/panel/169/admin",
        failureFlash : true 
      }));

    router.get("/panel/169/admin/dashboard",middleware.isAdminLoggedIn,function(req,res){
        res.render("admin_dash");
    });
    
    
router.get("/admin/logout",function(req,res){
    req.logout();
    req.flash('success','Bye..');
    // req.session.destroy();
    res.redirect("/");
});


module.exports = router;
