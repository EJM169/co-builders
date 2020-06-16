var express             = require("express"),
    async               = require("async"),
    router              = express.Router({mergeParams:true}),
    multer              = require("multer"),
    contractorUser      = require("../models/contractor"),
    customerUser        = require("../models/customer"),
    projectC            = require("../models/project"),
    chat                = require("../models/chat"),
    flash               = require("connect-flash"),
    passport            = require("passport"),
    LocalStrategy       = require("passport-local"),
    bCrypt              = require('bcrypt'),
    {amountCalc,scheduleCheck}          = require("../utils/utilfnc"),
    middleware          = require("../middleware");

var storage = multer.diskStorage({
  destination: function(req,file,cb){
    cb(null,'./uploads');
  },
  filename: function(req,file,cb){
    cb(null,file.originalname);
  }
});
var fileFilter = function(req,file,cb){
  if(file.mimetype ==='image/png' || file.mimetype==='image/jpeg'){
    cb(null,true);
  }
  else{
    cb(null,false);
  }
}
var uploads = multer({
  storage:storage, limits:{
  fieldSize: 1024*1024*5
  },
  fileFilter:fileFilter
});

//<-----------Passport configuration------------------->

module.exports = function (io) {

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
    res.render("contractor/signup");
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

router.get("/contractor/dashboard",middleware.isContractorLoggedIn,function(req,res){
    contractorUser.findById(req.user,function(err,contractor){
        if(err){
            console.log(err);
            req.flash('error','Error whil loading dashboard');
            res.redirect("/");
        } else {
          if(contractor.customer.length>0){
            contractor.customer.forEach(function(customer){
              customerUser.findById(customer,function(err,customer){
                if(err){
                  console.log(err);
                  req.flash('error','Error while loading customer data');
                }
                else{
                  res.render("contractor/dashboard",{currentUser:contractor,customerDetail:customer});
                }
              });           
          });
           
          }
          else{
            res.render("contractor/dashboard",{currentUser:contractor,customerDetail:[]});
        }
          }
    });
});

router.post("/contractor/dashboard/:id/accept",middleware.isContractorLoggedIn,function(req,res){
  contractorUser.findById(req.user,function(err,contractor){
    if(err){
      console.log(err);
      req.flash('error','Error while accepting customer, contractor detail not found');
      res.redirect("/contractor/dashoard");
    }
    else{
      customerUser.findById(req.params.id,function(err,customer){
        if(err){
          console.log(err);
          req.flash('error','Error while accepting customer, customer not found');
          res.redirect("/contractor/dashoard");
        }
        else{
          async.series([
            function(callback){
              customer.contractor.pop(contractor);
              customer.active_proj_cont.push(contractor);
              customer.save(function(err,data){
                if(err){
                  console.log(err)
                  callback(err);
                }
                callback();
              });
            },
            function(callback){
              contractor.customer.pop(customer);
              contractor.active_proj_cust.push(customer);
              contractor.save(function(err,data){
                if(err){
                  console.log(err)
                  callback(err);
                }
                callback();
              });
            },
            function(callback){
              var newData =  projectC();
     
              newData.customer=customer._id;
              newData.contractor=contractor._id;
              newData.save(function(err){
                if(err){                  
                  console.log(err);
                  callback(err);
                }
                callback();
              });
            },
            function(callback){
              var newData =  chat();
              newData.customer=customer._id;
              newData.contractor=contractor._id;
              newData.save(function(err){
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
                res.redirect("/contractor/dashboard");
            }
            req.flash('success','succesfully accepted the customer');
            res.redirect("/contractor/dashboard");  
          });
        }
      });
        }
      });
});

router.post("/contractor/dashboard/:id/reject",middleware.isContractorLoggedIn,function(req,res){
  contractorUser.findById(req.user,function(err,contractor){
    if(err){
      console.log(err);
      req.flash('error','Error while accepting customer, contractor detail not found');
      res.redirect("/contractor/dashoard");
    }
    else{
      customerUser.findById(req.params.id,function(err,customer){
        if(err){
          console.log(err);
          req.flash('error','Error while accepting customer, customer not found');
          res.redirect("/contractor/dashoard");
        }
        else{
          contractor.customer.pop(customer);
          contractor.save(function(err,data){
            if(err){
              console.log(err);
              req.flash('error','Error while rejecting, please try again');
              res.redirect("/contractor/dashboard");
            }
            else{
              console.log("Need to send notification to customer");
              customer.contractor.pop(contractor);
              customer.sendStatus=!customer.sendStatus;
              customer.save(function(err,savedata){
                if(err){
                  console.log(err)
                  req.flash('error','Error while updating, please try again');
                  res.redirect("/contractor/dashboard");
                }
                else{
                  req.flash('success','Successfully rejected the customer');
                  res.redirect("/contractor/dashboard");   
                }
              });         
            }
          });
        }
      });
    }
  });
});

router.get("/contractor/:id/profile",middleware.isContractorLoggedIn,function(req,res){
  contractorUser.findById(req.params.id,function(err,contractor){
    if(err){
      console.log(err)
        req.flash('error','Error while loading profile');
          res.redirect("/contractor/dashoard");
    }
    else{
      res.render("contractor/profile",{currentUser:contractor});
    }
  });
});

router.get("/contractor/:id/profile/edit",middleware.isContractorLoggedIn,function(req,res){
  contractorUser.findById(req.params.id,function(err,contractor){
    if(err){
      console.log(err);
      req.flash('error','Error while loading edit page');
      res.redirect("/contractor/:id/profile");
    }
    else{
      res.render("contractor/profile-edit",{currentUser:contractor});
    }
  });
});

router.put("/contractor/:id/profile",middleware.isContractorLoggedIn,function(req,res){
  contractorUser.findByIdAndUpdate(req.params.id,req.body.contractor, function(err,updateProfile){
    if(err){
      console.log(err);
      req.flash('error','error while updating profile');
      res.redirect("/contractor/"+req.params.id+"/profile");
    }
    else{
      req.flash('success','Updated profile');
      res.redirect("/contractor/"+req.params.id+"/profile"); 
    }
  });
});
router.get("/contractor/:id/customer",middleware.isContractorLoggedIn,function(req,res){
  contractorUser.findById(req.params.id,function(err,contractor){
    if(err){
      console.log(err);
      req.flash('error','Error while loading the page. Please try again');
      res.redirect("/contractor/dashboard");
    }
    else{
      if(contractor.active_proj_cust.length!=0){
        contractor.active_proj_cust.forEach(function(cust){
          customerUser.findById(cust,function(err,customer){
            if(err){
              console.log(err);
              req.flash('error','Error while loading the page. Please try again');
              res.redirect("/contractor/dashboard");
            }
            else{
              projectC.findOne({'contractor':req.params.id},function(err,project){
                if(err){
                  console.log(err);
                  req.flash('error','Error whil loading details');
                  res.redirect("/customer/dashboard");
                }   
                else{
                  if(project){
                    var scheduleStatus=scheduleCheck(project);
                    console.log(scheduleStatus);
                    res.render("contractor/cust-page",{currentUser:contractor,customerDetail:customer,project:project,scheduleStatus:scheduleStatus});
                  }
                  else{
                    res.render("contractor/cust-page",{currentUser:contractor,customerDetail:customer,project:null,scheduleStatus:null});
                  }
                } 
                });
            }
          });
        });
      }
    }
  })
});
router.get("/contractor/customer/:id",middleware.isContractorLoggedIn,function(req,res){
  contractorUser.findById(req.user,function(err,contractor){
    if(err){
      console.log(err);
      req.flash('error','Error whil loading details');
      res.redirect("/contractor/dashboard");
    }
    else{
      customerUser.findById(req.params.id,function(err,customer){
        if(err){
          console.log(err);
          req.flash('error','Error while loading contractor details');
          res.redirect("/contractor/dashboard");
        }
        else{
          res.render("contractor/cust-details",{currentUser:contractor,contractorDetail:customer});
        }
      });
    }
  });
});

router.get("/contractor/:id/plan",middleware.isContractorLoggedIn,function(req,res){
  contractorUser.findById(req.user,function(err,contractor){
    if(err){
      console.log(err);
      req.flash('error','Error whil loading details');
      res.redirect("/customer/dash");
    }
    else{
      projectC.findOne({'customer':req.params.id},function(err,project){
        if(err){
          console.log(err);
          req.flash('error','Error whil loading details');
          res.redirect("/contractor/dashboard");
        }   
        else{
          if(project){
            customerUser.findById(project.customer,function(err,customer){
              if(err){
                console.log(err);
                req.flash('error','Error whil loading details');
                res.redirect("/contractor/dashboard");
              }
              else{
                res.render("contractor/project-plan",{currentUser:contractor,project:project,customer:customer});
              }
            });
          }
          else{
              res.render("contractor/project-plan",{currentUser:contractor,project:null,customer:null});

          }
        }
      });
    }
  });    
});

router.post("/contractor/:id/plan",middleware.isContractorLoggedIn,function(req,res){
  projectC.findById(req.params.id,function(err,project){
    if(err){
      console.log(err);
                req.flash('error','Error whil loading details');
                res.redirect("/contractor/dashboard");
              }
    else{
      project.overallPlan=req.body.project.overallPlan;
      project.contractorStatus=!project.contractorStatus;
      project.save(function(err,savedata){
        if(err){
          console.log(err);
          req.flash('error','Error while saving')
        }
        else{
          req.flash('success','Successfully saved the data');
          res.redirect("/contractor/"+project.customer+"/plan")
        }
      })
    }
  })
});


router.get("/contractor/chat/:id",middleware.isContractorLoggedIn,function(req,res){
  contractorUser.findById(req.user,function(err,contractor){
    if(err){
      console.log(err);
      req.flash('error','Error whil loading details');
      res.redirect("/contractor/dash");
    }
    else{
      console.log("requesting user"+req.user);
      chat.findOne({'customer':req.params.id},function(err,chatLog){
          if(err){
            console.log(err);
            req.flash('error','Error whil loading details');
            res.redirect("/contractor/dash");
          }   
          else{
            console.log(chatLog);
            if(chatLog){
              customerUser.findById(chatLog.customer,function(err,customer){
                if(err){
                  console.log(err);
                  req.flash('error','Error whil loading details');
                  res.redirect("/contractor/dash");
                }
                else{
                  res.render("chat",{currentUser:contractor,message:chatLog,otherUser:customer});
                }
              });
            }
            else{
                res.render("chat",{currentUser:contractor,message:null,otherUser:null});
            }
          }
      });
    }
  })
}); 



//Printing Schedule task page
router.get("/contractor/:id/schedule",middleware.isContractorLoggedIn,function(req,res){
  contractorUser.findById(req.user,function(err,contractor){
    if(err){
      console.log(err);
      req.flash('error','Error while loading edit page');
      res.redirect("/contractor/:id/profile");
    }
    else{
      projectC.findById(req.params.id,function(err,project){
        if(err){
          console.log(err);
          req.flash('error','Error whil loading project details');
          res.redirect("/customer/dashboard");
        }   
        else{
          res.render("contractor/schedule",{currentUser:contractor,project:project});
      }
    });
  }
});
});


// this is for creating schedule task
router.post("/contractor/:id/schedule",middleware.isContractorLoggedIn,function(req,res){
       projectC.findById(req.params.id,function(err,project){
        if(err){
          console.log(err);
          req.flash('error','Error while loading project details');
          res.redirect("/contractor/dashboard");  
        }
        else{
              project.planDate.push(req.body.planDate);
              // project.planDate.plan.push(req.body.planDate.plan);
              project.save(function(err,savedata){
                if(err){
                  console.log(err);
                  req.flash('error','Error while saving')
                }
                else{
                  req.flash('success','Successfully saved the data');
                  res.redirect("/contractor/"+project._id+"/schedule")
                }
              })
            }
      });
});
// this is for updating schedule whether a task is completed or not
router.post("/contractor/:id/schedule/:id1",middleware.isContractorLoggedIn,uploads.single('scheduleImage'),function(req,res){
  projectC.findById(req.params.id,function(err,project){
   if(err){
     console.log(err);
     req.flash('error','Error while loading project details');
     res.redirect("/contractor/dashboard");  
   }
   else{

            project.planDate.forEach(function(planD){
              if(planD._id==req.params.id1){
                planD.status=!planD.status;
                planD.scheduleImage=req.file.path;
                  }
                })
              
                project.save(function(err,savedata){
                  if(err){
                    console.log(err);
                    req.flash('error','Error while saving')
                    res.redirect("/contractor/dashboard");
                  }
                  else{
                    req.flash('success','Successfully saved the data');
                    res.redirect("/contractor/"+project._id+"/schedule")

                  }
                })
      
       }
 });
});
router.post("/contractor/:id/schedule/:id1/delete",middleware.isContractorLoggedIn,function(req,res){
  projectC.findById(req.params.id,function(err,project){
   if(err){
     console.log(err);
     req.flash('error','Error while loading project details');
     res.redirect("/contractor/dashboard");  
   }
   else{
        
        
         
            project.planDate.pull({_id:req.params.id1});
                  project.save(function(err,savedata){
                    if(err){
                      console.log(err);
                      req.flash('error','Error while saving')
                    }
                    else{
                      req.flash('success','Successfully saved the data');
                      res.redirect("/contractor/"+project._id+"/schedule")
                    }
                  })
        
       }
 });
});

router.get("/contractor/:id/budget",middleware.isContractorLoggedIn,function(req,res){
  contractorUser.findById(req.user,function(err,contractor){
    if(err){
      console.log(err);
      req.flash('error','Error whil loading details');
      res.redirect("/contractor/dashboard");
    }
    else{
      projectC.findOne({'customer':req.params.id},function(err,project){
        if(err){
          console.log(err);
          req.flash('error','Error whil loading details');
          res.redirect("/contractor/dashboard");
        }   
        else{
          if(project){
            customerUser.findById(project.customer,function(err,customer){
              if(err){
                console.log(err);
                req.flash('error','Error whil loading details');
                res.redirect("/contractor/dashboard");
              }
              else{
                var amount = amountCalc(project.budget);
                res.render("contractor/budget",{currentUser:contractor,project:project,customer:customer,amount:amount});
              }
            });
          }
          else{
              res.render("contractor/budget",{currentUser:contractor,project:null,customer:null});

          }
        }
      });
    }
  });    
});


router.post("/contractor/:id/budget",middleware.isContractorLoggedIn,uploads.single('budgetImage'),function(req,res){
  projectC.findById(req.params.id,function(err,project){
   if(err){
     console.log(err);
     req.flash('error','Error while loading project details');
     res.redirect("/contractor/dashboard");  
   }
   else{
         req.body.budget.budgetImage = req.file.path;
         project.budget.push(req.body.budget);         
         project.save(function(err,savedata){
           if(err){
             console.log(err);
             req.flash('error','Error while saving');
             res.redirect("/contractor/dashboard");

           }
           else{
             req.flash('success','Successfully saved the data');
             res.redirect("/contractor/"+project.customer+"/budget")
           }
         })
       }
 });
});

router.get("/contractor/logout",function(req,res){
    req.logout();
    req.flash('success','Bye..');
    // req.session.destroy();
    res.redirect("/");
});


  //Socket.IO
  io.on('connection', function (socket) {
   
    // socket.on('chatMessage', msg =>{
    //   io.emit('message', msg);
    // });
    // socket.on('username',username=>{
    //   socket.on('chatMessage', msg =>{
    //     io.emit('message', formatMessage(username,msg));
    //   });
    // })

});


return router;
};