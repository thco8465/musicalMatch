<template>
  <v-app>
    <v-main>
      <v-container class="quiz-container">
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
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue';
import { questions } from '../data/questions.js';

const currentQuestionIndex = ref(0);
const selectedOptionIndex = ref(null);
const userAnswers = ref([]); // Array to hold user's answers

const currentQuestion = computed(() => questions[currentQuestionIndex.value]);

function nextQuestion() {
  if (selectedOptionIndex.value !== null) {
    // Save user's answer
    userAnswers.value.push({
      questionId: currentQuestion.value.id,
      selectedOption: currentQuestion.value.options[selectedOptionIndex.value],
      selectedOptionIndex: selectedOptionIndex.value
    });

    selectedOptionIndex.value = null; // Reset selected option
    if (currentQuestionIndex.value < questions.length - 1) {
      currentQuestionIndex.value++;
    } else {
      // Quiz completed, perform final calculations or show results
      alert('Quiz completed! Your musical personality will be revealed!');
      // Save user profile along with answers
      saveUserAnswers();
      // Reset quiz for retake if needed
      currentQuestionIndex.value = 0; // Reset to the first question
    }
  } else {
    alert('Please select an option before proceeding.');
  }
}

function saveUserAnswers() {
  // Assuming userProfile contains user profile data (username, email, etc.)
  const userProfile = {
    answers: userAnswers.value
  };
  // Save user profile data (e.g., to local storage or database)
  // For example, to local storage:
  localStorage.setItem('userProfile', JSON.stringify(userProfile));
}
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
</style>
