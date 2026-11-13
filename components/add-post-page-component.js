import { renderHeaderComponent } from './header-component.js';

import { renderUploadImageComponent } from './upload-image-component.js';

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  let imageUrl = '';

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>

      <div class="form">
        <h3 class="form-title">
          Добавить пост
        </h3>

        <div class="form-inputs">
          <div class="upload-image-container"></div>

          <textarea
            id="description-input"
            class="input textarea"
            placeholder="Описание фотографии"
          ></textarea>

          <div class="form-error"></div>

          <button
            class="button"
            id="add-button"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  `;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: appEl.querySelector('.header-container'),
  });

  const uploadImageContainer = appEl.querySelector('.upload-image-container');

  renderUploadImageComponent({
    element: uploadImageContainer,

    onImageUrlChange(newImageUrl) {
      imageUrl = newImageUrl;
    },
  });

  const descriptionInput = appEl.querySelector('#description-input');

  const addButton = appEl.querySelector('#add-button');

  const formError = appEl.querySelector('.form-error');

  addButton.addEventListener('click', () => {
    formError.textContent = '';

    const description = descriptionInput.value.trim();

    if (!imageUrl) {
      formError.textContent = 'Добавьте фотографию';
      return;
    }

    if (!description) {
      formError.textContent = 'Введите описание фотографии';
      return;
    }

    addButton.disabled = true;
    addButton.textContent = 'Добавляю...';

    onAddPostClick({
      description,
      imageUrl,
    })
      .catch((error) => {
        formError.textContent = error.message;
      })
      .finally(() => {
        addButton.disabled = false;
        addButton.textContent = 'Добавить';
      });
  });
}
