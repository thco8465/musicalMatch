<template>
  <div>
    <h1 class="sexy-header">Music Quiz</h1>
    <div class="quiz-container">
      <v-card class="question-card">
        <v-card-title class="question-title">{{ currentQuestion.text }}</v-card-title>
        <v-radio-group v-model="selectedOptionIndex" column>
          <v-radio
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            :label="option"
            :value="index"
          ></v-radio>
        </v-radio-group>
        <v-card-actions>
          <v-btn @click="nextQuestion" color="primary">Next</v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { questions } from '../data/questions.js';

const currentQuestionIndex = ref(0);
const selectedOptionIndex = ref(null);
const userAnswers = ref([]); // Array to hold user's answers

const currentQuestion = computed(() => questions[currentQuestionIndex.value]);

async function nextQuestion() {
  if (selectedOptionIndex.value !== null) {
    // Save user's answer
    userAnswers.value.push({
      questionId: currentQuestion.value.id,
      selectedOption: currentQuestion.value.options[selectedOptionIndex.value],
      selectedOptionIndex: selectedOptionIndex.value
    });

    console.log('User Answers:', userAnswers.value); // Debug log

    selectedOptionIndex.value = null; // Reset selected option
    if (currentQuestionIndex.value < questions.length - 1) {
      currentQuestionIndex.value++;
    } else {
      // Quiz completed, perform final calculations or show results
      alert('Quiz completed! Your musical personality will be revealed!');
      // Save user profile along with answers
      await saveUserAnswers();
      // Reset quiz for retake if needed
      currentQuestionIndex.value = 0; // Reset to the first question
    }
  } else {
    alert('Please select an option before proceeding.');
  }
}

function saveUserAnswers() {
  const userProfile = {
    userId: JSON.parse(localStorage.getItem('user')).id, // Add userId here
    answers: userAnswers.value,
  };
  fetch('https://musicalmatchbackend.onrender.com/api/save-answers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userProfile),
  })
    .then((response) => {
      console.log('Response:', response);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      console.log('Data received:', data);
      if (data.success) {
        alert('Your answers have been saved successfully');
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
      } else {
        alert('There was an issue saving your answers. Please try again.');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('There was an error saving your answers. Please try again.');
    });
}


// // Function to retrieve user ID from localStorage
// function getUserId() {
//   const user = JSON.parse(localStorage.getItem('user'));
//   if (user) {
//     console.log('Retrieved User ID:', user.id); // Debug log
//     return user.id;
//   } else {
//     console.error('User not found in localStorage'); // Debug log
//     return null;
//   }
// }
</script>

<style scoped>
.quiz-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  background-color: #f0f2f5;
}

.question-card {
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.question-title {
  white-space: normal;
  word-wrap: break-word;
  text-align: center;
  padding: 10px;
  font-size: 1.2em;
  line-height: 1.4;
}

.sexy-header {
  font-family: 'Great Vibes', cursive;
  font-size: 48px;
  color: #d7263d;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
  text-align: center;
  margin: 10px 0;
}
</style>
