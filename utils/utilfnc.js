
var    projectC                                = require("../models/project");

function amountCalc(budget){
    var invest=0, expense=0, total=0;
    budget.forEach(function(budget){
      if(budget.type == "Income"){
        invest +=budget.value;
      }
      else{
        expense +=budget.value;
      }
      total=invest-expense;
    });
    return {invest,expense,total};
  }

  function scheduleCheck(project){
    var i=0,k=0;
    if(project.length>0){
      project.forEach(function(project){
      projectC.findById(project._id,function(err,project){
        if(err){
          console.log(err);
            return 0;
        }
        else{
          project.planDate.forEach(function(plan){
            ++i;
            if(plan.status==true){
              ++k;
            }
          });
          if(i===k){
           project.scheduleStatus=true;
           
          }
          else{
            project.scheduleStatus=false;
          }
          project.save(function(err,data){
            if(err){
              return 0;
            }
            else{
              console.log("worked");
              return 1;
            }
          });
        }
      });
      });
  
      
    }
  
  }

  module.exports = {amountCalc,scheduleCheck};