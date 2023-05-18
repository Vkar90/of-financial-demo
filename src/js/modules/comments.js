import autoBind from 'auto-bind';

export default class {
  constructor() {
    autoBind(this);

    // Delete comment
    const deleteCommentModal = document.querySelector('.js-delete-comment');

    this.DOM = {
      deleteCommentModal,
      deleteCommentTriggers: document.querySelectorAll(
        '.js-delete-comment-trigger',
      ),
      deleteCommentInput: deleteCommentModal.querySelector('.js-comment-id'),
    };

    this.DOM.deleteCommentTriggers.forEach((trigger) => {
      // get comment id from data-comment-id
      const { commentId } = trigger.dataset;

      trigger.addEventListener('click', () => {
        this.DOM.deleteCommentInput.value = commentId;
      });
    });
  }
}
