<template>
  <v-card class="card" max-width="400" v-if="profile">
    <v-img :src="profilePictureUrl" aspect-ratio="1.7" :alt="profile.first_name + ' Profile Picture'"></v-img>
    <v-card-title>{{ profile.first_name }}</v-card-title>
    <v-card-subtitle>{{ profile.age }} years old, {{ profile.location }}</v-card-subtitle>
    <v-card-text>{{ profile.bio || 'No bio available' }}</v-card-text>
    <v-card-actions>
      <v-chip v-for="(interest, index) in profile.interests || []" :key="index" small outlined>{{ interest }}</v-chip>
    </v-card-actions>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="green" @click="handleLike">Consonance</v-btn>
      <v-btn color="red" @click="handleDislike">Dissonance</v-btn>
    </v-card-actions>
    <v-card-subtitle>Similarity Score: {{ profile.similarityScore || 'Not available' }}</v-card-subtitle>
  </v-card>
  <div v-else>
    <p>No profile data available</p>
  </div>
</template>

<script>
export default {
  props: {
    profile: {
      type: Object,
      required: true,
    },
    nextProfile: {
      type: Function,
      required: true,
    },
  },
  computed: {
    profilePictureUrl() {
      return this.profile.profile_picture
        ? `/images/${this.profile.profile_picture}`
        : '/images/default-profile.png'; // Fallback if profile picture is not available
    }
  },
  methods: {
    handleLike() {
      console.log('Liking profile with ID:', this.profile.user_id); // Debug log
      this.$emit('likeProfile', this.profile.user_id);
      this.nextProfile();
    },
    handleDislike() {
      console.log('Disliking profile with ID:', this.profile.user_id); // Debug log
      this.$emit('dislikeProfile', this.profile.user_id);
      this.nextProfile();
    }
  }
};
</script>

<style scoped>
.card {
  background-color: #fff;
}
</style>
