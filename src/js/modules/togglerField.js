import autoBind from 'auto-bind';

export default class {
  constructor(element) {
    autoBind(this);

    // This is the element we want checked
    this.element = element;
    // the input we are interested in being checked
    this.input = element.querySelector('input[type="radio"]');
    // parent element that includes all radio buttons
    this.parent = element.closest('.form__element');
    // the element we display between none and block
    this.togglerDiv = document.querySelector(
      `.${this.element.dataset.toggler}`,
    );

    // all the radiobuttons
    this.radioInputs = this.parent.querySelectorAll('input[type="radio"]');

    this.radioInputs.forEach((radioInput) => {
      radioInput.addEventListener('change', this.onChange);
    });

    this.onChange();


  }

  onChange() {
    // if the radio button we are interested in is checked, d:block else d:none
    if (this.input.checked) {
      this.togglerDiv.classList.add('toggler-area--active');
    } else {
      // If it gets hidden, clear all the inputs that are inside
      this.clearInputs();
      this.togglerDiv.classList.remove('toggler-area--active');
    }
  }

  clearInputs() {
    // clear inputs

    // input type text, email, date, datetime, number, textarea, hidden
    this.togglerDiv.querySelectorAll('input[type="text"], input[type="number"], input[type="hidden"], input[type="email"], input[type="date"], input[type="datetime"], textarea').forEach(input => {
      input.value = '';
      input.checked = false;

      const event = new Event('change');
      input.dispatchEvent(event);
    });

    // input type radio, checkbox
    this.togglerDiv.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
      input.checked = false;
      input.selected = false;

      const event = new Event('change');
      input.dispatchEvent(event);
    });

    // tom selects
    this.togglerDiv.querySelectorAll('select').forEach(select => {
      const tomSelect = select.tomselect;
      tomSelect.clear();
    });

    // dropzone
    this.togglerDiv.querySelectorAll('.dropzone').forEach(dropzone => {
      const dropzoneC = dropzone.dropzoneComponent;
      dropzoneC.deleteFile();
    });

    // Repeater fields items
    // Remove everything except the already sent recommendation letters
    this.togglerDiv.querySelectorAll('.js-repeatable-field').forEach(repeaterfield => {
      const repeater = repeaterfield.repeaterfield;
      if (repeater) {
        repeater.removeAllItems();
      }
    });

    // Remove all errors
    this.togglerDiv.querySelectorAll('.form__element-error').forEach(error => {
      error.remove();
    });
  }
}
