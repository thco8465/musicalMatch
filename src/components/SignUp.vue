<template>
  <div class="signup-container">
    <v-card class="card" max-width="400">
      <v-card-title class="card-title">
        {{ currentQuestion.label }}
      </v-card-title>
      <v-card-subtitle class="progress-indicator">
        {{ currentStep + 1 }} / {{ questions.length }}
      </v-card-subtitle>
      <v-card-text>
        <v-form @submit.prevent="nextQuestion">
          <v-text-field
            v-model="form[currentQuestion.key]"
            :label="currentQuestion.label"
            :type="currentQuestion.type"
            required
            class="input-field"
          />
          <div class="button-group">
            <v-btn @click="prevQuestion" :disabled="currentStep === 0" class="back-button">
              Back
            </v-btn>
            <v-btn type="submit" class="submit-button">
              {{ isLastQuestion ? 'Sign Up' : 'Next' }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        location: '',
        age: '',
      },
      currentStep: 0,
      questions: [
        { key: 'firstName', label: 'First Name', type: 'text' },
        { key: 'lastName', label: 'Last Name', type: 'text' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phone', label: 'Phone Number', type: 'tel' },
        { key: 'password', label: 'Password', type: 'password' },
        { key: 'location', label: 'Location', type: 'text' },
        { key: 'age', label: 'Age', type: 'number' },
      ],
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentStep];
    },
    isLastQuestion() {
      return this.currentStep === this.questions.length - 1;
    },
  },
  methods: {
    nextQuestion() {
      if (this.isLastQuestion) {
        this.signUp();
      } else {
        this.currentStep += 1;
      }
    },
    prevQuestion() {
      if (this.currentStep > 0) {
        this.currentStep -= 1;
      }
    },
    async signUp() {
      try {
        const response = await fetch('https://musicalmatchbackend.onrender.com/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form),
        });
        const result = await response.json();
        if (response.ok) {
          this.$router.push('/MusicQuiz'); // Redirect to the main menu or other page
          alert('Sign up successful!');
        } else {
          alert('Error signing up: ' + result.message);
        }
      } catch (error) {
        console.error('Error signing up:', error);
      }
    },
  },
};
</script>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #424B54; /* Background color of the page */
}

.card {
  width: 100%;
  max-width: 400px;
  background-color: #e2b4bd; /* Card background color */
  border-radius: 10px;
}

.card-title {
  color: #424B54; /* Title color */
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}

.progress-indicator {
  color: #9B6A6C; /* Progress indicator color */
  font-size: 16px;
  text-align: center;
  margin-bottom: 10px;
}

.input-field {
  background-color: #9B6A6C; /* Input field background color */
  color: #e2b4bd; /* Input text color */
  border-radius: 10px;
}

.input-field .v-input__control {
  color: #e2b4bd; /* Input label color */
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.back-button {
  background-color: #d7263d; /* Back button background color */
  color: #e2b4bd; /* Back button text color */
  font-weight: bold;
}

.back-button:hover {
  background-color: #9B6A6C; /* Back button hover color */
}

.submit-button {
  background-color: #d7263d; /* Button background color */
  color: #e2b4bd; /* Button text color */
  font-weight: bold;
}

.submit-button:hover {
  background-color: #9B6A6C; /* Button background color on hover */
}
</style>
