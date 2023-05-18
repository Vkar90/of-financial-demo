/* eslint-disable no-plusplus */
import Cookies from 'js-cookie';
import TomSelect from 'tom-select';
import autoBind from 'auto-bind';
import List from 'list.js';
import OffCanvas from './offCanvas';

export default class {
  constructor(element) {
    autoBind(this);
    this.element = element;
    this.selectAllBtn = this.element.querySelector('.select-all');
    this.claimBtn = this.element.querySelector('.action-bar__claim-button');
    this.shortlistBtn = this.element.querySelector(
      '.action-bar__shortlist-button',
    );
    this.evaluationBtn = this.element.querySelector(
      '.action-bar__evaluation-button',
    );

    this.filterBar = this.element.querySelector('.filter-bar');
    if (this.filterBar) {
      this.filters = this.filterBar.querySelectorAll('.tom-select');
    }
    this.copy = this.element.querySelector('.entries');
    this.cookieName = this.element.dataset.cookieName;
    this.selectedBtnState = false;

    // offCanvas filters menu
    const filtersMenu = document.getElementById('offcanvasApplicantsFilter');
    if (filtersMenu) {
      this.offCanvas = new OffCanvas(filtersMenu);
    }

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
    this.applicantsList = new List('applicants-table', options);

    // Get all checkboxes
    this.checkboxes = this.element.querySelectorAll(
      'tbody input[type="checkbox"]',
    );
    this.checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('click', this.selectApplicant);
    });

    // Select All Button
    if (this.selectAllBtn) {
      this.selectAllBtn.addEventListener('click', this.selectApplicants);
    }

    // Initiate Tom Selects
    this.tomSelectComponents = [];
    if (this.filters) {
      this.filters.forEach((filter) => {
        const tomSelectComponent = new TomSelect(filter, {
          plugins: ['remove_button'],
          maxOptions: null,
        });
        this.tomSelectComponents.push(tomSelectComponent);
      });
    }

    // Populate items
    this.tomSelectComponents.forEach((tomSelectComponent) => {
      let isArray = false;

      // Get the data filter name
      let filterColumn = tomSelectComponent.input.dataset.filterName;
      // check if this is an array
      // cast string to js array
      if (filterColumn.includes('[')) {
        isArray = true;
        // remove the first char
        filterColumn = filterColumn.substring(1);
        // remove the last char
        filterColumn = filterColumn.substring(0, filterColumn.length - 1);

        // split the string into an array
        filterColumn = filterColumn.split(',');
        // cast the array to a js array
        filterColumn = Array.from(filterColumn);
      }

      // filterIsArrayOrString

      // Unique values
      const uniqueValues = [];

      // Loop the list and add to array
      this.applicantsList.items.forEach((item) => {
        // eslint-disable-next-line no-underscore-dangle
        if (isArray) {
          filterColumn.forEach((column) => {
            // eslint-disable-next-line no-underscore-dangle
            const value = item._values[column];
            if (!uniqueValues.includes(value)) {
              uniqueValues.push(value);
            }
          });
        } else {
          // eslint-disable-next-line no-underscore-dangle
          const value = item._values[filterColumn];
          if (!uniqueValues.includes(value)) {
            uniqueValues.push(value);
          }
        }
      });

      // Populate the dropdown with the unique values
      uniqueValues.forEach((uniqueValue) => {
        tomSelectComponent.addOption({
          value: uniqueValue,
          text: uniqueValue,
        });
      });

      let filtersCount = 0;

      const updateFiltersCount = () => {
        filtersCount = 0;
        // eslint-disable-next-line no-shadow
        this.tomSelectComponents.forEach((tomSelectComponent) => {
          filtersCount += tomSelectComponent.items.length;
        });
        if (filtersCount > 0) {
          this.filtersBtn.innerText = `Filters Active ${filtersCount}`;
        } else {
          this.filtersBtn.innerText = 'Filters';
        }
      };

      // Add events for filtering the list
      tomSelectComponent.on('item_add', () => {
        this.filterList();
        updateFiltersCount();
      });

      tomSelectComponent.on('item_remove', () => {
        this.filterList();
        updateFiltersCount();
      });
    });

    this.filtersBtn = this.element.querySelector('.filters-drawer');

    // Update the copies
    this.updateSumCopy();
    this.applicantsList.on('updated', this.updateSumCopy);

    // Cookie Function
    this.setFiltersWithCookie();

    // get clear selection button
    this.clearSelectionBtn = this.element.querySelector('.clear-selection');

    // add click listener to clear selection button
    if (this.clearSelectionBtn) {
      this.clearSelectionBtn.addEventListener('click', this.clearSelection);
    }

    this.updateBtnState();
  }

  populateDemoApplicants() {
    for (let index = 0; index < 1000; index += 1) {
      this.applicantsList.add({
        name: 'sfdfds',
        email: 'fsd',
        status: 'fsd',
        submissionDate: 'sdfsdf',
        submissionId: 'sdfsdf',
        assignedOwner: 'sdfsdf',
      });
    }
  }

  // The filtering is logic OR between items in the filter and logic AND between filters
  filterList() {
    const filtersToApply = [];

    this.tomSelectComponents.forEach((tomSelectComponent) => {
      if (tomSelectComponent.items.length === 0) return;

      let column = tomSelectComponent.input.dataset.filterName;
      if (column.startsWith('[') && column.endsWith(']')) {
        // Column is an array
        column = column.slice(1, -1).split(',');
      }

      filtersToApply.push({
        column,
        items: tomSelectComponent.items,
      });
    });

    this.applicantsList.filter((item) => {
      const matchedFilters = [];

      filtersToApply.forEach((filterToApply) => {
        const { column } = filterToApply;
        const { items } = filterToApply;

        if (Array.isArray(column)) {
          // Multiple columns
          let anyMatch = false;
          column.forEach((c) => {
            if (Array.isArray(item.values()[c])) {
              anyMatch =
                anyMatch ||
                item.values()[c].some((value) => items.includes(value));
            } else {
              anyMatch = anyMatch || items.includes(item.values()[c]);
            }
          });

          if (anyMatch) {
            matchedFilters.push(column);
          }
        } else {
          // Single column
          // eslint-disable-next-line no-lonely-if
          if (Array.isArray(item.values()[column])) {
            const anyMatch = item
              .values()
              [column].some((value) => items.includes(value));
            if (anyMatch) {
              matchedFilters.push(column);
            }
          } else if (items.includes(item.values()[column])) {
            matchedFilters.push(column);
          }
        }
      });

      return matchedFilters.length === filtersToApply.length;
    });

    this.updateBtnState();
    Cookies.set(this.cookieName, JSON.stringify(filtersToApply));
  }

  // eslint-disable-next-line class-methods-use-this
  setFiltersWithCookie() {
    const filtersCookie = Cookies.get(this.cookieName);

    if (!filtersCookie) return;
    const appliedFilters = JSON.parse(filtersCookie);
    appliedFilters.forEach((filter) => {
      const tomselectFilter = document.querySelector(
        `.tom-select[data-filter-name=${filter.column}]`,
      );
      filter.items.forEach((item) => {
        tomselectFilter.tomselect.addItem(item, true);
      });
    });
    this.filterList();
  }

  updateSumCopy() {
    // Showing 15 entries out of 50
    this.copy.innerText = `Showing ${this.applicantsList.visibleItems.length} entries out of ${this.applicantsList.items.length}`;
  }

  selectApplicant() {
    this.updateBtnState();
  }

  selectApplicants() {
    this.selectedBtnState = !this.selectedBtnState;
    document
      .querySelectorAll('tbody input[type="checkbox"]')
      .forEach((checkbox) => {
        const checkEvent = new Event('change');
        checkbox.checked = this.selectedBtnState;
        checkbox.dispatchEvent(checkEvent);
      });
    this.updateBtnState();
    if (this.clearSelectionBtn) {
      this.clearSelectionBtn.classList.add('hidden');
    }
  }

  clearSelection() {
    const checkboxes = this.element.querySelectorAll(
      'tbody input[type="checkbox"]',
    );
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
    if (this.clearSelectionBtn) {
      this.clearSelectionBtn.classList.add('hidden');
    }
    this.updateBtnState();
  }

  updateBtnState() {
    // Find how many checkboxes are selected
    let selectedCount = 0;
    const visibleCheckboxes = this.element.querySelectorAll(
      'tbody input[type="checkbox"]',
    );
    visibleCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) selectedCount += 1;
    });

    if (selectedCount > 0) {
      //  enable the btn
      if (this.claimBtn) {
        this.claimBtn.classList.remove('hidden');
      }
      if (this.shortlistBtn) {
        this.shortlistBtn.classList.remove('hidden');
      }
      if (this.evaluationBtn) {
        this.evaluationBtn.classList.remove('hidden');
      }
      if (this.clearSelectionBtn) {
        this.clearSelectionBtn.classList.remove('hidden');
      }
    } else {
      //  disable the btn
      if (this.claimBtn) {
        this.claimBtn.classList.add('hidden');
      }
      if (this.shortlistBtn) {
        this.shortlistBtn.classList.add('hidden');
      }
      if (this.evaluationBtn) {
        this.evaluationBtn.classList.add('hidden');
      }
      if (this.clearSelectionBtn) {
        this.clearSelectionBtn.classList.add('hidden');
      }
    }

    // update copy
    if (this.claimBtn) {
      this.claimBtn.innerText = `Claim ${selectedCount} applications`;
    }
    if (this.shortlistBtn) {
      this.shortlistBtn.innerText = `Move to Financial Planning ${selectedCount} applications`;
    }
    if (this.evaluationBtn) {
      this.evaluationBtn.innerText = `Move to Evalution Round with ${selectedCount} applications`;
    }
    if (this.selectAllBtn) {
      this.selectAllBtn.innerText = `${
        !this.selectedBtnState ? 'Select' : 'Deselect'
      } All`;
    }
  }
}
