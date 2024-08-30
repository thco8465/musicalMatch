<template>
  <v-container fluid class="profile-container">
    <v-card class="mx-auto" max-width="800" outlined elevation="2">
      <!-- Use v-img with contain or cover for better fit -->
      <v-img :src="profileData.profile_picture || defaultAvatar" class="profile-img" aspect-ratio="16/9">
        <v-row no-gutters>
          <v-col>
            <v-avatar size="100" class="mt-n16 ml-4">
              <img :src="profileData.profile_picture || defaultAvatar" alt="Profile Avatar">
            </v-avatar>
          </v-col>
        </v-row>
      </v-img>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field v-model="profileData.first_name" label="First Name" :disabled="!isEditing" required></v-text-field>
              <v-text-field v-model="profileData.last_name" label="Last Name" :disabled="!isEditing" required></v-text-field>
              <v-text-field v-model="profileData.age" label="Age" type="number" :disabled="!isEditing"></v-text-field>
              <v-text-field v-model="profileData.location" label="Location" :disabled="!isEditing"></v-text-field>
              <v-textarea v-model="profileData.bio" label="Bio" :disabled="!isEditing"></v-textarea>
              <v-text-field v-model="profileData.email" label="Email" type="email" :disabled="!isEditing" required></v-text-field>
              <v-text-field v-model="profileData.phone" label="Phone Number" type="tel" :disabled="!isEditing"></v-text-field>
              
              <v-list-item v-if="userAnswers.length > 0">
                <v-list-item-icon>
                  <v-icon>mdi-clipboard-text</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Quiz Answers</v-list-item-title>
                  <v-list-item-subtitle>
                    <ul>
                      <li v-for="(answer, index) in userAnswers" :key="index">{{ answer.selectedOption }}</li>
                    </ul>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-form>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="toggleEdit">{{ isEditing ? 'Cancel' : 'Edit' }}</v-btn>
        <v-btn color="secondary" @click="saveProfile" :disabled="!isEditing || !valid">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const profileData = ref({
  first_name: '',
  last_name: '',
  age: null,
  location: '',
  bio: '',
  profile_picture: '',
  email: '',
  phone: ''
});

const userAnswers = ref([]);

const valid = ref(false);
const defaultAvatar = '/images/dog1.jpg'; // Path to a default avatar image
const isEditing = ref(false);

const fetchUserProfile = async () => {
  try {
    const userId = store.state.user.id;
    const response = await fetch(`https://musicalmatchbackend.onrender.com/users/${userId}`);
    const data = await response.json();
    profileData.value = data;

    // Fetch stored quiz answers if available
    const storedAnswers = localStorage.getItem('userAnswers');
    if (storedAnswers) {
      userAnswers.value = JSON.parse(storedAnswers);
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
};

const saveProfile = async () => {
  try {
    const userId = store.state.user.id;
    const response = await fetch(`https://musicalmatchbackend.onrender.com/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData.value)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    // Optionally, update localStorage or Vuex store with the updated profile
    const updatedProfile = await response.json();
    store.commit('setUser', updatedProfile);
    isEditing.value = false; // Exit edit mode after saving
  } catch (error) {
    console.error('Error saving profile:', error);
  }
};

const toggleEdit = () => {
  isEditing.value = !isEditing.value;
};

onMounted(fetchUserProfile);
</script>

<style scoped>
.profile-img {
  position: relative;
  height: 200px;
  width: 100%;
  overflow: hidden; /* Ensure any overflow is hidden */
}

.profile-img img {
  position: absolute;
  top: 0%; /* Adjust this value to move the image down */
  left: 50%;
  transform: translate(-50%, 0); /* Center horizontally; no vertical adjustment needed */
  width: 100%;
  height: auto; /* Maintain aspect ratio */
  object-fit: cover; /* Ensure the image covers the container */
}

</style>
