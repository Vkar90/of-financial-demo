import autoBind from 'auto-bind';
import FieldGroup from './fieldGroup';

export default class {
  constructor(element) {
    autoBind(this);
    // element: the container element of the repeater field
    // tmpl element: what is the template we need to clone and append to the container
    // add element: the button to add new elements
    // counter element: the display of the remaining items
    // remove element: (wil be inside the tmpl)
    // functions: add item, remove item, update counter,
    // max items: what is the max items that the use can add to this repeater field

    // Query the dom elements
    this.element = element;
    this.DOM = {
      element,
      template: element.querySelector('.repeatable-field__template'),
      addBtn: element.querySelector('.repeatable-field__add-btn'),
      counter: element.querySelector('.repeatable-field__counter'),
      itemsContainer: element.querySelector('.repeatable-field__items'),
    };

    this.maxItems = parseInt(element.dataset.maxItems, 10);
    this.name = element.dataset.name;
    this.nextCounter = parseInt(element.dataset.nextCounter, 10);
    this.prefix = 'form_fields';

    if (this.name) {
      // Hidden counter input for all items
      this.hiddenCounterInput = element.querySelector(`[name="form_fields[repeater_counter][${this.name}]"]`);
      this.updateHiddenInput();
    }

    // Setup event listeners
    if (this.DOM.addBtn) {
      this.DOM.addBtn.addEventListener('click', this.addItem);
    }

    // Setup delete listener
    [...this.DOM.itemsContainer.children].forEach((item) => {
      const removeButton = item.querySelector('.repeatable-field__right-side');
      if (removeButton) {
        removeButton.addEventListener('click', () => {
          this.removeItem(item);
        });
      }
    });

    // call this once in case we need to hide th add button
    this.updateAddButtonLogic();


  }

  updateHiddenInput() {
    if (this.hiddenCounterInput) {
      // update the hidden counter input
      this.hiddenCounterInput.value = this.itemsCount;
    }
  }

  addItem() {
    if (this.itemsCount >= this.maxItems) return;

    // Clone the tmpl node
    const newItem = this.DOM.template.content.cloneNode(true);

    // Append to the container element
    this.DOM.itemsContainer.appendChild(newItem);

    // Get the latest item
    const item = this.DOM.itemsContainer.lastElementChild;

    // Setup new item (event listener on remove btn)
    const removeButton = item.querySelector('.repeatable-field__right-side');
    removeButton.addEventListener('click', () => {
      this.removeItem(item);
    });

    // Create the input name arrays
    // get all the names that need creating
    const elementsWithName = item.querySelectorAll('[data-name]');
    elementsWithName.forEach((element) => {
      element.name = `${this.prefix}[${this.name}][${this.nextCounter}][${element.dataset.name}]`;
    });
    this.nextCounter += 1;

    // Initiate a field Group
    const fieldGroup = new FieldGroup(item);

    this.updateAddButtonLogic();
  }

  updateAddButtonLogic() {
    // Max items calculation
    if (this.DOM.addBtn) {
      if (this.itemsCount >= this.maxItems) {
        this.DOM.addBtn.classList.add('d-none');
      } else {
        this.DOM.addBtn.classList.remove('d-none');
      }
    }
    this.updateHiddenInput();
  }

  removeItem(item) {
    // Remove the selected item
    item.remove();

    this.updateAddButtonLogic();
  }

  // getter for the items count
  // everytime we try to get the itemsCount propery the following function runs
  get itemsCount() {
    // for recommendation letters we need to add the disabled items, except the ones with status rejected.
    const recommendationLetters = this.element.querySelectorAll(
      '[data-status="completed"],[data-status="pending"]',
    );

    return (
      this.DOM.itemsContainer.children.length + recommendationLetters.length
    );
  }

  removeAllItems() {
    [...this.DOM.itemsContainer.children].forEach(item => {
      this.removeItem(item);
    });
  }
}
