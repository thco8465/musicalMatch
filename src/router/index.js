import { createRouter, createWebHistory } from 'vue-router';
import userProfile from '../components/profile.vue'; // Adjust the path as per your project structure
import search from '../components/Search.vue'

<template>
    <head>
    <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-eval' https://www.google-analytics.com https://ssl.google-analytics.com https://www.google.com https://www.gstatic.com/recaptcha/ https://www.google.com/recaptcha/ https://accounts.scdn.co"/>

    </head>
</template>
const routes = [
  {
    path: '/profile',
    name: 'profile',
    component: userProfile
  },
  {
    path: '/search',
    name: 'search',
    component: search
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
