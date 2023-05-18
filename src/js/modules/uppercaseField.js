import autoBind from 'auto-bind';

export default class {
  constructor(element) {
    autoBind(this);
    this.element = element;
    element.addEventListener('input', this.makeUppercase);
    this.makeUppercase();
  }

  makeUppercase() {
    let tmp =this.element.value;

    tmp = tmp.replace("ά", "α");
    tmp = tmp.replace("έ", "ε");
    tmp = tmp.replace("ή", "η");
    tmp = tmp.replace("ί", "ι");
    tmp = tmp.replace("ό", "ο");
    tmp = tmp.replace("ύ", "υ");
    tmp = tmp.replace("ώ", "ω");

    tmp = tmp.toUpperCase();

    this.element.value = tmp;
  }
}
