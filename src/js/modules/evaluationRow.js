import autoBind from 'auto-bind';

export default class EvaluationRow {
  constructor(evaluationRow) {
    autoBind(this);
    this.evaluationRow = evaluationRow;

    // Find the hidden checboxes
    this.evaluatorCheckboxes = this.evaluationRow.querySelectorAll(
      '.evaluators-modal-container input[type="checkbox"]',
    );

    // get td with evaluators count
    this.evaluatorsCount = this.evaluationRow.querySelector('.evaluators');

    // hook an event listener
    this.evaluatorCheckboxes.forEach((evaluatorCheckbox) => {
      evaluatorCheckbox.addEventListener('click', this.updateEvaluatorsCount);
    });

    this.updateEvaluatorsCount();
  }

  updateEvaluatorsCount() {
    const checkedEvaluators = this.evaluationRow.querySelectorAll(
      '.evaluators-modal-container input[type="checkbox"]:checked',
    );

    this.evaluatorsCount.innerHTML = `${checkedEvaluators.length} / ${this.evaluatorCheckboxes.length}`;
  }
}
