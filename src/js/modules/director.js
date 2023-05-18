import autoBind from 'auto-bind';
import List from 'list.js';

export default class {
  constructor(element) {
    autoBind(this);
    this.element = element;

    this.copy = this.element.querySelector('.entries');

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
    this.applicantsList = new List('director', options);

    // get all questions
    this.questions = this.element.querySelectorAll(
      '.evaluation-container__question',
    );

    this.questions.forEach((question) => {
      // query the edit button
      const editBtn = question.querySelector(
        '.evaluation-container__edit-grade',
      );

      // query the container
      const editSection = question.querySelector(
        '.evaluation-container__edit-container',
      );

      // add an event listener to the edit button
      editBtn.addEventListener('click', () => {
        editSection.classList.toggle('hidden');
      });
    });
     // Update the copies
     if(this.copy){
      this.updateSumCopy();
      this.applicantsList.on('updated', this.updateSumCopy);
     }
  }

  updateSumCopy() {
    // Showing 15 entries out of 50
    this.copy.innerText = `Showing ${this.applicantsList.visibleItems.length} entries out of ${this.applicantsList.items.length}`;
  }
}
