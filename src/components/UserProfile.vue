<template>
  <v-container fluid>
    <v-card class="mx-auto" max-width="800" outlined elevation="2">
      <v-img :src="profileData.profile_picture || defaultAvatar" height="200px" class="grey lighten-2">
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
              <v-text-field v-model="profileData.first_name" label="First Name" required></v-text-field>
              <v-text-field v-model="profileData.last_name" label="Last Name" required></v-text-field>
              <v-text-field v-model="profileData.age" label="Age" type="number"></v-text-field>
              <v-text-field v-model="profileData.location" label="Location"></v-text-field>
              <v-textarea v-model="profileData.bio" label="Bio"></v-textarea>
              <v-text-field v-model="profileData.email" label="Email" type="email" required></v-text-field>
              <v-text-field v-model="profileData.phone" label="Phone Number" type="tel"></v-text-field>
              
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
        <v-btn color="primary" @click="saveProfile" :disabled="!valid">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex'; // If you're using Vuex to manage state
//import { useRouter } from 'vue-router';

const store = useStore();
//const router = useRouter();

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
const defaultAvatar = '/images/dog1.jpg'; // Add a path to a default avatar image

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
  } catch (error) {
    console.error('Error saving profile:', error);
  }
};

onMounted(fetchUserProfile);
</script>

<style scoped>
.v-card {
  background-color: #f7f7f7;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
