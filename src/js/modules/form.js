import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/all';
import RepeaterField from './repeaterField';
import FieldGroup from './fieldGroup';

export default class {
  constructor(formElement) {
    this.formElement = formElement;
    this.fieldGroup = new FieldGroup(formElement);

    // The form element is not the actuall <Form> Element.
    // We need to find it.
    if (this.formElement.tagName === 'FORM') {
      this.DOMFormElement = this.formElement;
    } else {
      this.DOMFormElement = this.formElement.querySelector('form');
    }

    // This event doesnt trigger if there are required fields pending.
    // After the form has been submitted, add the pointer events to the multiple click buttons
    if (this.DOMFormElement) {
      this.DOMFormElement.addEventListener('submit', () => {
        // Find the buttons with class js-prevent-multiple-clicks and add the pointer-events-none class
        this.DOMFormElement.querySelectorAll(
          '.js-prevent-multiple-clicks',
        ).forEach((el) => {
          el.classList.add('pointer-events-none');
        });
      });
    }

    // Repeater fields
    this.repeatableField = [];
    const repeatableFieldElements = this.formElement.querySelectorAll(
      '.js-repeatable-field',
    );
    repeatableFieldElements.forEach((repeatableFieldElement) => {
      const repeatableFieldElementComponent = new RepeaterField(
        repeatableFieldElement,
      );
      this.repeatableField.push(repeatableFieldElementComponent);

      // Add a ref to the element
      repeatableFieldElement.repeaterfield = repeatableFieldElementComponent;
    });

    gsap.registerPlugin(ScrollToPlugin);

    this.scrollOnFirstError();
  }

  scrollOnFirstError() {
    // remove error class after the user has clicked on the form element
    const formElementsWithError = this.formElement.querySelectorAll(
      '.form__element--has-error',
    );

    formElementsWithError.forEach((element) => {
      element.addEventListener('click', () => {
        element.classList.remove('form__element--has-error');
      });
      element.addEventListener('focus', () => {
        element.classList.remove('form__element--has-error');
      });
    });

    // Scroll to the first error element
    if (formElementsWithError.length > 0) {
      const firstError = formElementsWithError[0];
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
