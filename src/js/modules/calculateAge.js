import autoBind from 'auto-bind';

export default class {
  constructor(element) {
    autoBind(this);
    this.element = element;
    this.item = document.querySelector(element.dataset.age);

    if (this.item) {
      this.item.addEventListener('input', this.updateAge);
    }
    this.updateAge();
  }

  updateAge() {
    var today = new Date();
    var birthDate = this.stringToDate('dd-MM-yyyy', '-');
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (!Number.isNaN(age) && age >= 0) {
      this.element.value = age;
    }
  }

  // transform date format to dd MM yyyy
  stringToDate(_format, _delimiter) {
    const formatLowerCase = _format.toLowerCase();
    const formatItems = formatLowerCase.split(_delimiter);
    const dateItems = this.item.value.split(_delimiter);
    const monthIndex = formatItems.indexOf('mm');
    const dayIndex = formatItems.indexOf('dd');
    const yearIndex = formatItems.indexOf('yyyy');
    let month = parseInt(dateItems[monthIndex], 10);
    month -= 1;
    const formatedDate = new Date(
      dateItems[yearIndex],
      month,
      dateItems[dayIndex],
    );
    return formatedDate;
  }
}
