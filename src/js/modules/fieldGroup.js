import TomSelect from 'tom-select';
import IntlTelInput from 'intl-tel-input';
import flatpickr from 'flatpickr';
import DropzoneComponent from './dropzone';
import TogglerField from './togglerField';
import TextareaField from './textarea';
import CostSummary from './costSummary';
import CalculateAge from './calculateAge';
import UppercaseField from './uppercaseField';

export default class {
  constructor(parentElement) {
    this.parentElement = parentElement;

    // setup tom select dropdown
    this.tomSelects = [];
    const tomSelect = this.parentElement.querySelectorAll('.tom-select');
    tomSelect.forEach((select) => {
      const options = {
        maxOptions: null,
        allowEmptyOption: true,
        render: {
          no_results: () =>
            `<div class="no-results">Δεν βρέθηκαν αποτελέσματα</div>`,
          option_create: (data, escape) =>
            `<div class="create">Προσθήκη <strong>'${escape(
              data.input,
            )}'</strong></div>`,
        },
      };
      if (select.hasAttribute('data-allow-create')) {
        options.create = true;
      }
      if (
        select.hasAttribute('data-ajax-url') &&
        select.hasAttribute('data-ajax-search')
      ) {
        options.valueField = 'name';
        options.labelField = 'name';
        options.searchField = ['name'];
        // fetch remote data
        options.load = (query, callback) => {
          const url = `${select.dataset.ajaxUrl}?key=${
            select.dataset.ajaxSearch
          }&q=${encodeURIComponent(query)}`;

          fetch(url)
            .then((response) => response.json())
            .then((json) => {
              callback(json.items);
            })
            .catch(() => {
              callback();
            });
        };
        // custom rendering functions for options and items
        options.render.option = (item, escape) =>
          `<div>${escape(item.name)}</div>`;
      }
      const tomSelectComponent = new TomSelect(select, options);
      this.tomSelects.push(tomSelectComponent);
    });

    // setup phone inputs
    this.telInputs = [];
    const telInputs = this.parentElement.querySelectorAll('.phone-input');
    telInputs.forEach((input) => {
      const hiddenInput = input.parentNode.querySelector(
        '.international-phone',
      );
      const telInputComponent = new IntlTelInput(input, {
        utilsScript:
          'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/16.0.0/js/utils.js',
        initialCountry: 'gr',
        preferredCountries: ['gr', 'it', 'de', 'fr', 'gb'],
        separateDialCode: true,
        autoHideDialCode: false,
        nationalMode: false,
        autoPlaceholder: false,
      });

      const updateMargin = () => {
        const parent = input.parentNode;
        const flagContainer = parent.querySelector('.iti__flag-container');

        const width = flagContainer.offsetWidth;

        input.style.marginLeft = `${width + 8}px`;
      };

      input.addEventListener('close:countrydropdown', () => {
        updateMargin();
      });

      updateMargin();

      // on change event
      // create a hidden input to hold the international number
      input.addEventListener('change', () => {
        const number = telInputComponent.getNumber();
        hiddenInput.value = number;
      });
      input.addEventListener('countrychange', () => {
        const number = telInputComponent.getNumber();
        hiddenInput.value = number;
      });

      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D+/g, '');
        const number = telInputComponent.getNumber();
        hiddenInput.value = number;
      });

      this.telInputs.push(telInputComponent);
    });

    // setup dropzone
    this.dropzones = [];
    const dropzoneItems = this.parentElement.querySelectorAll('.dropzone');
    dropzoneItems.forEach((dropzone) => {
      const dropzoneComponent = new DropzoneComponent(dropzone);
      this.dropzones.push(dropzoneComponent);
      dropzone.dropzoneComponent = dropzoneComponent;
    });

    // date element with flatpickr
    this.dateComponents = [];
    const dates = this.parentElement.querySelectorAll(
      'input.form__element-date',
    );
    dates.forEach((date) => {
      const dateComponent = flatpickr(date, { dateFormat: 'd-m-Y' });
      this.dateComponents.push(dateComponent);
    });

    // datetime element with flatpickr
    this.dateTimeComponents = [];
    const dateTimes = this.parentElement.querySelectorAll(
      'input.form__element-datetime',
    );
    dateTimes.forEach((dateTime) => {
      const dateTimeComponent = flatpickr(dateTime, {
        enableTime: true,
        dateFormat: 'd-m-Y H:i',
      });
      this.dateTimeComponents.push(dateTimeComponent);
    });

    // toggler fields
    this.togglerFieldsComponents = [];
    const togglerFields = this.parentElement.querySelectorAll('[data-toggler]');
    togglerFields.forEach((togglerField) => {
      const togglerFieldsComponent = new TogglerField(togglerField);
      this.togglerFieldsComponents.push(togglerFieldsComponent);
    });

    // textarea character count
    this.textAreaComponents = [];
    const textAreaFields = this.parentElement.querySelectorAll('textarea');
    textAreaFields.forEach((textareaField) => {
      const textAreaFieldsComponent = new TextareaField(textareaField);
      this.textAreaComponents.push(textAreaFieldsComponent);
    });

    // cost sum
    const dataSum = this.parentElement.querySelector('[data-sum]');
    if (dataSum) {
      this.dataSumComponent = new CostSummary(dataSum);
    }

    // calculate age
    const dataAge = this.parentElement.querySelector('[data-age]');
    if (dataAge) {
      this.dataSumComponent = new CalculateAge(dataAge);
    }

    // make text fields uppercase
    this.uppercaseComponents = [];
    const uppercaseFields =
      this.parentElement.querySelectorAll('[data-uppercase]');
    uppercaseFields.forEach((uppercaseField) => {
      const uppercaseFieldsComponent = new UppercaseField(uppercaseField);
      this.uppercaseComponents.push(uppercaseFieldsComponent);
    });

    // Submit button with loading class
    const submitButton = this.parentElement.querySelector('.js-submit-btn');
    this.formElement = this.parentElement.querySelector('form');
    if (submitButton && this.formElement) {
      // enable popover
      let submitBtnIsClicked = false;
      submitButton.addEventListener('click', () => {
        if (this.formElement.checkValidity()) {
          submitBtnIsClicked = true;
        }
      });

      // eslint-disable-next-line no-undef
      const submitPopover = new bootstrap.Popover(submitButton, {
        trigger: 'manual',
      });

      this.formElement.addEventListener('submit', () => {
        // the form might be submitted from other buttons, but we only  show the loading on the submit
        if (!submitBtnIsClicked) return;

        submitPopover.show();
        submitButton.classList.add('btn--is-loading');
      });
    }
  }
}
