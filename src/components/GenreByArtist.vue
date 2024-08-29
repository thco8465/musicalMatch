<template>
  <v-app>
    <v-main>
      <v-container class="profile-container">
        <!-- Search Bar -->
        <v-text-field
          v-model="artistName"
          label="Enter artist name"
          @keyup.enter="searchArtist"
          solo
          class="search-bar"
        ></v-text-field>

        <!-- Search Button -->
        <v-btn @click="searchArtist" class="search-btn">Search</v-btn>
        
        <!-- Artist Info Card -->
        <v-card class="profile-card" v-if="artist">
          <v-card-title>
            <!-- Artist Image -->
            <v-avatar size="150" class="artist-avatar">
              <v-img :src="artist.image" cover></v-img>
            </v-avatar>
          </v-card-title>
          <v-card-subtitle class="artist-name">
            <!-- Artist Name -->
            Artist: {{ artist.name }}
          </v-card-subtitle>
          <v-card-text>
            <!-- Artist Genres -->
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

        <!-- Loading and Error States -->
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
  artist.value = null;
  error.value = '';
  loading.value = true;
  try {
    // Fetch the Spotify token from your backend service
    const tokenResponse = await axios.get('https://musicalmatchbackend.onrender.com/spotify-token');
    const accessToken = tokenResponse.data.token;

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
  flex-direction: column;
  align-items: center;
  padding: 20px;
  /* background-color: #f0f2f5; */
}

/* Search Bar Styling */
.search-bar {
  max-width: 600px;
  width: 100%;
  margin-bottom: 20px;
  background-color: #E2B4BD; /* Background color of the text field */
  color: #424B54; /* Text color inside the text field */
  border-radius: 15px; /* Curved corners */

}

/* Ensure the text field has curved borders */
.v-text-field__slot {
  border-radius: 25px; /* Adjust this value for more or less rounding */
  background-color: #ffffff; /* Optional: Background color for the input field */
}

/* Search Button Styling */
.search-btn {
  background-color: #E2B4BD; /* Background color */
  color: #424B54; /* Text color */
  border-radius: 25px; /* Rounded corners */
  
}

.search-btn:hover {
  background-color: #d1a1a4; /* Lighter background color on hover */
  color: black; /* Text color on hover */
}

/* Profile Card Styling */
.profile-card {
  text-align: center;
  max-width: 400px;
  width: 100%;
  margin-top: 20px;
}

/* Artist Avatar Styling */
.artist-avatar {
  border: 2px solid #ffffff; /* Optional: Add a border to the image */
}

.artist-avatar .v-img {
  object-fit: cover; /* Ensures the image covers the avatar while maintaining aspect ratio */
}
</style>
