var mongoose                = require("mongoose"),
    admin                   = require("./models/admin"),
    bCrypt                  = require('bcrypt');

mongoose.connect("mongodb://localhost:27017/construction");

var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
   }
            var pass="admin123";
            var newUser = new admin();
            newUser.username= "admin";
            newUser.password= createHash(pass); 
    
    return admin.create(newUser,function(err){
        if (err){
            console.log('Error in Saving user: '+err);  
            throw err;  
          }
          console.log('User Registration succesful');    
          process.exit();
        });