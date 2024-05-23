<template>
  <div class="menu">
    <ul>
      <li><router-link to="/profile">Profile</router-link></li>
      <li><a href="#">Matches</a></li>
      <li><a href="#">Messages</a></li>
      <li><router-link to="/search">Search</router-link></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'MainMenu'
};
</script>

<style scoped>
.menu {
  background-color: #137937;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
}

.logo {
  font-size: 1.5em;
  font-weight: bold;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
}

li {
  margin-right: 20px;
}

a {
  text-decoration: none;
  color: white;
  font-weight: bold;
}

a:hover {
  text-decoration: underline;
}
</style>
