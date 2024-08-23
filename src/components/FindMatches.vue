<template>
  <div>
    <h1 class="sexy-header">Find Harmony</h1>
    <div class="container">
      <ProfileCard 
        :profile="currentProfile" 
        :nextProfile="nextProfile" 
        @likeProfile="likeProfile" 
        @dislikeProfile="dislikeProfile"
      />
    </div>
  </div>
</template>

<script>
import ProfileCard from './ProfileCard.vue';

export default {
  components: {
    ProfileCard,
  },
  data() {
    return {
      currentIndex: 0,
      profiles: [],
      userId: null,
    };
  },
  computed: {
  currentProfile() {
    console.log('Current Profile:', this.profiles[this.currentIndex]); // Debug log
    return this.profiles[this.currentIndex];
  }
},
  methods: {
    async fetchProfiles() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      this.userId = user.id;
    }

    const response = await fetch(`http://localhost:5000/profiles?userId=${this.userId}`);
    const data = await response.json();
    this.profiles = data;
    console.log('Fetched Profiles:', this.profiles); // Debug log
    if (this.profiles.length > 0) {
      this.currentIndex = 0;
    }
  } catch (error) {
    console.error('Error fetching profiles:', error);
  }
},
    nextProfile() {
      if (this.profiles.length > 0) {
        this.currentIndex = (this.currentIndex + 1) % this.profiles.length;
      }
    },
    async likeProfile(profileId) {
      const userId = JSON.parse(localStorage.getItem('user')).id;
      console.log('Sending like request:', { userId, profileId }); // Debug log

      try {
        await fetch('http://localhost:5000/like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, likedUserId: profileId }),
        });
      } catch (error) {
        console.error('Error liking profile:', error);
      }
    },
    async dislikeProfile(profileId) {
      try {
        await fetch('http://localhost:5000/dislike', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: this.userId, profileId }),
        });
        this.nextProfile(); // Move to next profile after disliking
        this.fetchProfiles(); // Refresh profiles
      } catch (error) {
        console.error('Error disliking profile:', error);
      }
    }
  },
  mounted() {
    this.fetchProfiles();
  }
};
</script>

<style>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh; /* Full height of the viewport */
}
.sexy-header {
  font-family: 'Great Vibes', cursive; /* Stylish font */
  font-size: 48px; /* Large font size */
  color: #d7263d; /* A striking red color */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); /* Subtle shadow effect */
  letter-spacing: 1px; /* Slightly increased letter spacing */
  text-align: center; /* Centered text */
  margin: 10px 0; /* Spacing around the header */
}
</style>
