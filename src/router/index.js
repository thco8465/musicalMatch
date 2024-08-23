import { createRouter, createWebHistory } from 'vue-router';
import UserProfile from '../components/UserProfile.vue';
import ArtistSearch from '../components/ArtistSearch.vue';
import GenreByArtist from '../components/GenreByArtist.vue';
import MusicQuiz from '../components/MusicQuiz.vue';
import UserMatches from '../components/UserMatches.vue';
import FindMatches from '../components/FindMatches.vue';
import LoginPage from '../components/SignIn.vue';
import SignUpPage from '../components/SignUp.vue';
//import MainMenu from '../components/MainMenu.vue'; // Import the MainMenu component

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/SignUp',
    name: 'SignUp',
    component: SignUpPage
  },
  // {
  //   path: '/main-menu',
  //   name: 'MainMenu',
  //   component: MainMenu,
  //   meta: { requiresAuth: true }, // This route requires authentication
  // },
  {
    path: '/UserProfile',
    name: 'UserProfile',
    component: UserProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/ArtistSearch',
    name: 'ArtistSearch',
    component: ArtistSearch,
    meta: { requiresAuth: true }
  },
  {
    path: '/GenreByArtist',
    name: 'GenreByArtist',
    component: GenreByArtist,
    meta: { requiresAuth: true }
  },
  {
    path: '/MusicQuiz',
    name: 'MusicQuiz',
    component: MusicQuiz,
    meta: { requiresAuth: true }
  },
  {
    path: '/UserMatches',
    name: 'UserMatches',
    component: UserMatches,
    meta: { requiresAuth: true }
  },
  {
    path: '/FindMatches',
    name: 'FindMatches',
    component: FindMatches,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard to check authentication before accessing routes that require it
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('user'); // Replace with actual auth check
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
