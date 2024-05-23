<template>
  <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-eval' https://www.google-analytics.com https://ssl.google-analytics.com https://www.google.com https://www.gstatic.com/recaptcha/ https://www.google.com/recaptcha/ https://accounts.scdn.co">
  <div id="app">
    <MainMenu/> 
    <router-view /> <!-- This will render the component defined by the current route -->
  </div>
</template>

<script>
import MainMenu from './components/MainMenu.vue';
import router from './router/index.js';

export default {
  name: 'App',
  components: {
    MainMenu,
  },
  mounted() {
    this.$router = router; // Attach router to the component instance
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}
</style>
