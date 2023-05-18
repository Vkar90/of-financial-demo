import autoBind from 'auto-bind';

export default class {
  constructor(filtersMenu) {
    autoBind(this);
    this.layout = document.querySelector('.layout');

    // hook open-close offcanvas event
    this.myOffcanvas = filtersMenu;
    this.myOffcanvas.addEventListener('show.bs.offcanvas', this.onShow);
    this.myOffcanvas.addEventListener('hide.bs.offcanvas', this.onHide);
  }

  onShow() {
    this.layout.classList.add('open-canvas');
    this.layout.classList.remove('close-transition');
  }

  onHide() {
    this.layout.classList.remove('open-canvas');
    this.layout.classList.add('close-transition');
  }
}
