/* eslint-disable no-console */
import autoBind from 'auto-bind';

export default class {
  constructor(element) {
    autoBind(this);
    this.element = element;
    this.array = JSON.parse(element.dataset.sum);
    this.inputArray = [];
    this.array.forEach((name) => {
      const item = document.querySelector(`input[data-name="${name}"]`);
      if (item) {
        item.addEventListener('input', this.updateSum);
        this.inputArray.push(item);
      }
    });

    this.updateSum();
  }

  updateSum() {
    let sum = 0;
    this.inputArray.forEach((item) => {
      if (!Number.isNaN(parseFloat(item.value))) {
        sum += parseFloat(item.value);
      }
    });
    this.element.value = sum;
  }
}
