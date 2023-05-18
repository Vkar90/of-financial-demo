import Dropzone from 'dropzone';
import autoBind from 'auto-bind';

export default class {
  constructor(element) {
    autoBind(this);

    this.element = element;
    this.DOM = {
      dropzone: this.element,
      mainElement: this.element.querySelector('.dropzone__main-element'),
      defaultState: this.element.querySelector('.dropzone__default-state'),
      progressState: this.element.querySelector('.dropzone__progress-state'),
      progressCopy: this.element.querySelector(
        '.dropzone__progress-state-percentage',
      ),
      successState: this.element.querySelector('.dropzone__success-state'),
      filename: this.element.querySelector('.dropzone__filename'),
      deleteBtn: this.element.querySelector('.js-dropzone-delete'),
      viewBtn: this.element.querySelector('.js-dropzone-view'),
      downloadBtn: this.element.querySelector('.js-dropzone-download'),
      mockFileInput: this.element.querySelector('.dropzone__mockfile'),
      parentFormElement: this.element.closest('.form__element'),
    };

    const { url } = this.DOM.dropzone.dataset;

    const dropzoneOptions = {
      // url: 'http://localhost:3005/upload-avatar',
      url,
      headers: {
        'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]')
          .content,
      },
      //   maxFilesize: 10000000, // 10MB
      maxFiles: 1,
      uploadMultiple: false,
      paramName: 'file',
      createImageThumbnails: false,
      addRemoveLinks: false,
    };

    this.dropzone = new Dropzone(this.DOM.mainElement, dropzoneOptions);

    // events
    this.dropzone.on('addedfile', this.addedfile);
    this.dropzone.on('success', this.success);
    this.dropzone.on('error', this.error);
    this.dropzone.on('complete', this.error);
    this.dropzone.on('totaluploadprogress', this.progress);

    // add event listener for buttons
    if (this.DOM.deleteBtn) {
      this.DOM.deleteBtn.addEventListener('click', this.deleteFile);
    }
    if (this.DOM.downloadBtn) {
      this.DOM.downloadBtn.addEventListener('click', this.downloadBtn);
    }
    if (this.DOM.viewBtn) {
      this.DOM.viewBtn.addEventListener('click', this.viewBtn);
    }

    // The id and url of the uploaded file
    this.savedId = null;
    this.savedURL = null;

    // show default state
    this.DOM.defaultState.classList.remove('hidden');

    // if the mock file input has value in it, add the file
    if (this.DOM.mockFileInput.value) {
      this.addMockFile();
    }
  }

  // eslint-disable-next-line no-unused-vars
  addedfile(file) {
    // console.log(`File added: ${file.name}`);
    // hide the default state and show the progress
    this.DOM.defaultState.classList.add('hidden');
    this.DOM.progressState.classList.remove('hidden');

    // Remove previous error if exists
    this.DOM.parentFormElement.querySelector('.error-holder').innerHTML = '';
  }

  success(file, response) {
    this.savedId = response.id;
    this.savedURL = response.url;

    // update the filename
    this.DOM.filename.textContent = file.name;

    // hide the progress and show the success
    this.DOM.progressState.classList.add('hidden');
    this.DOM.successState.classList.remove('hidden');

    // hide the main element
    this.DOM.mainElement.classList.add('hidden');

    // update the input value
    this.DOM.mockFileInput.value = response.id;
  }

  // eslint-disable-next-line class-methods-use-this
  complete() { }

  error(file, errorMessage) {
    // eslint-disable-next-line no-console
    console.log(`Error: ${errorMessage}`);

    if (!errorMessage) return;
    // add the error message
    const html = this.errorTemplate(errorMessage.message);

    this.DOM.parentFormElement.querySelector('.error-holder').innerHTML = html;

    this.dropzone.removeAllFiles();
    this.DOM.progressCopy.textContent = '0%';
    this.DOM.defaultState.classList.remove('hidden');
    this.DOM.progressState.classList.add('hidden');
    this.DOM.successState.classList.add('hidden');

    // show the main element
    this.DOM.mainElement.classList.remove('hidden');
  }

  addMockFile() {
    // get the mock input value
    this.savedId = this.DOM.mockFileInput.value;
    this.savedURL = this.DOM.mockFileInput.dataset.url;

    // hide the default and show the success
    this.DOM.defaultState.classList.add('hidden');
    this.DOM.successState.classList.remove('hidden');
    // hide the main element
    this.DOM.mainElement.classList.add('hidden');

    // update the filename
    this.DOM.filename.textContent = this.DOM.mockFileInput.dataset.filename;
  }

  deleteFile() {
    this.dropzone.removeAllFiles();
    this.DOM.progressCopy.textContent = '0%';
    this.DOM.defaultState.classList.remove('hidden');
    this.DOM.successState.classList.add('hidden');

    // clear the mock file input
    this.DOM.mockFileInput.value = '';

    // show the main element
    this.DOM.mainElement.classList.remove('hidden');
  }

  downloadBtn() {
    window.open(this.savedURL, '_blank').focus();
  }

  viewBtn() {
    const modalSelector = document.getElementById('fileModal');
    // https://www.orimi.com/pdf-test.pdf#toolbar=0
    // eslint-disable-next-line no-undef
    const myModal = new bootstrap.Modal(modalSelector, {});
    modalSelector
      .querySelector('embed')
      .setAttribute('src', `${this.savedURL}#toolbar=0&navpanes=0&scrollbar=0`);

    if (this.savedURL.includes('.pdf')) {
      // Add pdf class
      modalSelector
        .querySelector('embed').classList.add('is-pdf');

    }

    myModal.show();
  }


  progress(progress) {
    // update the progress copy
    this.DOM.progressCopy.textContent = `${Math.round(progress)}%`;
    // eslint-disable-next-line no-console
    console.log(`Progress: ${progress}%`);
  }

  // eslint-disable-next-line class-methods-use-this
  errorTemplate(error) {
    return `<div class="form__element-error mb-8">
      <div class="form__element-error-text">${error}</div>
    </div>`;
  }
}
