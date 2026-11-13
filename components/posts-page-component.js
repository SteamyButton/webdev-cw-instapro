import likeActiveImage from '../assets/images/like-active.svg';
import likeNotActiveImage from '../assets/images/like-not-active.svg';

import { formatDistanceToNow } from 'date-fns';

import { ru } from 'date-fns/locale';
import { USER_POSTS_PAGE } from '../routes.js';
import { renderHeaderComponent } from './header-component.js';
import { posts, goToPage } from '../index.js';
import { escapeHtml } from '../helpers.js';

export function renderPostsPageComponent({
  appEl,
  isUserPostsPage = false,
  onLikeClick,
}) {
  const postsHtml = posts
    .map((post) => {
      return `
        <li class="post">
          <div
            class="post-header"
            data-user-id="${escapeHtml(post.user.id)}"
          >
            <img
              src="${escapeHtml(post.user.imageUrl)}"
              class="post-header__user-image"
              alt="${escapeHtml(post.user.name)}"
            >

            <p class="post-header__user-name">
              ${escapeHtml(post.user.name)}
            </p>
          </div>

          <div class="post-image-container">
            <img
              class="post-image"
              src="${escapeHtml(post.imageUrl)}"
              alt="${escapeHtml(post.description)}"
            >
          </div>

          <div class="post-likes">
            <button
              data-post-id="${escapeHtml(post.id)}"
              class="like-button"
            >
              <img
                src="${post.isLiked ? likeActiveImage : likeNotActiveImage}"
                alt="Лайк"
              >
            </button>

            <p class="post-likes-text">
              Нравится:
              <strong>${post.likes.length}</strong>
            </p>
          </div>

          <p class="post-text">
            <span class="user-name">
              ${escapeHtml(post.user.name)}
            </span>

            ${escapeHtml(post.description)}
          </p>

          <p class="post-date">
            ${formatDistanceToNow(new Date(post.createdAt), {
              addSuffix: true,
              locale: ru,
            })}
          </p>
        </li>
      `;
    })
    .join('');

  const postsUser = posts[0]?.user;

  const userHeaderHtml =
    isUserPostsPage && postsUser
      ? `
      <div class="posts-user-header">
        <img
          class="posts-user-header__user-image"
          src="${escapeHtml(postsUser.imageUrl)}"
          alt="${escapeHtml(postsUser.name)}"
        >

        <p class="posts-user-header__user-name">
          ${escapeHtml(postsUser.name)}
        </p>
      </div>
    `
      : '';

  const emptyMessageHtml =
    posts.length === 0
      ? `
      <p class="posts-empty-message">
        ${
          isUserPostsPage
            ? 'У пользователя пока нет постов'
            : 'Пока нет ни одного поста'
        }
      </p>
    `
      : '';

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>

    ${userHeaderHtml}
    ${emptyMessageHtml}


      <ul class="posts">
        ${postsHtml}
      </ul>
    </div>
  `;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: appEl.querySelector('.header-container'),
  });

  const likeButtons = appEl.querySelectorAll('.like-button');

  likeButtons.forEach((likeButton) => {
    likeButton.addEventListener('click', () => {
      const postId = likeButton.dataset.postId;

      const currentPost = posts.find((post) => post.id === postId);

      if (!currentPost) {
        return;
      }

      const postElement = likeButton.closest('.post');

      const likeImage = likeButton.querySelector('img');

      const likesCounter = postElement.querySelector('.post-likes-text strong');

      likeButton.disabled = true;

      onLikeClick({
        postId,
        isLiked: currentPost.isLiked,
      })
        .then((updatedPost) => {
          if (!updatedPost) {
            return;
          }

          likeImage.src = updatedPost.isLiked
            ? likeActiveImage
            : likeNotActiveImage;

          likesCounter.textContent = updatedPost.likes.length;
        })
        .catch((error) => {
          console.error(error);
          alert('Не удалось обновить лайк. Проверьте подключение к интернету.');
        })
        .finally(() => {
          likeButton.disabled = false;
        });
    });
  });

  if (!isUserPostsPage) {
    const userElements = appEl.querySelectorAll('.post-header');

    userElements.forEach((userElement) => {
      userElement.addEventListener('click', () => {
        goToPage(USER_POSTS_PAGE, {
          userId: userElement.dataset.userId,
        });
      });
    });
  }
}
