///////////////////////
// BUDGET CONTROLLER //
///////////////////////
const budgetController = (function () {
   const Expense = function (id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
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

            html = `<div class="item" id="income-%id">
         <div class="item__description">%description%</div>
         <div class="item__cost">
            <div class="item__cost__value">
               + %value%
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

            html = `<div class="item" id="expense-%id%">
            <div class="item__description">
               %description%
            </div>
            <div class="item__cost">
               <div class="item__cost__value">- %value%</div>
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
         newHTML = html.replace("%id%", obj.id);
         newHTML = newHTML.replace("%description%", obj.description);
         newHTML = newHTML.replace("%value%", obj.value);
         // Insert the HTML into the DOM
         document.querySelector(element).insertAdjacentHTML("afterbegin", newHTML);
      },

      clearFields: function () {
         let fields, fieldsArray;
         fields = document.querySelectorAll(
            DOMstrings.inputDescription + ", " + DOMstrings.inputValue
         );

         fieldsArray = Array.prototype.slice.call(fields);

         fieldsArray.forEach(function (element, index, array) {
            element.value = "";
         });

         fieldsArray[0].focus();
      },

      displayBudget: function (obj) {},

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
      let DOM = UICtrl.getDOMstrings();
      document.querySelector(DOM.inputButton).addEventListener("click", ctrlAddItem);

      document.addEventListener("keypress", function (event) {
         if (event.keyCode === 13 || event.which === 13) {
            ctrlAddItem();
         }
      });
   };

   const updateBudget = function () {
      // 1. calculate the budget
      budgetCtrl.calculateBudget();
      // 2. Return the budget
      let budget = budgetCtrl.getBudget();
      // 5. display the budget
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
      }
   };

   return {
      init: function () {
         console.log("app started");
         setupEventListeners();
      },
   };
})(budgetController, UIController);

window.addEventListener("DOMContentLoaded", () => {
   controller.init();
});
