import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';
import Swal from 'sweetalert2';
import Form from './modules/form';
import Comments from './modules/comments';
import RecommendationLetter from './modules/recommendation-letter';
import ApplicantsTable from './modules/applicantsTable';
import Evaluation from './modules/evaluation';
import Director from './modules/director';
import Shortlist from './modules/shortlist';
// eslint-disable-next-line import/no-named-as-default
import Grades from './modules/grades';
import Budget from './modules/budget';

class App {
  constructor() {
    this.init();
  }

  init() {
    // Get context
    this.context = window.context;

    // Set environment
    if (
      this.context.environment === 'staging' ||
      this.context.environment === 'production'
    ) {
      // eslint-disable-next-line no-console
      console.log('Staging or Production: Initializing Sentry');
      this.initSentry();
    } else {
      // eslint-disable-next-line no-console
      console.log('🔥 DEV MODE 🔥');
    }

    // Show toast notifications on page load (error / success)
    if (this.context && this.context.showErrorOnLoad) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 10000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
        icon: 'error',
        title: this.context.showErrorOnLoad,
      });
    }
    if (this.context && this.context.showSuccessOnLoad) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 10000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
        icon: 'success',
        title: this.context.showSuccessOnLoad,
      });
    }

    // Forms
    this.forms = [];
    const formElements = document.querySelectorAll('.js-form');
    formElements.forEach((formElement) => {
      const tmp = new Form(formElement);
      this.forms.push(tmp);
    });

    // Anchor side links on form
    const menu = document.querySelector('.side-menu-container');
    if (menu) {
      // find the mobile toggle and inner menu
      const mobileToggler = menu.querySelector(
        '.side-menu-container__mobile-toggler',
      );
      const innerMenu = menu.querySelector('.side-menu-container__menu');

      // add event listener on toggler to toggle a class on inner menu
      mobileToggler.addEventListener('click', () => {
        innerMenu.classList.toggle('show');
      });
    }

    // Comments
    if (document.querySelector('.js-delete-comment')) {
      this.Comments = new Comments();
    }

    // recommendation letters
    if (document.querySelector('.js-withdraw-recommendation-letter')) {
      // withdraw recommendation letter
      const withdrawRecommendationLetterModal = document.querySelector(
        '.js-withdraw-recommendation-letter',
      );

      this.DOM = {
        withdrawRecommendationLetterModal,
        withdrawRecommendationLetterTriggers: document.querySelectorAll(
          '.js-withdraw-recommendation-letter-trigger',
        ),
        withdrawRecommendationLetterInput:
          withdrawRecommendationLetterModal.querySelector(
            '.js-withdraw-recommendation-letter-id',
          ),
      };

      this.DOM.withdrawRecommendationLetterTriggers.forEach((trigger) => {
        // get RecommendationLetter id from data
        const { recommendationLetterId } = trigger.dataset;

        trigger.addEventListener('click', () => {
          this.DOM.withdrawRecommendationLetterInput.value =
            recommendationLetterId;
        });
      });
    }

    // document.body.addEventListener('contextmenu', (e) => {
    //   e.preventDefault();
    //   return false;
    // });

    // document.querySelector('.is-pdf').addEventListener('contextmenu', (e) => {
    //   e.preventDefault();
    //   return false;
    // });


    // Applicants table
    const applicantsTable = document.querySelector('#applicants-table');
    if (applicantsTable) {
      this.applicantsTable = new ApplicantsTable(applicantsTable);
    }

    // Evaluation functionalities
    const evaluation = document.querySelector('#evaluation');
    if (evaluation) {
      this.evaluation = new Evaluation(evaluation);
    }

    // Director functionalities
    const director = document.querySelector('#director');
    if (director) {
      this.director = new Director(director);
    }

    // Financial planning functionalities
    const financialPlanning = document.querySelector('#shortlist');
    if (financialPlanning) {
      this.financialPlanning = new Shortlist(financialPlanning);
    }

    // Budget functionalities
    const budget = document.querySelector('#budget');
    if (budget) {
      this.budget = new Budget(budget);
    }

    // Grades functionalities
    const grades = document.querySelector('#grades');
    if (grades) {
      this.grades = new Grades(grades)
    }

    // Recommendation letter
    const recommendationLetterForm = document.querySelector('.js-rl-form');
    if (recommendationLetterForm) {
      this.recommendationLetter = new RecommendationLetter(
        recommendationLetterForm,
      );
    }

    // Quick View Functionality
    const quickViewModal = document.querySelector('#quickViewModal');
    if (quickViewModal) {
      const quickViewModalEl = document.querySelector('#quickViewModal');
      quickViewModalEl.addEventListener('show.bs.modal', (event) => {
        const quickViewData =
          event.relatedTarget.parentElement.parentElement.querySelector(
            '.quick-view-data',
          );
        document.querySelector('#quickViewModal .modal-description').innerHTML =
          '';
        if (quickViewData != null) {
          document.querySelector(
            '#quickViewModal .modal-description',
          ).innerHTML = quickViewData.innerHTML;
        }
      });
    }

    // Calculate total grade in evaluation phase
    const questionsObjectsArray = [];
    const questions = document.querySelectorAll(
      '.evaluation-container__question',
    );
    questions.forEach((question) => {
      const gradeObject = {
        evaluatorGradeInput: question.querySelector(
          '.evaluation-container__question-grading-box',
        ),
        directorGradeInput: question.querySelector('.director-grade'),
      };
      questionsObjectsArray.push(gradeObject);
    });

    const totalGrade = document.querySelector(
      '.evaluation-container__grades_total-grade',
    );

    function calculateTotalScore() {
      let total = 0;
      questionsObjectsArray.forEach((question) => {
        if (question.directorGradeInput && question.directorGradeInput.value) {
          total += parseInt(question.directorGradeInput.value, 10);
        } else if (
          question.evaluatorGradeInput &&
          question.evaluatorGradeInput.value
        ) {
          total += parseInt(question.evaluatorGradeInput.value, 10);
        }
        totalGrade.innerHTML = total.toString();
      });
    }

    // calculate total grade on input change
    questionsObjectsArray.forEach((question) => {
      if (question.directorGradeInput) {
        question.directorGradeInput.addEventListener('change', () => {
          calculateTotalScore();
        });
      } else if (question.evaluatorGradeInput) {
        question.evaluatorGradeInput.addEventListener('change', () => {
          calculateTotalScore();
        });
      }
    });
    calculateTotalScore();
  }

  // eslint-disable-next-line class-methods-use-this
  initSentry() {
    Sentry.init({
      dsn: 'https://a57c811171aa412182415c2bb904100c@o1294989.ingest.sentry.io/4504214676111360',
      environment: this.context.environment,
      integrations: [new BrowserTracing()],

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,
    });
  }
}

window.app = new App();
