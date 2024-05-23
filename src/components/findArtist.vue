<template>
    <div>
      <!-- Add HTML elements here to display artist information -->
    </div>
  </template>
  
  <script setup>
  import axios from 'axios';
  
  // Define the Artist interface
  interface Artist {
    id: string;
    name: string;
    genres: string[];
    // Add other relevant properties
  }
  
  // Function to fetch artist information from Spotify API
  export async function getArtistInfo(artistName: string, accessToken: string): Promise<Artist | null> {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/search?type=artist&q=${encodeURIComponent(artistName)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      const artist = response.data.artists.items[0];
      if (artist) {
        const formattedGenres = artist.genres.join(', '); // Convert array of genres to a string
        return {
          id: artist.id,
          name: artist.name,
          genres: formattedGenres,
          // Add other relevant properties
        };
      } else {
        console.log('Artist not found.');
        return null;
      }
    } catch (error) {
      console.error('Error fetching artist data:', error.message);
      return null;
    }
  }
  
  // Call the getArtistInfo function to fetch artist information
  const artistName = 'The Beatles'; // Replace with the desired artist name
  const accessToken = 'BQAxLyIB-SI9VR8hpstNZg1hMmmUvVjs7WkiRZbe_-P24a_C0ZD7CevF9Y_rgMa1lbiEf58CU-kn-hLOh0esLZ0CeF46twbeNETHid2QmRieZvu0My8'; // Replace with your valid access token
  getArtistInfo(artistName, accessToken).then(artist => {
    if (artist) {
      console.log('Artist Name:', artist.name);
      console.log('Spotify ID:', artist.id);
      // You can update Vue reactive properties here to display artist information in the template
      // For example:
      // displayName.value = artist.name;
      // genre.value = artist.genres[0];
    }
  });
  </script>
  