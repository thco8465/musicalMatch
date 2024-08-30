<template>
  <div>
    <h1 class="sexy-header">Matches</h1>
    <v-card v-if="recentMatches.length > 0 && currentIndex < recentMatches.length" max-width="400" class="mx-auto">
      <v-img :src="currentProfile.profilePicture" aspect-ratio="1.7"></v-img>
      <v-card-title>{{ currentProfile.name }}</v-card-title>
      <v-card-subtitle>{{ currentProfile.age }} years old, {{ currentProfile.location }}</v-card-subtitle>
      <v-card-text>{{ currentProfile.bio }}</v-card-text>
      <v-card-actions class="interests">
        <v-chip v-for="(interest, index) in currentProfile.interests" :key="index" small outlined>{{ interest }}</v-chip>
      </v-card-actions>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green" @click="nextProfile">Consonance</v-btn>
        <v-btn color="red" @click="nextProfile">Dissonance</v-btn>
      </v-card-actions>
      <v-card-subtitle>Harmony: {{ currentProfile.similarityScore }}</v-card-subtitle>
    </v-card>
    <div v-else class="no-profiles">
      <p>No more profiles to display.</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      currentIndex: 0,
      recentMatches: [],
    };
  },
  computed: {
    ...mapGetters(['user']),
    currentProfile() {
      return this.recentMatches[this.currentIndex];
    },
  },
  methods: {
    async fetchProfiles() {
      try {
        if (this.user) {
          const response = await fetch(`https://musicalmatchbackend.onrender.com/profiles?userId=${this.user.id}`);
          const data = await response.json();
          this.recentMatches = data;
          if (this.recentMatches.length > 0) {
            this.currentIndex = 0;
          }
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    },
    nextProfile() {
      if (this.currentIndex < this.recentMatches.length - 1) {
        this.currentIndex++;
      }
    },
  },
  mounted() {
    this.fetchProfiles();
  },
};
</script>

<style>
.interests {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: left;
}
.sexy-header {
  font-family: 'Great Vibes', cursive;
  font-size: 48px;
  color: #d7263d;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
  text-align: center;
  margin: 20px 0;
}
.no-profiles {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}
.no-profiles p {
  font-family: 'Great Vibes', cursive;
  font-size: 24px;
  color: #d7263d;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}
</style>
