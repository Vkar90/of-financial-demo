import autoBind from 'auto-bind';
import List from 'list.js';

export default class {
  constructor(element) {
    autoBind(this);
    this.element = element;

    // get the first tbody tr
    const tr = element.querySelector('table tbody tr');
    let classes = [];
    if (tr) {
      // create an array of all the classes inside the td
      classes = Array.from(tr.querySelectorAll('td')).map(
        (item) => item.classList[0],
      );

      // eslint-disable-next-line no-shadow
      classes = classes.filter((element) => element !== undefined);

      classes = classes.filter((item) => item !== undefined);

      // Add hidden values to the array from data attributes on the TR
      const keysFromDataAttributes = Object.keys({ ...tr.dataset });

      // Merge with the classes names
      const dataAttributesObject = {
        data: keysFromDataAttributes,
      };

      classes.push(dataAttributesObject);
    }

    // Create list.js with sorting and search
    const options = {
      valueNames: classes,
      listClass: 'js-list',
    };
    this.applicantsList = new List('shortlist', options);

    // get present to bod button
    this.presentToBodBtn = this.element.querySelector('.present-to-bod-button');

    // get remove applicants button
    this.removeApplicantsBtn = this.element.querySelector(
      '.remove-applicants-button',
    );

    // Get all checkboxes
    this.checkboxes = this.element.querySelectorAll(
      'tbody .select-box[type="checkbox"]',
    );
    if (this.checkboxes.length > 0) {
      this.checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('click', this.selectApplicant);
      });
    }

    // get clear selection button
    this.clearSelectionBtn = this.element.querySelector('.clear-selection');

    if (this.clearSelectionBtn) {
      // add click listener to clear selection button
      this.clearSelectionBtn.addEventListener('click', this.clearSelection);
    }

    this.updateBtnState();
  }

  selectApplicant() {
    this.updateBtnState();
  }

  clearSelection() {
    const checkboxes = this.element.querySelectorAll(
      'tbody input[type="checkbox"]',
    );
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
    this.updateBtnState();
  }

  updateBtnState() {
    // Find how many checkboxes are selected
    let selectedCount = 0;
    const visibleCheckboxes = this.element.querySelectorAll(
      'tbody .select-box[type="checkbox"]',
    );
    visibleCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) selectedCount += 1;
    });

    if (selectedCount > 0) {
      //  enable the btn
      if (this.removeApplicantsBtn) {
        this.removeApplicantsBtn.classList.remove('hidden');
        // update copy
        this.removeApplicantsBtn.innerText = `Remove ${selectedCount} applications`;
      }
      if (this.clearSelectionBtn) {
        this.clearSelectionBtn.classList.remove('hidden');
      }
      if (this.presentToBodBtn) {
        this.presentToBodBtn.classList.remove('hidden');
      }
    } else {
      //  disable the btn
      if (this.removeApplicantsBtn) {
        this.removeApplicantsBtn.classList.add('hidden');
      }
      if (this.clearSelectionBtn) {
        this.clearSelectionBtn.classList.add('hidden');
      }
      if (this.presentToBodBtn) {
        this.presentToBodBtn.classList.add('hidden');
      }
    }
  }
}
