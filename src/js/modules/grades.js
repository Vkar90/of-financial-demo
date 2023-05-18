import autoBind from 'auto-bind';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/all';

export default class {
  constructor(element) {
    autoBind(this);
    this.element = element;

    gsap.registerPlugin(ScrollToPlugin);
    if(this.elementsWithError){
        this.scrollOnFirstError();
    }
  }

  scrollOnFirstError() {
    // remove error class after the user has clicked on the form element
    const elementsWithError = this.document.querySelectorAll(
      '.form__element--has-error',
    );

    elementsWithError.forEach((element) => {
      element.addEventListener('click', () => {
        element.classList.remove('form__element--has-error');
      });
      element.addEventListener('focus', () => {
        element.classList.remove('form__element--has-error');
      });
    });

    // Scroll to the first error element
    if (elementsWithError.length > 0) {
      const firstError = elementsWithError[0];
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
