
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
    if(project.length){
      project.forEach(function(proj){
        proj.planDate.forEach(function(plan){
          ++i;
          if(plan.status==true){
            ++k;
          }
        });
        if(i===k){
          proj.flags.scheduleStatus=true;
          
         }
         else{
          proj.flags.scheduleStatus=false;
         }
         proj.save(function(err,data){
           if(err){
             return 0;
           }
           else{
             // console.log("worked");
             return 1;
           }
         });
      });
   

         
        }else{

          project.planDate.forEach(function(plan){
            ++i;
            if(plan.status==true){
              ++k;
            }
          });
          if(i===k){
           project.flags.scheduleStatus=true;
           
          }
          else{
            project.flags.scheduleStatus=false;
          }
          
          project.save(function(err,data){
            if(err){
              return 0;
            }
            else{
              // console.log("worked");
              return 1;
            }
          });

        }
  
      
    
  
  }

  module.exports = {amountCalc,scheduleCheck};