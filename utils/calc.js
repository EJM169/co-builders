
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

  module.exports = amountCalc;