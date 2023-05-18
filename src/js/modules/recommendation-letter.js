import autoBind from 'auto-bind';
import Quill from 'quill';

export default class {
  constructor(form) {
    autoBind(this);

    // Find the DOM elements required for the rl
    this.form = form;
    this.fileFormElement = form.querySelector('.js-rl-file');
    this.editorFormElement = form.querySelector('.js-rl-editor');
    this.togglerFormElement = form.querySelector('.js-rl-toggler');
    this.hiddenRadio = form.querySelector('.js-hidden-radio');
    this.quillEditor = this.editorFormElement.querySelector('.quill-editor');
    this.togglerCopy = form.querySelector('.text-link');

    // Setup Quill Editor
    this.Quill = new Quill(this.quillEditor, {
      modules: {
        toolbar: [[{ header: [1, 2, false] }], ['bold', 'italic', 'underline']],
      },
      placeholder: this.editorFormElement.dataset.placeholder,
      theme: 'snow', // or 'bubble'
    });

    const initialContent = this.Quill.clipboard.convert(form.querySelector('.quill-hidden').value);
    this.Quill.setContents(initialContent, 'silent');

    // on change event
    // get the hidden input to hold the rt
    this.Quill.on('text-change', () => {
      const hiddenInput = form.querySelector('.quill-hidden');
      const text = form.querySelector('.ql-editor').innerHTML;
      hiddenInput.value = text;
    });

    // Hide the Quil editor
    this.editorFormElement.classList.add('d-none');

    // add event listener on text editor button
    this.togglerFormElement.addEventListener('click', this.switch);
    this.initSwitch();
  }

  initSwitch() {
    if (this.form.querySelector('[value="editor"]').checked === true) {
      this.showEditor();
    } else {
      this.showFile();
    }
  }

  showEditor() {
    this.form.querySelector('[value="editor"]').checked = true;
    this.togglerCopy.innerText = this.togglerFormElement.dataset.fileCopy;
    this.editorFormElement.classList.remove('d-none');
    this.fileFormElement.classList.add('d-none');
  }

  showFile() {
    this.form.querySelector('[value="file"]').checked = true;
    this.togglerCopy.innerText = this.togglerFormElement.dataset.editorCopy;
    this.fileFormElement.classList.remove('d-none');
    this.editorFormElement.classList.add('d-none');
  }

  switch() {
    // Switch the copies and set the radio
    if (this.form.querySelector('[value="editor"]').checked === true) {
      this.showFile();
    } else {
      this.showEditor();
    }
  }
}
