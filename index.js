import {
  addPost,
  dislikePost,
  getPosts,
  getUserPosts,
  likePost,
} from './api.js';
import { renderAddPostPageComponent } from './components/add-post-page-component.js';
import { renderAuthPageComponent } from './components/auth-page-component.js';
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from './routes.js';
import { renderPostsPageComponent } from './components/posts-page-component.js';
import { renderLoadingPageComponent } from './components/loading-page-component.js';
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from './helpers.js';

export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];
export let selectedUserId = null;

const getToken = () => {
  const token = user ? `Bearer ${user.token}` : undefined;
  return token;
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

/**
 * Включает страницу приложения
 */
export const goToPage = (newPage, data) => {
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      /* Если пользователь не авторизован, то отправляем его на страницу авторизации перед добавлением поста */
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      return renderApp();
    }

    if (newPage === POSTS_PAGE) {
      selectedUserId = null;

      page = LOADING_PAGE;
      renderApp();

      return getPosts({ token: getToken() })
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);

          page = POSTS_PAGE;
          posts = [];
          renderApp();

          alert('Не удалось загрузить посты. Попробуйте позже.');
        });
    }

    if (newPage === USER_POSTS_PAGE) {
      selectedUserId = data.userId;

      page = LOADING_PAGE;
      renderApp();

      return getUserPosts({
        token: getToken(),
        userId: selectedUserId,
      })
        .then((newPosts) => {
          posts = newPosts;
          page = USER_POSTS_PAGE;

          renderApp();
        })
        .catch((error) => {
          console.error(error);
          alert('Не удалось загрузить посты пользователя');

          return goToPage(POSTS_PAGE);
        });
    }

    page = newPage;
    renderApp();

    return;
  }

  throw new Error('страницы не существует');
};

const handleLikeClick = ({ postId, isLiked }) => {
  if (!user) {
    alert('Чтобы поставить лайк, необходимо авторизоваться');

    return Promise.resolve();
  }

  const likeRequest = isLiked ? dislikePost : likePost;

  return likeRequest({
    token: getToken(),
    postId,
  }).then((updatedPost) => {
    const postIndex = posts.findIndex((post) => post.id === updatedPost.id);

    if (postIndex !== -1) {
      posts[postIndex] = updatedPost;
    }

    return updatedPost;
  });
};

const renderApp = () => {
  const appEl = document.getElementById('app');
  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick({ description, imageUrl }) {
        return addPost({
          token: getToken(),
          description,
          imageUrl,
        }).then(() => {
          return goToPage(POSTS_PAGE);
        });
      },
    });
  }

  if (page === POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
      onLikeClick: handleLikeClick,
    });
  }

  if (page === USER_POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
      isUserPostsPage: true,
      onLikeClick: handleLikeClick,
    });
  }
};

goToPage(POSTS_PAGE);
