 
 var middlewareObject ={};

 
middlewareObject.isContractorLoggedIn=function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","Hi  Please Login First")
    res.redirect("/");
} 

 middlewareObject.isCustomerLoggedIn=function(req,res,next){
    if(req.isAuthenticated()){
        console.log(req.user.role);
        return next();
    }
    req.flash("error","Hi  Please Login First")
    res.redirect("/");
} 

 
//won't work until user database is set
middlewareObject.isUserLogged=function(req,res,next){
    if(username!=null && password!=null){
        console.log("user middleware");
        return next();
    }
    else{
        req.flash("error","Please Create a user acount first")
        res.redirect("/");
    }
}



 module.exports=middlewareObject;