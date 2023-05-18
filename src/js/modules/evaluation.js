import autoBind from 'auto-bind';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/all';
import TomSelect from 'tom-select';
import List from 'list.js';
import EvaluationRow from './evaluationRow';

export default class {
  constructor(element) {
    autoBind(this);
    const that = this;
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
    this.applicantsList = new List('evaluation', options);

    // For every TD create an instance of a class evaluationRow
    this.evaluationRows = this.element.querySelectorAll('tbody tr');
    this.evaluationRowsComponents = [];
    this.evaluationRows.forEach((evaluationRow) => {
      this.evaluationRowsComponents.push(new EvaluationRow(evaluationRow));
    });

    // get automatic assign button
    this.automaticAssignBtn = this.element.querySelector(
      '.automatic-assign-btn',
    );

    // add click listener to automatic assign button that will check all checkoxes in the modal
    if (this.automaticAssignBtn) {
      this.automaticAssignBtn.addEventListener('click', () => {
        const modalCheckboxes = document.querySelectorAll(
          '.evaluators-modal-container input[type="checkbox"]',
        );

        modalCheckboxes.forEach((checkbox) => {
          checkbox.checked = true;
        });
        // Update all rows evaluators count
        this.evaluationRowsComponents.forEach((row) => {
          row.updateEvaluatorsCount();
        });
      });
    }

    // get add evaluator button
    this.addEvaluatorBtn = this.element.querySelector('.add-evaluator-btn');

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

    this.critirioTemplate = this.element.querySelector(
      '.add-criterio__template',
    );
    this.critiriaContainer = this.element.querySelector(
      '.add-new-criterio__container',
    );

    // add new critirio
    this.addNewCriterionBtn = this.element.querySelector(
      '.add-new-criterio__title',
    );
    if (this.addNewCriterionBtn) {
      this.addNewCriterionBtn.addEventListener('click', this.addCritirio);
    }

    // By default add one critirio if there is none
    if (!document.querySelector('.add-criterio.form__section-subtitle')) {
      this.addCritirio();
    }

    // click listerners for delete criterio buttons
    document.addEventListener(
      'click',
      (event) => {
        if (event.target.matches('.add-criterio__critirio-delete')) {
          event.target.closest('.add-criterio.form__section-subtitle').remove();
          that.updateCritiriaTitles();
        }
      },
      false,
    );

    // get clear selection button
    this.clearSelectionBtn = this.element.querySelector('.clear-selection');

    if (this.clearSelectionBtn) {
      // add click listener to clear selection button
      this.clearSelectionBtn.addEventListener('click', this.clearSelection);
    }

    this.updateBtnState();

    gsap.registerPlugin(ScrollToPlugin);

    this.scrollOnFirstError();
  }

  addCritirio() {
    const newCritirio = this.critirioTemplate.content.cloneNode(true);
    this.critiriaContainer.appendChild(newCritirio);
    const critirio = this.critiriaContainer.lastElementChild;

    const nextIndex = document.querySelectorAll(
      '.add-criterio.form__section-subtitle',
    ).length;

    // add title
    critirio.querySelector(
      '.add-criterio__critirio-title',
    ).innerHTML = `Set Criterion ${nextIndex}`;

    this.setupCritirio(critirio);
  }

  // eslint-disable-next-line class-methods-use-this
  setupCritirio(element) {
    // save dom
    const tmp = {};

    tmp.DOM = {
      critirio: element,
      remove: element.querySelector('.add-criterio__critirio-delete'),
      dropdown: element.querySelector('.tom-select'),
    };

    // dropdown
    tmp.dropdown = new TomSelect(tmp.DOM.dropdown, {
      maxOptions: null,
      allowEmptyOption: true,
      render: {
        no_results: () =>
          `<div class="no-results">Δεν βρέθηκαν αποτελέσματα</div>`,
      },
    });
  }

  // eslint-disable-next-line class-methods-use-this
  updateCritiriaTitles() {
    const criteria = document.querySelectorAll(
      '.add-criterio.form__section-subtitle',
    );
    criteria.forEach((critirio, index) => {
      critirio.querySelector(
        '.add-criterio__critirio-title',
      ).innerHTML = `Set Criterion ${index + 1}`;
    });
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
      }
      if (this.clearSelectionBtn) {
        this.clearSelectionBtn.classList.remove('hidden');
      }
    } else {
      //  disable the btn
      if (this.removeApplicantsBtn) {
        this.removeApplicantsBtn.classList.add('hidden');
      }
      if (this.clearSelectionBtn) {
        this.clearSelectionBtn.classList.add('hidden');
      }
    }

    // update copy
    this.removeApplicantsBtn.innerText = `Remove ${selectedCount} applications`;
  }

  scrollOnFirstError() {
    // remove error class after the user has clicked on the form element
    const formElementsWithError = this.formElement.querySelectorAll(
      '.form__element--has-error',
    );

    formElementsWithError.forEach((element) => {
      element.addEventListener('click', () => {
        element.classList.remove('form__element--has-error');
      });
      element.addEventListener('focus', () => {
        element.classList.remove('form__element--has-error');
      });
    });

    // Scroll to the first error element
    if (formElementsWithError.length > 0) {
      const firstError = formElementsWithError[0];
      gsap.to(window, {
        duration: 1.6,
        scrollTo: {
          y: firstError.offsetTop - 200,
          autoKill: false,
        },
      });
    }
  }
}
