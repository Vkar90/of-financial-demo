import autosize from 'autosize';

export default class {
  constructor(element) {
    // get parent
    this.element = element.parentNode;
    this.input = this.element.querySelector('textarea');
    this.characterMessage = this.element.querySelector('.js-count');

    this.init();
  }

  init() {
    autosize(this.input);

    if (this.characterMessage) {
      this.input.addEventListener('input', () => {
        this.updateCharacterMessage();
      });

      this.updateCharacterMessage();
    }
  }

  updateCharacterMessage() {
    const { length } = this.input.value;
    const maxLength = this.input.getAttribute('maxlength');

    this.characterMessage.innerHTML = `${length}/${maxLength} characters.`;
  }
}
