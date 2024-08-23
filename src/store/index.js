import { createStore } from 'vuex';

export default createStore({
  state() {
    return {
      user: null,
    };
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    clearUser(state) {
      state.user = null;
    },
  },
  actions: {
    setUser({ commit }, user) {
      commit('setUser', user);
    },
    clearUser({ commit }) {
      commit('clearUser');
    },
  },
  getters: {
    user(state) {
      return state.user;
    },
  },
});
