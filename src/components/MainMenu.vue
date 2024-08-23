<template>
  <div class="menu">
    <div class="header-container">
      <h3 class="sexy-header">MusicalMatchMaker</h3>
      <div class="user-info">
        <span v-if="userName">Welcome, {{ userName }}</span>
        <span v-else>Welcome!</span>
      </div>
    </div>
    <div class="menuList">
      <ul>
        <li><router-link to="/UserProfile">Profile</router-link></li>
        <li><router-link to="/MusicQuiz">Quiz</router-link></li>
        <li><router-link to="/GenreByArtist">Genres by Artist</router-link></li>
        <li><router-link to="/ArtistSearch">Artists by Genre</router-link></li>
        <li><router-link to="/UserMatches">Matches</router-link></li>
        <li><router-link to="/FindMatches">Find Matches</router-link></li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MainMenu',
  data() {
    return {
      userName: ''
    };
  },
  created() {
    this.loadUserData();
  },
  methods: {
  loadUserData() {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedData = JSON.parse(userData);
        this.userName = parsedData.first_name || ''; // Fetch first_name from user data
      }
    } catch (error) {
      console.error('Failed to parse user data from localStorage:', error);
    }
  }
}
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');

.menu {
  background-color: #9B6A6C;
  color: #424B54;
  padding: 20px;
  display: flex;
  flex-direction: column; /* Stack items vertically */
  position: relative; /* Make the menu position relative to use absolute positioning within it */
}

.header-container {
  display: flex;
  justify-content: center; /* Center horizontally */
  align-items: center;
  position: relative;
  width: 100%;
}

.sexy-header {
  font-family: 'Great Vibes', cursive;
  font-size: 48px;
  color: #d7263d;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
  margin: 0;
  text-align: center; /* Center the text within its container */
}

.user-info {
  font-size: 18px;
  font-weight: bold;
  position: absolute; /* Absolute positioning for the user info */
  top: 20px; /* Adjust the top margin to be slightly higher */
  right: 20px; /* Align to the right side */
}

.menuList {
  margin-top: 10px; /* Space to separate menu options from the header and user-info */
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: center; /* Center the list items horizontally */
}

.menu li {
  display: inline-block;
  text-align: center;
  margin-bottom: 10px;
  padding: 0px 10px;
}

.menu a {
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 12px;
  transition: background-color 0.9s, color 0.9s;
}

.menu a:hover {
  background-color: #E2B4BD;
  color: white;
}

a {
  text-decoration: none;
  color: #424B54;
  font-weight: bold;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sexy-header {
    font-size: 36px;
  }
  .user-info {
    font-size: 16px;
  }
}
</style>
