<!-- eslint-disable vue/multi-word-component-names -->

<template>
  <div>
    <h2>Logged in as <span>{{ displayName }}</span></h2>
    <div id="avatar">
      <img :src="avatarUrl" alt="Profile Avatar">
    </div>
    <ul>
      <li>User ID: <span>{{ userId }}</span></li>
      <li>Email: <span>{{ email }}</span></li>
      <li>Spotify URI: <a :href="spotifyUri">{{ spotifyUri }}</a></li>
      <!-- Add more profile information as needed -->
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { onMounted } from 'vue';

// Define reactive variables
const displayName = ref('');
const avatarUrl = ref('');
const userId = ref('');
const email = ref('');
const spotifyUri = ref('');

// Your client ID from Spotify Developer Dashboard
const clientId = "5ff8a50fd4354b47b8e3236e6df107f4";

// Function to handle authentication and fetch profile information
const handleAuthentication = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
        redirectToAuthCodeFlow(clientId);
    } else {
        const accessToken = await getAccessToken(clientId, code);
        const profile = await fetchProfile(accessToken);
        populateUI(profile);
    }
};

// Function to redirect user to Spotify authorization flow
const redirectToAuthCodeFlow = async (clientId) => {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);
    
    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:8080/profile");
    params.append("scope", "user-read-private user-read-email");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

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
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

// Function to fetch access token from Spotify API
const getAccessToken = async (clientId, code) => {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:8080/profile");
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
};

// Function to fetch user profile from Spotify API
const fetchProfile = async (token) => {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
};

// Function to populate UI with profile information
const populateUI = (profile) => {
    // Update reactive variables with profile information
    displayName.value = profile.display_name;
    avatarUrl.value = profile.images && profile.images.length > 0 ? profile.images[0].url : '';    userId.value = profile.id;
    email.value = profile.email;
    spotifyUri.value = profile.uri;
    // Update more profile information as needed
};

// Call the authentication handler when the component is mounted
onMounted(handleAuthentication);
</script>
