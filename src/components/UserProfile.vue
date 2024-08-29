<template>
  <v-container fluid>
    <v-card class="mx-auto" max-width="800" outlined elevation="2">
      <v-img :src="avatarUrl" height="200px" class="grey lighten-2">
        <v-row no-gutters>
          <v-col>
            <v-avatar size="100" class="mt-n16 ml-4">
              <img :src="avatarUrl" alt="Profile Avatar">
            </v-avatar>
          </v-col>
        </v-row>
      </v-img>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-account</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>User ID</v-list-item-title>
                <v-list-item-subtitle>{{ userId }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-spotify</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Spotify URI</v-list-item-title>
                <v-list-item-subtitle><a :href="spotifyUri">{{ spotifyUri }}</a></v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
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
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { onMounted } from 'vue';
import { VAvatar } from 'vuetify';

// Define reactive variables
const displayName = ref('');
const avatarUrl = ref('');
const userId = ref('');
const email = ref('');
const spotifyUri = ref('');
const userAnswers = ref([]);

// Your client ID from Spotify Developer Dashboard
const clientId = "5ff8a50fd4354b47b8e3236e6df107f4";

// Function to handle authentication and fetch profile information
const handleAuthentication = async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  console.log('Handling authentication. Code:', code);

  if (!code) {
    console.log('No authorization code found. Redirecting to auth code flow...');
    redirectToAuthCodeFlow(clientId);
  } else {
    try {
      console.log('Code found. Getting access token...');
      const accessToken = await getAccessToken(clientId, code);
      console.log('Access token obtained:', accessToken);
      
      console.log('Fetching user profile...');
      const profile = await fetchProfile(accessToken);
      console.log('User profile data:', profile);

      console.log('Populating UI with profile data...');
      populateUI(profile);

      // Retrieve user answers from localStorage
      const storedAnswers = localStorage.getItem('userAnswers');
      console.log('Stored user answers:', storedAnswers);
      if (storedAnswers) {
        userAnswers.value = JSON.parse(storedAnswers);
        console.log('User answers updated:', userAnswers.value);
      }
    } catch (error) {
      console.error('Error in handleAuthentication:', error);
    }
  }
};

const redirectToAuthCodeFlow = async (clientId) => {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", "https://musicalmatch.onrender.com/UserProfile"); // Updated redirect URI
  params.append("scope", "user-read-private user-read-email");
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  console.log('Redirecting to Spotify auth URL:', `https://accounts.spotify.com/authorize?${params.toString()}`);
  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
};

// Function to generate code verifier
const generateCodeVerifier = (length) => {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// Function to generate code challenge
const generateCodeChallenge = async (codeVerifier) => {
  const data = new TextEncoder().encode(codeVerifier);
  if (window.crypto && window.crypto.subtle) {
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    const challenge = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    console.log('Generated code challenge:', challenge);
    return challenge;
  } else {
    console.error('Web Cryptography API is not supported in this environment.');
    return '';
  }
};

// Function to fetch access token from Spotify API
const getAccessToken = async (clientId, code) => {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "https://musicalmatch.onrender.com/UserProfile"); // Updated redirect URI
  params.append("code_verifier", verifier);

  try {
    console.log('Fetching access token from Spotify API...');
    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });

    const data = await result.json();
    console.log('Access token response:', data);
    return data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error);
    throw error;
  }
};

// Function to fetch user profile from Spotify API
const fetchProfile = async (token) => {
  try {
    console.log('Fetching user profile from Spotify API...');
    const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });

    const profile = await result.json();
    console.log('User profile response:', profile);
    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Function to populate UI with profile information
const populateUI = (profile) => {
  console.log('Populating UI with profile data:', profile);
  displayName.value = profile.display_name;
  avatarUrl.value = profile.images && profile.images.length > 0 ? profile.images[0].url : '';
  userId.value = profile.id;
  email.value = profile.email;
  spotifyUri.value = profile.uri;
  
  const userProfileData = JSON.parse(localStorage.getItem('userProfile'));
  console.log('User profile data from localStorage:', userProfileData);

  // Update user answers if available
  if (userProfileData && userProfileData.answers) {
    userAnswers.value = userProfileData.answers;
    console.log('Updated user answers:', userAnswers.value);
  }
};

// Call the authentication handler when the component is mounted
onMounted(handleAuthentication);

</script>

<style>
.v-card {
  background-color: #f7f7f7;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
