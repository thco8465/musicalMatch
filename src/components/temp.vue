<template>
    <v-app>
      <v-main>
        <v-container class="profile-container">
          <v-text-field
            v-model="artistName"
            label="Enter artist name"
            @keyup.enter="searchArtist"
            solo
          ></v-text-field>
          <v-btn @click="searchArtist" color="primary" class="ml-2">Search</v-btn>
          <v-card class="profile-card" v-if="artist">
            <v-card-title>
              <v-avatar size="150">
                <img :src="artist.image" alt="Artist Image" />
              </v-avatar>
              Artist: {{ artist.name }}
            </v-card-title>
            <v-card-text>
              <div v-if="artist.genres.length">
                <p v-for="genre in artist.genres" :key="genre.name">
                  <strong>{{ genre.intro }}</strong> {{ genre.name }}
                </p>
              </div>
              <div v-else>
                <p>No genres available for this artist.</p>
              </div>
            </v-card-text>
          </v-card>
          <v-progress-circular v-if="loading" indeterminate></v-progress-circular>
          <p v-if="error">{{ error }}</p>
        </v-container>
      </v-main>
    </v-app>
  </template>
  
  
  <script setup>
  import { ref } from 'vue';
  import axios from 'axios';
  
  // Reactive properties
  const artistName = ref('');
  const artist = ref(null);
  const loading = ref(false);
  const error = ref('');
  
  // Fun intros for genres
  const genreIntros = [
    "Get ready for some",
    "Experience the magic of",
    "Dive into the world of",
    "Feel the rhythm of",
    "Explore the essence of"
  ];
  
  // Function to fetch artist information from Spotify API
  async function getArtistInfo(artistName, accessToken) {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/search?type=artist&q=${encodeURIComponent(artistName)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      const fetchedArtist = response.data.artists.items[0];
      if (fetchedArtist) {
        const formattedGenres = fetchedArtist.genres.map((genre, index) => ({
          name: genre,
          intro: genreIntros[index % genreIntros.length]
        }));
        return {
          id: fetchedArtist.id,
          name: fetchedArtist.name,
          genres: formattedGenres,
          image: fetchedArtist.images[0] ? fetchedArtist.images[0].url : 'https://via.placeholder.com/150' // Default image if none exists
        };
      } else {
        console.log('Artist not found.');
        return null;
      }
    } catch (error) {
      console.error('Error fetching artist data:', error.message);
      throw new Error('Failed to fetch artist data');
    }
  }
  
  // Function to handle artist search
  async function searchArtist() {
    const accessToken = 'BQBF-7s_78GQl5DzapRwRlMNW3Auot8NfHyDvc7j2mq65w8Rsv1QKMm1o6MS6iIogd4ktzH-U6L5G3h_7SMis02nJNsFPKy7UoSfxvkaNRe5SKAhGNs'; // Replace with your valid access token
    artist.value = null;
    error.value = '';
    loading.value = true;
    try {
      const fetchedArtist = await getArtistInfo(artistName.value, accessToken);
      artist.value = fetchedArtist;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }
  </script>
  <style scoped>
  .profile-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 20px;
    background-color: #f0f2f5;
  }
  
  .profile-card {
    text-align: center;
    max-width: 400px;
    width: 100%;
  }
  </style>