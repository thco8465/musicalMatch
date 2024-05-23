<template>
    <div>
      <!-- You can add HTML elements here to display profile information -->
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import axios from 'axios';
  
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
    params.append("redirect_uri", "http://localhost:5173/callback");
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
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
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
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("code_verifier", verifier!);
  
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
    // You can update UI elements using Vue reactive properties
    // For example:
    // displayName.value = profile.display_name;
    // avatarUrl.value = profile.images[0]?.url;
  };
  
  // Call the authentication handler when the component is mounted
  import { onMounted } from 'vue';
  onMounted(handleAuthentication);
  </script>
  