<template>
    <v-app id="app">
      <v-container class="search-container">
        <!-- Search Bar -->
        <v-text-field
          v-model="searchQuery"
          label="Search by genre"
          @keyup.enter="handleSearch"
          solo
          class="mb-3 v-text-field-custom"
        ></v-text-field>
  
        <!-- Button Container -->
        <div class="button-container">
          <v-btn @click="handleSearch" class="custom-btn">
            Search
          </v-btn>
        </div>
  
        <!-- Artist List -->
        <div class="artist-list">
          <div
            v-for="artist in searchResults"
            :key="artist.id"
            class="artist-item"
          >
            <div class="artist-circle">
              <v-img :src="artist.images[0]?.url" class="artist-img"></v-img>
            </div>
            <div class="artist-name">{{ artist.name }}</div>
          </div>
        </div>
  
        <!-- Loading and Error States -->
        <v-alert v-if="error" type="error" class="mt-3">{{ error }}</v-alert>
        <v-progress-circular v-if="loading" indeterminate color="primary"></v-progress-circular>
      </v-container>
    </v-app>
  </template>
  
  <script>
  import { ref } from 'vue';
import axios from 'axios';

export default {
  name: 'ArtistSearch',
  setup() {
    const searchQuery = ref('');
    const searchResults = ref([]);
    const loading = ref(false);
    const error = ref('');

    const handleSearch = async () => {
      loading.value = true;
      error.value = '';
      searchResults.value = [];

      try {
        // Fetch the Spotify token from your backend service
        const tokenResponse = await axios.get('https://musicalmatchbackend.onrender.com/spotify-token');
        const token = tokenResponse.data.token;

        // Use the token to search for artists by genre
        const response = await axios.get(`https://api.spotify.com/v1/search`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            q: `genre:"${searchQuery.value}"`,
            type: 'artist',
            limit: 10
          }
        });

        searchResults.value = response.data.artists.items;
      } catch (err) {
        error.value = 'Error fetching data. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    return { searchQuery, searchResults, loading, error, handleSearch };
  }
};

  </script>
  
  <style scoped>
  .search-container {
    max-width: 800px;
    margin: 0 auto;
    text-align: center; /* Center text and inline elements */
  }
  
  /* Style for the text field */
  .v-text-field-custom {
    background-color: #E2B4BD; /* Background color of the text field */
    color: #424B54; /* Text color inside the text field */
    border-radius: 15px; /* Curved corners */
  }
  
  /* Button Container to center the button */
  .button-container {
    display: flex;
    justify-content: center;
    margin-bottom: 20px; /* Space between button and other elements */
  }
  
  /* Custom button styling */
  .custom-btn {
    background-color: #E2B4BD; /* Default background color */
    border-radius: 25px; /* Rounded corners */
    transition: background-color 0.3s, color 0.3s; /* Smooth transition */
    color: #424B54;
    font-weight: bold;
  }
  
  /* Button hover styling */
  .custom-btn:hover {
    background-color: #d18f8d; /* Background color on hover */
    color: #000000; /* Text color on hover */
  }
  
  /* Artist List Styling */
  .artist-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }
  
  .artist-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
    width: 120px;
    text-align: center;
  }
  
  .artist-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background-color: #f0f0f0;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .artist-img {
    width: 100%;
    height: auto;
  }
  
  .artist-name {
    margin-top: 10px;
    font-size: 1em;
    font-weight: bold;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  </style>
  