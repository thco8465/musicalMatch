<template>
    <!-- Add the #app element here -->
    <div id="app">
        <div class="search-container">
            <input v-model="searchQuery" placeholder="Search by genre" />
            <button @click="handleSearch">Search</button>
            <ul class="results-list">
                <li v-for="artist in searchResults" :key="artist.id" class="artist-item">
                    <img :src="artist.images[0]?.url" alt="Artist Image" v-if="artist.images.length" class="artist-image" />
                    <span class="artist-name">{{ artist.name }}</span>
                </li>
            </ul>
            <p v-if="error" class="error-message">{{ error }}</p>
            <p v-if="loading" class="loading-message">Loading...</p>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';

export default {
    name: 'ArtistSearch',
    setup() {
        const searchQuery = ref('');
        const searchResults = ref([]);
        const loading = ref(false);
        const error = ref('');

        const handleSearch = async () => {
            loading.value = true;
            error.value = '';
            searchResults.value = [];

            const token = 'BQAYeOKRwlb7kjyROtvNE8FsLPjD7d1ffwi_s0v2Dnrh-ySMRxTn5adgjOHcbQhZoPJ5ZrTVMcnwJXv0wL1GfWhQ5vLqrdpryQmB3HnEk9rxXBX6mLI'

            try {
                const response = await axios.get(`https://api.spotify.com/v1/search`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        q: `genre:"${searchQuery.value}"`,
                        type: 'artist',
                        limit: 10
                    }
                });

                searchResults.value = response.data.artists.items;
            } catch (err) {
                error.value = 'Error fetching data. Please try again.';
            } finally {
                loading.value = false;
            }
        };

        return { searchQuery, searchResults, loading, error, handleSearch };
    }
};
</script>

<style scoped>
.search-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
    font-family: Arial, sans-serif;
}

input {
    padding: 10px;
    margin-bottom: 10px;
    width: 100%;
    max-width: 400px;
    box-sizing: border-box;
}

button {
    padding: 10px 20px;
    margin-bottom: 20px;
    cursor: pointer;
}

.results-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    list-style: none;
    padding: 0;
    margin: 0;
}

.artist-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 10px;
    padding: 10px;
    width: 150px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    text-align: center;
}

.artist-image {
    width: 100%;
    height: auto;
    border-radius: 50%;
    margin-bottom: 10px;
}

.artist-name {
    font-size: 1em;
    font-weight: bold;
}

.error-message, .loading-message {
    color: red;
    font-size: 1.2em;
    margin-top: 20px;
}
</style>
