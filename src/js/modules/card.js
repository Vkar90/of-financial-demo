/* eslint-disable no-console */
import autoBind from 'auto-bind';

export default class {
  constructor(card) {
    autoBind(this);
    this.DOM = {
      card,
      cardTitle: card.querySelector('.card__title'),
      cardBody: card.querySelector('.card__body'),
    };

    this.DOM.card.addEventListener('click', this.click);
  }

  // a click function that console logs something
  click() {
    console.log(this.DOM.cardTitle.innerText);
  }
}
