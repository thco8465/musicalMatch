import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import { loadFonts } from './plugins/webfontloader';
import store from './store'; // Import the Vuex store

loadFonts();

createApp(App)
  .use(router)
  .use(vuetify)
  .use(store) // Add Vuex store to the app
  .mount('#app');
