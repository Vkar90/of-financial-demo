/* eslint-disable no-use-before-define */
import autoBind from 'auto-bind';
import flatpickr from 'flatpickr';
import TomSelect from 'tom-select';

// State Disabled: Disabled default state - You cant click it until you populate some fields
// State Active: Active default state - Action: creates the installments plan
// State Reset: Reset state - Action: Clears the form and removes all installments
const AutoPlanButtonStates = {
  Disabled: "disabled",
  Active: "active",
  Reset: "reset",
}

// This returns the number of months between two dates ex. 8 or 10
const calculateMonthsBetweenDates = (date1, date2) => {
  // Also adds one because something
  const months = Math.abs((date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth())) + 1;
  return months;
}

// This returns an array of objects with the month and year labels between two dates ex.
// [{monthLabel: "JAN", yearLabel: 2020}, {monthLabel: "FEB", yearLabel: 2020}, {monthLabel: "MAR", yearLabel: 2020}]
const calculateMonthsBetweenDatesWithLabels = (date1, date2) => {
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const formattedMonths = [];

  while (date1 <= date2) {
    const formattedMonthName = monthNames[date1.getMonth()];
    const year = date1.getFullYear();

    formattedMonths.push({
      monthLabel: formattedMonthName,
      yearLabel: year,
    });

    // increment the date by one month
    date1.setMonth(date1.getMonth() + 1);
  }

  return formattedMonths;
}

// Parses the date to human date format
const parseDate = (input, format) => {
  format = format || 'yyyy-mm-dd'; // default format
  const parts = input.match(/(\d+)/g);

  if (parts === null) {
    return NaN;
  }

  let i = 0;
  const fmt = {};
  // extract date-part indexes from the format
  // eslint-disable-next-line no-plusplus
  format.replace(/(yyyy|dd|mm)/g, (part) => { fmt[part] = i++; });

  return new Date(parts[fmt.yyyy], parts[fmt.mm] - 1, parts[fmt.dd]);
}


// Optimization ideas
// 1. Create a seperate class for the installment in order for it to handle the event listeners and logic
// 2. Get the auto plan button copies from the html with data attributes (backend)
export default class {
  constructor(element) {
    autoBind(this);
    this.element = element;

    this.currencyObjects = []

    // Get DOM elements for later use
    this.queryDOM();

    // Setup event listeners
    this.setupEventListeners();

    this.initTomSelects();

    this.initFlatPickr();

    // Initialize variables
    // Initialize installment count
    this.installmentCount = this.installmentsRows.length;
    this.autoPlanButtonState = AutoPlanButtonStates.Disabled;
    this.createAutoPlanButton.disabled = true;

    // In case there is no installment, add one
    if (this.installmentCount === 0) {
      this.addInstallment(null, null, null, null, null, null);
    }

    // This array will hold the installment objects
    this.installments = [];

    this.calculateTotalAmount();

    this.addThousandSeparator();
  }

  queryDOM() {
    this.calculator = this.element.querySelector('.financial__calculator');
    this.budgetInputs = this.element.querySelectorAll('.financial__budget input');
    this.totalInputField = this.element.querySelector("#total");
    this.totalAmount = document.querySelector("#total-amount");
    this.scholarshipMonths = document.querySelector("#scholarship-months");
    this.efapaxInputField = document.querySelector("#efapax-input");
    this.efapax = Array.from(this.element.querySelectorAll(".efapax"));
    this.efapaxCurrency = document.querySelector(".efapax_currency");
    this.currencyDropdown = document.getElementById('installment-currency');
    this.installmentAmountInputField = document.querySelector("#installment-amount-input");
    this.scholarshipAmount = document.querySelector("#scholarship-amount");
    this.scholarshipAmountInputField = document.querySelector("#scholarship-amount-input");
    this.installmentAmount = document.querySelector("#installment-amount");
    this.installmentsTable = document.querySelector('.installments-table');
    this.createAutoPlanButton = document.querySelector('.create-auto-plan-button');
    this.createCustomPlanButton = document.querySelector('.create-custom-plan-button');
    this.scholarshipFrom = document.querySelector('.scholarship-from');
    this.scholarshipTo = document.querySelector('.scholarship-to');
    this.installmentCurrency = document.querySelector('.installment-currency');
    this.periodInput = document.querySelector('.period-input');
    this.period = document.querySelector('.period');
    this.numberOfInstallments = document.querySelector('.installment-number');
    this.numberOfInstallmentsInput = document.querySelector('.numberOfInstallments-input');
    this.typeOfInstallments = document.querySelector('.installments-type');
    this.installmentsContainer = this.element.querySelector(
      '.add-installment__container',
    );
    this.installmentsTemplate = this.element.querySelector(
      '.add-installment__template',
    );

    this.installmentsContainer = this.element.querySelector(
      '.add-installment__container',
    );
    this.currencyInputs = this.element.querySelectorAll('.js-currency');

    this.installmentsRows = this.element.querySelectorAll('.add-installment__row');

    // Select the year-to and month-to fields
    this.yearToFields = this.installmentsContainer.querySelectorAll('.year-to-input');
    this.monthToFields = this.installmentsContainer.querySelectorAll('.month-to-input');

    // Select the budget section
    this.budgetSection = document.querySelector('.financial__budget');
    // Select all input elements within the budget section
    this.inputElements = this.budgetSection.querySelectorAll('input');
    // Select all selects
    this.selectElements = this.budgetSection.querySelectorAll('select');

    // Select all date elements
    this.dateElements = document.querySelectorAll('.form__element-date');

    // Select clear inputs button
    this.clearInputsButton = document.querySelector('.clear-inputs-btn');

    // Select the currency exchange rate input
    this.currencyExchangeRateInput = document.getElementById('currency-exchange-rate');
   
    // Select the override currency exchange rate input
    this.overrideCurrencyExchangeRateInput = document.getElementById('currency-exchange-rate-override');

    // Select the total amount in dollars input
    this.totalAmountInDollarsInput = document.getElementById('total-amount-dollars');

    // Select all amount input fields 
    this.amountFields = document.querySelectorAll('.amount-field');
  }

  initTomSelects() {
    this.selectElements.forEach((select) => {
      const tomSelect = new TomSelect(select, {
        create: true,
        plugins: {
          remove_button: {
            title: 'Αφαίρεση',
          },
        },
      });
      select.tomSelect = tomSelect;
    },
    );
  }

  initFlatPickr () {
    this.dateElements.forEach((dateElement) => {
      // eslint-disable-next-line new-cap
      const obj = new flatpickr(dateElement, {
        dateFormat: 'd-m-Y',
        allowInput: false,
      });
      dateElement.flatpickr = obj;
    },
    );
  }

  setupEventListeners() {
    // Attach an event listener to the button
    this.createAutoPlanButton.addEventListener('click', this.handleCreateAutoPlanButtonClick);

    this.installmentAmountInputField.addEventListener("input", () => {
      const value = parseInt(this.installmentAmountInputField.value.replace(/\./g, ""), 10) || 0;
      this.installmentAmount.value = this.formatNumberWithThousandSeparator(value);
      const months = parseInt(this.scholarshipMonths.value, 10);
      const typeOfInstallments = this.typeOfInstallments.value;
      const numberOfInstallments = parseInt(this.numberOfInstallmentsInput.value, 10);
    
      if (typeOfInstallments === 'even' && !Number.isNaN(value) && !Number.isNaN(months)) {
        this.calculateEvenScholarshipAmount(value, months);
        this.updateEfapaxRow();
      } else if (typeOfInstallments === 'intermittent') {
        this.calculateIntermittentScholarshipAmount(value, months);
        this.updateEfapaxRow();
      } else if (typeOfInstallments === 'custom') {
        this.calculateCustomScholarshipAmount(value, numberOfInstallments);
        this.yearToFields.forEach(field => field.classList.remove('hidden'));
        this.monthToFields.forEach(field => field.classList.remove('hidden')); 
        this.updateEfapaxRow();
      } else {
        this.yearToFields.forEach(field => field.classList.add('hidden'));
        this.monthToFields.forEach(field => field.classList.add('hidden'));
      }
      this.calculateTotalAmount();
      this.updateEfapaxRow();
    });

    this.periodInput.addEventListener("input", () => {
      this.calculateTotalAmount();
    });

    this.numberOfInstallmentsInput.addEventListener("input", () => {
      this.calculateCustomScholarshipAmount();
      this.calculateTotalAmount();
    });

    this.scholarshipAmountInputField.addEventListener("input", () => {
      const value = parseInt(this.scholarshipAmountInputField.value, 10) || 0;
      this.scholarshipAmount.value = this.formatNumberWithThousandSeparator(value);;
      this.calculateTotalAmount();
    });


    this.scholarshipMonths.addEventListener("input", () => {
      const months = parseInt(this.scholarshipMonths.value, 10);
      const installmentAmount = parseInt(this.installmentAmountInputField.value, 10) || 0;
      const scholarshipAmount = (months * installmentAmount);
      this.scholarshipAmountInputField.value = scholarshipAmount;
      this.scholarshipAmount.value = scholarshipAmount;
      this.calculateTotalAmount();
    });

    // Attach event listeners related to the scholarship date range inputs
    this.scholarshipFrom.addEventListener("change", this.updateScholarshipMonths);
    this.scholarshipTo.addEventListener("change", this.updateScholarshipMonths);

    // Attach event listeners related to the efapax row
    this.scholarshipFrom.addEventListener('change', this.updateEfapaxRow);
    this.scholarshipTo.addEventListener('change', this.updateEfapaxRow);


    // Add event listeners to the budget inputs and selects
    this.budgetInputs.forEach(input => {
      input.addEventListener('change', () => {
        if (this.autoPlanCreated) {
          // eslint-disable-next-line no-restricted-globals, no-alert
          const resetConfirmed = confirm('Changing the budget inputs will reset the autoplan. Are you sure you want to continue?');
          if (resetConfirmed) {
            this.resetAutoPlan();
          }
        }
      });
    });

    this.selectElements.forEach(select => {
      select.addEventListener('change', () => {
        if (this.autoPlanCreated) {
          // eslint-disable-next-line no-restricted-globals, no-alert
          const resetConfirmed = confirm('Changing the budget inputs will reset the autoplan. Are you sure you want to continue?');
          if (resetConfirmed) {
            this.resetAutoPlan();
          }
        }
      });
    });

    this.efapaxInputField.addEventListener("input", () => {
      const value = parseFloat(this.efapaxInputField.value.replace(/\./g, "").replace(/,/g, ".")) || 0;
      const roundedValue = Math.round(value); // Round the value
      const formattedValue = this.formatNumberWithThousandSeparator(roundedValue);
      this.element.querySelectorAll(".efapax").forEach((field) => {
        field.value = formattedValue;
      });
      this.updateEfapaxRow();
      this.calculateTotalAmount();
    });
    
    this.amountFields.forEach((element) => {
    element.innerHTML += ` <span class="amount-currency"></span>`; 
    });
    

    this.periodInput.addEventListener("input", () => {
      const periodCount = parseInt(this.periodInput.value, 10);

      // eslint-disable-next-line no-restricted-globals
      if (!isNaN(periodCount) && periodCount > 0) {
        this.generatePeriodInputFields(periodCount);
      } else {
        const periodContainer = this.element.querySelector(".period-container");
        periodContainer.innerHTML = "";
      }

      // Add event listeners to period input fields
      const periodFromInputs = this.element.querySelectorAll(".period-from-input");
      const periodToInputs = this.element.querySelectorAll(".period-to-input");

      periodFromInputs.forEach(input => {
        input.addEventListener("input", updatePeriods);
      });

      periodToInputs.forEach(input => {
        input.addEventListener("input", updatePeriods);
      });

      // Call updatePeriods to set the initial value
      updatePeriods();
    });

    // New function to handle period input changes
    const updatePeriods = () => {
      // Get the type of installments from the selected option
      const typeOfInstallments = this.typeOfInstallments.value;

      // Get the NodeList of period elements and convert it to an array of objects
      const periodElements = this.element.querySelectorAll(".period-row");
      const periods = Array.from(periodElements).map(element => {
        const from = element.querySelector(".period-from-input").value;
        const to = element.querySelector(".period-to-input").value;
        return { from, to };
      });

      this.updateScholarshipMonths(typeOfInstallments, periods);
    };

    // Show περίοδος input field if Diakoptomeni is selected
    this.typeOfInstallments.addEventListener("change", () => {
      const selectedOption = this.typeOfInstallments.options[this.typeOfInstallments.selectedIndex].value;
      const periodContainer = this.element.querySelector(".period-container");

      if (selectedOption === "intermittent") {
        this.period.classList.remove("hidden");
        periodContainer.classList.remove("hidden");
        this.updateScholarshipMonths(selectedOption);
      } else {
        this.period.classList.add("hidden");
        periodContainer.classList.add("hidden");
      }

      // Show or hide the installments number
      if (selectedOption === "custom") {
        this.updateScholarshipMonths(selectedOption);
        this.numberOfInstallments.classList.remove("hidden");
      } else {
        this.numberOfInstallments.classList.add("hidden");
        this.updateScholarshipMonths(selectedOption); 
      }

      // Disable or enable the createAutoPlanButton based on the selected option
      if (selectedOption === "custom") {
        this.createAutoPlanButton.disabled = false;
        this.autoPlanButtonState = AutoPlanButtonStates.Active;
      } else {
        this.createAutoPlanButton.disabled = false;
        this.autoPlanButtonState = AutoPlanButtonStates.Active;
      }
    });

    // Add event listener to the clear inputs button 
    this.clearInputsButton.addEventListener("click", () => {
      this.clearBudgetInputs();
    });

    // Add event listener to currency dropdown
    this.currencyDropdown.addEventListener('change', () => {
      this.calculateExchangeRate();
      this.handleCurrencyChange();
    });

    // Add event listener to the override exchange rate input
    this.overrideCurrencyExchangeRateInput.addEventListener('input', () => {
      this.calculateExchangeRate();
    });
  }

  updateScholarshipMonths(typeOfInstallments, periods = []) {
    const parseDateDDMMYYYY = (input) => {
      const parts = input.split("-");
      return new Date(parts[2], parts[1] - 1, parts[0]);
    };

    let months = 0;

    if (typeOfInstallments === 'intermittent') {
      periods.forEach(period => {
        if (period.from === '' || period.to === '') {
          return;
        }

        const fromDate = parseDateDDMMYYYY(period.from);
        const toDate = parseDateDDMMYYYY(period.to);

        if (!Number.isNaN(fromDate) && !Number.isNaN(toDate)) {
          // count the last month as well
          const periodMonths = calculateMonthsBetweenDates(fromDate, toDate);
          months += periodMonths;
        }
      });
    } else {
      if (this.scholarshipFrom.value === '' || this.scholarshipTo.value === '') {
        this.scholarshipMonths.value = '';
        return;
      }

      const fromDate = parseDateDDMMYYYY(this.scholarshipFrom.value);
      const toDate = parseDateDDMMYYYY(this.scholarshipTo.value);

      if (!Number.isNaN(fromDate) && !Number.isNaN(toDate)) {
        // count the last month as well
        months = calculateMonthsBetweenDates(fromDate, toDate);
      }
    }

    if (months > 0) {
      this.scholarshipMonths.value = months;

      // Trigger the input event on the scholarshipMonths input field
      const event = new Event('input');
      this.scholarshipMonths.dispatchEvent(event);
    } else {
      this.scholarshipMonths.value = '';
    }
    this.calculateIntermittentScholarshipAmount();
    this.calculateTotalAmount();
  }

 // calculate total amount
calculateTotalAmount() {
  const scholarshipAmount = parseInt(this.scholarshipAmountInputField.value.replace(/\./g, ""), 10) || 0;
  const efapaxAmount = parseInt(this.efapaxInputField.value.replace(/\./g, ""), 10) || 0;
  const totalAmount = Math.round(scholarshipAmount + efapaxAmount);

  this.totalInputField.value = this.formatNumberWithThousandSeparator(totalAmount);
  this.totalAmount.value = this.formatNumberWithThousandSeparator(totalAmount);
  this.calculateExchangeRate();
}

// calculate the scholarship amount when the type of installments is even
calculateEvenScholarshipAmount() {
  const value = parseFloat(this.installmentAmountInputField.value.replace(/\./g, "")) || 0;
  const months = parseInt(this.scholarshipMonths.value, 10) || 0;
  const scholarshipAmount =  value * months;
  this.scholarshipAmountInputField.value = this.formatNumberWithThousandSeparator(scholarshipAmount);
  this.scholarshipAmount.value = this.formatNumberWithThousandSeparator(scholarshipAmount);
}

calculateIntermittentScholarshipAmount() {
  const value = parseFloat(this.installmentAmountInputField.value.replace(/\./g, "")) || 0;
  const months = parseInt(this.scholarshipMonths.value, 10) || 0;
  const scholarshipAmount = value * months;
  this.scholarshipAmountInputField.value = this.formatNumberWithThousandSeparator(scholarshipAmount);
  this.scholarshipAmount.value = this.formatNumberWithThousandSeparator(scholarshipAmount);
}



// calculate the scholarship amount when the type of installments is custom
calculateCustomScholarshipAmount() {
  const value = parseInt(this.installmentAmountInputField.value.replace(/\./g, ""), 10) || 0;
  const numberOfInstallments = parseInt(this.numberOfInstallmentsInput.value, 10) || 0;
  const scholarshipAmount = Math.round(value * numberOfInstallments);
  this.scholarshipAmountInputField.value = this.formatNumberWithThousandSeparator(scholarshipAmount);
  this.scholarshipAmount.value = this.formatNumberWithThousandSeparator(scholarshipAmount);
}

calculateExchangeRate() {
  const currencySelect = this.currencyDropdown;
  const originalExchangeRate = parseFloat(currencySelect.options[currencySelect.selectedIndex].dataset.exchangeRate) || 0;

  const overrideExchangeRate = parseFloat(this.overrideCurrencyExchangeRateInput.value.replace(/,/g, ".")) || 0;
  const finalExchangeRate = overrideExchangeRate !== 0 ? overrideExchangeRate : originalExchangeRate;

  this.currencyExchangeRateInput.value = `${originalExchangeRate.toFixed(2)}`;

  const totalAmount = parseFloat(this.totalAmount.value.replace(/\./g, "")) || 0;
  const convertedAmount = totalAmount * finalExchangeRate;
  const formattedAmount = this.formatNumberWithThousandSeparator(convertedAmount.toFixed(2));

  this.totalAmountInDollarsInput.value = `${formattedAmount}`;
}

// Function to handle currency change event
handleCurrencyChange() {
  const currencySelect = this.currencyDropdown;
  const selectedCurrency = currencySelect.value;
  const currencySymbol = this.getCurrencySymbol(selectedCurrency);

  // Update the text content of each label with the selected currency symbol
  const amountLabels = document.querySelectorAll('.amount-currency');
  amountLabels.forEach((label) => {
    if (currencySymbol !== '' ) {
        // Prepend the selected currency symbol and the word 'in' to the new value
        label.innerHTML = ` in ${currencySymbol}`;
    } else {
      label.innerHTML = '';
    }
  });
}


// eslint-disable-next-line class-methods-use-this
getCurrencySymbol(currencyCode) {
  return currencyCode;
  // switch (currencyCode) {
  //   case 'USD':
  //     return '$';
  //   case 'EUR':
  //     return '€';
  //   case 'GBP':
  //     return '£';
  //   default:
  //     return '';
  // }
}

// add thousand separator to a number
// eslint-disable-next-line class-methods-use-this
formatNumberWithThousandSeparator(value) {
  const number = Math.round(parseFloat(value));
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}


// add thousand separator to inputs with class js-currency
addThousandSeparator() {
  const currencyInputs = this.element.querySelectorAll(".js-currency");
  currencyInputs.forEach(input => {
    input.addEventListener("input", () => {
      const value = input.value.replace(/\./g, "");
      const number = parseInt(value, 10); // parse to integer to remove any possible decimal
      input.value = Number.isNaN(number) ? "" : this.formatNumberWithThousandSeparator(number);
    });
  });
}


  // update the button copy based on the state
  updateAutoPlanCopy() {
    if (this.autoPlanButtonState === AutoPlanButtonStates.Active || this.autoPlanButtonState === AutoPlanButtonStates.Disabled) {
      this.createAutoPlanButton.textContent = 'Create Auto Plan';
    } else if (this.autoPlanButtonState === AutoPlanButtonStates.Reset) {
      this.createAutoPlanButton.textContent = 'Reset Auto Plan';
    } else {
      this.createAutoPlanButton.textContent = 'Create Auto Plan';
    }
  }

  // function that handles the 'Create Auto Plan' button click
  handleCreateAutoPlanButtonClick() {
    switch (this.autoPlanButtonState) {
      case AutoPlanButtonStates.Reset:
        this.resetAutoPlan();
        this.autoPlanButtonState = AutoPlanButtonStates.Active;
        break;
      case AutoPlanButtonStates.Active:
        this.createAutoPlan();
        this.autoPlanButtonState = AutoPlanButtonStates.Reset;
        break;
      default:
        break;
    }

    // Finally update the copy based on the state
    this.updateAutoPlanCopy();
  }

  createAutoPlan() {
    // Get the selected option from the dropdown
    const selectedOption = this.typeOfInstallments.options[this.typeOfInstallments.selectedIndex].value;

    if (selectedOption === "even") {
      this.handleContinuousInstallments();
    } else if (selectedOption === "intermittent") {
      this.handleNonContinuousInstallments();
    } else if (selectedOption === "custom") {
      this.handleCustomInstallments();
    }
    // Set the autoPlanCreated flag to true
    this.autoPlanCreated = true;
    this.updateEfapaxRow();
  }

  // Function that populates the efapax row with data
  // eslint-disable-next-line class-methods-use-this
  updateEfapaxRow() {
    const scholarshipFromValue = document.querySelector('.scholarship-from').value;
    const scholarshipToValue = document.querySelector('.scholarship-to').value;
    const efapaxAmount = parseFloat(this.element.querySelector('#efapax-input').value, 10) || 0;

    if (!scholarshipFromValue || !scholarshipToValue || !efapaxAmount) {
      return;
    }

    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const scholarshipFrom = parseDate(scholarshipFromValue, 'dd-mm-yyyy');

    const efapaxMonth = monthNames[scholarshipFrom.getMonth()];
    const efapaxYear = scholarshipFrom.getFullYear();

    document.getElementById('efapax-month').value = efapaxMonth;
    document.getElementById('efapax-year').value = efapaxYear;
    const value = parseFloat(this.efapaxInputField.value.replace(/\./g, "").replace(/,/g, ".")) || 0;
      const roundedValue = Math.round(value); // Round the value
      const formattedValue = this.formatNumberWithThousandSeparator(roundedValue);
      this.element.querySelectorAll(".efapax").forEach((field) => {
        field.value = formattedValue;
      });
  }

  // Function to clear the installments table
  clearInstallmentsTable() {
    // Keep the efapax-row element and the financial__overview_title element
    const efapaxRow = this.installmentsContainer.querySelector('.efapax-row');
    const titleElement = this.installmentsContainer.querySelector('.financial__overview_title');

    // Clear the installmentsContainer
    this.installmentsContainer.innerHTML = '';

    // Re-append the efapax-row and financial__overview_title elements
    if (efapaxRow) this.installmentsContainer.appendChild(efapaxRow);
    if (titleElement) this.installmentsContainer.appendChild(titleElement);

    this.installmentCount = 0;
  }

  // Function to clear the input values in the efapax-row
  clearEfapaxInputs() {
    // Find the efapax-row element
    const efapaxRow = this.installmentsContainer.querySelector('.efapax-row');

    // Iterate through the input elements in the efapax-row and clear their values
    if (efapaxRow) {
      const inputElements = efapaxRow.querySelectorAll('input');
      inputElements.forEach(input => {
        input.value = '';
      });
    }
  }

  resetAutoPlan() {
    // Reset autoPlanCreated to false
    this.autoPlanCreated = false;

    // Reset autoPlanButtonState to active
    this.autoPlanButtonState = AutoPlanButtonStates.Active;
    this.createAutoPlanButton.disabled = false;

    this.createAutoPlanButton.innerText = 'Create Auto Plan';

    // Clear the installments table
    this.clearInstallmentsTable();
  }

  clearBudgetInputs() {
    // Iterate through the input elements and clear their values
    this.inputElements.forEach(input => {
      input.value = '';
    });

     // Check if the efapax-row exists
     const efapaxRow = this.installmentsContainer.querySelector('.efapax-row');
     if (efapaxRow) {
       // Iterate through the input elements in the efapax-row and clear their values
       const inputElements = efapaxRow.querySelectorAll('input');
       inputElements.forEach(input => {
         input.value = '';
       });
     }

    // Reset the select dropdowns
    this.selectElements.forEach(select => {
      // Check if the select dropdown has a Tom Select plugin attached to it
      if (select.tomSelect) {
        // If a Tom Select plugin is attached, reset it
        select.tomSelect.clear();
      } else {
        // If a Tom Select plugin is not attached, reset the selected index and value
        select.selectedIndex = -1;
        select.value = '';
      }
    });

    // Reset the type of installments dropdown
    this.typeOfInstallments.selectedIndex = 0;


    // Hide the period container
    const periodContainer = this.element.querySelector('.period-container');
    periodContainer.classList.add("hidden");
  }

  // function that adds an installment row
  addInstallment(amount, dueDate, yearFrom, monthFrom, yearTo, monthTo) {
    console.log(amount, dueDate, yearFrom, monthFrom, yearTo, monthTo);
    // Increment installment count
    // eslint-disable-next-line no-plusplus
    this.installmentCount++;

    // Clone the installment template
    const newInstallment = this.installmentsTemplate.content.cloneNode(true);
    this.installmentsContainer.appendChild(newInstallment);
    const installment = this.installmentsContainer.lastElementChild;
    const amountInput = installment.querySelector('.js-amount');
    const dueDateInput = installment.querySelector('.js-due-date');

    const monthFromInput = installment.querySelector('.js-month-from');
    const yearFromInput = installment.querySelector('.js-year');
    monthFromInput.value = monthFrom;
    yearFromInput.value = yearFrom;
    const tomSelectMonthFrom = new TomSelect(monthFromInput, {
      plugins: ['remove_button'],
      maxOptions: null,
    });
    // Set the default month FROM value
    tomSelectMonthFrom.setValue(monthFrom);


    const monthToInput = installment.querySelector('.js-month-to');
    const yearToInput = installment.querySelector('.js-year-to');
    monthToInput.value = monthTo;
    yearToInput.value = yearTo;
    const tomSelectMonthTo = new TomSelect(monthToInput, {
      plugins: ['remove_button'],
      maxOptions: null,
    });
    // Set the default month TO value
    tomSelectMonthTo.setValue(monthTo);

    // Initialize flatpickr datepickers
    const dueDateFlatpickr = flatpickr(dueDateInput, {
      dateFormat: 'd-m-Y',
      allowInput: false,
    });

    if (dueDate != null) {
      dueDateFlatpickr.setDate(dueDate);
    }

    if (amount != null) {
      amountInput.value = amount;
    }

    // Add the month-to and year-to inputs to the installment row
    const monthToTd = installment.querySelector('.month-to');
    const yearToTd = installment.querySelector('.year-to');
    const selectedOption = this.typeOfInstallments.options[this.typeOfInstallments.selectedIndex].value;
    if (selectedOption === 'custom') {
      monthToTd.classList.remove('hidden');
      yearToTd.classList.remove('hidden');
      
    } else {
      monthToTd.classList.add('hidden');
      yearToTd.classList.add('hidden');
    }

    // Update the installment ID
    const idTd = installment.querySelector('.id');
    idTd.innerHTML = '';
    const installmentNumber = document.createElement('td');
    installmentNumber.textContent = `Installment ${this.installmentCount}`;
    idTd.appendChild(installmentNumber);

    // Set installment ID number inside the input element with class "installment-id"
    const installmentIdInput = installment.querySelector('.installment-id');
    if (installmentIdInput) {
      installmentIdInput.value = this.installmentCount;
    }
  }

  // function that updates the installment titles
  updateInstallmentTitles() {
    const installments = document.querySelectorAll('.add-installment__row');
    installments.forEach((installment, index) => {
      const idTd = installment.querySelector('.id');
      idTd.textContent = `Installment ${index + 1}`;
    });

    this.installmentCount = installments.length;
  }

  // function that handles the Even installments case
  handleContinuousInstallments() {
    const scholarshipFromValue = this.scholarshipFrom.value;
    const scholarshipToValue = this.scholarshipTo.value;
    const scholarshipAmount = parseInt(this.element.querySelector('#scholarship-amount').value.replace(/\./g, ""), 10);

    if (!scholarshipFromValue || !scholarshipToValue || !scholarshipAmount ) {
      // eslint-disable-next-line no-alert
      alert("Please fill all required fields");
      return;
    }

    const installmentFrom = parseDate(scholarshipFromValue, 'dd-mm-yyyy');
    const installmentTo = parseDate(scholarshipToValue, 'dd-mm-yyyy');

    const months = calculateMonthsBetweenDates(installmentFrom, installmentTo);

    const monthlyInstallmentAmount = Math.round(scholarshipAmount / months);

    this.clearInstallmentsTable();

    const startDate = new Date(installmentFrom);
    let endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(endDate.getDate() - 1);

    // Add the month names array
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < months; i++) {
      // Check if this is the last installment and if so, set the endDate to the scholarshipToDate
      if (i === months - 1) {
        endDate = new Date(installmentTo);
      } else {
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(endDate.getDate() - 1);
      }

      const formattedMonthName = monthNames[startDate.getMonth()];
      const year = startDate.getFullYear();
      this.addInstallment(this.formatNumberWithThousandSeparator(monthlyInstallmentAmount), null, year, formattedMonthName, null, null);

      startDate.setMonth(startDate.getMonth() + 1);
    }
  }

  handleNonContinuousInstallments() {
    const efapaxAmount = parseInt(this.element.querySelector('#efapax-input').value.replace(/\./g, ""), 10) || 0;
    const initialTotalAmount = parseInt(this.element.querySelector('#total-amount').value.replace(/\./g, ""), 10);
    const totalAmount = initialTotalAmount - efapaxAmount;
    const periodFromInputs = document.querySelectorAll(".period-from-input");
    const periodToInputs = document.querySelectorAll(".period-to-input");

    // Calculate the total number of months
    let totalMonths = 0;
    periodFromInputs.forEach((fromInput, index) => {
      const toInput = periodToInputs[index];

      const fromDate = new Date(parseDate(fromInput.value, 'dd-mm-yyyy'));
      const toDate = parseDate(toInput.value, 'dd-mm-yyyy');

      if (!Number.isNaN(fromDate) && !Number.isNaN(toDate)) {

        const months = calculateMonthsBetweenDates(fromDate, toDate);
        totalMonths += months;
      }
    });

    const monthlyInstallmentAmount = totalAmount / totalMonths;

    this.clearInstallmentsTable();

    if (!periodFromInputs || !periodToInputs || this.scholarshipFrom.value === '' || this.scholarshipTo.value === '' || !totalAmount) {
      // eslint-disable-next-line no-alert
      alert("Please fill all required fields");
      return;
    }

    // Find the installment months
    const totalMonthsWithLabels = [];
    periodFromInputs.forEach((fromInput, index) => {
      const toInput = periodToInputs[index];
      const startDate = new Date(parseDate(fromInput.value, 'dd-mm-yyyy'));
      const endDate = new Date(parseDate(toInput.value, 'dd-mm-yyyy'));

      const months = calculateMonthsBetweenDatesWithLabels(startDate, endDate);
      // concat array of objects
      Array.prototype.push.apply(totalMonthsWithLabels, months);
    });


    // Create the installments table elements
    totalMonthsWithLabels.forEach((item, index) => {
      // Check if this is the last month of a period
      const isLastMonthOfPeriod = index < totalMonthsWithLabels.length - 1 ? totalMonthsWithLabels[index + 1].yearLabel !== item.yearLabel : true;

      // Check if this is the last month of the first period
      const isLastMonthOfFirstPeriod = index === totalMonthsWithLabels.length - 1 && index === 0;

      // Round monthlyInstallmentAmount to nearest integer and format it with thousand separators
    const formattedInstallment = this.formatNumberWithThousandSeparator(monthlyInstallmentAmount);

      if (isLastMonthOfPeriod || isLastMonthOfFirstPeriod) {
        // If it's the last month of a period, or the last month of the first period, add it as a separate installment
        this.addInstallment(formattedInstallment, null, item.yearLabel, item.monthLabel, null, null);
      } else {
        this.addInstallment(formattedInstallment, null, item.yearLabel, item.monthLabel, null, null);
      }
    });
  }

  handleCustomInstallments() {
    const efapaxAmount = parseInt(this.element.querySelector('#efapax-input').value.replace(/\./g, ""), 10) || 0;
    const initialTotalAmount = parseInt(this.element.querySelector('#total-amount').value.replace(/\./g, ""), 10);
    const totalAmount = initialTotalAmount - efapaxAmount;
    
    const numberOfInstallments = parseInt(this.element.querySelector('#installment-number').value, 10) || 0;
    const monthlyInstallmentAmount = parseInt(this.element.querySelector('#installment-amount').value.replace(/\./g, ""), 10) || 0;
  
    this.clearInstallmentsTable();
  
    if (numberOfInstallments === 0 || monthlyInstallmentAmount === 0 || !totalAmount || this.scholarshipFrom.value === '' || this.scholarshipTo.value === '') {
      // eslint-disable-next-line no-alert
      alert("Please fill all required fields");
      return;
    }
  
    const startDate = parseDate(this.scholarshipFrom.value, 'dd-mm-yyyy');
    const endDate = parseDate(this.scholarshipTo.value, 'dd-mm-yyyy');
  
    // Add the month names array
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    
    const formattedInstallmentAmount = this.formatNumberWithThousandSeparator(monthlyInstallmentAmount);
  
    // Add the first installment
    const formattedMonthName = monthNames[startDate.getMonth()];
    const year = startDate.getFullYear();
    this.addInstallment(formattedInstallmentAmount, null, year, formattedMonthName, null, null);

    // Add any other installments in between
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i < numberOfInstallments - 1; i++) {
      this.addInstallment(formattedInstallmentAmount, null, null, null, null, null);
    }
  
    // Add the last installment
    const formattedLastMonthName = monthNames[endDate.getMonth()];
    const lastYear = endDate.getFullYear();
    this.addInstallment(formattedInstallmentAmount, null, null, null, lastYear, formattedLastMonthName);
  
    // Pre-populate the first month-from and the last month-to fields
    const firstMonthFromInput = this.element.querySelector('.js-month-from');
    firstMonthFromInput.value = formattedMonthName;

    const lastMonthToInput = Array.from(this.element.querySelectorAll('.month-to')).pop().querySelector('select');
    lastMonthToInput.value = endDate.getMonth() + 1;
  }
  

  generatePeriodInputFields(periodCount) {
    const periodContainer = this.element.querySelector(".period-container");
    periodContainer.innerHTML = ""; // Clear the container

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < periodCount; i++) {
      const periodRow = document.createElement("div");
      periodRow.classList.add("period-row");

      const periodFromWrapper = document.createElement("div");
      periodFromWrapper.classList.add("input-wrapper");
      const periodToWrapper = document.createElement("div");
      periodToWrapper.classList.add("input-wrapper");

      const periodFromLabel = document.createElement("label");
      periodFromLabel.textContent = `Period ${i + 1} From: `;
      periodFromLabel.classList.add("form__element-label");
      const periodFromInput = document.createElement("input");
      periodFromInput.type = "text";
      periodFromInput.classList.add("form__element-input");
      periodFromInput.classList.add("period-from-input");

      const periodToLabel = document.createElement("label");
      periodToLabel.textContent = `Period ${i + 1} To: `;
      periodToLabel.classList.add("form__element-label");
      const periodToInput = document.createElement("input");
      periodToInput.type = "text";
      periodToInput.classList.add("form__element-input");
      periodToInput.classList.add("period-to-input");

      periodFromWrapper.appendChild(periodFromLabel);
      periodFromWrapper.appendChild(periodFromInput);
      periodToWrapper.appendChild(periodToLabel);
      periodToWrapper.appendChild(periodToInput);

      periodRow.appendChild(periodFromWrapper);
      periodRow.appendChild(periodToWrapper);

      periodContainer.appendChild(periodRow);

      // Initialize Flatpickr for the periodFromInput and periodToInput
      flatpickr(periodFromInput, {
        dateFormat: 'd-m-Y',
        allowInput: false,
      });

      flatpickr(periodToInput, {
        dateFormat: 'd-m-Y',
        allowInput: false,
      });
    }
  }
}
