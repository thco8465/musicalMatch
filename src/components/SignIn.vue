<template>
  <div class="login-container">
    <h1 ref = "sexyHeader" :class="['sexy-header',{'no-cursor': !showCursor}]">{{ displayedText }}</h1>
    <v-card class="card" max-width="400">
      <v-card-title class="card-title">Sign In</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleSignIn">
          <v-text-field
            v-model="emailOrPhone"
            label="Email or Phone"
            required
            class="input-field"
          />
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            required
            class="input-field"
          />
          <div class="button-group">
            <v-btn type="submit" class="submit-button">Sign In</v-btn>
          </div>
        </v-form>
        <p class="signup-link">
          Don't have an account? <router-link to="/SignUp">Create one</router-link>
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'SignIn',
  data() {
    return {
      fullText: 'MusicalMatchMaker',
      displayedText:'',
      showCursor: true,
      emailOrPhone: '',
      password: '',
    };
  },
  mounted(){
    this.typewriterEffect();
  },
  methods: {
    typewriterEffect(){
      let index = 0;
      const interval = setInterval(() => {
        if(index < this.fullText.length){
          this.displayedText += this.fullText[index];
          index++;
        }else{
          clearInterval(interval);
          this.showCursor = false;
        }
      }, 150);
    },
    ...mapActions(['setUser']),
    async handleSignIn() {
      try {
        const response = await fetch('http://localhost:5000/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emailOrPhone: this.emailOrPhone,
            password: this.password,
          }),
        });

        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          if (result.success) {
            this.setUser(result.user); // Store the user in Vuex
            localStorage.setItem('user', JSON.stringify(result.user));
            this.$router.push('/FindMatches');
          } else {
            alert(result.message);
          }
        } else {
          console.error('Unexpected content type:', contentType);
        }
      } catch (error) {
        console.error('Error signing in:', error);
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
  background-color: #424B54; /* Background color of the page */
}

.card {
  width: 100%;
  max-width: 400px;
  background-color: #e2b4bd; /* Card background color */
  border-radius: 10px;
}
.sexy-header {
  font-family: 'Great Vibes', cursive;
  font-size: 48px;
  color: #d7263d;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
  margin: 0;
  text-align: center; /* Center the text within its container */
  white-space: nowrap; /* Prevents text wrapping */
  overflow: hidden; /* Hides the text that's not yet displayed */
  border-right: 2px solid #d7263d; /* Creates a blinking cursor effect */
  animation: blink-caret 0.75s step-end infinite; /* Cursor blinking animation */
}
.no-cursor{
  border-right: none;
  animation: none;
}

@keyframes blink-caret {
  from, to {
    border-color: transparent;
  }
  50% {
    border-color: #d7263d;
  }
}

.card-title {
  color: #424B54; /* Title color */
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}

.input-field {
  background-color: #9B6A6C; /* Input field background color */
  color: #e2b4bd; /* Input text color */
  border-radius: 10px;
  margin-bottom: 10px;
}

.input-field .v-input__control {
  color: #e2b4bd; /* Input label color */
}

.button-group {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.submit-button {
  background-color: #d7263d; /* Button background color */
  color: #e2b4bd; /* Button text color */
  font-weight: bold;
}

.submit-button:hover {
  background-color: #9B6A6C; /* Button background color on hover */
}

.signup-link {
  text-align: center;
  color: #9B6A6C; /* Text color for the sign-up link */
  margin-top: 15px;
}
</style>
