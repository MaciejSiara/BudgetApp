///////////////////////
// BUDGET CONTROLLER //
///////////////////////
const budgetController = (function () {
   const Expense = function (id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
   };

   Expense.prototype.calcPercentage = function (totIncome) {
      if (totIncome > 0) {
         this.percentage = Math.round((this.value / totIncome) * 100);
      } else {
         this.percentage = -1;
      }
   };

   Expense.prototype.getPercentage = function () {
      return this.percentage;
   };

   const Income = function (id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
   };

   let calculateTotal = function (type) {
      let sum = 0;
      data.allItems[type].forEach(function (el) {
         sum += el.value;
      });
      data.totals[type] = sum;
   };

   let data = {
      allItems: {
         exp: [],
         inc: [],
      },
      totals: {
         exp: 0,
         inc: 0,
      },
      budget: 0,
      percentage: -1,
   };

   return {
      addItem: function (type, des, val) {
         let newItem;

         // create new ID
         if (data.allItems[type].length > 0) {
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
         } else ID = 0;

         // create new item based on 'inc' or 'exp'
         if (type === "exp") {
            newItem = new Expense(ID, des, val);
         } else if (type == "inc") {
            newItem = new Income(ID, des, val);
         }

         // Push it into our data structure
         data.allItems[type].push(newItem);

         // return the new element
         return newItem;
      },

      deleteItem: function (type, id) {
         //get id of item
         let ids, index;
         ids = data.allItems[type].map(function (current) {
            return current.id;
         });

         index = ids.indexOf(id);

         if (index !== -1) {
            data.allItems[type].splice(index, 1);
         }
      },

      calculateBudget: function () {
         calculateTotal("exp");
         calculateTotal("inc");

         data.budget = data.totals.inc - data.totals.exp;
         if (data.totals.inc > 0) {
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
         } else {
            data.percentage = -1;
         }
      },

      calucatePercentages: function () {
         data.allItems.exp.forEach(function (cur) {
            cur.calcPercentage(data.totals.inc);
         });
      },

      getPercentages: function () {
         let allPerc = data.allItems.exp.map(function (cur) {
            return cur.getPercentage();
         });
         return allPerc;
      },

      getBudget: function () {
         return {
            budget: data.budget,
            totalIncome: data.totals.inc,
            totalExpenses: data.totals.exp,
            percentage: data.percentage,
         };
      },

      testing: function () {
         console.log(data);
      },
   };
})();

///////////////////
// UI CONTROLLER //
///////////////////
const UIController = (function () {
   const DOMstrings = {
      inputType: ".add__type",
      inputDescription: ".add__description",
      inputValue: ".add__value",
      inputButton: ".add__btn",
      incomeContainer: ".income__list",
      expensesContainer: ".expenses__list",
      budgetLabel: ".budget__value",
      incomeLabel: ".budget__income-value",
      expenseLabel: ".budget__expenses-value",
      percentageLabel: ".budget__expenses-percentage",
      itemsContainer: ".items__container",
      expensesPercentages: ".item__cost__percentage",
   };

   const formatNumber = function (num, type) {
      let numSplit, int, dec;

      num = Math.abs(num);
      num = num.toFixed(2);

      numSplit = num.split(".");
      int = numSplit[0];
      if (int.length > 3) {
         int = `${int.substr(0, int.length - 3)},${int.substr(int.length - 3, int.length)}`;
      }

      dec = numSplit[1];
      if (type === "") sign = "";
      else if (type === "inc") sign = "+";
      else sign = "-";
      return `${sign}${int}.${dec}`;
   };

   return {
      getInput: function () {
         return {
            type: document.querySelector(DOMstrings.inputType).value,
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
         };
      },

      addListItem: function (obj, type) {
         let html, newHTML, element;
         //create HTML string with placeholder text
         if (type === "inc") {
            element = DOMstrings.incomeContainer;

            newHTML = `<div class="item" id="inc-${obj.id}">
         <div class="item__description">${obj.description}</div>
         <div class="item__cost">
            <div class="item__cost__value">
               ${formatNumber(obj.value, type)}
            </div>
            <div class="item__cost__delete">
               <button class="item__cost__delete-btn">
                  <i class="ion-ios-close-outline"></i>
               </button>
            </div>
         </div>
      </div>`;
         } else if (type === "exp") {
            element = DOMstrings.expensesContainer;

            newHTML = `<div class="item" id="exp-${obj.id}">
            <div class="item__description">
               ${obj.description}
            </div>
            <div class="item__cost">
               <div class="item__cost__value">${formatNumber(obj.value, type)}</div>
               <div class="item__cost__percentage">21%</div>
               <div class="item__cost__delete">
                  <button class="item__cost__delete-btn">
                     <i class="ion-ios-close-outline"></i>
                  </button>
               </div>
            </div>
         </div>`;
         }
         // Replace the placeholder text witch some actual data
         // newHTML = html.replace('%id%', obj.id);
         //newHTML = html.replace("%id%", obj.id);
         //newHTML = newHTML.replace("%description%", obj.description);
         //newHTML = newHTML.replace("%value%", obj.value);
         // Insert the HTML into the DOM
         document.querySelector(element).insertAdjacentHTML("afterbegin", newHTML);
      },

      deleteListItem: function (selectorID) {
         let el = document.getElementById(selectorID);
         el.parentNode.removeChild(el);
      },

      clearFields: function () {
         let fields, fieldsArray;
         fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);

         fieldsArray = Array.prototype.slice.call(fields);

         fieldsArray.forEach(function (element, index, array) {
            element.value = "";
         });

         fieldsArray[0].focus();
      },

      displayBudget: function (obj) {
         let type;
         if (obj.budget === 0) type = "";
         else if (obj.budget > 0) type = "inc";
         else type = "exp";

         document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
         document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, "inc");
         document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExpenses, "exp");

         if (obj.percentage > 0) {
            document.querySelector(DOMstrings.percentageLabel).textContent = `${obj.percentage} %`;
         } else {
            document.querySelector(DOMstrings.percentageLabel).textContent = `---`;
         }
      },

      displayPercentages: function (percentages) {
         let fields = document.querySelectorAll(DOMstrings.expensesPercentages);

         const nodeListForEach = function (list, callback) {
            for (let i = 0; i < list.length; i++) {
               callback(list[i], i);
            }
         };

         nodeListForEach(fields, function (current, index) {
            if (percentages[index] > 0) {
               current.textContent = `${percentages[index]}%`;
            } else {
               current.textContent = "---";
            }
         });
      },

      getDOMstrings: function () {
         return DOMstrings;
      },
   };
})();

////////////////////////////
// GLOBAL APP CONTROLLER ///
////////////////////////////
const controller = (function (budgetCtrl, UICtrl) {
   const setupEventListeners = function () {
      const DOM = UICtrl.getDOMstrings();
      document.querySelector(DOM.inputButton).addEventListener("click", ctrlAddItem);

      document.addEventListener("keypress", function (event) {
         if (event.keyCode === 13 || event.which === 13) {
            ctrlAddItem();
         }
      });

      document.querySelector(DOM.itemsContainer).addEventListener("click", ctrlDeleteItem);
   };

   const updateBudget = function () {
      // 1. calculate the budget
      budgetCtrl.calculateBudget();
      // 2. Return the budget
      let budget = budgetCtrl.getBudget();
      // 5. display the budget
      UICtrl.displayBudget(budget);
   };

   const updatePercentages = function () {
      // calculate precentage
      budgetCtrl.calucatePercentages();
      // read percentage from budget controller
      let percentages = budgetCtrl.getPercentages();
      // update UI
      UICtrl.displayPercentages(percentages);
   };

   const ctrlAddItem = function () {
      let input, newItem;

      // 1. get the field input data (ENTER or button)
      input = UICtrl.getInput();

      if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
         // 2. add item to the budget controller
         newItem = budgetCtrl.addItem(input.type, input.description, input.value);
         // 3. add the new item to UI
         UICtrl.addListItem(newItem, input.type);

         //. Clear the fields
         UICtrl.clearFields();

         // 5. Calculate and update budget
         updateBudget();

         // calculate and update percentages
         updatePercentages();
      }
   };

   const ctrlDeleteItem = function (event) {
      let itemID, splitID, type, ID;
      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

      if (itemID !== null) {
         // exp-0
         splitID = itemID.split("-");
         type = splitID[0];
         ID = parseInt(splitID[1]);

         // delete item from data structure
         budgetCtrl.deleteItem(type, ID);
         //delete item from UI
         UICtrl.deleteListItem(itemID);

         //show new total budget
         updateBudget();

         // calculate and update percentages
         updatePercentages();
      }
   };

   return {
      init: function () {
         console.log("app started");
         UICtrl.displayBudget({
            budget: 0,
            totalIncome: 0,
            totalExpenses: 0,
            percentage: 0,
         });
         setupEventListeners();
      },
   };
})(budgetController, UIController);

window.addEventListener("DOMContentLoaded", () => {
   controller.init();
});
