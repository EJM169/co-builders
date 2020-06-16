
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
    project.planDate.forEach(function(plan){
      ++i;
      if(plan.status==true){
        ++k;
      }
    });
    if(i===k){
      return true;
    }
    else{
      return false;
    }
  }

  module.exports = {amountCalc,scheduleCheck};