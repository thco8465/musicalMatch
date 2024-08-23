<template>
  <div id="app">
    <!-- Conditionally render MainMenu based on user authentication status and route -->
    <MainMenu v-if="isAuthenticated && !isAuthPage" />
    <router-view /> <!-- This will render the component defined by the current route -->
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'; // Import computed
import { useRoute } from 'vue-router';
import MainMenu from './components/MainMenu.vue';

export default {
  name: 'App',
  components: {
    MainMenu,
  },
  setup() {
    const isAuthenticated = ref(false);
    const route = useRoute();

    const checkAuthentication = () => {
      const user = localStorage.getItem('user');
      isAuthenticated.value = !!user;
    };

    const isAuthPage = computed(() => {
      // List of routes that should not display MainMenu
      const authPages = ['/','/SignUp', '/SignIn'];
      return authPages.includes(route.path);
    });

    onMounted(() => {
      checkAuthentication();
    });

    // Watch route changes to update the authentication status
    watch(route, () => {
      checkAuthentication();
    });

    return {
      isAuthenticated,
      isAuthPage,
    };
  },
};
</script>
