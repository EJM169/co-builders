var express             = require("express"),
    async               = require("async"),
    router              = express.Router({mergeParams:true}),
    customerUser        = require("../models/customer"),
    contractorUser      = require("../models/contractor"),
    projectC            = require("../models/project"),
    chat                = require("../models/chat"),
    formatMessage       = require("../utils/messages"),
    flash               = require("connect-flash"),
    passport            = require("passport"),
    LocalStrategy       = require("passport-local"),
    bCrypt              = require('bcrypt'),
    middleware          = require("../middleware");

//<-----------Passport configuration------------------->

module.exports = function (io) {
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
    res.render("customer/signup");
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
              req.flash('error','Error whil loading contractor details');
              res.redirect("/")
            }
            else{
              res.render("customer/dash",{currentUser:customer,contractoreDetail:contractor});              
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
      res.render("customer/profile",{currentUser:customer});
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
      res.render("customer/profile-edit",{currentUser:customer});
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
          res.render("customer/cont-details",{currentUser:customer,contractorDetail:contractor});
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
          contractorUser.findOne({'customer':customer._id},function(err,user){
            if(err){
              req.flash('error','Error while retreiving data');
              res.redirect("/customer/dashboard");
            }
            if(user){
              req.flash('error','Error already sent request to this contractor');
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
                        customerUser.findOne({'contractor':customer._id},function(err,user){
                          if(err){
                            req.flash('error','Error while customer retreiving data');
                            res.redirect("/customer/dashboard");
                          }
                          if(user){
                            req.flash('error','Error already sent request to this contractor');
                            res.redirect("/customer/dashboard");
                          }
                          else{
                              customer.contractor.push(contractor);
                              customer.save(function(err,data){
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
            }
          })
          
        }
      });
    }
  }); 
});

router.get("/customer/:id/contractor",middleware.isCustomerLoggedIn,function(req,res){
  customerUser.findById(req.params.id,function(err,customer){
    if(err){
      console.log(err);
      req.flash('error','Error while loading the page. Please try again');
      res.redirect("/customer/dashboard");
    }
    else{
      if(customer.active_proj_cont.length!=0){
        customer.active_proj_cont.forEach(function(cont){
          contractorUser.findById(cont,function(err,contractor){
            if(err){
              console.log(err);
              req.flash('error','Error while loading the page. Please try again');
              res.redirect("/customer/dashboard");
            }
            else{
              res.render("customer/cont-page",{currentUser:customer,contractorDetail:contractor});
            }
          });
        });
      }
    }
  })
});

//Nidhilesh editing

router.get("/customer/:id/project/",middleware.isCustomerLoggedIn,function(req,res){
  customerUser.findById(req.params.id,function(err,customer){
    if(err){
      console.log(err);
      req.flash('error','Error while loading the project page. Please try again');
      res.redirect("/customer/dashboard");
    }
    else{
      res.render("customer/project",{currentUser:customer});
    }
  });
});

router.get("/customer/:id/project/edit",middleware.isCustomerLoggedIn,function(req,res){
  customerUser.findById(req.params.id,function(err,customer){
    if(err){
      console.log(err);
      req.flash('error','Error while loading the project page. Please try again');
      res.redirect("/customer/:id/project");
    }
    else{
      res.render("customer/project-edit",{currentUser:customer});
    }
  });
})

router.put("/customer/:id/project",middleware.isCustomerLoggedIn,function(req,res){
      if(req.body.customer.prayerRoomreq){
        req.body.customer.prayerRoomreq=true;
      }
      else{
        req.body.customer.prayerRoomreq=false;
      }
      if(req.body.customer.studyRoomreq){
        req.body.customer.studyRoomreq=true;
      }
      else{
        req.body.customer.studyRoomreq=false;
      }
      if(req.body.customer.diningRoomreq){
        req.body.customer.diningRoomreq=true;
      }
      else{
        req.body.customer.diningRoomreq=false;
      }
      if(req.body.customer.workAreareq){
        req.body.customer.workAreareq=true;
      }
      else{
        req.body.customer.workAreareq=false;
      }
      if(req.body.customer.utilityRoomreq){
        req.body.customer.utilityRoomreq=true;
      }
      else{
        req.body.customer.utilityRoomreq=false;
      }
      if(req.body.customer.carPorchreq){
        req.body.customer.carPorchreq=true;
      }
      else{
        req.body.customer.carPorchreq=false;
      }
    
      customerUser.findByIdAndUpdate(req.params.id,req.body.customer,{upsert: true},function(err,updateProfile){
        if(err){
          console.log(err);
          req.flash('error','error while updating profile. Please try again');
          res.redirect("/customer/"+req.params.id+"/project/edit");
        }
        else{
          req.flash('success','Profile Updation successful');
          res.redirect("/customer/"+req.params.id+"/project"); 
        }
      });
     
    });
  
   router.get("/customer/:id/plan",middleware.isCustomerLoggedIn,function(req,res){
    customerUser.findById(req.user,function(err,customer){
      if(err){
          console.log(err);
          req.flash('error','Error whil loading details');
          res.redirect("/customer/dash");
        }
        else{
          projectC.findOne({'contractor':req.params.id},function(err,project){
            if(err){
              console.log(err);
              req.flash('error','Error whil loading details');
              res.redirect("/customer/dash");
            }   
            else{
              if(project){
                contractorUser.findById(project.contractor,function(err,contractor){
                  if(err){
                    console.log(err);
                    req.flash('error','Error whil loading details');
                    res.redirect("/customer/dashboard");
                  }
                  else{
                    res.render("customer/project-plan",{currentUser:customer,project:project,contractor:contractor});
                  }
                });
              }
              else{
                  res.render("customer/project-plan",{currentUser:customer,project:null,contractor:null});
    
              }
            }
          });
        }
      });    
    });

  router.post("/customer/:id/plan/accept",middleware.isCustomerLoggedIn,function(req,res){
      projectC.findById(req.params.id,function(err,project){
        if(err){
          req.flash('error','Error whil loading project details');
          res.redirect("/customer/dashboard");
        }
        else{
          customerUser.findById(project.customer,function(err,customer){
            if(err){
              req.flash('error','Error whil loading customer details');
              res.redirect("/customer/"+projectC.customer+"/plan");
            }
            else{
              contractorUser.findById(project.contractor,function(err,contractor){
                if(err){
                  req.flash('error','Error whil loading contractor details');
                  res.redirect("/customer/"+projectC.customer+"/plan");
                }
                else{
                  async.series([
                    function(callback){
                      customer.projectStatus=!customer.projectStatus;
                      customer.save(function(err,data){
                        if(err){
                          console.log(err)
                          callback(err);
                        }
                        callback();
                      });
                    },
                    function(callback){
                      contractor.projectStatus=!contractor.projectStatus;
                      contractor.save(function(err,data){
                        if(err){
                          console.log(err)
                          callback(err);
                        }
                        callback();
                      });
                    },
                    function(callback){
                      project.customerStatus=!project.customerStatus;
                      project.projectStart=! project.projectStart;
                      project.save(function(err){
                        if(err){
                          console.log(err);
                          callback(err);
                        }
                        callback();
                      });
                    }
                  ], function(err) {
                    if(err) {
                        req.flash('error','Error while saving data');
                        res.redirect("/customer/"+projectC.customer+"/plan");
                    }
                    req.flash('success','succesfully accepted the plan');
                    res.redirect("/customer/"+projectC.customer+"/plan");  
                  });
                }
              });
            }
          });
        }
      });
    });
  router.post("/customer/:id/plan/reject",middleware.isCustomerLoggedIn,function(req,res){
      projectC.findById(req.params.id,function(err,project){
        if(err){
          req.flash('error','Error whil loading details');
          res.redirect("/customer/dashboard");
        }
        else{
          project.contractorStatus=!project.contractorStatus;
          project.save(function(err,savedata){
            if(err){
              console.log(err);
              req.flash('error','Error while saving')
            }
            else{
              req.flash('success','Successfully rejected the plan');
              res.redirect("/customer/"+project.customer+"/plan")
            }
          })
        }
      })
    });   

router.get("/customer/chat/:id",middleware.isCustomerLoggedIn,function(req,res){
  customerUser.findById(req.user,function(err,customer){
    if(err){
      console.log(err);
      req.flash('error','Error whil loading details');
      res.redirect("/customer/dash");
    }
    else{
      chat.findOne({'contractor':req.params.id},function(err,chatLog){
          if(err){
            console.log(err);
            req.flash('error','Error whil loading details');
            res.redirect("/customer/dash");
          }   
          else{
            if(chatLog){
              contractorUser.findById(chatLog.contractor,function(err,contractor){
                if(err){
                  console.log(err);
                  req.flash('error','Error whil loading details');
                  res.redirect("/customer/dashboard");
                }
                else{
                  res.render("chat",{currentUser:customer,message:chatLog,otherUser:contractor});
                }
              });
            }
            else{
                res.render("chat",{currentUser:customer,message:null,otherUser:null});
            }
          }
      });
    }
  })
}); 

// router.post("/customer/chat/:id",middleware.isCustomerLoggedIn,function(req,res){
//   customerUser.findById(req.user,function(err,customer){
//     if(err){
//       console.log(err);
//       req.flash('error','Error whil loading details');
//       res.redirect("/customer/chat/");
//     }
//     else{
//           chat.findById(req.params.id,function(err,chatData){
//             if(err){
//               console.log(err);
//               sendStatus(500);
//             }
//             else {
             
//               chatData.sender = customer.username;
//               chatData.messages = req.body.chat.messages.toString();            
//             chatData.save(function(err,data){
//                   if(err){
//                     console.log(err);
//                     req.flash('error','Error whil saving');

//                     res.redirect("/customer/chat/"+chatData.contractor);
//                   }
//                   else{

//                     res.redirect("/customer/chat/"+chatData.contractor);

//                   }
//                 });
//             }
//           })
//     }
//   });
// });

router.get("/customer/logout",function(req,res){
  req.logout();
  req.flash('success','Bye..');
  res.redirect("/");
});

var botName = "System";
  //Socket.IO
  io.on('connection', function (socket) {
      console.log('Customer has connected to Index');
      // socket.emit('message', formatMessage(botName,"Welcome"));

      // socket.broadcast.emit('message', formatMessage(botName,"A user has connectedd"));
      //ON Events
     socket.on('chatMessage', msg =>{
      io.emit('message', msg);
    });

    
  });
  
  return router;
};