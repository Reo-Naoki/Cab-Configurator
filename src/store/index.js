import Vue from 'vue';
import Vuex from 'vuex';
import DisplayManager from './modules/DisplayManager';
import Camera from './modules/Camera';
import Panels from './modules/Panels';
import Materials from './modules/Materials/Materials';
import User from './modules/User';

Vue.use(Vuex);

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    DisplayManager,
    User,
    Camera,
    Panels,
    materials: Materials,
  },
});

store.watch((state) => state.Panels.panels, () => {
  if (store.state.Panels.price !== '---') store.commit('Panels/setPrice');
}, { deep: true });

store.watch((state) => state.Panels.connections, () => {
  if (store.state.Panels.price !== '---') store.commit('Panels/setPrice');
}, { deep: true });

export default store;
